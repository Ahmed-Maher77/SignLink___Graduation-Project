from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import cv2
import mediapipe as mp
import numpy as np
import pickle

# Load the trained model
model_dict = pickle.load(open('./model.p', 'rb'))
model = model_dict['model']

# Mediapipe setup
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, min_detection_confidence=0.5, max_num_hands=1)

# Label mapping
labels_dict = {
    0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'J', 10: 'K', 11: 'L', 12: 'M',
    13: 'N', 14: 'O', 15: 'P', 16: 'Q', 17: 'R', 18: 'S', 19: 'T', 20: 'U', 21: 'V', 22: 'W', 23: 'X', 24: 'Y',
    25: 'Z', 26: '0', 27: '1', 28: '2', 29: '3', 30: '4', 31: '5', 32: '6', 33: '7', 34: '8', 35: '9'
}
expected_features = 42

# Initialize FastAPI app
app = FastAPI()

# Initialize video capture
cap = cv2.VideoCapture(0)

@app.get("/")
def root():
    return {"message": "Hand Gesture Recognition API is running!"}

@app.get("/predict")
def predict():
    ret, frame = cap.read()
    if not ret:
        raise HTTPException(status_code=500, detail="Could not capture frame from the webcam.")

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(frame_rgb)

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            data_aux = []
            x_ = []
            y_ = []

            for landmark in hand_landmarks.landmark:
                x_.append(landmark.x)
                y_.append(landmark.y)

            for landmark in hand_landmarks.landmark:
                data_aux.append(landmark.x - min(x_))
                data_aux.append(landmark.y - min(y_))

            # Ensure valid data
            if len(data_aux) < expected_features:
                data_aux.extend([0] * (expected_features - len(data_aux)))
            elif len(data_aux) > expected_features:
                data_aux = data_aux[:expected_features]

            # Predict gesture
            prediction = model.predict([np.asarray(data_aux)])
            predicted_label = int(prediction[0])

            # Check if the predicted label exists in labels_dict
            if predicted_label in labels_dict:
                predicted_character = labels_dict[predicted_label]
                return JSONResponse(content={"gesture": predicted_character})
            else:
                return JSONResponse(content={"gesture": "Unknown Gesture"})

    raise HTTPException(status_code=404, detail="No hand detected.")

# Cleanup on shutdown
@app.on_event("shutdown")
def shutdown_event():
    cap.release()
    cv2.destroyAllWindows()
