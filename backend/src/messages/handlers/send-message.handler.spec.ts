import type { ConversationRepository } from "@/conversations/repositories/conversation.repository.js";
import type { MessageRepository } from "../repositories/message.repository.js";
import { SendMessageHandler } from "./send-message.handler.js";

describe("SendMessageHandler", () => {
  const conversationRepository = {
    getByIdForParticipant: vi.fn(),
    recordMessage: vi.fn(),
  };
  const messageRepository = { create: vi.fn() };
  const handler = new SendMessageHandler(
    conversationRepository as unknown as ConversationRepository,
    messageRepository as unknown as MessageRepository,
  );
  const command = { conversationId: "1", senderId: "2", text: "Hi" };

  beforeEach(() => vi.clearAllMocks());

  it("saves the message for a participant", async () => {
    const message = { id: "3", createdAt: new Date() };

    conversationRepository.getByIdForParticipant.mockResolvedValue({ id: "1" });
    messageRepository.create.mockResolvedValue(message);

    await expect(handler.execute(command)).resolves.toBe(message);
    expect(conversationRepository.recordMessage).toHaveBeenCalledOnce();
  });

  it("gives CNV-001 to a stranger and saves nothing", async () => {
    conversationRepository.getByIdForParticipant.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toMatchObject({
      response: { code: "CNV-001" },
    });
    expect(messageRepository.create).not.toHaveBeenCalled();
  });
});
