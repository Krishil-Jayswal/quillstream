import os
from config import settings
from utils import download_video
from pipeline import ffmpeg_pipeline, frame_reduction_pipeline, whisper_pipeline

def process_video(video_id: str):
    # Base directory of artifacts
    base_dir = "artifacts"
    os.makedirs(base_dir, exist_ok=True)
    print("Artifacst directory created successfully.")

    # Stage 0: Download the video
    video_dir = os.path.join(base_dir, "video.mp4")
    download_video(video_id, video_dir)
    print("0. video downloaded successfully.")

    # Stage 1: ffmpeg pipeline
    audio_dir = os.path.join(base_dir, "audio")
    frames_dir = os.path.join(base_dir, "frames")
    audio_chunks_dir = os.path.join(audio_dir, "chunks")
    logs = ffmpeg_pipeline(video_dir, frames_dir, audio_dir, audio_chunks_dir)
    print(logs)
    print("1. ffmpeg pipeline completed successfully.")

    # Stage 2: frame reduction pipeline
    reduced_frames = frame_reduction_pipeline(frames_dir)
    print(reduced_frames)
    print("2. frame reduction pipeline completed successfully.")

    # Stage 3: whisper pipeline
    whisper_artifacts_dir = os.path.join(base_dir, "whisper")
    whisper_pipeline(audio_chunks_dir, whisper_artifacts_dir)
    print("3. whisper pipeline completed successfully.")

if __name__ == "__main__" :
    video_id = settings.VIDEO_ID
    process_video(video_id)
