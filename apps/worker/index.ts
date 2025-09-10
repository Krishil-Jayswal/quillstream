import { join } from "node:path";
import { spawnProcess } from "./utils/spawn_process";

class Worker {
  public static async run() {
    try {
      const baseDir = "artifacts";
      const videoPath = join(baseDir, "raw", "video.mp4");
      const ffmpegScriptPath = join("scripts", "process_video.sh");

      // 1. ffmpeg pipeline
      const ffmpegstdout = await spawnProcess([
        "bash",
        ffmpegScriptPath,
        videoPath,
      ]);
      console.log(ffmpegstdout);
    } catch (error) {
      console.error("Error in worker: ", (error as Error).message);
    }
  }
}

Worker.run();
