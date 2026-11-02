import { randomUUID } from "node:crypto";

export enum EventNamespace {
  MESSAGES = "messages",
  CONVERSATIONS = "conversations",
  USERS = "users",
}

export enum ChangeType {
  CREATED = "created",
  UPDATED = "updated",
}

export type EventMeta = {
  namespace: EventNamespace;
  name: string;
  type: ChangeType;
  actorId: string;
  correlationId: string;
};

export type ChatEvent<Data> = {
  type: "change";
  data: Data;
  meta: EventMeta;
};

type ChangeEventParams<Data> = Omit<EventMeta, "correlationId"> & {
  data: Data;
};

export function createChangeEvent<Data>({
  data,
  ...meta
}: ChangeEventParams<Data>): ChatEvent<Data> {
  return {
    type: "change",
    data,
    meta: { ...meta, correlationId: randomUUID() },
  };
}
