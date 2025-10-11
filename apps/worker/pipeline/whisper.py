import os
import json
from utils import groq
from natsort import natsorted
from schema import Transcript, Segment

def whisper_pipeline(audio_chunks_dir: str, whisper_artifacts_dir: str):
    os.makedirs(whisper_artifacts_dir, exist_ok=True) 
    audio_chunks = natsorted(os.listdir(audio_chunks_dir))
    responses = []

    for audio_chunk in audio_chunks:
        with open(os.path.join(audio_chunks_dir, audio_chunk), "rb") as f:
            response = groq.audio.transcriptions.create(
                model="whisper-large-v3-turbo",
                file=f,
                response_format="verbose_json"
            )
            responses.append(response.model_dump())
    
    transcript = Transcript(segments=[
        Segment(text=seg["text"], start=seg["start"] + i * 600, end=seg["end"] + i * 600)
        for i, resp in enumerate(responses)
        for seg in resp["segments"]
    ])
    
    with open(os.path.join(whisper_artifacts_dir, "transcription.json"), "w", encoding="utf-8") as f:
        json.dump(transcript.model_dump(), f, indent=2)
    