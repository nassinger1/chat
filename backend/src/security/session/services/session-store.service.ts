import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RedisStore } from "connect-redis";
import type { AppConfig } from "@/config/app-config.js";
import { RedisClientService } from "./redis-client.service.js";

@Injectable()
export class SessionStoreService extends RedisStore {
  constructor(
    redisClient: RedisClientService,
    configService: ConfigService<AppConfig, true>,
  ) {
    const prefix = configService.get("redis.prefix", { infer: true });

    super({ client: redisClient.getClient(), prefix: `${prefix}:session:` });
  }
}
