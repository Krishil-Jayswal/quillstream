import { xAckDel, xReadGroup } from "@quillstream/redis/client";
import { processVideo } from "./job.js";

const startProcessor = async () => {
  const MIN_IDLE_BACKOFF_MS = 5000;
  const MAX_IDLE_BACKOFF_MS = 30000;
  let currentBackoff = MIN_IDLE_BACKOFF_MS;

  while (true) {
    const entries = await xReadGroup();

    if (!entries) {
      await new Promise((r) => setTimeout(r, currentBackoff));
      if (currentBackoff === MAX_IDLE_BACKOFF_MS) {
        currentBackoff = MIN_IDLE_BACKOFF_MS;
      } else {
        currentBackoff = Math.min(currentBackoff * 1.5, MAX_IDLE_BACKOFF_MS);
      }
      continue;
    }

    const eventIds: string[] = [];

    const Jobs = entries.map(({ eventId, video: { id, name } }) => {
      eventIds.push(eventId);
      return processVideo(id, name);
    });

    await Promise.all(Jobs);

    await xAckDel(eventIds);
    currentBackoff = MIN_IDLE_BACKOFF_MS;
  }
};

startProcessor();
