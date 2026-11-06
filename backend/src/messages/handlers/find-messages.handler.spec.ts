import type { ConversationRepository } from "@/conversations/repositories/conversation.repository.js";
import type { MessageRepository } from "../repositories/message.repository.js";
import { FindMessagesHandler } from "./find-messages.handler.js";

describe("FindMessagesHandler", () => {
  const conversationRepository = { getByIdForParticipant: vi.fn() };
  const messageRepository = { findByConversation: vi.fn() };
  const handler = new FindMessagesHandler(
    conversationRepository as unknown as ConversationRepository,
    messageRepository as unknown as MessageRepository,
  );
  const command = { conversationId: "1", userId: "ana", page: 2, limit: 50 };

  beforeEach(() => vi.clearAllMocks());

  it("checks that you take part, as the user who asked", async () => {
    conversationRepository.getByIdForParticipant.mockResolvedValue({ id: "1" });
    messageRepository.findByConversation.mockResolvedValue({ items: [] });

    await handler.execute(command);

    expect(conversationRepository.getByIdForParticipant).toHaveBeenCalledWith({
      id: "1",
      userId: "ana",
    });
  });

  it("returns the page you asked for", async () => {
    const page = { items: [{ id: "a" }], meta: { page: 2 } };

    conversationRepository.getByIdForParticipant.mockResolvedValue({ id: "1" });
    messageRepository.findByConversation.mockResolvedValue(page);

    await expect(handler.execute(command)).resolves.toBe(page);
    expect(messageRepository.findByConversation).toHaveBeenCalledWith("1", {
      page: 2,
      limit: 50,
    });
  });

  it("gives CNV-001 to a stranger and reads nothing", async () => {
    conversationRepository.getByIdForParticipant.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toMatchObject({
      response: { code: "CNV-001" },
    });
    expect(messageRepository.findByConversation).not.toHaveBeenCalled();
  });
});
