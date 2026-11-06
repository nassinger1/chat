import type { MessageResDto } from "../dtos/message-res.dto.js";
import type { DeliverMessageHandler } from "../handlers/deliver-message.handler.js";
import { MessagesBrokerController } from "./messages-broker.controller.js";

const PATTERN_METADATA_KEY = "microservices:pattern";

describe("MessagesBrokerController", () => {
  const deliverMessageHandler = { execute: vi.fn() };
  const controller = new MessagesBrokerController(
    deliverMessageHandler as unknown as DeliverMessageHandler,
  );
  const message = {
    id: "1",
    conversationId: "2",
    senderId: "ana",
    text: "Hi",
  } as MessageResDto;

  beforeEach(() => vi.clearAllMocks());

  it("reads the queue of new messages", () => {
    const subjects = Reflect.getMetadata(
      PATTERN_METADATA_KEY,
      MessagesBrokerController.prototype.deliver,
    );

    expect(subjects).toEqual(["chat.service.messages.created"]);
  });

  it("hands each new message to the delivery", async () => {
    deliverMessageHandler.execute.mockResolvedValue(undefined);

    await controller.deliver(message);

    expect(deliverMessageHandler.execute).toHaveBeenCalledWith(message);
  });

  it("lets a failed delivery fail, so the queue tries again", async () => {
    deliverMessageHandler.execute.mockRejectedValue(new Error("Mongo is down"));

    await expect(controller.deliver(message)).rejects.toThrow("Mongo is down");
  });
});
