#! /bin/sh

video=$1

audio_dir=$2
frames_dir=$3
audio_chunks_dir=$4

mkdir -p $audio_dir
mkdir -p $audio_chunks_dir
mkdir -p $frames_dir

ffmpeg -y -i $video -vn -acodec pcm_s16le -ar 16000 -ac 1 $audio_dir/audio.wav && echo "wav file created successfully."

ffmpeg -i $audio_dir/audio.wav -f segment -segment_time 600 -c copy $audio_chunks_dir/chunk_%03d.wav && echo "wav chunks created successfully." &

ffmpeg -y -i $video -vf fps=1 $frames_dir/frame_%05d.jpg && echo "frames created successfully." &

wait

echo "ffmpeg jobs (frames + audio chunks) completed successfully."
