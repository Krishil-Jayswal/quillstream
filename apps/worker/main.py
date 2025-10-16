import os
from config import settings
from utils import download, upload, upload_artifacts
from pipeline import (
    ffmpeg_pipeline,
    frame_reduction_pipeline,
    audio_transcription_pipeline,
    ocr_pipeline,
    notes_generation_pipeline,
)


def process_video(video_name: str, video_id: str):
    # Base directory of artifacts
    base_dir = "artifacts"
    os.makedirs(base_dir, exist_ok=True)

    # Stage 0: Download the video
    video_dir = os.path.join(base_dir, video_name)
    download(os.path.join(video_id, video_name), video_dir)

    # Stage 1: ffmpeg pipeline
    audio_dir = os.path.join(base_dir, "audio")
    frames_dir = os.path.join(base_dir, "frames")
    audio_chunks_dir = os.path.join(audio_dir, "chunks")
    ffmpeg_pipeline(video_dir, frames_dir, audio_dir, audio_chunks_dir)

    # Stage 2: frame reduction pipeline
    selected_frames_file = frame_reduction_pipeline(frames_dir)
    print(selected_frames_file)
    upload(os.path.join(video_id, selected_frames_file), selected_frames_file)

    # Stage 3: audio transcription pipeline
    audio_transcription_artifacts_dir = os.path.join(base_dir, "transcription")
    transcript_file = audio_transcription_pipeline(
        audio_chunks_dir, audio_transcription_artifacts_dir
    )
    upload(os.path.join(video_id, transcript_file), transcript_file)

    # Stage 4: ocr pipeline
    ocr_artifacts_dir = ocr_pipeline(base_dir, frames_dir, selected_frames_file)
    upload_artifacts(ocr_artifacts_dir)

    # Stage 5: notes generation pipeline
    notes_artifacts_dir = notes_generation_pipeline(
        base_dir, transcript_file, ocr_artifacts_dir
    )
    upload_artifacts(notes_artifacts_dir)


if __name__ == "__main__":
    process_video(settings.VIDEO_NAME, settings.VIDEO_ID)
