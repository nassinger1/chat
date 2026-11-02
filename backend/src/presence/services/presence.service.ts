import { Injectable } from "@nestjs/common";
import {
  ChangeType,
  createChangeEvent,
  EventNamespace,
} from "@/events/event.types.js";
import { EventPublisher } from "@/events/event-publisher.service.js";
import { UserRepository } from "@/users/repositories/user.repository.js";
import { UserStatus } from "@/users/users.types.js";

@Injectable()
export class PresenceService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async markOnline(userId: string) {
    const hasChanged = await this.userRepository.markOnline(userId);

    if (hasChanged) this.broadcast(userId, UserStatus.ONLINE);
  }

  async markOffline(userId: string) {
    const user = await this.userRepository.markOffline(userId);

    if (user) this.broadcast(userId, UserStatus.OFFLINE);
  }

  heartbeat(userId: string) {
    return this.markOnline(userId);
  }

  private broadcast(userId: string, status: UserStatus) {
    this.eventPublisher.toEveryone(
      createChangeEvent({
        namespace: EventNamespace.USERS,
        name: "presence-changed",
        type: ChangeType.UPDATED,
        actorId: userId,
        data: { userId, status },
      }),
    );
  }
}
