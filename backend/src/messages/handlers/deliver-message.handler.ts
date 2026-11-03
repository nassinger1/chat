import { Injectable, Logger } from "@nestjs/common";
import type { ICommandHandler } from "@/common/interfaces/command-handler.interface.js";
import { ConversationRepository } from "@/conversations/repositories/conversation.repository.js";
import {
  ChangeType,
  createChangeEvent,
  EventNamespace,
} from "@/events/event.types.js";
import { EventPublisher } from "@/events/event-publisher.service.js";
import type { MessageResDto } from "../dtos/message-res.dto.js";

@Injectable()
export class DeliverMessageHandler
  implements ICommandHandler<MessageResDto, void>
{
  private readonly logger = new Logger(DeliverMessageHandler.name);

  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(message: MessageResDto) {
    const conversation = await this.conversationRepository.getById(
      message.conversationId,
    );

    if (!conversation) return;

    const event = createChangeEvent({
      namespace: EventNamespace.MESSAGES,
      name: "message-created",
      type: ChangeType.CREATED,
      actorId: message.senderId,
      data: message,
    });

    for (const { userId } of conversation.participants) {
      this.eventPublisher.toUser(userId, event);
    }

    this.logger.debug(`Message ${message.id} delivered by ${process.pid}`);
  }
}
