import { Module } from "@nestjs/common";
import { UsersModule } from "@/users/users.module.js";
import { PresenceHttpController } from "./controllers/presence-http.controller.js";
import { HeartbeatHandler } from "./handlers/heartbeat.handler.js";
import { PresenceService } from "./services/presence.service.js";
import { PresenceSweepService } from "./services/presence-sweep.service.js";

@Module({
  imports: [UsersModule],
  controllers: [PresenceHttpController],
  providers: [PresenceService, PresenceSweepService, HeartbeatHandler],
  exports: [PresenceService],
})
export class PresenceModule {}
