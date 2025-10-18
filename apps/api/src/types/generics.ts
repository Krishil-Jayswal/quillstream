import { createPrismaClient } from "@quillstream/store/edge";
import { Context } from "hono";

export type Bindings = {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  CLIENT_URL: string;
  ABS_CONNECTION_URL: string;
  ABS_CONTAINER_NAME: string;
  WEBHOOK_SECRET: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
};

export type Variables = {
  prisma: ReturnType<typeof createPrismaClient>;
  userId: string;
};

export type AppContext = Context & {
  Bindings: Bindings;
  Variables: Variables;
};
