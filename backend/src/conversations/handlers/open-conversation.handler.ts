import { Injectable } from "@nestjs/common";
import type { ICommandHandler } from "@/common/interfaces/command-handler.interface.js";
import { UserRepository } from "@/users/repositories/user.repository.js";
import { UserErrors } from "@/users/user.errors.js";
import { ConversationErrors } from "../conversation.errors.js";
import type { ConversationWithPeer } from "../conversations.types.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";

export type OpenConversationCommand = {
  userId: string;
  participantId: string;
};

@Injectable()
export class OpenConversationHandler
  implements ICommandHandler<OpenConversationCommand, ConversationWithPeer>
{
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({
    userId,
    participantId,
  }: OpenConversationCommand): Promise<ConversationWithPeer> {
    if (userId === participantId) {
      throw ConversationErrors.cannotChatWithYourself();
    }

    const peer = await this.userRepository.getById(participantId);

    if (!peer) throw UserErrors.notFound({ id: participantId });

    const conversation = await this.conversationRepository.findOrCreateDirect(
      userId,
      participantId,
    );
    const own = conversation.participants.find(
      (participant) => participant.userId === userId,
    );

    return { ...conversation, peer, unreadCount: own?.unreadCount ?? 0 };
  }
}
