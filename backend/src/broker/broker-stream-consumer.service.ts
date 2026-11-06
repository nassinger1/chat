import {
  type ConsumerMessages,
  type JsMsg,
  jetstream,
  jetstreamManager,
} from "@nats-io/jetstream";
import type { NatsConnection } from "@nats-io/nats-core";
import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
} from "@nestjs/common";
import { type BrokerStreamConfig, NATS_CONNECTION } from "./broker.types.js";

const RETRY_DELAYS_IN_MS = [1_000, 2_000, 5_000, 10_000, 30_000];

@Injectable()
export class BrokerStreamConsumerService implements OnModuleDestroy {
  private readonly logger = new Logger(BrokerStreamConsumerService.name);
  private readonly runningConsumers: ConsumerMessages[] = [];

  constructor(
    @Inject(NATS_CONNECTION) private readonly connection: NatsConnection,
  ) {}

  async start(
    { stream, consumer }: BrokerStreamConfig,
    handleMessage: (message: JsMsg) => Promise<void>,
  ) {
    const manager = await jetstreamManager(this.connection);

    await manager.streams.add(stream);
    await manager.consumers.add(stream.name, consumer);

    const streamConsumer = await jetstream(this.connection).consumers.get(
      stream.name,
      consumer.durable_name,
    );
    const messages = await streamConsumer.consume();

    this.runningConsumers.push(messages);

    void this.processMessages(messages, handleMessage, consumer.max_deliver);
  }

  private async processMessages(
    messages: ConsumerMessages,
    handleMessage: (message: JsMsg) => Promise<void>,
    maxDeliveries?: number,
  ) {
    for await (const message of messages) {
      try {
        await handleMessage(message);
        message.ack();
      } catch (error) {
        this.logger.error(
          `Failed to process ${message.subject}: ${String(error)}`,
        );
        this.retryOrGiveUp(message, maxDeliveries);
      }
    }
  }

  private retryOrGiveUp(message: JsMsg, maxDeliveries?: number) {
    const { deliveryCount } = message.info;
    const isLastDelivery =
      maxDeliveries !== undefined && deliveryCount >= maxDeliveries;

    if (isLastDelivery) {
      this.logger.error(
        `Giving up on ${message.subject} after ${deliveryCount} deliveries`,
      );
      message.term();
      return;
    }

    message.nak(RETRY_DELAYS_IN_MS[deliveryCount - 1]);
  }

  async onModuleDestroy() {
    await Promise.all(
      this.runningConsumers.map((messages) => messages.close()),
    );
  }
}
