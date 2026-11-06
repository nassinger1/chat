import { createBrokerClientMock } from "@test/mocks/broker-client.mock.js";
import type { BrokerClientService } from "@/broker/broker-client.service.js";
import {
  ChangeType,
  createChangeEvent,
  EventNamespace,
} from "./event.types.js";
import { EventPublisher } from "./event-publisher.service.js";

describe("EventPublisher", () => {
  const brokerClient = createBrokerClientMock();
  const publisher = new EventPublisher(
    brokerClient as unknown as BrokerClientService,
  );
  const event = createChangeEvent({
    namespace: EventNamespace.MESSAGES,
    name: "message-created",
    type: ChangeType.CREATED,
    actorId: "ana",
    data: { text: "Hi" },
  });

  beforeEach(() => vi.clearAllMocks());

  it("sends a private event to that user's own subject", () => {
    publisher.toUser("bruno", event);

    expect(brokerClient.publish).toHaveBeenCalledWith(
      "chat.events.bruno",
      event,
    );
  });

  it("sends a public event to the subject everyone listens to", () => {
    publisher.toEveryone(event);

    expect(brokerClient.publish).toHaveBeenCalledWith("chat.events", event);
  });

  it("puts work in the queue instead of telling browsers", async () => {
    const payload = { id: "1" };

    await publisher.enqueue("chat.service.messages.created", payload);

    expect(brokerClient.jsPublish).toHaveBeenCalledWith(
      "chat.service.messages.created",
      payload,
    );
    expect(brokerClient.publish).not.toHaveBeenCalled();
  });
});
