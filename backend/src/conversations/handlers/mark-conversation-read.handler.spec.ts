import type { EventPublisher } from "@/events/event-publisher.service.js";
import type { ConversationRepository } from "../repositories/conversation.repository.js";
import { MarkConversationReadHandler } from "./mark-conversation-read.handler.js";

describe("MarkConversationReadHandler", () => {
  const conversationRepository = {
    getByIdForParticipant: vi.fn(),
    markRead: vi.fn(),
  };
  const eventPublisher = { toUser: vi.fn() };
  const handler = new MarkConversationReadHandler(
    conversationRepository as unknown as ConversationRepository,
    eventPublisher as unknown as EventPublisher,
  );
  const command = { id: "1", userId: "bruno" };

  beforeEach(() => vi.clearAllMocks());

  it("clears your count, then tells only you", async () => {
    conversationRepository.getByIdForParticipant.mockResolvedValue({ id: "1" });

    await handler.execute(command);

    const [cleared] = conversationRepository.markRead.mock.invocationCallOrder;
    const [published] = eventPublisher.toUser.mock.invocationCallOrder;

    expect(conversationRepository.markRead).toHaveBeenCalledWith(command);
    expect(cleared).toBeLessThan(published);
    expect(eventPublisher.toUser).toHaveBeenCalledOnce();
    expect(eventPublisher.toUser).toHaveBeenCalledWith(
      "bruno",
      expect.objectContaining({
        data: { conversationId: "1" },
        meta: expect.objectContaining({
          name: "conversation-read",
          namespace: "conversations",
          actorId: "bruno",
        }),
      }),
    );
  });

  it("gives CNV-001 to a stranger and changes nothing", async () => {
    conversationRepository.getByIdForParticipant.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toMatchObject({
      response: { code: "CNV-001" },
    });
    expect(conversationRepository.markRead).not.toHaveBeenCalled();
    expect(eventPublisher.toUser).not.toHaveBeenCalled();
  });
});
