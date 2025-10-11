import os
import torch
from typing import List
from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights
from natsort import natsorted
from PIL import Image

def frame_reduction_pipeline(frames_dir: str) -> List[str] :
    BATCH_SIZE = 300
    THRESHOLD = 0.9
    device = "cuda" if torch.cuda.is_available() else "cpu"
    frames = natsorted(os.listdir(frames_dir))
    selected_frames = []

    weights = MobileNet_V3_Small_Weights.DEFAULT
    model = torch.nn.Sequential(*list(mobilenet_v3_small(weights=weights).children())[:-1])
    model = model.to(device).eval()
    preprocess = weights.transforms()

    prev = None
    for i in range(0, len(frames), BATCH_SIZE):
        batch_frames = frames[i : i+BATCH_SIZE]
        imgs = [preprocess(Image.open(os.path.join(frames_dir, f)).convert("RGB")) for f in batch_frames]
        batch = torch.stack(imgs).to(device)
        with torch.no_grad():
            embs = model(batch)
            embs = torch.nn.functional.normalize(embs.view(embs.size(0), -1), dim=-1)
        
        if prev is not None:
            score = torch.sum(prev * embs[0]).item()
            if score < THRESHOLD:
                selected_frames.append(frames[i-1])
        scores = torch.sum(embs[:-1] * embs[1:], dim=-1).cpu().numpy()
        for j, score in enumerate(scores):
            if score < THRESHOLD:
                selected_frames.append(frames[i+j])

    return selected_frames