import { Injectable } from "@nestjs/common";
import type { ICommandHandler } from "@/common/interfaces/command-handler.interface.js";
import { PresenceService } from "../services/presence.service.js";

@Injectable()
export class HeartbeatHandler implements ICommandHandler<string, void> {
  constructor(private readonly presenceService: PresenceService) {}

  execute(userId: string) {
    return this.presenceService.heartbeat(userId);
  }
}
