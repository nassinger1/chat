import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import { UserRepository } from "@/users/repositories/user.repository.js";
import { PresenceService } from "./presence.service.js";

const SWEEP_INTERVAL_IN_MS = 30_000;
const OFFLINE_AFTER_IN_MS = 60_000;

@Injectable()
export class PresenceSweepService implements OnModuleInit, OnModuleDestroy {
  private sweepTimer: NodeJS.Timeout;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly presenceService: PresenceService,
  ) {}

  onModuleInit() {
    this.sweepTimer = setInterval(
      () => void this.sweep(),
      SWEEP_INTERVAL_IN_MS,
    );
  }

  onModuleDestroy() {
    clearInterval(this.sweepTimer);
  }

  async sweep() {
    const staleBefore = new Date(Date.now() - OFFLINE_AFTER_IN_MS);
    const staleUsers = await this.userRepository.findStaleOnline(staleBefore);

    await Promise.all(
      staleUsers.map(({ id }) => this.presenceService.markOffline(id)),
    );
  }
}
