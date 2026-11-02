import type { ConversationRepository } from "@/conversations/repositories/conversation.repository.js";
import type { EventPublisher } from "@/events/event-publisher.service.js";
import type { MessageRepository } from "../repositories/message.repository.js";
import { SendMessageHandler } from "./send-message.handler.js";

describe("SendMessageHandler", () => {
  const conversationRepository = {
    getByIdForParticipant: vi.fn(),
    recordMessage: vi.fn(),
  };
  const messageRepository = { create: vi.fn() };
  const eventPublisher = { enqueue: vi.fn() };
  const handler = new SendMessageHandler(
    conversationRepository as unknown as ConversationRepository,
    messageRepository as unknown as MessageRepository,
    eventPublisher as unknown as EventPublisher,
  );
  const command = { conversationId: "1", senderId: "2", text: "Hi" };

  beforeEach(() => vi.clearAllMocks());

  it("saves first, then enqueues", async () => {
    conversationRepository.getByIdForParticipant.mockResolvedValue({ id: "1" });
    messageRepository.create.mockResolvedValue({
      id: "3",
      ...command,
      createdAt: new Date(),
    });

    await handler.execute(command);

    const [saved] = messageRepository.create.mock.invocationCallOrder;
    const [enqueued] = eventPublisher.enqueue.mock.invocationCallOrder;

    expect(saved).toBeLessThan(enqueued);
  });

  it("gives CNV-001 to a stranger and saves nothing", async () => {
    conversationRepository.getByIdForParticipant.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toMatchObject({
      response: { code: "CNV-001" },
    });
    expect(messageRepository.create).not.toHaveBeenCalled();
    expect(eventPublisher.enqueue).not.toHaveBeenCalled();
  });
});
