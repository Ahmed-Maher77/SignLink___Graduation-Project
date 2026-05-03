import os
import cv2
from dotenv import load_dotenv
from collections import deque
import threading

load_dotenv()

class AppConfig:
    # Model and Data Settings
    MODEL_PATH = 'model.h5'
    LABELS_PATH = 'labels.xlsx'
    
    # Video Processing Settings
    VIDEO_BUFFER_SIZE_FRAMES = 40  # Matches sequence_length in main.py
    FPS = 30
    
    # Prediction Settings
    PREDICTION_CONFIDENCE_THRESHOLD = 0.7  # 70% confidence threshold
    LOW_CONFIDENCE_STREAK_THRESHOLD = 3
    SMOOTHING_WINDOW_SIZE = 5
    
    # Display Settings
    WINDOW_NAME = 'Arabic Sign Language Recognition'
    WINDOW_WIDTH = 1280
    WINDOW_HEIGHT = 720
    PROGRESS_BAR_HEIGHT = 20
    TEXT_FONT = cv2.FONT_HERSHEY_SIMPLEX
    TEXT_FONT_SCALE = 0.8
    TEXT_THICKNESS = 2
    TEXT_COLOR_PREDICTION_HIGH_CONF = (0, 255, 0)
    TEXT_COLOR_PREDICTION_MID_CONF = (0, 255, 255)
    TEXT_COLOR_PREDICTION_LOW_CONF = (128, 128, 128)
    TEXT_COLOR_SENTENCE = (255, 255, 0)
    TEXT_START_X = 30
    TEXT_START_Y_INFO = 50
    TEXT_START_Y_PREDICTIONS = 100
    TEXT_LINE_SPACING = 35

class ApplicationState:
    def __init__(self):
        self.sentence_buffer = deque()
        self.top_k_predictions_display = []
        self.low_prob_count = 0
        self.original_sentence = ""
        self.corrected_sentence = ""
        self.prediction_history = deque(maxlen=AppConfig.SMOOTHING_WINDOW_SIZE)
        self.current_prediction = None
        self.consecutive_count = 0 