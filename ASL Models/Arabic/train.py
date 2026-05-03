# Import libraries
# Core Python
import os
import glob
import shutil
import datetime as dt
import logging
import numpy as np
import pandas as pd
import mediapipe as mp
import tensorflow as tf

# Progress bars
from tqdm import tqdm

# Plotting
import matplotlib.pyplot as plt
import seaborn as sns

# OpenCV
import cv2

# Machine Learning / Deep Learning
import tensorflow as tf
from tensorflow.keras import optimizers
from tensorflow.keras.utils import Progbar
from tensorflow.keras.optimizers import Adam, RMSprop

import keras
from keras.models import Sequential, Model
from keras.layers import (Input, Dense, Dropout, Flatten,
                          Conv1D, MaxPooling1D, Bidirectional, LSTM,
                          TimeDistributed, Concatenate, Attention)
from keras.callbacks import EarlyStopping
from keras.utils import to_categorical
from keras.regularizers import l2

# Hyperparameter Tuning
import keras_tuner as kt

# Scikit-Learn
from sklearn.model_selection import train_test_split, KFold, GridSearchCV
from sklearn.metrics import (confusion_matrix, classification_report,
                             multilabel_confusion_matrix, accuracy_score,
                             roc_curve, auc)
from sklearn.preprocessing import label_binarize

# Arabic text processing
import arabic_reshaper
from bidi.algorithm import get_display

# Multiprocessing
from multiprocessing import Pool


# Suppress TensorFlow and MediaPipe logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # TF: Only show errors
logging.getLogger('mediapipe').setLevel(logging.CRITICAL)


print("=== Versions ===")
print("MediaPipe version:", mp.__version__)
print("TensorFlow version:", tf.__version__)
print("================\n")

# Load an image
img = cv2.imread('/kaggle/input/karsl-502/02/02/test/0001/01_02_0001_(15_11_16_16_41_12)_c/01_02_0001_(15_11_16_16_41_12)_c_0003.jpg')

# Get image size
height, width = img.shape[:2]

print("=== Image Dimensions ===")
print("Width:", width)
print("Height:", height)
print("=======================\n")

# Create a Holistic object to detect pose, face, and hands keypoints
mp_holistic = mp.solutions.holistic

# Drawing utilities
mp_drawing = mp.solutions.drawing_utils 


# Optional: Set a font that supports Arabic if available.
plt.rcParams['font.family'] = 'Noto Naskh Arabic'  # Adjust this if needed

def fix_arabic(text):
    """
    Reshape and apply bidirectional reordering to Arabic text.
    Returns a prettified version of the provided text.
    """
    try:
        reshaped_text = arabic_reshaper.reshape(text)
        bidi_text = get_display(reshaped_text)
        return bidi_text
    except Exception:
        # In case of an error (or missing packages), return the original text.
        return text

def mediapipe_detection(image, model):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB) # COLOR CONVERSION BGR 2 RGB
    image.flags.writeable = False                  # Image is no longer writeable
    results = model.process(image)                 # Make prediction
    image.flags.writeable = True                   # Image is now writeable 
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR) # COLOR COVERSION RGB 2 BGR
    return image, results

def draw_styled_landmarks(image, results):
    # Draw pose connections
    mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS,
                             mp_drawing.DrawingSpec(color=(80,22,10), thickness=2, circle_radius=4), 
                             mp_drawing.DrawingSpec(color=(80,44,121), thickness=2, circle_radius=2)
                             ) 
    # Draw left hand connections
    mp_drawing.draw_landmarks(image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS, 
                             mp_drawing.DrawingSpec(color=(121,22,76), thickness=2, circle_radius=4), 
                             mp_drawing.DrawingSpec(color=(121,44,250), thickness=2, circle_radius=2)
                             ) 
    # Draw right hand connections  
    mp_drawing.draw_landmarks(image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS, 
                             mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=4), 
                             mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2)
                             ) 

def adjust_landmarks(arr,center):
    # Reshape the array to have shape (n, 3)
    arr_reshaped = arr.reshape(-1, 3)

    # Repeat the center array to have shape (n, 3)
    center_repeated = np.tile(center, (len(arr_reshaped), 1))

    # Subtract the center array from the arr array
    arr_adjusted = arr_reshaped - center_repeated

    # Reshape arr_adjusted back to shape (n*3,)
    arr_adjusted = arr_adjusted.reshape(-1)
    return(arr_adjusted)

def extract_keypoints(results):
    pose = np.array([[res.x, res.y, res.z] for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*3)
    lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
    rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
    nose=pose[:3]
    lh_wrist=lh[:3]
    rh_wrist=rh[:3]
    pose_adjusted = adjust_landmarks(pose,nose)
    lh_adjusted = adjust_landmarks(lh,lh_wrist)
    rh_adjusted = adjust_landmarks(rh,rh_wrist)
    return pose_adjusted, lh_adjusted, rh_adjusted

def augment_keypoints(keypoints, rotation_range=15, scale_range=0.2):
    """Augment 2D keypoints with rotation and scaling around centroid"""
    keypoints = keypoints.reshape(-1, 2)
    centroid = np.mean(keypoints, axis=0)
    
    # Center keypoints
    centered = keypoints - centroid
    
    # Generate random transformation
    angle = np.random.uniform(-rotation_range, rotation_range)
    scale = np.random.uniform(1 - scale_range, 1 + scale_range)
    
    # Create rotation matrix
    rot_mat = np.array([
        [np.cos(np.radians(angle)), -np.sin(np.radians(angle))],
        [np.sin(np.radians(angle)), np.cos(np.radians(angle))]
    ])
    
    # Apply transformation
    transformed = np.dot(centered, rot_mat) * scale
    
    # Restore original position
    return (transformed + centroid).flatten()

def train_model(X_train, y_train, input_shape, num_classes, params=None, **kwargs):
    """Train model with proper parameter initialization"""
    print("\n=== STARTING MODEL TRAINING ===")
    params = params or {}  # Initialize empty dict if None
    model = build_model(input_shape, num_classes, params)
    
    model.compile(
        optimizer=Adam(learning_rate=params.get('learning_rate', 0.001)),
        loss='categorical_crossentropy',
        metrics=['accuracy',
                 tf.keras.metrics.Precision(name='precision'),
                 tf.keras.metrics.Recall(name='recall')]
    )

    print("\n=== TRAINING PARAMETERS ===")
    print(f"Epochs: {params.get('epochs', 50)}")
    print(f"Batch Size: {params.get('batch_size', 32)}")
    print("==========================\n")
    
    history = model.fit(
        X_train, y_train,
        validation_data=(kwargs.get('X_val'), kwargs.get('y_val')),
        epochs=params.get('epochs', 50),
        batch_size=params.get('batch_size', 32),
        callbacks=[EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)],
        verbose=1
    )
    print("\n=== TRAINING COMPLETE ===")
    return model, history

def build_model(input_shape, num_classes, params=None):
    """Build a simpler model architecture that works with single input."""
    print("\n=== BUILDING MODEL ARCHITECTURE ===")
    params = params or {}
    
    try:
        # Input layer
        inputs = Input(shape=input_shape, name='input')
        
        # Convolutional layers for feature extraction
        x = Conv1D(params.get('filters', 64), 3, activation='relu', padding='same')(inputs)
        x = MaxPooling1D(2)(x)
        x = Conv1D(params.get('filters', 128), 3, activation='relu', padding='same')(x)
        x = MaxPooling1D(2)(x)
        
        # Bidirectional LSTM layers
        x = Bidirectional(LSTM(params.get('lstm_units', 128), 
                              return_sequences=True,
                              dropout=params.get('dropout_rate', 0.3)))(x)
        x = Bidirectional(LSTM(params.get('lstm_units', 64),
                              dropout=params.get('dropout_rate', 0.3)))(x)
        
        # Dense layers
        x = Dense(params.get('dense_units', 128), activation='relu')(x)
        x = Dropout(params.get('dropout_rate', 0.3))(x)
        outputs = Dense(num_classes, activation='softmax')(x)
        
        # Create model
        model = Model(inputs, outputs)
        
        print("\n=== MODEL SUMMARY ===")
        model.summary()
        print("=====================\n")
        
        return model
    except Exception as e:
        print(f"Error building model: {e}")
        raise

def cross_validate(X, y, input_shape, num_classes, params=None, n_splits=5):
    """Proper metric handling in cross-validation"""
    print("\n=== STARTING CROSS VALIDATION ===")
    params = params or {}
    kf = KFold(n_splits=n_splits, shuffle=True)
    accuracies = []
    
    for fold, (train_idx, val_idx) in enumerate(kf.split(X)):
        print(f"\n=== FOLD {fold + 1}/{n_splits} ===")
        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]
        
        # Train temporary model
        model, _ = train_model(
            X_train, y_train,
            input_shape, num_classes,
            params=params,
            X_val=X_val,
            y_val=y_val
        )
        
        # Get evaluation results (loss, accuracy, precision, recall)
        results = model.evaluate(X_val, y_val, verbose=0)
        acc = results[1]  # Accuracy is second metric
        accuracies.append(acc)
        print(f"Fold {fold + 1} Accuracy: {acc:.2%}")
    
    print("\n=== CROSS VALIDATION RESULTS ===")
    print(f"Mean Accuracy: {np.mean(accuracies):.2%}")
    print(f"Standard Deviation: {np.std(accuracies):.2%}")
    print("===============================\n")
    
    return np.mean(accuracies), np.std(accuracies)

def tune_hyperparameters(X, y, input_shape, num_classes, max_trials=20):
    """Keras Tuner integration for hyperparameter optimization"""
    print("\n=== STARTING HYPERPARAMETER TUNING ===")
    
    def model_builder(hp):
        params = {
            'filters': hp.Int('filters', 32, 128, step=32),
            'lstm_units': hp.Int('lstm_units', 64, 256, step=64),
            'dropout_rate': hp.Float('dropout', 0.2, 0.7, step=0.1),
            'learning_rate': hp.Choice('lr', [1e-2, 1e-3, 1e-4]),
            'dense_units': hp.Int('dense', 32, 128, step=32)
        }
        model = build_model(input_shape, num_classes, params)
        model.compile(
            optimizer=Adam(params['learning_rate']),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        return model

    tuner = kt.RandomSearch(
        model_builder,
        objective='val_accuracy',
        max_trials=max_trials,
        directory='tuning',
        project_name='pose_estimation'
    )

    tuner.search(
        X, y,
        epochs=30,
        validation_split=0.2,
        callbacks=[EarlyStopping(patience=3)],
        verbose=1
    )
    
    best_params = tuner.get_best_hyperparameters()[0].values
    print("\n=== BEST HYPERPARAMETERS ===")
    for k, v in best_params.items():
        print(f"- {k}: {v}")
    print("===========================\n")
    
    return best_params

def uniform_temporal_subsample(data, target_frames):
    """
    Subsamples a sequence to a target number of frames by selecting evenly spaced frames.
    """
    # Convert to numpy if it's a tensor
    if tf.is_tensor(data):
        data = data.numpy()
        
    num_frames = data.shape[0]
    if num_frames == target_frames:
        return data
    
    # Generate indices of frames to keep
    indices = np.linspace(0, num_frames - 1, target_frames, dtype=int)
    return data[indices]

def normalize_keypoints(data):
    """
    Normalizes keypoints across all frames.
    This implementation performs per-feature standardization (z-score normalization).
    """
    # Reshape to (num_frames * num_timesteps, num_features) to calculate global stats
    data_reshaped = data.reshape(-1, data.shape[-1])
    
    # Calculate mean and std dev across all frames for each feature
    mean = np.mean(data_reshaped, axis=0)
    std = np.std(data_reshaped, axis=0)
    
    # Avoid division by zero
    std[std == 0] = 1
    
    # Apply normalization
    normalized_data = (data - mean) / std
    return normalized_data

def process_sequence(sequence_path, sequence, f_avg, label_map, word, features, augment=False):
    """Process a sequence with enhanced path handling and debugging"""
    try:
        components = []
        
        for feature in features:
            feature_dir = f"{feature}_keypoints"
            feature_folder = os.path.join(sequence_path, feature_dir)
            
            if not os.path.exists(feature_folder):
                continue
                
            file_path = os.path.join(feature_folder, sequence)
            
            if not os.path.exists(file_path):
                continue
                
            try:
                data = np.load(file_path)
                
                if data.ndim == 1:
                    data = data.reshape(1, -1)
                    
                tensor = tf.convert_to_tensor(data, dtype=tf.float32)
                sampled = uniform_temporal_subsample(tensor, f_avg)
                components.append(sampled)
                
            except Exception as load_error:
                print(f"🚨 Error loading {file_path}: {str(load_error)}")
                continue

        if not components:
            return None, None
            
        combined = np.concatenate(components, axis=1)
        
        combined = normalize_keypoints(combined)
        
        if augment:
            # Assuming augment_keypoints should work on 3D data (x, y, z)
            # Placeholder for 3D augmentation if needed, current one is 2D
            pass
            
        return combined, label_map[word]
        
    except Exception as e:
        print(f"🔥 Critical error in process_sequence for {sequence}: {str(e)}")
        return None, None

def preprocess_data(data_path, signers, split, f_avg, features, augment=False, cache_dir=None, num_workers=4):
    """Main preprocessing function with fixed label mapping."""
    if cache_dir:
        os.makedirs(cache_dir, exist_ok=True)
        cache_file = os.path.join(cache_dir, f"{split}_X_y_{'_'.join(signers)}.npz")
        if os.path.exists(cache_file):
            print(f"Loading cached data from {cache_file}")
            data = np.load(cache_file)
            return data["X"], data["y"]
    
    sequences = []
    labels = []
    error_count = 0
    
    # Create label mapping from directory names
    # This assumes all signers have the same set of words for a given split.
    signer_split_path = os.path.join(data_path, signers[0], split)
    
    if not os.path.exists(signer_split_path):
        raise FileNotFoundError(f"Base path for label mapping not found: {signer_split_path}")

    label_samples = [d for d in os.listdir(signer_split_path) 
                    if os.path.isdir(os.path.join(signer_split_path, d))]

    if not label_samples:
        raise ValueError(f"No word directories found in {signer_split_path} to create label mapping.")
    
    label_mapping = {word: i for i, word in enumerate(sorted(label_samples))}

    all_tasks = []
    for signer in signers:
        signer_path = os.path.join(data_path, signer, split)
        if not os.path.isdir(signer_path):
            print(f"Warning: Signer directory not found: {signer_path}")
            continue
        
        word_dirs = [d for d in os.listdir(signer_path) 
                    if os.path.isdir(os.path.join(signer_path, d))]
        
        for word_dir in word_dirs:
            word_path = os.path.join(signer_path, word_dir)
            
            ref_feature = features[0]
            seq_dir = os.path.join(word_path, f'{ref_feature}_keypoints')
            
            if not os.path.exists(seq_dir):
                continue
                
            for seq_file in os.listdir(seq_dir):
                all_tasks.append((word_path, seq_file, f_avg, label_mapping, word_dir, features, augment))

    with Pool(num_workers) as pool:
        results = pool.starmap(
            process_sequence,
            tqdm(all_tasks, desc=f"Processing {split} data")
        )

    for combined, label in results:
        if combined is not None and label is not None:
            sequences.append(combined)
            labels.append(label)
        else:
            error_count += 1
            
    if error_count > 0:
        print(f"Warning: Failed to process {error_count} sequences.")

    if len(sequences) == 0:
        raise ValueError("No valid data was processed. Check input paths and data integrity.")
    
    X = np.array(sequences)
    y = to_categorical(labels, num_classes=len(label_mapping)).astype(int)

    if cache_dir:
        np.savez(cache_file, X=X, y=y)
        print(f"Saved processed data to {cache_file}")
    
    return X, y

# Define the different ranges
ranges = [(1, 502)]  # Single range as requested

# Initialize an empty list to store the results
selected_words = []

# Iterate over each range
for start, end in ranges:
    # Extend the list with zero-padded numbers in the current range
    selected_words.extend([str(num).zfill(4) for num in range(start, end)])

print("\n=== SELECTED WORDS ===")
print(selected_words)
print("=====================\n")

def make_keypoint_arrays(path,signer,split):
    """This function generates numpy arrays of keypoints for each video in the specified folder location."""
    print(f"\n=== PROCESSING KEYPOINTS FOR SIGNER {signer} {split.upper()} ===")
    os.makedirs('karsl-502',exist_ok = True)
    os.makedirs(f'karsl-502/{signer}',exist_ok = True)
    os.makedirs(f'karsl-502/{signer}/{split}',exist_ok = True)
    working_path = f'karsl-502/{signer}/{split}'
    words_folder = os.path.join(path,str(signer),str(signer), split)
    
    # Loop through all the subfolders in the folder
    for word in tqdm(selected_words):
        video_files = os.listdir(os.path.join(words_folder, word))
        
        # Loop through the video files
        for video_file in video_files:
            # Open the video file
            video = sorted(os.listdir(os.path.join(words_folder, word, video_file)))

            # Initialize the list of keypoints for this video
            pose_keypoints, lh_keypoints, rh_keypoints = [], [], []
            with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
                # Loop through the video frames
                for frame in video:
                    # Perform any necessary preprocessing on the frame
                    frame = os.path.join(words_folder, word, video_file,frame)
                    frame = cv2.imread(frame)
                    
                    # Make detections
                    image, results = mediapipe_detection(frame, holistic)

                    # Extract keypoints
                    pose, lh, rh = extract_keypoints(results)
                    
                    # Add the keypoints to the list for this video
                    pose_keypoints.append(pose)
                    lh_keypoints.append(lh)
                    rh_keypoints.append(rh)           
                    
                    # Save the keypoints for this video to a numpy array
                    pose_directory = os.path.join(working_path, word,'pose_keypoints')
                    lh_directory = os.path.join(working_path, word,'lh_keypoints')
                    rh_directory = os.path.join(working_path, word,'rh_keypoints')

                    if not os.path.exists(pose_directory):
                        os.makedirs(pose_directory)

                    if not os.path.exists(lh_directory):
                        os.makedirs(lh_directory)

                    if not os.path.exists(rh_directory):
                        os.makedirs(rh_directory)

                    pose_path = os.path.join(pose_directory, video_file)
                    np.save(pose_path, pose_keypoints)

                    lh_path = os.path.join(lh_directory, video_file)
                    np.save(lh_path, lh_keypoints)

                    rh_path = os.path.join(rh_directory, video_file)
                    np.save(rh_path, rh_keypoints)
    print("\n=== KEYPOINT EXTRACTION COMPLETE ===")

# Process all data
print("\n=== PROCESSING ALL DATA ===")
make_keypoint_arrays('/kaggle/input/karsl-502','01','train')
make_keypoint_arrays('/kaggle/input/karsl-502','01','test')
make_keypoint_arrays('/kaggle/input/karsl-502','02','train')
make_keypoint_arrays('/kaggle/input/karsl-502','02','test')
make_keypoint_arrays('/kaggle/input/karsl-502','03','train')
make_keypoint_arrays('/kaggle/input/karsl-502','03','test')
print("\n=== DATA PROCESSING COMPLETE ===")

# Load and prepare labels
print("\n=== LOADING LABELS ===")
karsl_df = pd.read_excel('/kaggle/input/labels/KARSL-502_Labels (2).xlsx')
mask = []
for i in karsl_df['SignID'].values:
    if str(i).zfill(4) in selected_words:
        mask.append(True)
    else:
        mask.append(False)
    
karsl_6 = karsl_df[mask].reset_index(drop=True)

print("\n=== LABEL MAPPING ===")
w2id = {w:i for w,i in zip(karsl_6['Sign-Arabic'].values,karsl_6['SignID'].values)}
print(w2id)

words= np.array([v for v in karsl_6['Sign-Arabic']])
print("\n=== WORDS ===")
print(words)

label_map = {label:num for num, label in enumerate(words)}
print("\n=== LABEL MAP ===")
print(label_map)
print("================\n")

# Feature constants
FEATURE_POSE = "pose"
FEATURE_LH = "lh"
FEATURE_RH = "rh"
features = [FEATURE_POSE, FEATURE_LH, FEATURE_RH]

# Data preprocessing
data_path = "/kaggle/working/karsl-502"
signers = ["01"]  # List of signers
split = "train"  # or "test"
f_avg = 40  # Number of frames to sample
augment = True  # Apply data augmentation
cache_dir = None  # Directory to cache preprocessed data
num_workers = 4  # Number of parallel workers

print("\n=== PREPROCESSING DATA ===")
X, y = preprocess_data(data_path, signers, split, f_avg, features, augment, cache_dir, num_workers)

# Split data
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
print("\n=== DATA SHAPES ===")
print("X_train:", X_train.shape)
print("y_train:", y_train.shape)
print("X_val:", X_val.shape)
print("y_val:", y_val.shape)

# Test split
test_split = "test"
print("\n=== PROCESSING TEST DATA ===")
X_test,y_test = preprocess_data(data_path, signers, test_split, f_avg, features, augment, cache_dir, num_workers)
print("\n=== TEST DATA SHAPES ===")
print("X_test:", X_test.shape)
print("y_test:", y_test.shape)

# Define input shape and number of classes
input_shape = (X_train.shape[1], X_train.shape[2])
num_classes = y_train.shape[1]
print("\n=== MODEL INPUT SHAPE ===")
print(input_shape)

# Model training pipeline
print("\n=== STARTING MODEL TRAINING PIPELINE ===")

# 1. Initial cross-validation
print("\n=== INITIAL CROSS VALIDATION ===")
base_acc, base_std = cross_validate(X_train, y_train, input_shape, num_classes)
print(f"Baseline Accuracy: {base_acc:.2%} (±{base_std:.2%})")

# 2. Hyperparameter tuning
print("\n=== HYPERPARAMETER TUNING ===")
best_params = tune_hyperparameters(X_train, y_train, input_shape, num_classes)

# 3. Final training with best parameters
print("\n=== FINAL TRAINING WITH BEST PARAMETERS ===")
final_model, history = train_model(
    X_train, y_train,
    input_shape, num_classes,
    params=best_params,
    X_val=X_val,
    y_val=y_val
)

# 4. Evaluate tuned model
print("\n=== EVALUATING TUNED MODEL ===")
tuned_acc, tuned_std = cross_validate(X_train, y_train, input_shape, num_classes, best_params)
print(f"\nTuned Model Accuracy: {tuned_acc:.2%} (±{tuned_std:.2%})")



# To see all available metrics:
print("\nAvailable history metrics:")
for key in history.history.keys():
    print(f"- {key}")

# To see numerical values:
print("\nTraining Metrics Summary:")
for metric in ['loss', 'accuracy', 'precision', 'recall']:
    print(f"Final Training {metric}: {history.history[metric][-1]:.4f}")
    if f'val_{metric}' in history.history:
        print(f"Final Validation {metric}: {history.history[f'val_{metric}'][-1]:.4f}")

# Training visualization
print("\n=== GENERATING TRAINING VISUALIZATIONS ===")
def plot_training_history(history):
    """Plot training and validation metrics across epochs"""
    metrics = ['loss', 'accuracy', 'precision', 'recall']
    
    plt.figure(figsize=(12, 8))
    
    for i, metric in enumerate(metrics):
        # Training metric
        plt.subplot(2, 2, i+1)
        plt.plot(history.history[metric], label=f'Training {metric}')
        
        # Validation metric if available
        if f'val_{metric}' in history.history:
            plt.plot(history.history[f'val_{metric}'], label=f'Validation {metric}')
            
        plt.title(metric.capitalize())
        plt.ylabel(metric)
        plt.xlabel('Epoch')
        plt.legend()
    
    plt.tight_layout()
    plt.show()
plot_training_history(history)

# Save model
print("\n=== SAVING MODEL ===")
final_model.save('arabic_sign_model.h5')
print("Model saved as 'model.h5'")

# Generate diagnostics
print("\n=== GENERATING DIAGNOSTICS ===")
def plot_diagnostics(model, X, y_true, label_map):
    """
    Generate comprehensive diagnostic plots for classification models.
    
    Parameters:
    model -- Trained Keras model.
    X -- Input data (n_samples, n_timesteps, n_features).
    y_true -- True labels (one-hot encoded or integer indices).
    label_map -- Dictionary mapping either:
                 - class indices to class names (e.g., {0: 'Class A', 1: 'Class B'}) OR
                 - class names to indices (e.g., {'Class A': 0, 'Class B': 1}).
                 
    If label_map is provided in the second format, the function will automatically invert it.
    Additionally, this function applies Arabic reshaping to labels to ensure proper display.
    """
    # Check if label_map is inverted (e.g., {'كذاب': 0, 'أناني': 1}) 
    # by testing the type of the first value. If so, invert it.
    sample_key = list(label_map.keys())[0]
    if isinstance(label_map[sample_key], int):
        # Invert the mapping so that keys are numeric labels and values are class names.
        label_map_inverted = {v: k for k, v in label_map.items()}
    else:
        label_map_inverted = label_map

    # Convert y_true to integer indices if provided as one-hot encoded vectors.
    if y_true.ndim == 2:
        y_true_indices = np.argmax(y_true, axis=1)
    else:
        y_true_indices = y_true.copy()
    
    # Debug prints (optional)
    print("Unique y_true indices:", np.unique(y_true_indices))
    print("Inverted label_map keys:", list(label_map_inverted.keys()))
    
    # Prepare the class names in a sorted order.
    try:
        sorted_keys = sorted(label_map_inverted.keys(), key=lambda x: int(x))
    except Exception:
        sorted_keys = sorted(label_map_inverted.keys())
    # Apply the fix_arabic function to each label so it prints prettily.
    class_names = [fix_arabic(label_map_inverted[k]) for k in sorted_keys]
    n_classes = len(class_names)
    unique_classes = np.arange(n_classes)  # Assuming classes are 0-indexed

    # Get model predictions.
    y_pred = model.predict(X, verbose=0)
    y_pred_classes = np.argmax(y_pred, axis=1)

    # Create figure for diagnostic plots.
    plt.figure(figsize=(18, 12))
    plt.suptitle("Model Diagnostics", fontsize=16, y=1.02)

    # 1. Confusion Matrix (using the inverted mapping and prettified labels)
    plt.subplot(2, 2, 1)
    cm = confusion_matrix(
        [fix_arabic(label_map_inverted[i]) for i in y_true_indices],
        [fix_arabic(label_map_inverted[i]) for i in y_pred_classes]
    )
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=class_names, yticklabels=class_names,
                cbar=False)
    plt.title('Confusion Matrix')
    plt.xlabel('Predicted Label')
    plt.ylabel('True Label')

    # 2. ROC Curves (handles binary and multiclass)
    plt.subplot(2, 2, 2)
    if n_classes == 2:
        # For binary classification, use the probability for the positive class.
        fpr, tpr, _ = roc_curve(y_true_indices, y_pred[:, 1])
        roc_auc = auc(fpr, tpr)
        plt.plot(fpr, tpr, label=f'AUC = {roc_auc:.2f}', lw=2)
    else:
        # For multiclass, binarize true labels and plot one ROC per class.
        y_true_bin = label_binarize(y_true_indices, classes=unique_classes)
        for i in unique_classes:
            fpr, tpr, _ = roc_curve(y_true_bin[:, i], y_pred[:, i])
            roc_auc = auc(fpr, tpr)
            plt.plot(fpr, tpr, lw=2,
                     label=f'{class_names[i]} (AUC = {roc_auc:.2f})')
    
    plt.plot([0, 1], [0, 1], 'k--', lw=1)
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.title('ROC Curves')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.legend(loc='lower right')

    # 3. Classification Report
    plt.subplot(2, 2, 3)
    report = classification_report(y_true_indices, y_pred_classes,
                                   target_names=class_names,
                                   output_dict=True)
    df_report = pd.DataFrame(report).T.round(2)
    sns.heatmap(df_report.iloc[:-1, :], annot=True, cmap='Greens',
                cbar=False, fmt='g')
    plt.title('Classification Report')
    plt.xlabel('Metric')
    plt.ylabel('Class')

    # 4. Prediction Confidence Distribution
    plt.subplot(2, 2, 4)
    max_probs = np.max(y_pred, axis=1)
    correct = y_pred_classes == y_true_indices
    sns.histplot(x=max_probs, hue=correct, element='step',
                 stat='probability', common_norm=False,
                 palette={True: 'green', False: 'red'})
    plt.title('Prediction Confidence Distribution')
    plt.xlabel('Maximum Class Probability')
    plt.ylabel('Density')
    plt.legend(labels=['Correct', 'Incorrect'])

    plt.tight_layout()
    plt.show()

plot_diagnostics(final_model, X_test, y_test, label_map)

print("\n=== ALL PROCESSES COMPLETE ===")