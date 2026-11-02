import { Module } from "@nestjs/common";
import { UsersModule } from "@/users/users.module.js";
import { PresenceService } from "./services/presence.service.js";

@Module({
  imports: [UsersModule],
  providers: [PresenceService],
  exports: [PresenceService],
})
export class PresenceModule {}
