import type { UserRepository } from "@/users/repositories/user.repository.js";
import type { ConversationRepository } from "../repositories/conversation.repository.js";
import { OpenConversationHandler } from "./open-conversation.handler.js";

describe("OpenConversationHandler", () => {
  const conversationRepository = { findOrCreateDirect: vi.fn() };
  const userRepository = { getById: vi.fn() };
  const handler = new OpenConversationHandler(
    conversationRepository as unknown as ConversationRepository,
    userRepository as unknown as UserRepository,
  );
  const bruno = { id: "bruno", name: "Bruno", email: "bruno@test.com" };
  const command = { userId: "ana", participantId: "bruno" };

  beforeEach(() => vi.clearAllMocks());

  it("returns the conversation with the other person and your own unread count", async () => {
    userRepository.getById.mockResolvedValue(bruno);
    conversationRepository.findOrCreateDirect.mockResolvedValue({
      id: "1",
      participants: [
        { userId: "bruno", unreadCount: 0 },
        { userId: "ana", unreadCount: 3 },
      ],
      lastMessage: null,
    });

    const conversation = await handler.execute(command);

    expect(conversation).toMatchObject({
      id: "1",
      peer: bruno,
      unreadCount: 3,
    });
  });

  it("gives CNV-002 for a conversation with yourself and touches nothing", async () => {
    const commandWithYourself = { userId: "ana", participantId: "ana" };

    await expect(handler.execute(commandWithYourself)).rejects.toMatchObject({
      response: { code: "CNV-002" },
    });
    expect(userRepository.getById).not.toHaveBeenCalled();
    expect(conversationRepository.findOrCreateDirect).not.toHaveBeenCalled();
  });

  it("gives USR-002 for a user that does not exist and creates nothing", async () => {
    userRepository.getById.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toMatchObject({
      response: { code: "USR-002" },
    });
    expect(conversationRepository.findOrCreateDirect).not.toHaveBeenCalled();
  });
});
