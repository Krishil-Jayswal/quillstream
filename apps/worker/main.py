import os
from config import settings
from utils import download_video
from pipeline import (
    ffmpeg_pipeline,
    frame_reduction_pipeline,
    audio_transcription_pipeline,
    ocr_pipeline,
    notes_generation_pipeline,
)


def process_video(video_id: str):
    # Base directory of artifacts
    base_dir = "artifacts"
    os.makedirs(base_dir, exist_ok=True)
    print("Artifacst directory created successfully.")

    # Stage 0: Download the video
    video_dir = os.path.join(base_dir, "video.mp4")
    download_video(video_id, video_dir)
    print("video downloaded successfully.")

    # Stage 1: ffmpeg pipeline
    audio_dir = os.path.join(base_dir, "audio")
    frames_dir = os.path.join(base_dir, "frames")
    audio_chunks_dir = os.path.join(audio_dir, "chunks")
    logs = ffmpeg_pipeline(video_dir, frames_dir, audio_dir, audio_chunks_dir)
    print(logs)
    print("ffmpeg pipeline completed successfully.")

    # Stage 2: frame reduction pipeline
    selected_frames_file = frame_reduction_pipeline(frames_dir)

    # Stage 3: audio transcription pipeline
    audio_transcription_artifacts_dir = os.path.join(base_dir, "transcription")
    transcript_file = audio_transcription_pipeline(
        audio_chunks_dir, audio_transcription_artifacts_dir
    )

    # Stage 4: ocr pipeline
    ocr_artifacts_dir = ocr_pipeline(base_dir, frames_dir, selected_frames_file)

    # Stage 5: notes generation pipeline
    notes_artifacts_dir = notes_generation_pipeline(
        base_dir, transcript_file, ocr_artifacts_dir
    )


if __name__ == "__main__":
    video_id = settings.VIDEO_ID
    process_video(video_id)
