import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
from tensorflow.keras.models import load_model

# ========== Load Model ==========
model = load_model("Stop_Sign.keras")

# ========== Initialize MediaPipe ==========
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils

# ========== Helper Functions ==========
def adjust_landmarks(arr, center):
    if np.count_nonzero(arr) == 0:
        return arr
    arr_reshaped = arr.reshape(-1, 3)
    center_repeated = np.tile(center, (len(arr_reshaped), 1))
    arr_adjusted = arr_reshaped - center_repeated
    return arr_adjusted.flatten()

def extract_keypoints(results):
    if results.multi_hand_landmarks:
        hand_landmarks = results.multi_hand_landmarks[0]
        hand = np.array([[lm.x, lm.y, lm.z] for lm in hand_landmarks.landmark]).flatten()
        wrist = hand[:3]
        hand_normalized = adjust_landmarks(hand, wrist)
        return hand_normalized
    return np.zeros(21 * 3)

# ========== Frame Sequence for LSTM ==========
sequence = []
SEQ_LENGTH = 16  # LSTM expects 16 frames

# ========== Start Webcam ==========
cap = cv2.VideoCapture(0)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Flip and convert color for MediaPipe
    image = cv2.cvtColor(cv2.flip(frame, 1), cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = hands.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

    # Draw hand landmarks
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(image, hand_landmarks, mp_hands.HAND_CONNECTIONS)

    # Extract normalized keypoints
    keypoints = extract_keypoints(results)
    sequence.append(keypoints)
    if len(sequence) > SEQ_LENGTH:
        sequence.pop(0)

    # If sequence is ready, make prediction
    if len(sequence) == SEQ_LENGTH:
        input_data = np.expand_dims(sequence, axis=0)  # Shape: (1, 16, 63)
        prediction = model.predict(input_data)[0][0]

        label = "Y" if prediction > 0.5 else "Other"
        confidence = f"{prediction:.2f}"

        # Display prediction
        color = (0, 255, 0) if label == "Y" else (0, 0, 255)
        cv2.putText(image, f"Prediction: {label} ({confidence})", (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)

    # Show frame
    cv2.imshow('ASL Detection', image)

    # Press 'q' to exit
    if cv2.waitKey(10) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
