import { RedisClient } from "@quillstream/redis/client";
import { ExponentialBackoff } from "@quillstream/redis/backoff";
import { processVideo } from "./job.js";

const startProcessor = async () => {
  const redis = new RedisClient("quillstream:videos");
  const backoff = new ExponentialBackoff();

  while (true) {
    const entries = await redis.xReadGroup();

    if (!entries) {
      await backoff.wait();
      continue;
    }

    const eventIds: string[] = [];

    const Jobs = entries.map(({ eventId, video: { id, name } }) => {
      eventIds.push(eventId);
      return processVideo(id, name);
    });

    await Promise.all(Jobs);

    await redis.xAckDel(eventIds);
    backoff.reset();
  }
};

startProcessor();
