import { Injectable } from "@nestjs/common";
import { BrokerClientService } from "@/broker/broker-client.service.js";
import type { ChatEvent } from "./event.types.js";
import { BROADCAST_SUBJECT, userSubject } from "./event-subjects.js";

@Injectable()
export class EventPublisher {
  constructor(private readonly brokerClient: BrokerClientService) {}

  toUser<Data>(userId: string, event: ChatEvent<Data>) {
    this.brokerClient.publish(userSubject(userId), event);
  }

  toEveryone<Data>(event: ChatEvent<Data>) {
    this.brokerClient.publish(BROADCAST_SUBJECT, event);
  }

  enqueue<Data>(subject: string, payload: Data) {
    return this.brokerClient.jsPublish(subject, payload);
  }
}
