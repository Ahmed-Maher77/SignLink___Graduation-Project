import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import arabic_reshaper
from bidi.algorithm import get_display
import pandas as pd

def fix_arabic(text):
    """Reshape and apply bidirectional reordering to Arabic text."""
    try:
        reshaped_text = arabic_reshaper.reshape(text)
        return get_display(reshaped_text)
    except:
        return text

def normalize_keypoints(keypoints):
    """Normalize keypoints to [-1, 1] range."""
    if keypoints.size == 0:
        return keypoints
    
    # Reshape to (num_keypoints, 3) for vector operations
    # The expected shape is (num_frames, num_features) -> e.g. (40, 225)
    # The 225 features are flattened (x,y,z) coordinates.
    num_frames = keypoints.shape[0]
    num_features_per_frame = keypoints.shape[1]
    
    # We expect features to be a multiple of 3 (x,y,z)
    if num_features_per_frame % 3 != 0:
        # Or handle this error appropriately
        return keypoints
        
    reshaped_for_norm = keypoints.reshape(num_frames * (num_features_per_frame // 3), 3)
    
    # Normalize only x and y coordinates, keep z as is
    xy = reshaped_for_norm[:, :2]
    min_val = np.min(xy, axis=0, keepdims=True)
    max_val = np.max(xy, axis=0, keepdims=True)
    
    # Avoid division by zero
    range_val = max_val - min_val
    range_val[range_val < 1e-8] = 1e-8
    
    xy_normalized = 2 * ((xy - min_val) / range_val) - 1
    
    # Combine with original z coordinates
    normalized_reshaped = np.concatenate([xy_normalized, reshaped_for_norm[:, 2:]], axis=1)
    
    # Reshape back to the original (num_frames, num_features)
    return normalized_reshaped.reshape(num_frames, num_features_per_frame)

def initialize_model(config):
    """Initialize the model."""
    # Load model
    model = load_model(config.MODEL_PATH)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])
    
    # Load labels
    karsl_df = pd.read_excel(config.LABELS_PATH)
    ranges = [(250, 301)]  # Update these ranges based on your data
    selected_words = [str(num).zfill(4) for start, end in ranges for num in range(start, end)]
    mask = [str(i).zfill(4) in selected_words for i in karsl_df['SignID'].values]
    karsl_6 = karsl_df[mask].reset_index(drop=True)
    words = np.array([v for v in karsl_6['Sign-Arabic']])
    label_map = {num: label for num, label in enumerate(words)}
    
    return model, label_map

def smooth_predictions(prediction, app_state):
    """Apply smoothing techniques to predictions."""
    # Add current prediction to history
    app_state.prediction_history.append(prediction)
    
    # Calculate moving average if we have enough history
    if len(app_state.prediction_history) == app_state.prediction_history.maxlen:
        avg_prediction = np.mean(app_state.prediction_history, axis=0)
        predicted_class = np.argmax(avg_prediction)
        confidence = np.max(avg_prediction)
        
        # Only consider predictions above confidence threshold
        if confidence < 0.7:  # 70% confidence threshold
            return app_state.current_prediction, confidence
        
        # Check for consecutive consistent predictions
        if app_state.current_prediction == predicted_class:
            app_state.consecutive_count += 1
        else:
            app_state.consecutive_count = 1
            app_state.current_prediction = predicted_class
        
        # Only update if we have consistent predictions
        if app_state.consecutive_count >= 3:  # Minimum 3 consecutive frames
            app_state.current_prediction = predicted_class
            return app_state.current_prediction, confidence
    
    return app_state.current_prediction, 0  # Return 0 confidence if not enough data 