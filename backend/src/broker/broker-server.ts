import type { JsMsg } from "@nats-io/jetstream";
import type { Msg } from "@nats-io/nats-core";
import { type CustomTransportStrategy, Server } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";
import type { BrokerServerConfig } from "./broker.types.js";
import type { BrokerClientService } from "./broker-client.service.js";
import { BrokerContext } from "./broker-context.js";
import type { BrokerStreamConsumerService } from "./broker-stream-consumer.service.js";
import { brokerStreams } from "./broker-streams.js";

export class BrokerServer extends Server implements CustomTransportStrategy {
  constructor(
    private readonly brokerClient: BrokerClientService,
    private readonly streamConsumer: BrokerStreamConsumerService,
    private readonly config: BrokerServerConfig,
  ) {
    super();
  }

  async listen(callback: (error?: unknown) => void) {
    try {
      this.subscribeToRequests();
      await this.startConsumers();
      callback();
    } catch (error) {
      callback(error);
    }
  }

  close() {
    return this.brokerClient.disconnect();
  }

  on() {
    throw new Error("Method not implemented.");
  }

  unwrap<T = never>(): T {
    throw new Error("Method not implemented.");
  }

  private subscribeToRequests() {
    const handleBrokerRequest = this.handleBrokerRequest.bind(this);

    for (const subject of this.config.subscriptions) {
      this.brokerClient.subscribe(subject, handleBrokerRequest, {
        queue: this.config.queue,
      });
    }
  }

  private async startConsumers() {
    const handleStreamMessage = this.handleStreamMessage.bind(this);

    await Promise.all(
      brokerStreams.map((stream) =>
        this.streamConsumer.start(stream, handleStreamMessage),
      ),
    );
  }

  private async handleBrokerRequest(
    subject: string,
    payload: unknown,
    message: Msg,
  ) {
    const handler = this.getHandlerByPattern(subject);

    if (!handler) return;

    const context = new BrokerContext({ subject, message });
    const response$ = this.transformToObservable(handler(payload, context));

    this.send(response$, (response) => {
      if (!message.reply) return;

      const body = response.err ? { error: response.err } : response.response;

      this.brokerClient.reply(message.reply, body);
    });
  }

  private async handleStreamMessage(message: JsMsg) {
    const handler = this.getHandlerByPattern(message.subject);

    if (!handler) {
      message.term();
      return;
    }

    const context = new BrokerContext({ subject: message.subject, message });
    const response$ = this.transformToObservable(
      handler(message.json(), context),
    );

    await lastValueFrom(response$, { defaultValue: undefined });
  }
}
