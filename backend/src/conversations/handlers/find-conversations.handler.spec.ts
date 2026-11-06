import type { UserRepository } from "@/users/repositories/user.repository.js";
import type { ConversationRepository } from "../repositories/conversation.repository.js";
import { FindConversationsHandler } from "./find-conversations.handler.js";

describe("FindConversationsHandler", () => {
  const conversationRepository = { findByParticipant: vi.fn() };
  const userRepository = { findByIds: vi.fn() };
  const handler = new FindConversationsHandler(
    conversationRepository as unknown as ConversationRepository,
    userRepository as unknown as UserRepository,
  );
  const bruno = { id: "bruno", name: "Bruno" };
  const carla = { id: "carla", name: "Carla" };

  beforeEach(() => vi.clearAllMocks());

  it("gives each conversation the other person as the peer", async () => {
    conversationRepository.findByParticipant.mockResolvedValue([
      {
        id: "1",
        participants: [
          { userId: "ana", unreadCount: 0 },
          { userId: "bruno", unreadCount: 0 },
        ],
      },
      {
        id: "2",
        participants: [
          { userId: "carla", unreadCount: 0 },
          { userId: "ana", unreadCount: 0 },
        ],
      },
    ]);
    userRepository.findByIds.mockResolvedValue([carla, bruno]);

    const conversations = await handler.execute("ana");
    const peerByConversation = conversations.map(({ id, peer }) => [
      id,
      peer?.id,
    ]);

    expect(peerByConversation).toEqual([
      ["1", "bruno"],
      ["2", "carla"],
    ]);
  });

  it("shows your own unread count, not the other person's", async () => {
    conversationRepository.findByParticipant.mockResolvedValue([
      {
        id: "1",
        participants: [
          { userId: "ana", unreadCount: 2 },
          { userId: "bruno", unreadCount: 7 },
        ],
      },
    ]);
    userRepository.findByIds.mockResolvedValue([bruno]);

    const [conversation] = await handler.execute("ana");

    expect(conversation.unreadCount).toBe(2);
  });

  it("returns an empty list for someone with no conversations", async () => {
    conversationRepository.findByParticipant.mockResolvedValue([]);
    userRepository.findByIds.mockResolvedValue([]);

    await expect(handler.execute("ana")).resolves.toEqual([]);
  });
});
