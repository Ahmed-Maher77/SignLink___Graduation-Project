import requests
import numpy as np
import torch
import torch.nn as nn
from torchvision.transforms import Compose, Lambda
from torchvision.transforms._transforms_video import CenterCropVideo, NormalizeVideo
from pytorchvideo.transforms import UniformTemporalSubsample, ShortSideScale, ApplyTransformToKey
from pytorchvideo.models.hub import slowfast_r50

from app_settings import AppConfig

def get_api_corrected_sentence(sentence_to_correct, config: AppConfig):
    if not config.OPENROUTER_API_KEY:
        return "API_N/A"
    headers = {"Authorization": f"Bearer {config.OPENROUTER_API_KEY}"}
    messages = [
        {"role": "system", "content": config.GRAMMAR_SYSTEM_PROMPT},
        {"role": "user", "content": sentence_to_correct}
    ]
    data = {"model": config.GRAMMAR_API_MODEL, "messages": messages}
    try:
        session = requests.Session()
        session.mount('https://', requests.adapters.HTTPAdapter(
            max_retries=1,
            pool_connections=1,
            pool_maxsize=1
        ))
            
        response = session.post(
            config.GRAMMAR_API_URL,
            headers=headers,
            json=data,
            timeout=(2, config.API_TIMEOUT_SECONDS)  
        )
        
        # Check for rate limit or quota exceeded
        if response.status_code == 429:
            print("API Rate limit exceeded or quota depleted", flush=True)
            return "API_N/A"
            
        response.raise_for_status()
        
        # Check response content
        response_json = response.json()
        if "error" in response_json:
            error_msg = response_json.get("error", {}).get("message", "Unknown API error")
            print(f"API Error: {error_msg}", flush=True)
            if "quota" in error_msg.lower() or "limit" in error_msg.lower():
                print("API quota exceeded or rate limited", flush=True)
            return "API_N/A"
            
        return response_json["choices"][0]["message"]["content"].strip()
    except requests.exceptions.Timeout:
        print("Grammar API timeout", flush=True)
        return "API_N/A"
    except requests.exceptions.RequestException as e:
        print(f"Grammar API error: {e}", flush=True)
        if hasattr(e.response, 'status_code'):
            if e.response.status_code == 429:
                print("API Rate limit exceeded or quota depleted", flush=True)
            elif e.response.status_code == 401:
                print("API Key invalid or expired", flush=True)
        return "API_N/A"
    except (KeyError, IndexError, TypeError) as e:
        print(f"Grammar API response parsing error: {e}", flush=True)
        return "API_N/A"
    finally:
        session.close()

def uniform_subsample(frames_list, num_samples):
    if not frames_list: return np.array([])
    indices = np.linspace(0, len(frames_list) - 1, num_samples, dtype=int)
    return np.array(frames_list)[indices]

class LocalPackPathway(nn.Module): 
    def __init__(self, alpha_val):
        super().__init__()
        self.alpha = alpha_val
    
    def forward(self, frames: torch.Tensor): 
        fast_pathway = frames
        slow_pathway = torch.index_select(
            frames, 1, torch.linspace(0, frames.shape[1] - 1, frames.shape[1] // self.alpha).long()
        )
        return [slow_pathway, fast_pathway]

def initialize_model_and_transforms(config: AppConfig, device: torch.device):
    val_transform = ApplyTransformToKey(
        key='video',
        transform=Compose([
            UniformTemporalSubsample(config.NUM_FRAMES_INPUT),
            Lambda(lambda x: x / 255.0),
            NormalizeVideo(config.MEAN, config.STD),
            ShortSideScale(size=config.SIDE_SIZE),
            CenterCropVideo(config.CROP_SIZE),
            LocalPackPathway(alpha_val=config.SLOWFAST_ALPHA), 
        ])
    )
    print('Loading model (this might take a moment)...', flush=True)
    model = slowfast_r50(pretrained=True)
    model.blocks[-1].proj = nn.Sequential(
        nn.Dropout(0.5),
        nn.Linear(model.blocks[-1].proj.in_features, config.NUM_CLASSES)
    )
    checkpoint = torch.load(config.MODEL_CHECKPOINT_PATH, map_location=device)
    if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
        model.load_state_dict(checkpoint['model_state_dict'])
    else:
        model.load_state_dict(checkpoint)
    model = model.to(device)
    model.eval()
    print('Model loaded and set to eval mode.', flush=True)
    return model, val_transform

def check_api_availability(config: AppConfig) -> bool:
    """Check if the OpenRouter API is available and the key is valid."""
    if not config.OPENROUTER_API_KEY:
        print("No API key provided", flush=True)
        return False
        
    headers = {"Authorization": f"Bearer {config.OPENROUTER_API_KEY}"}
    messages = [
        {"role": "system", "content": "Test message"},
        {"role": "user", "content": "Test"}
    ]
    data = {"model": config.GRAMMAR_API_MODEL, "messages": messages}
    
    try:
        session = requests.Session()
        session.mount('https://', requests.adapters.HTTPAdapter(
            max_retries=1,
            pool_connections=1,
            pool_maxsize=1
        ))
        
        response = session.post(
            config.GRAMMAR_API_URL,
            headers=headers,
            json=data,
            timeout=(2, config.API_TIMEOUT_SECONDS)
        )
        
        if response.status_code == 429:
            print("API Rate limit exceeded or quota depleted at startup", flush=True)
            return False
            
        response.raise_for_status()
        
        response_json = response.json()
        if "error" in response_json:
            error_msg = response_json.get("error", {}).get("message", "Unknown API error")
            print(f"API Error at startup: {error_msg}", flush=True)
            if "quota" in error_msg.lower() or "limit" in error_msg.lower():
                print("API quota exceeded or rate limited at startup", flush=True)
            return False
            
        print("API connection successful", flush=True)
        return True
        
    except requests.exceptions.Timeout:
        print("API timeout at startup", flush=True)
        return False
    except requests.exceptions.RequestException as e:
        print(f"API error at startup: {e}", flush=True)
        if hasattr(e.response, 'status_code'):
            if e.response.status_code == 429:
                print("API Rate limit exceeded or quota depleted at startup", flush=True)
            elif e.response.status_code == 401:
                print("API Key invalid or expired at startup", flush=True)
        return False
    except Exception as e:
        print(f"Unexpected error checking API at startup: {e}", flush=True)
        return False
    finally:
        session.close()