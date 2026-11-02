import { Injectable } from "@nestjs/common";
import { HealthIndicatorService } from "@nestjs/terminus";
import { RedisClientService } from "@/security/session/services/redis-client.service.js";

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly redisClient: RedisClientService,
  ) {}

  async pingCheck(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await this.redisClient.getClient().ping();

      return indicator.up();
    } catch {
      return indicator.down();
    }
  }
}
