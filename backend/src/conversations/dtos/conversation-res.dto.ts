import { toUserResDto, type UserResDto } from "@/users/dtos/user-res.dto.js";
import type { ConversationWithPeer } from "../conversations.types.js";

export type ConversationResDto = {
  id: string;
  peer: UserResDto | null;
  unreadCount: number;
  lastMessage: ConversationWithPeer["lastMessage"];
  updatedAt: Date;
};

export function toConversationResDto(
  conversation: ConversationWithPeer,
): ConversationResDto {
  return {
    id: conversation.id,
    peer: conversation.peer ? toUserResDto(conversation.peer) : null,
    unreadCount: conversation.unreadCount,
    lastMessage: conversation.lastMessage,
    updatedAt: conversation.updatedAt,
  };
}

export function toConversationListResDto(
  conversations: ConversationWithPeer[],
) {
  return conversations.map(toConversationResDto);
}
