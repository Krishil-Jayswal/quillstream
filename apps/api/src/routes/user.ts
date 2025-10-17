import { Hono } from "hono";
import { AppContext } from "../types/generics";
import { authMiddleware } from "../middlewares/auth";
import { prismaMiddleware } from "../middlewares/prisma";

const userRouter = new Hono<AppContext>();

userRouter.use("*", authMiddleware);
userRouter.use("*", prismaMiddleware);

userRouter.get("/me", async (c) => {
  try {
    const userId = c.get("userId");
    const user = await c.get("prisma").user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
      },
    });
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json(user, 200);
  } catch (error) {
    console.error(`User me: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default userRouter;
