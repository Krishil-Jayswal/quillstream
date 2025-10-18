import { Redis } from "@upstash/redis/cloudflare";

export const createRedisClient = (url: string, token: string) => {
  return new Redis({
    url,
    token,
  });
};
