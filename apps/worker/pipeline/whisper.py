import os
import json
from tqdm import tqdm
from utils import groq
from rich.table import Table
from natsort import natsorted
from rich.console import Console
from schema import Transcript, Segment

console = Console()


def whisper_pipeline(audio_chunks_dir: str, whisper_artifacts_dir: str) -> str:
    os.makedirs(whisper_artifacts_dir, exist_ok=True)
    chunks = natsorted(os.listdir(audio_chunks_dir))
    transcriptions = []

    console.rule(f"[bold green] Starting Audio Transcription Pipeline")
    console.print(f"Audio Chunks Directory: [cyan]{audio_chunks_dir}")
    console.print(f"Total Audio Chunks: [yellow]{len(chunks)}")

    with tqdm(
        total=len(chunks), desc="Processing Audio Chunks", ncols=100, colour="green"
    ) as pbar:
        for chunk in chunks:
            with open(os.path.join(audio_chunks_dir, chunk), "rb") as f:
                transcription = groq.audio.transcriptions.create(
                    model="whisper-large-v3-turbo",
                    file=f,
                    response_format="verbose_json",
                )
                transcriptions.append(transcription.model_dump())
                pbar.update(1)

    transcript = Transcript(
        segments=[
            Segment(
                text=segment["text"],
                start=segment["start"] + i * 600,
                end=segment["end"] + i * 600,
            )
            for i, transcription in enumerate(transcriptions)
            for segment in transcription["segments"]
        ]
    )

    transcript_path = os.path.join(whisper_artifacts_dir, "transcript.json")
    with open(transcript_path, "w", encoding="utf-8") as f:
        json.dump(transcript.model_dump(), f, indent=2)

    console.rule("[bold blue] Transcription Summary")
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Metric", style="cyan")
    table.add_column("Value", justify="right")

    table.add_row("Total Audio Chunks", str(len(chunks)))
    table.add_row("Transcript File", transcript_path)

    console.print(table)
    console.rule("[bold green] Transcription Pipeline Completed\n")

    return transcript_path
