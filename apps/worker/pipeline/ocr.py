import os
import re
import json
import math
import base64
from tqdm import tqdm
from utils import groq
from rich.table import Table
from rich.console import Console
from schemas import SelectedFrames
from prompts import ocr_system_prompt
from concurrent.futures import ThreadPoolExecutor

console = Console()


def ocr_pipeline(base_dir: str, frames_dir: str, selected_frames_file: str) -> str:
    BATCH_SIZE = 2

    ocr_artifacts_dir = os.path.join(base_dir, "ocr")
    os.makedirs(ocr_artifacts_dir, exist_ok=True)

    with open(selected_frames_file, encoding="utf-8") as f:
        selected_frames = SelectedFrames(**json.load(f))

    def load_and_encode(frame_name: str):
        path = os.path.join(frames_dir, frame_name)
        with open(path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")

    def save_ocr_output(frame_name: str, text: str):
        path = os.path.join(ocr_artifacts_dir, f"{frame_name.split(".")[0]}.md")
        with open(path, "w", encoding="utf-8") as f:
            f.write(text)

    total_batches = math.ceil(len(selected_frames.frames) // BATCH_SIZE)

    console.rule("[bold green] Starting OCR Pipeline")
    console.print(f"Frames Directory: [cyan]{frames_dir}")
    console.print(
        f"Total Frames: [yellow]{len(selected_frames.frames)} ({total_batches} batches)\n"
    )

    with tqdm(
        total=len(selected_frames.frames),
        desc="Analyzing Frames",
        ncols=100,
        colour="green",
    ) as pbar:
        for i in range(0, len(selected_frames.frames), BATCH_SIZE):
            batch_frames = selected_frames.frames[i : i + BATCH_SIZE]

            with ThreadPoolExecutor(max_workers=BATCH_SIZE) as executor:
                imgs = list(executor.map(load_and_encode, batch_frames))

            response = groq.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=[
                    {"role": "system", "content": ocr_system_prompt},
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{img}"},
                            }
                            for img in imgs
                        ],
                    },
                ],
            )

            texts = re.split(
                r"### Image \d", (response.choices[0].message.content or "")
            )
            texts = [text.strip() for text in texts if text.strip() != ""]

            with ThreadPoolExecutor(max_workers=BATCH_SIZE) as executor:
                for frame_name, text in zip(batch_frames, texts):
                    executor.submit(save_ocr_output, frame_name, text)

            pbar.update(len(batch_frames))

    console.rule("[bold blue] OCR Summary")
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Metric", style="cyan")
    table.add_column("Value", justify="right")

    table.add_row("Total Frames", str(len(selected_frames.frames)))
    table.add_row("OCR Artifacts Dir", ocr_artifacts_dir)

    console.print(table)
    console.rule("[bold green] OCR Pipeline Completed\n\n")

    return ocr_artifacts_dir
