import os
import subprocess

def ffmpeg_pipeline(video_dir: str, frames_dir: str, audio_dir: str, audio_chunks_dir: str) -> str:
    script_path = os.path.join(os.getcwd(), "scripts", "ffmpeg.sh")
    process = subprocess.run(
        ["sh", 
         script_path, 
         video_dir, 
         audio_dir, 
         frames_dir, 
         audio_chunks_dir], 
        capture_output=True, 
        text=True,
        )
    return process.stdout