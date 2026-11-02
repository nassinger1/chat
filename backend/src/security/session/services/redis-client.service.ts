import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "redis";
import type { AppConfig } from "@/config/app-config.js";

@Injectable()
export class RedisClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisClientService.name);
  private readonly client: ReturnType<typeof createClient>;

  constructor(configService: ConfigService<AppConfig, true>) {
    this.client = createClient({
      url: configService.get("redis.url", { infer: true }),
    });

    this.client.on("error", (error: Error) => {
      this.logger.error(`Redis error: ${error.message}`);
    });
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async onModuleDestroy() {
    if (this.client.isOpen) await this.client.quit();
  }

  getClient() {
    return this.client;
  }
}
