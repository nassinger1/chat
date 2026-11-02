import type { MessageDocument } from "../message.schema.js";
import type { Message } from "../messages.types.js";

export function toMessage(document: MessageDocument): Message {
  return {
    id: document._id.toString(),
    conversationId: document.conversation.toString(),
    senderId: document.sender.toString(),
    text: document.text,
    createdAt: document.createdAt as Date,
  };
}
