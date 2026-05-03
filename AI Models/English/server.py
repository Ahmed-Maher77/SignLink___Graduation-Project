import cv2
import asyncio
from collections import deque
import json
import torch
import os
import sys
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.websockets import WebSocketState
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np

utils_dir = os.path.join(os.path.abspath(os.path.join(__file__, "..")), "utils")
sys.path.append(utils_dir)

from app_settings import AppConfig, ApplicationState
from core_services import initialize_model_and_transforms, get_api_corrected_sentence, uniform_subsample, check_api_availability

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

config = AppConfig()
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f'Using device: {device}', flush=True)

# Check API availability at startup
if config.OPENROUTER_API_KEY:
    api_available = check_api_availability(config)
    if not api_available:
        print("API unavailable at startup - grammar correction disabled", flush=True)

model, vision_transform = initialize_model_and_transforms(config, device)

label_map_json = {}
inv_label_map = {}
try:
    with open(config.LABEL_MAP_PATH, 'r') as f:
        label_map_json = json.load(f)
    inv_label_map = {int(v): k for k, v in label_map_json.items()}
except Exception as e:
    print(f"Error loading label map '{config.LABEL_MAP_PATH}': {e}. Exiting.", flush=True)
    sys.exit(1)

skipped_indices_list = [int(label_map_json[w]) for w in config.SKIPPED_WORDS if w in label_map_json]

class ClientSession:
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.app_state = ApplicationState()
        self.app_state.top_k_predictions_web = []
        self.app_state._current_original_str_for_grammar = ""
        self.app_state._is_special_case_for_grammar = False
        self.app_state._current_sentence_list_for_grammar = []
        self.frame_input_queue = asyncio.Queue(maxsize=config.VIDEO_BUFFER_SIZE_FRAMES * 2)
        self.processing_task = None
        self.delay_start_time = None
        self.is_in_delay = False
        self.initial_delay_completed = False
        self.frame_buffer = deque()
        # Initialize API state
        if not config.OPENROUTER_API_KEY:
            self.app_state.corrected_sentence = "API N/A"
        else:
            api_available = check_api_availability(config)
            if not api_available:
                self.app_state.corrected_sentence = "API N/A"

clients_lock = asyncio.Lock()
clients = {}


def sync_inference_and_initial_state_update(clip_frames_rgb, app_state: ApplicationState, current_config: AppConfig):
    if not clip_frames_rgb:
        app_state.top_k_predictions_web = []
        app_state.original_sentence = "(No clip)"
        app_state.corrected_sentence = ""
        return False

    subsampled_np = uniform_subsample(clip_frames_rgb, current_config.NUM_FRAMES_INPUT)
    if subsampled_np.size == 0:
        app_state.top_k_predictions_web = []
        app_state.original_sentence = "(Subsampling failed)"
        app_state.corrected_sentence = ""
        return False

    try:
        video_tensor = torch.from_numpy(subsampled_np).float().permute(3, 0, 1, 2)
        clip_dict = {'video': video_tensor}
        processed = vision_transform(clip_dict)
        slow_pathway = processed['video'][0].unsqueeze(0).to(device)
        fast_pathway = processed['video'][1].unsqueeze(0).to(device)

        with torch.no_grad():
            outputs = model([slow_pathway, fast_pathway])
            for idx_val in skipped_indices_list:
                if 0 <= idx_val < outputs.shape[1]:
                    outputs[0, idx_val] = -float('inf')
            probs = torch.nn.functional.softmax(outputs, dim=1)
            top5_probs_tensor, top5_idx_tensor = torch.topk(probs, k=5, dim=1)

        top1_prob = top5_probs_tensor[0, 0].item() * 100
        top1_idx_val = top5_idx_tensor[0, 0].item()
        top1_label = inv_label_map.get(top1_idx_val, 'Unknown')

        if top1_prob >= current_config.PREDICTION_CONFIDENCE_THRESHOLD:
            processed_label = top1_label.lower()  # Convert to lowercase first
            if not app_state.sentence_buffer and processed_label == "me":
                processed_label = "I"
            elif not app_state.sentence_buffer:
                processed_label = processed_label.capitalize()  # Capitalize first word
            app_state.sentence_buffer.append(processed_label)
            app_state.low_prob_count = 0
        else:
            app_state.low_prob_count += 1
            if app_state.low_prob_count >= current_config.LOW_CONFIDENCE_STREAK_THRESHOLD:
                app_state.sentence_buffer.clear()
                app_state.last_original_sent_for_grammar = ""
                app_state.last_corrected_sentence_from_api = ""
                if app_state.corrected_sentence != "API N/A":
                    app_state.corrected_sentence = ""  # Clear when confidence is too low
                app_state.low_prob_count = 0

        current_sentence_list = list(app_state.sentence_buffer)
        current_original_str = ' '.join(current_sentence_list)
        is_special_case = (current_sentence_list == current_config.SPECIAL_CASE_HOW_YOU_INPUT)

        if is_special_case or len(current_sentence_list) >= current_config.SENTENCE_MIN_WORDS_FOR_CORRECTION:
            app_state.original_sentence = f"{current_original_str}"
        else:
            app_state.original_sentence = f"{current_original_str}"
        if not current_sentence_list:
            app_state.original_sentence = ""

        app_state.top_k_predictions_web = []
        for i in range(top5_idx_tensor.size(1)):
            idx = top5_idx_tensor[0, i].item()
            label = inv_label_map.get(idx, 'Unknown')
            prob = top5_probs_tensor[0, i].item() * 100
            app_state.top_k_predictions_web.append({"label": label, "probability": prob})

        app_state._current_original_str_for_grammar = current_original_str
        app_state._is_special_case_for_grammar = is_special_case
        app_state._current_sentence_list_for_grammar = current_sentence_list
        return True
    except Exception as e:
        print(f"Exception in sync_inference: {e}", flush=True)
        app_state.top_k_predictions_web = []
        app_state.original_sentence = "(Inference Error)"
        app_state.corrected_sentence = str(e) 
        return False

def app_state_to_web_dict(app_state: ApplicationState, current_config: AppConfig,
                          processing_clip_buffer_size: int,
                          status_msg: str,
                          is_in_delay: bool = False,
                          delay_progress: float = 0.0):
    buffer_fill_percentage = (processing_clip_buffer_size / current_config.VIDEO_BUFFER_SIZE_FRAMES) * 100 \
        if current_config.VIDEO_BUFFER_SIZE_FRAMES > 0 else 0

    corrected_sentence = app_state.corrected_sentence if hasattr(app_state, 'corrected_sentence') else ""

    return {
        "status_message": status_msg,
        "buffer_fill_percentage": buffer_fill_percentage,
        "input_queue_actual_size": processing_clip_buffer_size,
        "input_queue_target_clip_size": current_config.VIDEO_BUFFER_SIZE_FRAMES,
        "original_sentence_text": app_state.original_sentence,
        "corrected_sentence_text": corrected_sentence,
        "top_k_predictions": getattr(app_state, 'top_k_predictions_web', []),
        "is_in_delay": is_in_delay,
        "delay_progress": delay_progress
    }

async def process_frames_worker(client_session: ClientSession, current_config: AppConfig):
    ws = client_session.websocket
    app_s = client_session.app_state
    last_buffer_update_time = 0
    BUFFER_UPDATE_INTERVAL = 0.05
    DELAY_DURATION = 1.0 
    
    grammar_tasks = asyncio.Queue()
    inference_tasks = asyncio.Queue()
    
    async def process_grammar_results():
        while True:
            try:
                task = await grammar_tasks.get()
                try:
                    result = await task
                    current_original_str = app_s._current_original_str_for_grammar
                    current_buffer_len = len(client_session.frame_buffer)
                    
                    print(f"Grammar API Response for '{current_original_str}': '{result}'", flush=True)
                    
                    app_s.last_corrected_sentence_from_api = result
                    app_s.last_original_sent_for_grammar = current_original_str
                    
                    if result == "API_N/A":
                        app_s.corrected_sentence = "API N/A"
                        print("API unavailable - showing API N/A message", flush=True)
                    elif result and result != current_original_str:
                        app_s.corrected_sentence = result  
                        print(f"Setting corrected_sentence to: {result}", flush=True)
                    else:
                        app_s.corrected_sentence = ""  # Empty when no changes needed
                        print("No changes needed, clearing corrected sentence", flush=True)
                    
                    print(f"Sending web dict with corrected_sentence_text: '{app_s.corrected_sentence}'", flush=True)
                    await ws.send_json(app_state_to_web_dict(app_s, current_config, current_buffer_len, "Grammar Status Updated"))
                except Exception as e:
                    print(f"Error processing grammar result: {e}", flush=True)
                    if app_s.corrected_sentence != "API N/A":  # Don't overwrite API N/A state
                        app_s.corrected_sentence = ""
                    current_buffer_len = len(client_session.frame_buffer)
                    await ws.send_json(app_state_to_web_dict(app_s, current_config, current_buffer_len, "Grammar Check Failed"))
                finally:
                    grammar_tasks.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"Error in grammar results processor: {e}", flush=True)
    
    async def process_inference_results():
        while True:
            try:
                task, clip_frames = await inference_tasks.get()
                try:
                    result = await task
                    if result:  
                        current_original_str = app_s._current_original_str_for_grammar
                        is_special_case = app_s._is_special_case_for_grammar
                        current_sentence_list = app_s._current_sentence_list_for_grammar
                        
                        if is_special_case:
                            manual_correction = current_config.SPECIAL_CASE_HOW_YOU_OUTPUT
                            app_s.corrected_sentence = manual_correction  
                            app_s.last_original_sent_for_grammar = current_original_str
                            app_s.last_corrected_sentence_from_api = manual_correction
                            await ws.send_json(app_state_to_web_dict(
                                app_s, current_config, current_config.VIDEO_BUFFER_SIZE_FRAMES, "Grammar Status Updated",
                                is_in_delay=True, delay_progress=min((asyncio.get_event_loop().time() - client_session.delay_start_time) / DELAY_DURATION, 1.0) if client_session.delay_start_time is not None else 0.0
                            ))
                        elif len(current_sentence_list) >= current_config.SENTENCE_MIN_WORDS_FOR_CORRECTION:
                            needs_api_call = (current_original_str != app_s.last_original_sent_for_grammar)
                            
                            if needs_api_call and current_config.OPENROUTER_API_KEY:
                                grammar_task = asyncio.create_task(
                                    asyncio.to_thread(
                                        get_api_corrected_sentence, current_original_str, current_config
                                    )
                                )
                                await grammar_tasks.put(grammar_task)
                                if app_s.corrected_sentence != "API N/A":  # Don't overwrite API N/A state
                                    app_s.corrected_sentence = ""
                            elif current_original_str == app_s.last_original_sent_for_grammar and app_s.last_corrected_sentence_from_api:
                                if app_s.last_corrected_sentence_from_api == "API_N/A":
                                    app_s.corrected_sentence = "API N/A"
                                elif app_s.last_corrected_sentence_from_api != current_original_str:
                                    app_s.corrected_sentence = app_s.last_corrected_sentence_from_api  
                                else:
                                    if app_s.corrected_sentence != "API N/A":  # Don't overwrite API N/A state
                                        app_s.corrected_sentence = ""
                            else:
                                if app_s.corrected_sentence != "API N/A":  # Don't overwrite API N/A state
                                    app_s.corrected_sentence = ""
                            await ws.send_json(app_state_to_web_dict(
                                app_s, current_config, current_config.VIDEO_BUFFER_SIZE_FRAMES, "Grammar Status Updated",
                                is_in_delay=True, delay_progress=min((asyncio.get_event_loop().time() - client_session.delay_start_time) / DELAY_DURATION, 1.0) if client_session.delay_start_time is not None else 0.0
                            ))
                        else:
                            if app_s.corrected_sentence != "API N/A":  # Don't overwrite API N/A state
                                app_s.corrected_sentence = current_original_str
                            await ws.send_json(app_state_to_web_dict(
                                app_s, current_config, current_config.VIDEO_BUFFER_SIZE_FRAMES, "Grammar Status Updated",
                                is_in_delay=True, delay_progress=min((asyncio.get_event_loop().time() - client_session.delay_start_time) / DELAY_DURATION, 1.0) if client_session.delay_start_time is not None else 0.0
                            ))
                except Exception as e:
                    print(f"Error processing inference result: {e}", flush=True)
                finally:
                    inference_tasks.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"Error in inference results processor: {e}", flush=True)

    grammar_processor = asyncio.create_task(process_grammar_results())
    inference_processor = asyncio.create_task(process_inference_results())

    try:
        while True:
            if ws.client_state != WebSocketState.CONNECTED:
                print(f"Worker: WebSocket no longer connected for {ws.client}. Exiting.", flush=True)
                break

            current_time = asyncio.get_event_loop().time()
            current_buffer_len = len(client_session.frame_buffer)

            if not client_session.initial_delay_completed and not client_session.is_in_delay:
                print("Starting initial delay period", flush=True)
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
                    is_in_delay=True, delay_progress=0.0
                ))
                continue

            if client_session.is_in_delay:
                elapsed_delay = current_time - client_session.delay_start_time if client_session.delay_start_time is not None else 0
                delay_progress = min(elapsed_delay / DELAY_DURATION, 1.0)
                
                if elapsed_delay >= DELAY_DURATION:
                    # print("Delay period complete, transitioning to frame collection", flush=True)
                    client_session.is_in_delay = False
                    client_session.delay_start_time = None
                    client_session.initial_delay_completed = True
                    
                    # Clear any remaining frames in the buffer
                    client_session.frame_buffer.clear()
                    while not client_session.frame_input_queue.empty():
                        try:
                            client_session.frame_input_queue.get_nowait()
                            client_session.frame_input_queue.task_done()
                        except asyncio.QueueEmpty:
                            break
                    
                    # Send initial state update
                    await ws.send_json(app_state_to_web_dict(
                        app_s, current_config, 0, "Starting frame collection...",
                        is_in_delay=False, delay_progress=1.0
                    ))
                    last_buffer_update_time = current_time
                    await asyncio.sleep(0.1)  # Small delay to ensure state update is processed
                    continue  # Skip to next iteration to start collecting frames
                
                await ws.send_json(app_state_to_web_dict(
                    app_s, current_config, 0, "Processing...",
                    is_in_delay=True, delay_progress=delay_progress
                ))
                await asyncio.sleep(BUFFER_UPDATE_INTERVAL)
                continue

            # Frame collection and processing
            if current_buffer_len < current_config.VIDEO_BUFFER_SIZE_FRAMES:
                try:
                    frame_rgb = await asyncio.wait_for(client_session.frame_input_queue.get(), timeout=0.05)
                    client_session.frame_buffer.append(frame_rgb)
                    client_session.frame_input_queue.task_done()
                    
                    # Update progress more frequently during frame collection
                    if current_time - last_buffer_update_time >= BUFFER_UPDATE_INTERVAL:
                        new_len = len(client_session.frame_buffer)
                        status_msg = "Buffering for Inference..."
                        if new_len >= current_config.VIDEO_BUFFER_SIZE_FRAMES:
                            status_msg = "Buffer Full. Processing..."
                        await ws.send_json(app_state_to_web_dict(
                            app_s, current_config, new_len, status_msg,
                            is_in_delay=False, delay_progress=1.0
                        ))
                        last_buffer_update_time = current_time
                except asyncio.TimeoutError:
                    if client_session.frame_input_queue.empty() and current_buffer_len == 0:
                        await asyncio.sleep(0.05)
                    continue
                except asyncio.QueueEmpty:
                    continue

            if len(client_session.frame_buffer) >= current_config.VIDEO_BUFFER_SIZE_FRAMES:
                # print("Buffer full, starting processing", flush=True)
                clip_to_process = list(client_session.frame_buffer)
                
                inference_task = asyncio.create_task(
                    asyncio.to_thread(
                        sync_inference_and_initial_state_update,
                        clip_to_process, app_s, current_config
                    )
                )
                await inference_tasks.put((inference_task, clip_to_process))
                
                client_session.frame_buffer.clear()
                while not client_session.frame_input_queue.empty():
                    try:
                        client_session.frame_input_queue.get_nowait()
                        client_session.frame_input_queue.task_done()
                    except asyncio.QueueEmpty:
                        break
                
                client_session.is_in_delay = True
                client_session.delay_start_time = current_time
                
                await ws.send_json(app_state_to_web_dict(
                    app_s, current_config, 0, "Starting new cycle...",
                    is_in_delay=True, delay_progress=0.0
                ))

    except WebSocketDisconnect:
        print(f"Worker: WebSocket disconnected for {ws.client}", flush=True)
    except asyncio.CancelledError:
        print(f"Worker: Task cancelled for {ws.client}", flush=True)
    except Exception as e:
        print(f"Error in process_frames_worker for {ws.client}: {type(e).__name__}: {e}", flush=True)
        try:
            if ws.client_state == WebSocketState.CONNECTED:
                await ws.send_json(app_state_to_web_dict(
                    app_s, current_config, len(client_session.frame_buffer),
                    f"Worker Error: {type(e).__name__}"
                ))
        except Exception as send_err:
            print(f"Worker: Could not send error to client {ws.client}: {send_err}", flush=True)
    finally:
        grammar_processor.cancel()
        inference_processor.cancel()
        try:
            await asyncio.gather(grammar_processor, inference_processor, return_exceptions=True)
        except Exception as e:
            print(f"Error during cleanup: {e}", flush=True)
        print(f"Worker finished for {ws.client}", flush=True)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    client_key = (websocket.client.host, websocket.client.port)
    client_session = ClientSession(websocket)

    async with clients_lock:
        clients[client_key] = client_session

    print(f"Client {client_key} connected. Starting worker task.", flush=True)
    client_session.processing_task = asyncio.create_task(
        process_frames_worker(client_session, config)
    )

    try:
        while True:
            frame_bytes = await websocket.receive_bytes()
            np_arr = np.frombuffer(frame_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if frame is None:
                print(f"Client {client_key} sent an empty (None) frame.", flush=True)
                continue

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            try:
                client_session.frame_input_queue.put_nowait(frame_rgb)
            except asyncio.QueueFull:
                print(f"Client {client_key} input queue full. Frame dropped by server.", flush=True)

    except WebSocketDisconnect:
        print(f"Client {client_key} disconnected (main loop).", flush=True)
    except Exception as e:
        print(f"Error in main websocket loop for {client_key}: {type(e).__name__}: {e}", flush=True)
    finally:
        print(f"Cleaning up for client {client_key}.", flush=True)
        if client_session.processing_task:
            client_session.processing_task.cancel()
            try:
                await client_session.processing_task
            except asyncio.CancelledError:
                print(f"Processing task for {client_key} successfully cancelled.", flush=True)
            except Exception as e_task:
                 print(f"Exception during processing task await for {client_key} after cancel: {type(e_task).__name__}: {e_task}", flush=True)

        async with clients_lock:
            if client_key in clients:
                del clients[client_key]
        print(f"Client {client_key} resources cleaned up.", flush=True)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)