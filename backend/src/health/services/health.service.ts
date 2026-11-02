import { Injectable } from "@nestjs/common";
import { HealthCheckService, MongooseHealthIndicator } from "@nestjs/terminus";
import { NatsHealthIndicator } from "./nats.health.js";
import { RedisHealthIndicator } from "./redis.health.js";

@Injectable()
export class HealthService {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly mongooseIndicator: MongooseHealthIndicator,
    private readonly natsIndicator: NatsHealthIndicator,
    private readonly redisIndicator: RedisHealthIndicator,
  ) {}

  live() {
    return { status: "up" };
  }

  async ready() {
    const result = await this.healthCheckService.check([
      () => this.mongooseIndicator.pingCheck("mongo"),
      () => this.natsIndicator.pingCheck("nats"),
      () => this.redisIndicator.pingCheck("redis"),
    ]);

    return { status: "up", dependencies: result.details };
  }
}
