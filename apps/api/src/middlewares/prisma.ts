import { createMiddleware } from "hono/factory";
import { createPrismaClient } from "@quillstream/store/edge";
import { AppContext } from "../types/generics";

export const prismaMiddleware = createMiddleware<AppContext>(
  async (c, next) => {
    try {
      c.set("prisma", createPrismaClient(c.env.DATABASE_URL));
      await next();
    } catch (error) {
      console.error(`Prisma Middleware: ${error}`);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);
