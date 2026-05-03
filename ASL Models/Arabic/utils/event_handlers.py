import cv2
import numpy as np
import queue
import traceback
from app_settings import AppConfig, ApplicationState
from core_services import process_frame, normalize_keypoints, smooth_predictions, fix_arabic

def initialize_display_window(config: AppConfig):
    print('Creating display window (pre-heavy imports)...', flush=True)
    cv2.namedWindow(config.WINDOW_NAME, cv2.WINDOW_AUTOSIZE)
    dummy_frame = np.zeros((config.WINDOW_HEIGHT // 2, config.WINDOW_WIDTH // 2, 3), dtype=np.uint8)
    cv2.imshow(config.WINDOW_NAME, dummy_frame)
    cv2.waitKey(1)
    print('Display window created successfully.', flush=True)

def draw_main_ui(frame, app_state: ApplicationState, config: AppConfig, current_buffer_len: int):
    display_frame = frame.copy()
    progress = min(current_buffer_len / config.VIDEO_BUFFER_SIZE_FRAMES, 1.0)
    bar_width = int(progress * display_frame.shape[1])
    cv2.rectangle(display_frame, (0, display_frame.shape[0] - config.PROGRESS_BAR_HEIGHT),
                  (bar_width, display_frame.shape[0]), (0, 0, 255), -1)
    cv2.rectangle(display_frame, (0, display_frame.shape[0] - config.PROGRESS_BAR_HEIGHT),
                  (display_frame.shape[1], display_frame.shape[0]), (255, 255, 255), 2)

    info_text = f"Buffer: {current_buffer_len}/{config.VIDEO_BUFFER_SIZE_FRAMES}"
    cv2.putText(display_frame, info_text, (config.TEXT_START_X, config.TEXT_START_Y_INFO),
                config.TEXT_FONT, config.TEXT_FONT_SCALE, config.TEXT_COLOR_SENTENCE, config.TEXT_THICKNESS)

    y_offset = config.TEXT_START_Y_PREDICTIONS
    for text, color in app_state.top_k_predictions_display:
        cv2.putText(display_frame, text, (config.TEXT_START_X, y_offset),
                    config.TEXT_FONT, config.TEXT_FONT_SCALE, color, config.TEXT_THICKNESS)
        y_offset += config.TEXT_LINE_SPACING

    if app_state.original_sentence:
        cv2.putText(display_frame, app_state.original_sentence, (config.TEXT_START_X, y_offset),
                    config.TEXT_FONT, config.TEXT_FONT_SCALE, config.TEXT_COLOR_SENTENCE, config.TEXT_THICKNESS)
    return display_frame

def run_inference_worker(inference_q: queue.Queue, model, holistic, label_map: dict, device, app_state: ApplicationState, config: AppConfig):
    while True:
        clip_frames = inference_q.get()
        if clip_frames is None:
            inference_q.task_done()
            break
        try:
            # Process each frame in the clip
            processed_frames = []
            for frame in clip_frames:
                keypoints = process_frame(frame, holistic)
                processed_frames.append(keypoints)
            
            if not processed_frames:
                inference_q.task_done()
                continue

            # Convert to numpy array and normalize
            sequence = np.array(processed_frames)
            sequence = normalize_keypoints(sequence)
            
            # Add batch dimension and predict
            sequence = np.expand_dims(sequence, axis=0)
            prediction = model.predict(sequence, verbose=0)[0]
            
            # Get top 5 predictions
            top5_indices = np.argsort(prediction)[-5:][::-1]
            top5_confidences = prediction[top5_indices]
            top5_labels = [label_map.get(i, "Unknown") for i in top5_indices]
            
            # Apply smoothing
            smoothed_class, confidence = smooth_predictions(prediction, app_state)
            
            # Update display predictions
            current_preds_display = []
            for i, (label, conf) in enumerate(zip(top5_labels, top5_confidences)):
                text = f"{fix_arabic(label)} ({conf:.2%})"
                color = config.TEXT_COLOR_PREDICTION_HIGH_CONF if conf > 0.7 else \
                        config.TEXT_COLOR_PREDICTION_MID_CONF if conf > 0.5 else \
                        config.TEXT_COLOR_PREDICTION_LOW_CONF
                current_preds_display.append((text, color))
            app_state.top_k_predictions_display = current_preds_display
            
            # Update sentence if we have a confident prediction
            if confidence >= config.PREDICTION_CONFIDENCE_THRESHOLD:
                label = label_map.get(smoothed_class, "Unknown")
                app_state.original_sentence = fix_arabic(label)
                app_state.low_prob_count = 0
            else:
                app_state.low_prob_count += 1
                if app_state.low_prob_count >= config.LOW_CONFIDENCE_STREAK_THRESHOLD:
                    app_state.original_sentence = ""
                    app_state.low_prob_count = 0

        except Exception as e:
            print(f'Error during inference: {e}', flush=True)
            traceback.print_exc()
        finally:
            if inference_q.unfinished_tasks > 0:
                inference_q.task_done() 