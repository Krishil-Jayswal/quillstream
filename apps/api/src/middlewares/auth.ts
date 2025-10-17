import { createMiddleware } from "hono/factory";
import { verify } from "hono/utils/jwt/jwt";
import { AppContext } from "../types/generics";
import { JwtPayload } from "../types/jwt";

export const authMiddleware = createMiddleware<AppContext>(async (c, next) => {
  try {
    const token = c.req.header("Authorization");
    if (!token) {
      return c.json({ error: "No Token Provided" }, 401);
    }
    const { id } = (await verify(token, c.env.JWT_SECRET)) as JwtPayload;
    c.set("userId", id);
    await next();
  } catch (error) {
    console.error(`Auth Middleware: ${error}`);
    return c.json({ error: "Token expired" }, 401);
  }
});
