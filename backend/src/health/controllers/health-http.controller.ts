import { Controller, Get, Header } from "@nestjs/common";
import { SkipAuthentication } from "@/security/authentication/decorators/skip-authentication.decorator.js";
import { HealthService } from "../services/health.service.js";

@Controller("health")
export class HealthHttpController {
  constructor(private readonly healthService: HealthService) {}

  @SkipAuthentication()
  @Header("Cache-Control", "no-store")
  @Get("live")
  live() {
    return this.healthService.live();
  }

  @SkipAuthentication()
  @Header("Cache-Control", "no-store")
  @Get("ready")
  ready() {
    return this.healthService.ready();
  }
}
