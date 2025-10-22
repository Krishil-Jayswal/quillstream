import { Redis } from "@upstash/redis";
import {
  ConsumerGroup,
  Res,
  Stream,
  StreamResponse,
  VIDEOS_STREAM,
  JOBS_STREAM,
} from "./meta.js";

export class RedisClient<T extends Stream> {
  private client: Redis;
  private stream: T;
  private consumer: string;
  private consumerGroup: string;

  public constructor(stream: T) {
    this.client = Redis.fromEnv();
    this.stream = stream;
    this.consumerGroup = ConsumerGroup[stream];
    this.consumer = `${this.consumerGroup}-${Math.random().toString(36).slice(2, 6)}`;
  }

  public async xReadGroup(
    count: number = 1,
  ): Promise<StreamResponse<T> | undefined> {
    const res = (await this.client.xreadgroup(
      this.consumerGroup,
      this.consumer,
      this.stream,
      ">",
      {
        count,
      },
    )) as Res;
    if (!res || !res[0]) return undefined;

    switch (this.stream) {
      case VIDEOS_STREAM: {
        const xReadGroupResponse: StreamResponse<typeof VIDEOS_STREAM> = [];
        for (const entry of res[0][1]) {
          xReadGroupResponse.push({
            eventId: entry[0],
            video: {
              id: entry[1][1],
              name: entry[1][3],
            },
          });
        }
        return xReadGroupResponse as StreamResponse<T>;
      }
      case JOBS_STREAM: {
        const xReadGroupResponse: StreamResponse<typeof JOBS_STREAM> = [];
        for (const entry of res[0][1]) {
          if (entry[1][3] === "COMPLETED" || entry[1][3] === "FAILED") {
            xReadGroupResponse.push({
              eventId: entry[0],
              job: {
                id: entry[1][1],
                status: entry[1][3],
              },
            });
          }
        }
        return xReadGroupResponse as StreamResponse<T>;
      }
      default:
        return undefined;
    }
  }

  public async xAckDel(eventId: string | string[]) {
    await this.client
      .multi()
      .xack(this.stream, this.consumerGroup, eventId)
      .xdel(this.stream, eventId)
      .exec();
  }
}
