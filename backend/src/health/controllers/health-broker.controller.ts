import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { SkipAuthentication } from "@/security/authentication/decorators/skip-authentication.decorator.js";
import { HealthService } from "../services/health.service.js";

@Controller()
export class HealthBrokerController {
  constructor(private readonly healthService: HealthService) {}

  @SkipAuthentication()
  @MessagePattern("chat.service.health.check")
  check() {
    return this.healthService.live();
  }
}
