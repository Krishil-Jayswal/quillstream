import { Redis } from "@upstash/redis/cloudflare";
import { STREAM } from "./meta.js";

export const xAdd = async (
  url: string,
  token: string,
  data: Record<string, string>,
) => {
  await new Redis({
    url,
    token,
  }).xadd(STREAM, "*", data);
};
