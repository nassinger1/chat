import { Module } from "@nestjs/common";
import { RedisClientService } from "./services/redis-client.service.js";
import { SessionService } from "./services/session.service.js";
import { SessionStoreService } from "./services/session-store.service.js";

@Module({
  providers: [RedisClientService, SessionStoreService, SessionService],
  exports: [RedisClientService, SessionStoreService, SessionService],
})
export class SessionModule {}
