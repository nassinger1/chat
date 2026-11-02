import { Injectable } from "@nestjs/common";
import type { ICommandHandler } from "@/common/interfaces/command-handler.interface.js";
import { ConversationErrors } from "../conversation.errors.js";
import type { ParticipantLookup } from "../conversations.types.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";

@Injectable()
export class MarkConversationReadHandler
  implements ICommandHandler<ParticipantLookup, void>
{
  constructor(
    private readonly conversationRepository: ConversationRepository,
  ) {}

  async execute({ id, userId }: ParticipantLookup) {
    const conversation =
      await this.conversationRepository.getByIdForParticipant({ id, userId });

    if (!conversation) throw ConversationErrors.notFound({ id });

    await this.conversationRepository.markRead({ id, userId });
  }
}
