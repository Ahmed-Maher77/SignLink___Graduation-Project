import cv2
import numpy as np
import queue
import torch 
import traceback

from app_settings import AppConfig, ApplicationState

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

    cv2.putText(display_frame, app_state.original_sentence, (config.TEXT_START_X, y_offset),
                config.TEXT_FONT, config.TEXT_FONT_SCALE, config.TEXT_COLOR_SENTENCE, config.TEXT_THICKNESS)
    if app_state.corrected_sentence:
        y_offset += config.TEXT_LINE_SPACING
        cv2.putText(display_frame, app_state.corrected_sentence, (config.TEXT_START_X, y_offset),
                    config.TEXT_FONT, config.TEXT_FONT_SCALE, config.TEXT_COLOR_SENTENCE, config.TEXT_THICKNESS)
    return display_frame

def run_grammar_worker(grammar_q: queue.Queue, app_state: ApplicationState, config: AppConfig):
    from core_services import get_api_corrected_sentence 
    while True:
        try:
            sentence_to_correct = grammar_q.get(timeout=1)
            if sentence_to_correct is None:
                grammar_q.task_done()
                break
            corrected_text = get_api_corrected_sentence(sentence_to_correct, config)
            with app_state.grammar_result_lock:
                app_state.last_original_sent_for_grammar = sentence_to_correct
                app_state.last_corrected_sentence_from_api = corrected_text
            grammar_q.task_done()
        except queue.Empty:
            continue
        except Exception as e:
            print(f"Error in grammar_worker: {e}", flush=True)
            if grammar_q.unfinished_tasks > 0: grammar_q.task_done()

def run_inference_worker(inference_q: queue.Queue, grammar_q: queue.Queue, model, vision_transform, inv_label_map: dict, skipped_indices_list: list, device: torch.device, app_state: ApplicationState, config: AppConfig):
    from core_services import uniform_subsample
    while True:
        clip_frames = inference_q.get()
        if clip_frames is None:
            inference_q.task_done()
            break
        try:
            subsampled_np = uniform_subsample(clip_frames, config.NUM_FRAMES_INPUT)
            if subsampled_np.size == 0: 
                inference_q.task_done()
                continue

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

            if top1_prob >= config.PREDICTION_CONFIDENCE_THRESHOLD:
                processed_label = top1_label.lower()
                if not app_state.sentence_buffer and processed_label == "me":
                    processed_label = "I"
                elif not app_state.sentence_buffer:
                    processed_label = processed_label.capitalize()
                app_state.sentence_buffer.append(processed_label)
                app_state.low_prob_count = 0
            else:
                app_state.low_prob_count += 1
                if app_state.low_prob_count >= config.LOW_CONFIDENCE_STREAK_THRESHOLD:
                    app_state.sentence_buffer.clear()
                    with app_state.grammar_result_lock:
                        app_state.last_original_sent_for_grammar = ""
                        app_state.last_corrected_sentence_from_api = ""
                        if app_state.corrected_sentence != "API N/A":
                            app_state.corrected_sentence = ""
                    app_state.low_prob_count = 0
            
            current_sentence_list = list(app_state.sentence_buffer)
            current_original_str = ' '.join(current_sentence_list)
            
            line1 = f"Original: {current_original_str}"
            line2 = ""
            is_special_case = (current_sentence_list == config.SPECIAL_CASE_HOW_YOU_INPUT)

            if is_special_case:
                manual_correction = config.SPECIAL_CASE_HOW_YOU_OUTPUT
                line1 = f"Original: {current_original_str}"
                line2 = f"Corrected: {manual_correction}"
                with app_state.grammar_result_lock:
                    app_state.last_original_sent_for_grammar = current_original_str
                    app_state.last_corrected_sentence_from_api = manual_correction
            elif len(current_sentence_list) >= config.SENTENCE_MIN_WORDS_FOR_CORRECTION:
                line1 = f"Original: {current_original_str}"
                needs_api_call = False
                with app_state.grammar_result_lock:
                    needs_api_call = (current_original_str != app_state.last_original_sent_for_grammar)

                if needs_api_call and grammar_q.empty() and config.OPENROUTER_API_KEY:
                    try: grammar_q.put_nowait(current_original_str)
                    except queue.Full: pass 

                with app_state.grammar_result_lock:
                    api_corrected_str = app_state.last_corrected_sentence_from_api
                    if current_original_str == app_state.last_original_sent_for_grammar and api_corrected_str and config.OPENROUTER_API_KEY:
                        if api_corrected_str == "API_N/A":
                            line2 = "API N/A"
                        elif api_corrected_str != current_original_str: 
                            line2 = f"Corrected: {api_corrected_str}"
                        else: 
                            line2 = ""  # Empty when no changes needed
                    elif config.OPENROUTER_API_KEY: 
                        line2 = ""  # Empty while waiting for API
                    else: 
                        line2 = "API N/A"  # No API key
            else:
                line1 = f"Original: {current_original_str}"
                line2 = f"Corrected: {current_original_str}"
            
            if not current_sentence_list and not is_special_case:
                line1 = "Original: "
                line2 = ""
            
            app_state.original_sentence = line1
            app_state.corrected_sentence = line2
            
            current_preds_display = []
            for i in range(top5_idx_tensor.size(1)):
                idx = top5_idx_tensor[0, i].item()
                label = inv_label_map.get(idx, 'Unknown')
                prob = top5_probs_tensor[0, i].item() * 100
                text = f"{label} ({prob:.2f}%)"
                color = config.TEXT_COLOR_PREDICTION_HIGH_CONF if prob > 50 else \
                        config.TEXT_COLOR_PREDICTION_MID_CONF if prob > 30 else \
                        config.TEXT_COLOR_PREDICTION_LOW_CONF
                current_preds_display.append((text, color))
            app_state.top_k_predictions_display = current_preds_display

        except Exception as e:
            print(f'Error during inference: {e}', flush=True)
            traceback.print_exc()
        finally:
            if inference_q.unfinished_tasks > 0: inference_q.task_done()