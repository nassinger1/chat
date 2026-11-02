import { Injectable } from "@nestjs/common";
import type { ICommandHandler } from "@/common/interfaces/command-handler.interface.js";
import { PresenceService } from "@/presence/services/presence.service.js";

@Injectable()
export class LogoutHandler implements ICommandHandler<string, void> {
  constructor(private readonly presenceService: PresenceService) {}

  execute(userId: string) {
    return this.presenceService.markOffline(userId);
  }
}
