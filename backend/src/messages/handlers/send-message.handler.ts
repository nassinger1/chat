import { Injectable } from "@nestjs/common";
import { MESSAGE_CREATED_SUBJECT } from "@/broker/broker-streams.js";
import type { ICommandHandler } from "@/common/interfaces/command-handler.interface.js";
import { ConversationErrors } from "@/conversations/conversation.errors.js";
import { ConversationRepository } from "@/conversations/repositories/conversation.repository.js";
import { EventPublisher } from "@/events/event-publisher.service.js";
import { toMessageResDto } from "../dtos/message-res.dto.js";
import type { CreateMessageInput, Message } from "../messages.types.js";
import { MessageRepository } from "../repositories/message.repository.js";

@Injectable()
export class SendMessageHandler
  implements ICommandHandler<CreateMessageInput, Message>
{
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly eventPublisher: EventPublisher,
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

    await this.eventPublisher.enqueue(
      MESSAGE_CREATED_SUBJECT,
      toMessageResDto(message),
    );

    return message;
  }
}
