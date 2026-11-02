import type { ConsumerConfig, StreamConfig } from "@nats-io/jetstream";

export const NATS_CONNECTION = "NATS_CONNECTION";

export type BrokerServerConfig = {
  queue: string;
  subscriptions: string[];
};

export type BrokerStreamConfig = {
  stream: Partial<StreamConfig> & { name: string };
  consumer: Partial<ConsumerConfig> & { durable_name: string };
};
