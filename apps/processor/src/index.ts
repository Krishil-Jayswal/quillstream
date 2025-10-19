import { xAckDel, xReadGroup } from "@quillstream/redis/client";

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

    const eventId: string[] = [];
    for (const entry of entries) {
      console.log(entry.video);
      eventId.push(entry.eventId);
    }

    await xAckDel(eventId);
    currentBackoff = MIN_IDLE_BACKOFF_MS;
  }
};

startProcessor();
