import cv2
import time
import threading
import queue
from collections import deque
import json
import torch 
import os
import sys
utils_dir = os.path.join(os.path.abspath(os.path.join(__file__, "..")), "utils")
sys.path.append(utils_dir)
from app_settings import AppConfig, ApplicationState
from event_handlers import initialize_display_window

def main():
    config = AppConfig()
    app_state = ApplicationState()

    initialize_display_window(config) 

    print("Loading heavy libraries (PyTorch, etc.)...", flush=True)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f'Using device: {device}', flush=True)

    from core_services import initialize_model_and_transforms, check_api_availability
    model, vision_transform = initialize_model_and_transforms(config, device)
    print("Heavy libraries loaded.", flush=True)

    # Check API availability at startup
    if config.OPENROUTER_API_KEY:
        api_available = check_api_availability(config)
        if not api_available:
            app_state.corrected_sentence = "API N/A"
            print("API unavailable at startup - grammar correction disabled", flush=True)

    from event_handlers import draw_main_ui, run_inference_worker, run_grammar_worker
    
    label_map_json = {}
    inv_label_map = {}
    try:
        with open(config.LABEL_MAP_PATH, 'r') as f:
            label_map_json = json.load(f)
        inv_label_map = {int(v): k for k, v in label_map_json.items()}
    except Exception as e:
        print(f"Error loading label map '{config.LABEL_MAP_PATH}': {e}. Exiting.", flush=True)
        return

    skipped_indices_list = [label_map_json[w] for w in config.SKIPPED_WORDS if w in label_map_json]
    
    frame_capture_buffer = deque()
    inference_q = queue.Queue(maxsize=1)
    grammar_q = queue.Queue(maxsize=1)

    inference_thread = threading.Thread(target=run_inference_worker, 
                                        args=(inference_q, grammar_q, model, vision_transform, inv_label_map, skipped_indices_list, device, app_state, config), 
                                        daemon=True)
    grammar_thread = threading.Thread(target=run_grammar_worker, 
                                      args=(grammar_q, app_state, config), 
                                      daemon=True)
    inference_thread.start()
    grammar_thread.start()

    print('Attempting to open camera...', flush=True)
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print('Error: Unable to open camera.', flush=True)
        return
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, config.WINDOW_WIDTH)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, config.WINDOW_HEIGHT)
    print('Camera opened successfully.', flush=True)
    
    print('Entering main loop.', flush=True)
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print('Warning: Frame capture failed.', flush=True)
                time.sleep(0.1)
                continue

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame_capture_buffer.append(frame_rgb)

            if len(frame_capture_buffer) >= config.VIDEO_BUFFER_SIZE_FRAMES:
                clip_to_process = list(frame_capture_buffer)
                try: inference_q.put_nowait(clip_to_process)
                except queue.Full: print('Inference queue is full; skipping clip.', flush=True)
                frame_capture_buffer.clear()
            
            ui_frame = draw_main_ui(frame, app_state, config, len(frame_capture_buffer))
            cv2.imshow(config.WINDOW_NAME, ui_frame)

            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                print('Exit signal received.', flush=True)
                break
            
            time.sleep(0.01) 
    finally:
        print("Cleaning up resources...", flush=True)
        if cap.isOpened(): cap.release()
        cv2.destroyAllWindows()
        for i in range(5): cv2.waitKey(1)

        inference_q.put(None)
        grammar_q.put(None)

        if inference_thread.is_alive(): inference_thread.join(timeout=5)
        if grammar_thread.is_alive(): grammar_thread.join(timeout=5)
        
        if inference_thread.is_alive(): print("Warning: Inference thread did not terminate cleanly.", flush=True)
        if grammar_thread.is_alive(): print("Warning: Grammar thread did not terminate cleanly.", flush=True)

        print('Program terminated.', flush=True)

if __name__ == "__main__":
    main()