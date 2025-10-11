from .ffmpeg import ffmpeg_pipeline
from .frame import frame_reduction_pipeline
from .whisper import whisper_pipeline

__all__ = ["ffmpeg_pipeline", "frame_reduction_pipeline", "whisper_pipeline"]
