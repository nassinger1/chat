import { Injectable } from "@nestjs/common";
import type { ICommandHandler } from "@/common/interfaces/command-handler.interface.js";
import {
  ChangeType,
  createChangeEvent,
  EventNamespace,
} from "@/events/event.types.js";
import { EventPublisher } from "@/events/event-publisher.service.js";
import { ConversationErrors } from "../conversation.errors.js";
import type { ParticipantLookup } from "../conversations.types.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";

@Injectable()
export class MarkConversationReadHandler
  implements ICommandHandler<ParticipantLookup, void>
{
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({ id, userId }: ParticipantLookup) {
    const conversation =
      await this.conversationRepository.getByIdForParticipant({ id, userId });

    if (!conversation) throw ConversationErrors.notFound({ id });

    await this.conversationRepository.markRead({ id, userId });

    this.eventPublisher.toUser(
      userId,
      createChangeEvent({
        namespace: EventNamespace.CONVERSATIONS,
        name: "conversation-read",
        type: ChangeType.UPDATED,
        actorId: userId,
        data: { conversationId: id },
      }),
    );
  }
}
