import type { JsMsg } from "@nats-io/jetstream";
import type { Msg } from "@nats-io/nats-core";

type BrokerContextParams = {
  subject: string;
  message: Msg | JsMsg;
};

export class BrokerContext {
  readonly subject: string;
  readonly message: Msg | JsMsg;

  constructor({ subject, message }: BrokerContextParams) {
    this.subject = subject;
    this.message = message;
  }
}
