import { Injectable } from "@nestjs/common";
import type { ICommandHandler } from "@/common/interfaces/command-handler.interface.js";
import { ConversationErrors } from "@/conversations/conversation.errors.js";
import { ConversationRepository } from "@/conversations/repositories/conversation.repository.js";
import type { CreateMessageInput, Message } from "../messages.types.js";
import { MessageRepository } from "../repositories/message.repository.js";

@Injectable()
export class SendMessageHandler
  implements ICommandHandler<CreateMessageInput, Message>
{
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute({
    conversationId,
    senderId,
    text,
  }: CreateMessageInput): Promise<Message> {
    const conversation =
      await this.conversationRepository.getByIdForParticipant({
        id: conversationId,
        userId: senderId,
      });

    if (!conversation)
      throw ConversationErrors.notFound({ id: conversationId });

    const message = await this.messageRepository.create({
      conversationId,
      senderId,
      text,
    });

    await this.conversationRepository.recordMessage({
      id: conversationId,
      senderId,
      text,
      sentAt: message.createdAt,
    });

    return message;
  }
}
