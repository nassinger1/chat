import { type JetStreamClient, jetstream } from "@nats-io/jetstream";
import type { Msg, NatsConnection, Subscription } from "@nats-io/nats-core";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { NATS_CONNECTION } from "./broker.types.js";

type MessageHandler = (
  subject: string,
  payload: unknown,
  message: Msg,
) => Promise<void>;

@Injectable()
export class BrokerClientService {
  private readonly logger = new Logger(BrokerClientService.name);
  private readonly jetStreamClient: JetStreamClient;

  constructor(
    @Inject(NATS_CONNECTION) private readonly connection: NatsConnection,
  ) {
    this.jetStreamClient = jetstream(connection);
  }

  publish(subject: string, payload: unknown) {
    this.connection.publish(subject, JSON.stringify(payload));
  }

  async jsPublish(subject: string, payload: unknown) {
    try {
      await this.jetStreamClient.publish(subject, JSON.stringify(payload));
    } catch (error) {
      this.logger.error(`Failed to enqueue ${subject}: ${String(error)}`);
    }
  }

  subscribe(
    subject: string,
    handler: MessageHandler,
    options: { queue?: string } = {},
  ): Subscription {
    return this.connection.subscribe(subject, {
      queue: options.queue,
      callback: (error, message) => {
        if (error) {
          this.logger.error(`Subscription failed: ${String(error)}`);
          return;
        }

        const payload = message.data.length > 0 ? message.json() : undefined;

        void handler(message.subject, payload, message);
      },
    });
  }

  reply(subject: string, payload: unknown) {
    this.publish(subject, payload);
  }

  getConnection() {
    return this.connection;
  }

  disconnect() {
    return this.connection.drain();
  }
}
