import { RedisClient } from "@quillstream/redis/client";
import { ExponentialBackoff } from "@quillstream/redis/backoff";
import { prisma } from "@quillstream/store/client";

type Log = {
  level: "Info" | "Error";
  message: string;
  videoId: string;
  timestamp: Date;
};

const LOG_PREFIX = "quillstream:logs:";

const startPusher = async () => {
  const redis = new RedisClient("quillstream:jobs");
  const backoff = new ExponentialBackoff();

  while (true) {
    try {
      const entries = await redis.xReadGroup(1);

      if (!entries) {
        await backoff.wait();
        continue;
      }

      const eventIds: string[] = [];
      const completedIds: string[] = [];
      const failedIds: string[] = [];
      const jobIds: string[] = [];
      const logsData: Log[] = [];

      entries.forEach((e) => {
        eventIds.push(e.eventId);
        jobIds.push(e.job.id);
        if (e.job.status === "COMPLETED") completedIds.push(e.job.id);
        else failedIds.push(e.job.id);
      });

      const fetchlogsPipeline = redis.client.multi();
      jobIds.forEach((jobId) =>
        fetchlogsPipeline.lrange(`${LOG_PREFIX}${jobId}`, 0, -1),
      );
      const logsResults = await fetchlogsPipeline.exec();

      jobIds.forEach((jobId, index) => {
        (logsResults[index] as string[]).forEach((log) => {
          const parsed = JSON.parse(log);
          logsData.push({
            ...parsed,
            videoId: jobId,
          });
        });
      });

      await prisma.$transaction([
        prisma.video.updateMany({
          where: { id: { in: completedIds } },
          data: { status: "COMPLETED" },
        }),
        prisma.video.updateMany({
          where: { id: { in: failedIds } },
          data: { status: "FAILED" },
        }),
        prisma.log.createMany({ data: logsData }),
      ]);

      const deletelogsPipeline = redis.client.multi();
      jobIds.forEach((jobId) =>
        deletelogsPipeline.del(`${LOG_PREFIX}${jobId}`),
      );
      await deletelogsPipeline.exec();

      await redis.xAckDel(eventIds);
      backoff.reset();
    } catch (error) {
      console.error("Pusher error:", error);
      await backoff.wait();
    }
  }
};

startPusher();
