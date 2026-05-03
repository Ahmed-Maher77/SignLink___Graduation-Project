import os
import cv2
from dotenv import load_dotenv
from collections import deque
import threading

load_dotenv()

class AppConfig:
    USE_460_CLASS_MODEL = True  
    
    NUM_CLASSES = 460 if USE_460_CLASS_MODEL else 300
    LABEL_MAP_PATH = 'models/aslcitizen_460_label_map.json' if USE_460_CLASS_MODEL else 'models/aslcitizen_300_label_map.json'
    MODEL_CHECKPOINT_PATH = 'models/slowfast_460.pth' if USE_460_CLASS_MODEL else 'models/slowfast_300.pth'
    
    SKIPPED_WORDS = ['HUG', 'SKIN', 'BONE', "INTUITIVE", "SLAVE", "NECK", "IMPROVE", "WHITE"]

    SIDE_SIZE = 256
    MEAN = [0.45, 0.45, 0.45]
    STD = [0.225, 0.225, 0.225]
    CROP_SIZE = 256
    NUM_FRAMES_INPUT = 32
    SAMPLING_RATE = 2
    SLOWFAST_ALPHA = 4
    FPS = 30
    VIDEO_BUFFER_SIZE_FRAMES = 80 
    
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    GRAMMAR_API_URL = "https://openrouter.ai/api/v1/chat/completions"
    GRAMMAR_API_MODEL = "qwen/qwen2.5-vl-3b-instruct:free"
    GRAMMAR_SYSTEM_PROMPT = "Correct the grammar of the following sentence without adding any new information or nouns and respond with the corrected sentence only."
    API_TIMEOUT_SECONDS = 5

    PREDICTION_CONFIDENCE_THRESHOLD = 50
    LOW_CONFIDENCE_STREAK_THRESHOLD = 2
    SENTENCE_MIN_WORDS_FOR_CORRECTION = 3
    SPECIAL_CASE_HOW_YOU_INPUT = ["HOW", "YOU"]
    SPECIAL_CASE_HOW_YOU_OUTPUT = "How are you?"

    WINDOW_NAME = 'Live Feed'
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
        self.last_original_sent_for_grammar = ""
        self.last_corrected_sentence_from_api = ""
        self.grammar_result_lock = threading.Lock()
        self.original_sentence = ""
        self.corrected_sentence = ""