from .ffmpeg import ffmpeg_pipeline
from .frame_reduction import frame_reduction_pipeline
from .audio_transcription import audio_transcription_pipeline
from .ocr import ocr_pipeline
from .notes_generation import notes_generation_pipeline

__all__ = [
    "ffmpeg_pipeline",
    "frame_reduction_pipeline",
    "audio_transcription_pipeline",
    "ocr_pipeline",
    "notes_generation_pipeline",
]
