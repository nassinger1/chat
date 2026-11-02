import { Injectable } from "@nestjs/common";
import type { ICommandHandler } from "@/common/interfaces/command-handler.interface.js";
import type { PaginatedResult } from "@/common/interfaces/paginated-result.interface.js";
import type { PageOptions } from "@/common/pagination.js";
import { ConversationErrors } from "@/conversations/conversation.errors.js";
import { ConversationRepository } from "@/conversations/repositories/conversation.repository.js";
import type { Message } from "../messages.types.js";
import { MessageRepository } from "../repositories/message.repository.js";

export type FindMessagesCommand = PageOptions & {
  conversationId: string;
  userId: string;
};

@Injectable()
export class FindMessagesHandler
  implements ICommandHandler<FindMessagesCommand, PaginatedResult<Message>>
{
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute({
    conversationId,
    userId,
    page,
    limit,
  }: FindMessagesCommand): Promise<PaginatedResult<Message>> {
    const conversation =
      await this.conversationRepository.getByIdForParticipant({
        id: conversationId,
        userId,
      });

    if (!conversation)
      throw ConversationErrors.notFound({ id: conversationId });

    return this.messageRepository.findByConversation(conversationId, {
      page,
      limit,
    });
  }
}
