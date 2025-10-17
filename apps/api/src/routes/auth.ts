import { Hono } from "hono";
import { googleAuth } from "@hono/oauth-providers/google";
import { prismaMiddleware } from "../middlewares/prisma";
import { AppContext } from "../types/generics";
import { sign } from "hono/utils/jwt/jwt";

const authRouter = new Hono<AppContext>();

authRouter.use("*", prismaMiddleware);

authRouter.get(
  "/google",
  (c, next) => {
    return googleAuth({
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      scope: ["openid", "profile", "email"],
    })(c, next);
  },
  async (c) => {
    try {
      const userData = c.get("user-google")!;
      const user = await c.get("prisma").user.upsert({
        where: {
          oAuthType_oAuthId: {
            oAuthType: "GOOGLE",
            oAuthId: userData.id!,
          },
        },
        create: {
          name: userData.name!,
          email: userData.email!,
          oAuthId: userData.id!,
          oAuthType: "GOOGLE",
          profilePicture: userData.picture!,
        },
        update: {},
        select: {
          id: true,
        },
      });

      const token = await sign(
        { id: user.id, exp: Math.floor(Date.now() / 1000) + 604800 },
        c.env.JWT_SECRET,
      );

      return c.redirect(`${c.env.CLIENT_URL}/callback?token=${token}`);
    } catch (error) {
      console.error(`Google Auth: ${error}`);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

export default authRouter;
