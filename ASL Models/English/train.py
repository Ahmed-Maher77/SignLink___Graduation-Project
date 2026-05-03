import sys
import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import pytorchvideo
from torch.utils.data import DataLoader, Dataset
from sklearn.model_selection import train_test_split
import pandas as pd
import os
import matplotlib.pyplot as plt
from torchvision.transforms import Compose, Lambda, ColorJitter
from torchvision.transforms._transforms_video import (
    CenterCropVideo,
    NormalizeVideo,
    RandomCropVideo
)
from pytorchvideo.data.encoded_video import EncodedVideo
from pytorchvideo.models.hub import slowfast_r50
from pytorchvideo.transforms import (
    ApplyTransformToKey,
    ShortSideScale,
    UniformTemporalSubsample,
)
from tqdm import tqdm
import json
class VideoColorJitter(nn.Module):
    def __init__(self, brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1):
        super().__init__()
        self.jitter = ColorJitter(brightness, contrast, saturation, hue)
    
    def forward(self, video: torch.Tensor) -> torch.Tensor:
        # Video is in (C, T, H, W) with C==3 or 1.
        # Permute to (T, H, W, C) for per-frame processing.
        if video.ndim == 4 and video.shape[0] in [1, 3]:
            video = video.permute(1, 2, 3, 0)
        jittered_frames = []
        for frame in video:  
            frame = frame.permute(2, 0, 1)  # -> (C, H, W)
            frame = self.jitter(frame)
            frame = frame.permute(1, 2, 0)  # -> (H, W, C)
            jittered_frames.append(frame)
        video = torch.stack(jittered_frames, dim=0)  # (T, H, W, C)
        # Permute back to (C, T, H, W)
        video = video.permute(3, 0, 1, 2)
        return video

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

print("Loading the model...")
model = slowfast_r50(pretrained=True)
print("Model loaded.")

num_classes = 460
print(f"Updating projection layer to handle {num_classes} classes...")
model.blocks[-1].proj = nn.Sequential(
    nn.Dropout(0.5),
    nn.Linear(model.blocks[-1].proj.in_features, num_classes)
)
print("Updated model projection layer.")
model = model.to(device)

side_size = 256
mean = [0.45, 0.45, 0.45]
std = [0.225, 0.225, 0.225]
crop_size = 256
num_frames = 32
sampling_rate = 2
frames_per_second = 30
slowfast_alpha = 4
clip_duration = (num_frames * sampling_rate) / frames_per_second

class PackPathway(nn.Module):
    def __init__(self, alpha=4):
        super().__init__()
        self.alpha = alpha

    def forward(self, frames: torch.Tensor):
        fast_pathway = frames
        slow_pathway = torch.index_select(
            frames, 1, torch.linspace(0, frames.shape[1]-1, frames.shape[1] // self.alpha).long()
        )
        return [slow_pathway, fast_pathway]

train_transform = ApplyTransformToKey(
    key="video",
    transform=Compose([
        UniformTemporalSubsample(num_frames),
        Lambda(lambda x: x / 255.0),
        VideoColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
        NormalizeVideo(mean, std),
        ShortSideScale(size=side_size),
        RandomCropVideo(crop_size),
        PackPathway(alpha=slowfast_alpha),
    ])
)

val_transform = ApplyTransformToKey(
    key="video",
    transform=Compose([
        UniformTemporalSubsample(num_frames),
        Lambda(lambda x: x / 255.0),
        NormalizeVideo(mean, std),
        ShortSideScale(size=side_size),
        CenterCropVideo(crop_size),
        PackPathway(alpha=slowfast_alpha),
    ])
)

def combine_csvs(train_csv, val_csv, test_csv):
    return pd.concat([pd.read_csv(train_csv), pd.read_csv(val_csv), pd.read_csv(test_csv)], ignore_index=True)

def filter_signs(data, signs_txt):
    with open(signs_txt, 'r') as file:
        allowed_signs = set(file.read().splitlines())
    return data[data['Gloss'].isin(allowed_signs)]

def split_data(data, train_ratio=0.8):
    return train_test_split(data, test_size=1-train_ratio, stratify=data['Gloss'], random_state=42)

class ASLDataset(Dataset):
    def __init__(self, dataframe, video_dir, transform=None):
        self.data = dataframe
        self.video_dir = video_dir
        self.transform = transform
        unique_classes = sorted(self.data['Gloss'].unique())
        self.label_map = {gloss: idx for idx, gloss in enumerate(unique_classes)}
        self.data['Label'] = self.data['Gloss'].map(self.label_map)
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        video_path = os.path.join(self.video_dir, self.data.iloc[idx]['Video file'])
        label = self.data.iloc[idx]['Label']
        try:
            video = EncodedVideo.from_path(video_path)
            video_data = video.get_clip(0, clip_duration)
        except Exception as e:
            print(f"Error loading video: {video_path}, Error: {e}")
            raise e
        if self.transform:
            video_data = self.transform(video_data)
        frames = video_data["video"]
        return frames, label

train_csv = 'train.csv'
val_csv = 'val.csv'
test_csv = 'test.csv'
video_dir = 'videos'
signs_txt = 'top460.txt'

combined_data = combine_csvs(train_csv, val_csv, test_csv)
filtered_data = filter_signs(combined_data, signs_txt)
train_data, val_data = split_data(filtered_data)

train_dataset = ASLDataset(train_data, video_dir, transform=train_transform)
val_dataset = ASLDataset(val_data, video_dir, transform=val_transform)

train_loader = DataLoader(train_dataset, batch_size=4, shuffle=True, num_workers=os.cpu_count(), pin_memory=True)
val_loader = DataLoader(val_dataset, batch_size=4, shuffle=False, num_workers=os.cpu_count(), pin_memory=True)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=1e-4, weight_decay=1e-4)
epochs = 10
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
checkpoint_path = "last_model.pth"

start_epoch = 0
best_val_loss = float('inf')
if os.path.exists(checkpoint_path):
    checkpoint = torch.load(checkpoint_path, map_location=device)
    if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
        model.load_state_dict(checkpoint['model_state_dict'])
        optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        scheduler.load_state_dict(checkpoint['scheduler_state_dict'])
        start_epoch = checkpoint['epoch'] + 1
        best_val_loss = checkpoint['best_val_loss']
        history = checkpoint.get('history', {'train_loss': [], 'train_acc': [], 'val_loss': [], 'val_acc': []})
        print(f"Resuming training from epoch {start_epoch}")
    else:
        model.load_state_dict(checkpoint)
        history = {'train_loss': [], 'train_acc': [], 'val_loss': [], 'val_acc': []}
        print("Old checkpoint loaded; optimizer and scheduler state not loaded.")
else:
    history = {'train_loss': [], 'train_acc': [], 'val_loss': [], 'val_acc': []}
patience = 3
wait = 0

for epoch in range(start_epoch, epochs):
    model.train()
    running_loss, running_corrects = 0.0, 0
    for inputs, labels in tqdm(train_loader, desc=f"Epoch {epoch+1}/{epochs}"):
        labels = labels.to(device)
        inputs = [inp.to(device) for inp in inputs]
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        batch_size = labels.size(0)
        running_loss += loss.item() * batch_size
        preds = torch.argmax(outputs, dim=1)
        running_corrects += torch.sum(preds == labels).item()
    
    train_loss = running_loss / len(train_dataset)
    train_acc = running_corrects / len(train_dataset)
    history['train_loss'].append(train_loss)
    history['train_acc'].append(train_acc)
    
    model.eval()
    val_loss, val_corrects = 0.0, 0
    with torch.no_grad():
        for inputs, labels in val_loader:
            labels = labels.to(device)
            inputs = [inp.to(device) for inp in inputs]
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            batch_size = labels.size(0)
            val_loss += loss.item() * batch_size
            preds = torch.argmax(outputs, dim=1)
            val_corrects += torch.sum(preds == labels).item()
    val_loss = val_loss / len(val_dataset)
    val_acc = val_corrects / len(val_dataset)
    history['val_loss'].append(val_loss)
    history['val_acc'].append(val_acc)
    
    print(f"\nEpoch {epoch+1}/{epochs}")
    print(f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.4f}")
    print(f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.4f}\n")
    
    scheduler.step()
    
    checkpoint = {
        'epoch': epoch,
        'model_state_dict': model.state_dict(),
        'optimizer_state_dict': optimizer.state_dict(),
        'scheduler_state_dict': scheduler.state_dict(),
        'best_val_loss': best_val_loss,
        'history': history
    }
    torch.save(checkpoint, "last_model.pth")
    
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        wait = 0
        torch.save(checkpoint, "best_model.pth")
    else:
        wait += 1
        if wait >= patience:
            print("Early stopping triggered.")
            break


history_df = pd.DataFrame(history)
history_df.to_csv("training_history.csv", index=False)

plt.figure(figsize=(12, 5))
plt.subplot(1, 2, 1)
plt.plot(history['train_loss'], label='Train Loss')
plt.plot(history['val_loss'], label='Val Loss')
plt.title('Loss Over Epochs')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(history['train_acc'], label='Train Acc')
plt.plot(history['val_acc'], label='Val Acc')
plt.title('Accuracy Over Epochs')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()

plt.tight_layout()
plt.savefig('training_metrics.png')
plt.close()

print("Training complete. History and plots saved.")

label_map_save_path = "aslcitizen_460_label_map.json"
with open(label_map_save_path, "w") as f:
    json.dump(train_dataset.label_map, f)
print(f"Label mapping saved to {label_map_save_path}")