import {
  AckPolicy,
  DeliverPolicy,
  RetentionPolicy,
  StorageType,
} from "@nats-io/jetstream";
import type { BrokerStreamConfig } from "./broker.types.js";

export const MESSAGE_CREATED_SUBJECT = "chat.service.messages.created";

export const brokerStreams: BrokerStreamConfig[] = [
  {
    stream: {
      name: "CHAT_EVENTS",
      subjects: [MESSAGE_CREATED_SUBJECT],
      retention: RetentionPolicy.Workqueue,
      storage: StorageType.File,
    },
    consumer: {
      durable_name: "chat-fan-out",
      ack_policy: AckPolicy.Explicit,
      deliver_policy: DeliverPolicy.All,
      max_deliver: 6,
    },
  },
];
