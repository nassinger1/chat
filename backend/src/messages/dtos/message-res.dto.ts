import type { PaginatedResult } from "@/common/interfaces/paginated-result.interface.js";
import type { Message } from "../messages.types.js";

export type MessageResDto = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: Date;
};

export function toMessageResDto(message: Message): MessageResDto {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    text: message.text,
    createdAt: message.createdAt,
  };
}

export function toMessageListResDto(result: PaginatedResult<Message>) {
  return { items: result.items.map(toMessageResDto), meta: result.meta };
}
