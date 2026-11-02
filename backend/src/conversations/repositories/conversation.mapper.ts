import type { ConversationDocument } from "../conversation.schema.js";
import type { Conversation } from "../conversations.types.js";

export function toConversation(document: ConversationDocument): Conversation {
  const { lastMessage } = document;

  return {
    id: document._id.toString(),
    participants: document.participants.map(({ user, unreadCount }) => ({
      userId: user.toString(),
      unreadCount,
    })),
    lastMessage: lastMessage
      ? {
          text: lastMessage.text,
          senderId: lastMessage.sender.toString(),
          sentAt: lastMessage.sentAt,
        }
      : null,
    updatedAt: document.updatedAt as Date,
  };
}
