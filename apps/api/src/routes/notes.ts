import { Hono } from "hono";
import { AppContext } from "../types/generics";
import { authMiddleware } from "../middlewares/auth";
import { prismaMiddleware } from "../middlewares/prisma";

const notesRouter = new Hono<AppContext>();

notesRouter.use("*", authMiddleware);
notesRouter.use("*", prismaMiddleware);

notesRouter.get("/:videoId", async (c) => {
  try {
    const { videoId } = c.req.param();

    if (!videoId) {
      return c.json({ message: "Video ID is required" }, 400);
    }

    const video = await c.get("prisma").video.findFirst({
      where: {
        id: videoId,
        userId: c.get("userId"),
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!video) {
      return c.json(
        { message: "Video not found or you don't have access to it" },
        404,
      );
    }

    if (video.status !== "COMPLETED") {
      return c.json(
        {
          message:
            "Video processing is not complete yet. Notes will be available once processing is finished.",
          status: video.status,
        },
        202,
      );
    }

    const accountName =
      c.env.ABS_CONNECTION_URL.match(/AccountName=([^;]+)/)?.[1];

    const notesUrl = `https://${accountName}.blob.core.windows.net/${c.env.ABS_CONTAINER_NAME}/${videoId}/artifacts/notes/notes.md?${c.env.ABS_SAS_TOKEN}`;
    const response = await fetch(notesUrl);

    if (!response.ok) {
      return c.json(
        {
          message: "Notes temporarily unavailable, please retry",
        },
        503,
      );
    }

    const content = await response.text();

    return new Response(content, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "text/markdown",
      },
    });
  } catch (error) {
    console.error(
      `GET Notes Error: ${error instanceof Error ? error.message : error}`,
    );
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default notesRouter;
