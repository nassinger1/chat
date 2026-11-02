import { Injectable } from "@nestjs/common";
import type { ICommandHandler } from "@/common/interfaces/command-handler.interface.js";
import { UserRepository } from "@/users/repositories/user.repository.js";
import type { ConversationWithPeer } from "../conversations.types.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";

@Injectable()
export class FindConversationsHandler
  implements ICommandHandler<string, ConversationWithPeer[]>
{
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string): Promise<ConversationWithPeer[]> {
    const conversations =
      await this.conversationRepository.findByParticipant(userId);

    const peerIds = conversations.flatMap(({ participants }) =>
      participants
        .map((participant) => participant.userId)
        .filter((participantId) => participantId !== userId),
    );

    const peers = await this.userRepository.findByIds(peerIds);
    const peersById = new Map(peers.map((peer) => [peer.id, peer]));

    return conversations.map((conversation) => {
      const own = conversation.participants.find(
        (participant) => participant.userId === userId,
      );
      const other = conversation.participants.find(
        (participant) => participant.userId !== userId,
      );

      return {
        ...conversation,
        peer: peersById.get(other?.userId ?? "") ?? null,
        unreadCount: own?.unreadCount ?? 0,
      };
    });
  }
}
