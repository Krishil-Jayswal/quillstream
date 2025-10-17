import { Hono } from "hono";
import { AppContext } from "../types/generics";
import { prismaMiddleware } from "../middlewares/prisma";
import { authMiddleware } from "../middlewares/auth";
import { zValidator } from "@hono/zod-validator";
import { PreSignedURL, PreSignedUrlSchema } from "@quillstream/validation";
import { generateBlobSasUrl } from "../utils/blob";

const uploadRouter = new Hono<AppContext>();

uploadRouter.use("*", prismaMiddleware);
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

      const connectionString = c.env.ABS_CONNECTION_URL;
      const accountName =
        connectionString.match(/AccountName=([^;]+)/)?.[1] || "";
      const accountKey =
        connectionString.match(/AccountKey=([^;]+)/)?.[1] || "";

      const blobSasUrl = await generateBlobSasUrl(
        accountName,
        accountKey,
        c.env.ABS_CONTAINER_NAME,
        `${video.id}/${name}`,
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
