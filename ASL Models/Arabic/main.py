#main.py
import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import load_model
import arabic_reshaper
from bidi.algorithm import get_display
from collections import deque

# Initialize MediaPipe Holistic
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils 

# Load your trained model
model = load_model('model.h5')  # Update with your model path
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])
# Arabic label mapping (update with your actual labels)
# Define the different ranges
ranges = [(250, 301)]
selected_words = [str(num).zfill(4) for start, end in ranges for num in range(start, end)]
karsl_df = pd.read_excel("labels.xlsx")
mask = [str(i).zfill(4) in selected_words for i in karsl_df['SignID'].values]
karsl_6 = karsl_df[mask].reset_index(drop=True)
words = np.array([v for v in karsl_6['Sign-Arabic']])
label_map = {num:label for num, label in enumerate(words)}

# Prediction smoothing parameters
SMOOTHING_WINDOW_SIZE = 5  # Number of predictions to average
CONFIDENCE_THRESHOLD = 0.7  # Only show predictions above this confidence
MIN_CONSECUTIVE_FRAMES = 3  # Only update prediction after N consistent frames

# Initialize smoothing buffers
prediction_history = deque(maxlen=SMOOTHING_WINDOW_SIZE)
current_prediction = None
consecutive_count = 0

def fix_arabic(text):
    """Reshape and apply bidirectional reordering to Arabic text."""
    try:
        reshaped_text = arabic_reshaper.reshape(text)
        return get_display(reshaped_text)
    except:
        return text

def adjust_landmarks(arr, center):
    """Center-normalize landmarks around a reference point."""
    arr_reshaped = arr.reshape(-1, 3)
    center_repeated = np.tile(center, (len(arr_reshaped), 1))
    arr_adjusted = arr_reshaped - center_repeated
    return arr_adjusted.reshape(-1)

def extract_keypoints(results):
    """Extract and normalize keypoints from MediaPipe results."""
    pose = np.array([[res.x, res.y, res.z] for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*3)
    lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
    rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
    
    # Center normalization
    nose = pose[:3]
    lh_wrist = lh[:3] if results.left_hand_landmarks else np.zeros(3)
    rh_wrist = rh[:3] if results.right_hand_landmarks else np.zeros(3)
    
    pose_adjusted = adjust_landmarks(pose, nose)
    lh_adjusted = adjust_landmarks(lh, lh_wrist)
    rh_adjusted = adjust_landmarks(rh, rh_wrist)
    
    return pose_adjusted, lh_adjusted, rh_adjusted

def normalize_keypoints(keypoints):
    """Normalize keypoints to [-1, 1] range."""
    if keypoints.size == 0:
        return keypoints
    
    # Reshape to (num_keypoints, 3)
    original_shape = keypoints.shape
    reshaped = keypoints.reshape(-1, 3)
    
    # Normalize only x and y coordinates
    xy = reshaped[:, :2]
    min_val = np.min(xy, axis=0, keepdims=True)
    max_val = np.max(xy, axis=0, keepdims=True)
    xy_normalized = 2 * ((xy - min_val) / (max_val - min_val + 1e-8)) - 1
    
    # Combine with original z coordinates (don't normalize z)
    normalized = np.concatenate([xy_normalized, reshaped[:, 2:]], axis=1)
    return normalized.reshape(original_shape)

def process_frame(frame, holistic):
    """Process a single frame and extract features."""
    # Convert to RGB and process with MediaPipe
    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = holistic.process(image)
    
    # Extract keypoints
    pose, lh, rh = extract_keypoints(results)
    
    # Combine features (same order as training)
    combined = np.concatenate([pose, lh, rh])
    
    return combined

def smooth_predictions(prediction):
    """Apply smoothing techniques to predictions."""
    global prediction_history, current_prediction, consecutive_count
    
    # Add current prediction to history
    prediction_history.append(prediction)
    
    # Calculate moving average if we have enough history
    if len(prediction_history) == SMOOTHING_WINDOW_SIZE:
        avg_prediction = np.mean(prediction_history, axis=0)
        predicted_class = np.argmax(avg_prediction)
        confidence = np.max(avg_prediction)
        
        # Only consider predictions above confidence threshold
        if confidence < CONFIDENCE_THRESHOLD:
            return current_prediction, confidence
        
        # Check for consecutive consistent predictions
        if current_prediction == predicted_class:
            consecutive_count += 1
        else:
            consecutive_count = 1
            current_prediction = predicted_class
        
        # Only update if we have consistent predictions
        if consecutive_count >= MIN_CONSECUTIVE_FRAMES:
            current_prediction = predicted_class
            return current_prediction, confidence
    
    return current_prediction, 0  # Return 0 confidence if not enough data

# Initialize sliding window buffer
sequence_length = 40  # Should match your training sequence length
sequence_buffer = []

# Main camera loop
# Main camera loop
cap = cv2.VideoCapture(0)
with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        # Flip frame horizontally for mirror effect
        frame = cv2.flip(frame, 1)
        
        # Process frame and get keypoints
        keypoints = process_frame(frame, holistic)
        
        # Add to sequence buffer
        sequence_buffer.append(keypoints)
        if len(sequence_buffer) > sequence_length:
            sequence_buffer.clear()
        
        # When we have enough frames, make a prediction
        if len(sequence_buffer) == sequence_length:
            # Convert to numpy array and normalize
            sequence = np.array(sequence_buffer)
            sequence = normalize_keypoints(sequence)
            
            # Add batch dimension and predict
            sequence = np.expand_dims(sequence, axis=0)
            prediction = model.predict(sequence, verbose=0)[0]
            
            # Get top 5 predictions
            top5_indices = np.argsort(prediction)[-5:][::-1]  # Indices of top 5 predictions
            top5_confidences = prediction[top5_indices]  # Corresponding confidence values
            top5_labels = [label_map.get(i, "Unknown") for i in top5_indices]
            
            # Print top 5 predictions
            print("\nTop 5 Predictions:")
            for i, (label, conf) in enumerate(zip(top5_labels, top5_confidences)):
                print(f"{i+1}. {fix_arabic(label)}: {conf:.4f}")
            
            # Apply smoothing techniques to the top prediction
            smoothed_class, confidence = smooth_predictions(prediction)
            
            # Only display if we have a confident prediction
            if confidence >= CONFIDENCE_THRESHOLD:
                label = label_map.get(smoothed_class, "Unknown")
                arabic_label = fix_arabic(label)
                
                # Display prediction with confidence
                display_text = f"{arabic_label} ({confidence:.2f})"
                cv2.putText(frame, display_text, 
                           (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 
                           1, (0, 255, 0), 2, cv2.LINE_AA)
            else:
                cv2.putText(frame, "Processing...", 
                           (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 
                           1, (0, 0, 255), 2, cv2.LINE_AA)
        
        # Display the buffer fill progress bar
        bar_x, bar_y = 50, 20
        bar_width, bar_height = 400, 20
        fill_ratio = min(len(sequence_buffer) / sequence_length, 1.0)
        fill_width = int(bar_width * fill_ratio)
        # Draw background bar (gray)
        cv2.rectangle(frame, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), (180, 180, 180), -1)
        # Draw filled part (green)
        cv2.rectangle(frame, (bar_x, bar_y), (bar_x + fill_width, bar_y + bar_height), (0, 255, 0), -1)
        # Draw border
        cv2.rectangle(frame, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), (0, 0, 0), 2)
        # Optional: Add text
        cv2.putText(frame, f"Buffer: {len(sequence_buffer)}/{sequence_length}", (bar_x, bar_y + bar_height + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (50, 50, 50), 2, cv2.LINE_AA)
        
        # Display the frame
        cv2.imshow('Sign Language Recognition', frame)
        
        # Exit on 'q' key
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()