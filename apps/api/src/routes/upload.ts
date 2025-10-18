import { Hono } from "hono";
import { AppContext } from "../types/generics";
import { prismaMiddleware } from "../middlewares/prisma";
import { authMiddleware } from "../middlewares/auth";
import { zValidator } from "@hono/zod-validator";
import { PreSignedURL, PreSignedUrlSchema } from "@quillstream/validation";
import { generateBlobSasUrl } from "../utils/blob";
import { createRedisClient } from "@quillstream/redis/edge";
import { STREAM } from "@quillstream/redis/meta";

const uploadRouter = new Hono<AppContext>();

uploadRouter.use("*", prismaMiddleware);

uploadRouter.post("/completed", async (c) => {
  const webhookhookSecret = c.req.header("x-qs-wh-secret");

  if (!webhookhookSecret || c.env.WEBHOOK_SECRET !== webhookhookSecret) {
    return c.json({ error: "Unauthenticated" }, 401);
  }

  const events = await c.req.json();

  for (const event of events) {
    if (event.eventType === "Microsoft.EventGrid.SubscriptionValidationEvent") {
      return c.json({ validationResponse: event.data.validationCode });
    }

    if (event.eventType === "Microsoft.Storage.BlobCreated") {
      const videoId = event.data.url.split("/").at(-2);
      const video = await c.get("prisma").video.update({
        where: {
          id: videoId,
        },
        data: {
          status: "PROCESSING",
        },
        select: {
          id: true,
          name: true,
        },
      });
      const redis = createRedisClient(
        c.env.UPSTASH_REDIS_REST_URL,
        c.env.UPSTASH_REDIS_REST_TOKEN,
      );
      await redis.xadd(STREAM, "*", video);
    }
  }

  return c.json({ success: true }, 200);
});

uploadRouter.use("*", authMiddleware);

uploadRouter.post(
  "/pre-signed-url",
  zValidator("json", PreSignedUrlSchema),
  async (c) => {
    try {
      const { filename }: PreSignedURL = c.req.valid("json");
      const parts = filename.split(".");
      const extension = parts.pop() || "mp4";
      const title = parts.join(".");
      const name = `video.${extension}`;

      const video = await c.get("prisma").video.create({
        data: {
          title: title,
          name: name,
          status: "UPLOADING",
          userId: c.get("userId"),
        },
        select: {
          id: true,
        },
      });

      const blobSasUrl = await generateBlobSasUrl(
        c.env.ABS_CONNECTION_URL,
        c.env.ABS_CONTAINER_NAME,
        `${video.id}/${name}`,
        2,
      );

      return c.json({
        url: blobSasUrl,
        method: "PUT",
        headers: {
          "x-ms-blob-type": "BlockBlob",
        },
      });
    } catch (error) {
      console.error(`Upload Pre-Signed-URL: ${error}`);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

export default uploadRouter;
