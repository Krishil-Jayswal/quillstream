const quillstream = "quillstream";
export const VIDEOS_STREAM = `${quillstream}:videos`;
export const JOBS_STREAM = `${quillstream}:jobs`;
export const PROCESSOR_CONSUMER_GROUP = `${VIDEOS_STREAM}:processor`;
export const PUSHER_CONSUMER_GROUP = `${JOBS_STREAM}:pusher`;

export const ConsumerGroup = {
  [VIDEOS_STREAM]: PROCESSOR_CONSUMER_GROUP,
  [JOBS_STREAM]: PUSHER_CONSUMER_GROUP,
};

export type Stream = typeof VIDEOS_STREAM | typeof JOBS_STREAM;

export type Res = [
  stream: string,
  [
    eventId: string,
    [field: string, value: string, field: string, Value: string],
  ][],
][];

export type XReadGroupVideoResponse = {
  eventId: string;
  video: { id: string; name: string };
};

export type XReadGroupJobResponse = {
  eventId: string;
  job: { id: string; status: "COMPLETED" | "FAILED" };
};

export type StreamResponseMap = {
  [VIDEOS_STREAM]: XReadGroupVideoResponse[];
  [JOBS_STREAM]: XReadGroupJobResponse[];
};

export type StreamResponse<T extends Stream> = StreamResponseMap[T];
