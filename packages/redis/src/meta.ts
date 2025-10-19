export const STREAM = "quillstream:videos";

export const CONSUMER_GROUP = "quillstream:processor";

export const CONSUMER =
  "quillstream:processor-" + Math.random().toString(36).slice(2, 6);

export type Response = [
  stream: string,
  [eventId: string, [id: string, value: string, name: string, Value: string]][],
][];

export type XReadGroupResponse = {
  eventId: string;
  video: {
    id: string;
    name: string;
  };
};
