import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { SessionModule } from "@/security/session/session.module.js";
import { HealthBrokerController } from "./controllers/health-broker.controller.js";
import { HealthHttpController } from "./controllers/health-http.controller.js";
import { HealthService } from "./services/health.service.js";
import { NatsHealthIndicator } from "./services/nats.health.js";
import { RedisHealthIndicator } from "./services/redis.health.js";

@Module({
  imports: [TerminusModule, SessionModule],
  controllers: [HealthHttpController, HealthBrokerController],
  providers: [HealthService, NatsHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}
