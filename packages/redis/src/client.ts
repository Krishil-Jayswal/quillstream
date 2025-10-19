import { Redis } from "@upstash/redis";
import {
  CONSUMER,
  CONSUMER_GROUP,
  STREAM,
  XReadGroupResponse,
  Response,
} from "./meta.js";

const redis = Redis.fromEnv();

export const xReadGroup = async (
  count: number = 1,
): Promise<XReadGroupResponse[] | undefined> => {
  const res = (await redis.xreadgroup(CONSUMER_GROUP, CONSUMER, STREAM, ">", {
    count,
  })) as Response;

  if (!res || !res[0]) return undefined;

  const xReadGroupResponse: XReadGroupResponse[] = [];
  for (const entry of res[0][1]) {
    xReadGroupResponse.push({
      eventId: entry[0],
      video: {
        id: entry[1][1],
        name: entry[1][3],
      },
    });
  }
  return xReadGroupResponse;
};

export const xAckDel = async (eventId: string | string[]) => {
  await redis
    .multi()
    .xack(STREAM, CONSUMER_GROUP, eventId)
    .xdel(STREAM, eventId)
    .exec();
};
