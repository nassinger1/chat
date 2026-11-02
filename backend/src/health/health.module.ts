import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthBrokerController } from "./controllers/health-broker.controller.js";
import { HealthHttpController } from "./controllers/health-http.controller.js";
import { HealthService } from "./services/health.service.js";
import { NatsHealthIndicator } from "./services/nats.health.js";

@Module({
  imports: [TerminusModule],
  controllers: [HealthHttpController, HealthBrokerController],
  providers: [HealthService, NatsHealthIndicator],
})
export class HealthModule {}
