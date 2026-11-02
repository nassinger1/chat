import type { ConversationRepository } from "@/conversations/repositories/conversation.repository.js";
import type { EventPublisher } from "@/events/event-publisher.service.js";
import type { MessageResDto } from "../dtos/message-res.dto.js";
import { DeliverMessageHandler } from "./deliver-message.handler.js";

describe("DeliverMessageHandler", () => {
  const conversationRepository = { getById: vi.fn() };
  const eventPublisher = { toUser: vi.fn() };
  const handler = new DeliverMessageHandler(
    conversationRepository as unknown as ConversationRepository,
    eventPublisher as unknown as EventPublisher,
  );
  const message = {
    id: "1",
    conversationId: "2",
    senderId: "ana",
    text: "Hi",
  } as MessageResDto;

  beforeEach(() => vi.clearAllMocks());

  it("publishes to both participants", async () => {
    conversationRepository.getById.mockResolvedValue({
      participants: [{ userId: "ana" }, { userId: "bruno" }],
    });

    await handler.execute(message);

    const recipients = eventPublisher.toUser.mock.calls.map(
      ([userId]) => userId,
    );

    expect(recipients).toEqual(["ana", "bruno"]);
  });

  it("publishes nothing if the conversation is gone", async () => {
    conversationRepository.getById.mockResolvedValue(null);

    await handler.execute(message);

    expect(eventPublisher.toUser).not.toHaveBeenCalled();
  });
});
