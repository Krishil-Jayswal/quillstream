import os
import json
import math
import torch
from tqdm import tqdm
from typing import List
from natsort import natsorted
from PIL import Image
from rich.console import Console
from rich.table import Table
from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights
from concurrent.futures import ThreadPoolExecutor
from schema import SelectedFrames

console = Console()

def frame_reduction_pipeline(frames_dir: str) -> str :
    BATCH_SIZE = 300
    THRESHOLD = 0.9
    device = "cuda" if torch.cuda.is_available() else "cpu"
    frames = natsorted(os.listdir(frames_dir))
    selected_frames: List[str] = []

    weights = MobileNet_V3_Small_Weights.DEFAULT
    model = torch.nn.Sequential(*list(mobilenet_v3_small(weights=weights).children())[:-1])
    model = model.to(device).eval()
    preprocess = weights.transforms()

    def load_and_preprocess(frame_name: str):
        path = os.path.join(frames_dir, frame_name)
        img = Image.open(path).convert("RGB")
        return preprocess(img)

    prev = None
    total_batches = math.ceil(len(frames) / BATCH_SIZE)

    console.rule("[bold green] Starting Frame Reduction Pipeline")
    console.print(f"Frames Directory: [cyan]{frames_dir}")
    console.print(f"Device: [magenta]{device}")
    console.print(f"Total Frames: [yellow]{len(frames)} ({total_batches} batches)\n")

    with tqdm(total=len(frames), desc="Processing Frames", ncols=100, colour="green") as pbar:
        for i in range(0, len(frames), BATCH_SIZE):
            batch_frames = frames[i : i+BATCH_SIZE]

            with ThreadPoolExecutor(max_workers=15) as executor:
                imgs = list(executor.map(load_and_preprocess, batch_frames))

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
            
            prev = embs[-1]
            pbar.update(len(batch_frames))

            kept = len(selected_frames)
            console.print(f"[cyan]Batch {i//BATCH_SIZE+1}/{total_batches}[/cyan] -> [green]{kept}[/green] frames selected so far")

    selected_frames_path = os.path.join(frames_dir, "selected_frames.json")
    with open(selected_frames_path, "w", encoding="utf-8") as f:
        json.dump(SelectedFrames(frames=selected_frames).model_dump(), f, indent=2)

    console.rule("[bold blue] Frame Reduction Summary")
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Metric", style="cyan")
    table.add_column("Value", justify="right")

    table.add_row("Total Frames", str(len(frames)))
    table.add_row("Selected Frames", str(len(selected_frames)))
    table.add_row("Reduction (%)", f"{(1-len(selected_frames)/len(frames))*100:.2f}%")
    table.add_row("Selected Frames File", selected_frames_path)

    console.print(table)
    console.rule("[bold green] Frame Reduction Pipeline Completed\n")

    return selected_frames_path
