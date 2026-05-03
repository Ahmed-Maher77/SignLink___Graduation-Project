import asyncio
from collections import deque
import numpy as np
import os
import sys
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.websockets import WebSocketState
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

utils_dir = os.path.join(os.path.abspath(os.path.join(__file__, "..")), "utils")
sys.path.append(utils_dir)

from app_settings import AppConfig, ApplicationState
from core_services import (
    initialize_model,
    normalize_keypoints,
    fix_arabic,
    smooth_predictions
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

config = AppConfig()
model, label_map = initialize_model(config)

class ClientSession:
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.app_state = ApplicationState()
        self.frame_input_queue = asyncio.Queue(maxsize=config.VIDEO_BUFFER_SIZE_FRAMES * 2)
        self.inference_queue = asyncio.Queue(maxsize=2) 
        self.processing_task = None
        self.inference_task = None
        self.delay_start_time = None
        self.is_in_delay = False
        self.initial_delay_completed = False
        self.frame_buffer = deque()

clients_lock = asyncio.Lock()
clients = {}

result_sequence = 0 

def app_state_to_web_dict(app_state: ApplicationState, current_config: AppConfig,
                          processing_clip_buffer_size: int,
                          status_msg: str,
                          is_in_delay: bool = False,
                          delay_progress: float = 0.0,
                          result_sequence: int = 0):
    buffer_fill_percentage = (processing_clip_buffer_size / current_config.VIDEO_BUFFER_SIZE_FRAMES) * 100 \
        if current_config.VIDEO_BUFFER_SIZE_FRAMES > 0 else 0
    return {
        "status_message": status_msg,
        "buffer_fill_percentage": buffer_fill_percentage,
        "input_queue_actual_size": processing_clip_buffer_size,
        "input_queue_target_clip_size": current_config.VIDEO_BUFFER_SIZE_FRAMES,
        "top_k_predictions": getattr(app_state, 'top_k_predictions_display', []),
        "best_prediction": getattr(app_state, 'best_prediction', None),
        "is_in_delay": is_in_delay,
        "delay_progress": delay_progress,
        "result_sequence": result_sequence
    }

def center_keypoints(frame_keypoints):
    pose = frame_keypoints[:33*3]
    lh = frame_keypoints[33*3:33*3+21*3]
    rh = frame_keypoints[33*3+21*3:]
    
    def adjust_landmarks(arr, center):
        arr_reshaped = arr.reshape(-1, 3)
        center_repeated = np.tile(center, (len(arr_reshaped), 1))
        arr_adjusted = arr_reshaped - center_repeated
        return arr_adjusted.reshape(-1)
    
    nose = pose[:3]
    lh_wrist = lh[:3] if np.any(lh) else np.zeros(3)
    rh_wrist = rh[:3] if np.any(rh) else np.zeros(3)
    pose_adjusted = adjust_landmarks(pose, nose)
    lh_adjusted = adjust_landmarks(lh, lh_wrist)
    rh_adjusted = adjust_landmarks(rh, rh_wrist)
    return np.concatenate([pose_adjusted, lh_adjusted, rh_adjusted])

def process_clip_and_update_state(clip_frames_bgr, app_state: ApplicationState, current_config: AppConfig):
    if len(clip_frames_bgr) != current_config.VIDEO_BUFFER_SIZE_FRAMES:
        app_state.top_k_predictions_display = []
        app_state.best_prediction = None
        return False
    centered_frames = [center_keypoints(np.array(frame)) for frame in clip_frames_bgr]
    sequence = np.array(centered_frames)
    sequence = normalize_keypoints(sequence)
    sequence = np.expand_dims(sequence, axis=0)
    prediction = model.predict(sequence, verbose=0)[0]
    top5_indices = np.argsort(prediction)[-5:][::-1]
    top5_confidences = prediction[top5_indices]
    top5_labels = [label_map.get(i, "Unknown") for i in top5_indices]
    app_state.top_k_predictions_display = [
        {"label": label, "probability": float(conf)*100}
        for label, conf in zip(top5_labels, top5_confidences)
    ]
    print("\nTop 5 Predictions:")
    for i, (label, conf) in enumerate(zip(top5_labels, top5_confidences)):
        print(f"{i+1}. {fix_arabic(label)}: {conf:.4f}")
    best_class, best_conf = smooth_predictions(prediction, app_state)
    if best_class is not None and best_conf >= current_config.PREDICTION_CONFIDENCE_THRESHOLD:
        best_label = label_map.get(best_class, "Unknown")
        app_state.best_prediction = {"label": fix_arabic(best_label), "probability": float(best_conf)}
    else:
        app_state.best_prediction = None
    return True

async def inference_worker(client_session: ClientSession, current_config: AppConfig):
    ws = client_session.websocket
    app_s = client_session.app_state
    global result_sequence
    try:
        while True:
            clip_to_process = await client_session.inference_queue.get()
            await asyncio.to_thread(process_clip_and_update_state, clip_to_process, app_s, current_config)
            result_sequence += 1
            await ws.send_json(app_state_to_web_dict(
                app_s, current_config, 0, "Inference result ready",
                is_in_delay=False, delay_progress=1.0, result_sequence=result_sequence
            ))
            client_session.inference_queue.task_done()
    except asyncio.CancelledError:
        pass
    except Exception as e:
        print(f"Error in inference_worker: {type(e).__name__}: {e}", flush=True)

async def process_frames_worker(client_session: ClientSession, current_config: AppConfig):
    ws = client_session.websocket
    app_s = client_session.app_state
    last_buffer_update_time = 0
    BUFFER_UPDATE_INTERVAL = 0.05
    DELAY_DURATION = 1.0
    global result_sequence
    try:
        while True:
            if ws.client_state != WebSocketState.CONNECTED:
                break
            current_time = asyncio.get_event_loop().time()
            current_buffer_len = len(client_session.frame_buffer)
            if not client_session.initial_delay_completed and not client_session.is_in_delay:
                client_session.is_in_delay = True
                client_session.delay_start_time = current_time
                client_session.frame_buffer.clear()
                while not client_session.frame_input_queue.empty():
                    try:
                        client_session.frame_input_queue.get_nowait()
                        client_session.frame_input_queue.task_done()
                    except asyncio.QueueEmpty:
                        break
                await ws.send_json(app_state_to_web_dict(
                    app_s, current_config, 0, "Starting delay period...",
                    is_in_delay=True, delay_progress=0.0, result_sequence=result_sequence
                ))
                continue
            if client_session.is_in_delay:
                elapsed_delay = current_time - client_session.delay_start_time if client_session.delay_start_time is not None else 0
                delay_progress = min(elapsed_delay / DELAY_DURATION, 1.0)
                if elapsed_delay >= DELAY_DURATION:
                    client_session.is_in_delay = False
                    client_session.delay_start_time = None
                    client_session.initial_delay_completed = True
                    client_session.frame_buffer.clear()
                    while not client_session.frame_input_queue.empty():
                        try:
                            client_session.frame_input_queue.get_nowait()
                            client_session.frame_input_queue.task_done()
                        except asyncio.QueueEmpty:
                            break
                    await ws.send_json(app_state_to_web_dict(
                        app_s, current_config, 0, "Starting frame collection...",
                        is_in_delay=False, delay_progress=1.0, result_sequence=result_sequence
                    ))
                    last_buffer_update_time = current_time
                    await asyncio.sleep(0.1)
                    continue
                await ws.send_json(app_state_to_web_dict(
                    app_s, current_config, 0, "Processing...",
                    is_in_delay=True, delay_progress=delay_progress, result_sequence=result_sequence
                ))
                await asyncio.sleep(BUFFER_UPDATE_INTERVAL)
                continue
            if current_buffer_len < current_config.VIDEO_BUFFER_SIZE_FRAMES:
                try:
                    keypoints = await asyncio.wait_for(client_session.frame_input_queue.get(), timeout=0.05)
                    client_session.frame_buffer.append(keypoints)
                    client_session.frame_input_queue.task_done()
                    if current_time - last_buffer_update_time >= BUFFER_UPDATE_INTERVAL:
                        new_len = len(client_session.frame_buffer)
                        status_msg = "Buffering for Inference..."
                        if new_len >= current_config.VIDEO_BUFFER_SIZE_FRAMES:
                            status_msg = "Buffer Full. Sending to inference queue..."
                        await ws.send_json(app_state_to_web_dict(
                            app_s, current_config, new_len, status_msg,
                            is_in_delay=False, delay_progress=1.0, result_sequence=result_sequence
                        ))
                        last_buffer_update_time = current_time
                except asyncio.TimeoutError:
                    if client_session.frame_input_queue.empty() and current_buffer_len == 0:
                        await asyncio.sleep(0.05)
                    continue
                except asyncio.QueueEmpty:
                    continue
            if len(client_session.frame_buffer) >= current_config.VIDEO_BUFFER_SIZE_FRAMES:
                clip_to_process = list(client_session.frame_buffer)
                await client_session.inference_queue.put(clip_to_process)
                client_session.frame_buffer.clear()
                await ws.send_json(app_state_to_web_dict(
                    app_s, current_config, 0, "Buffer cleared, refilling...",
                    is_in_delay=False, delay_progress=1.0, result_sequence=result_sequence
                ))
                client_session.is_in_delay = True
                client_session.delay_start_time = current_time
                await ws.send_json(app_state_to_web_dict(
                    app_s, current_config, 0, "Starting delay period...",
                    is_in_delay=True, delay_progress=0.0, result_sequence=result_sequence
                ))
                continue
    except WebSocketDisconnect:
        pass
    except asyncio.CancelledError:
        pass
    except Exception as e:
        print(f"Error in process_frames_worker: {type(e).__name__}: {e}", flush=True)
        try:
            if ws.client_state == WebSocketState.CONNECTED:
                await ws.send_json(app_state_to_web_dict(
                    app_s, current_config, len(client_session.frame_buffer),
                    f"Worker Error: {type(e).__name__}", result_sequence=result_sequence
                ))
        except Exception:
            pass

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    client_key = (websocket.client.host, websocket.client.port)
    client_session = ClientSession(websocket)
    async with clients_lock:
        clients[client_key] = client_session
    client_session.processing_task = asyncio.create_task(
        process_frames_worker(client_session, config)
    )
    client_session.inference_task = asyncio.create_task(
        inference_worker(client_session, config)
    )
    try:
        while True:
            keypoints_data = await websocket.receive_json()
            keypoints = np.array(keypoints_data, dtype=np.float32)
            
            try:
                client_session.frame_input_queue.put_nowait(keypoints)
            except asyncio.QueueFull:
                pass
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Error in main websocket loop: {type(e).__name__}: {e}", flush=True)
    finally:
        if client_session.processing_task:
            client_session.processing_task.cancel()
            try:
                await client_session.processing_task
            except asyncio.CancelledError:
                pass
        if client_session.inference_task:
            client_session.inference_task.cancel()
            try:
                await client_session.inference_task
            except asyncio.CancelledError:
                pass
        async with clients_lock:
            if client_key in clients:
                del clients[client_key]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 