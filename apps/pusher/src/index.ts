import { RedisClient } from "@quillstream/redis/client";
import { ExponentialBackoff } from "@quillstream/redis/backoff";
import { prisma } from "@quillstream/store/client";

const startPusher = async () => {
  const redis = new RedisClient("quillstream:jobs");
  const backoff = new ExponentialBackoff();

  while (true) {
    const entries = await redis.xReadGroup(1);

    if (!entries) {
      backoff.wait();
      continue;
    }

    const eventIds: string[] = [];
    const completedIds: string[] = [];
    const failedIds: string[] = [];
    entries.forEach((e) => {
      eventIds.push(e.eventId);
      if (e.job.status === "COMPLETED") completedIds.push(e.job.id);
      else failedIds.push(e.job.id);
    });

    await prisma.$transaction([
      prisma.video.updateMany({
        where: {
          id: { in: completedIds },
        },
        data: {
          status: "COMPLETED",
        },
      }),
      prisma.video.updateMany({
        where: {
          id: { in: failedIds },
        },
        data: {
          status: "FAILED",
        },
      }),
    ]);

    await redis.xAckDel(eventIds);
    backoff.reset();
  }
};

startPusher();
