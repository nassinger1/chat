import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BrokerCredentialsService } from "@/broker/broker-credentials.service.js";
import type { AppConfig } from "@/config/app-config.js";
import { BROADCAST_SUBJECT, userSubject } from "@/events/event-subjects.js";
import type { AuthenticatedContext } from "../authentication.types.js";

@Injectable()
export class IssueBrokerCredentialsHandler {
  constructor(
    private readonly brokerCredentialsService: BrokerCredentialsService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async execute({ userId }: AuthenticatedContext) {
    const credentials = await this.brokerCredentialsService.mintSubscribeOnly(
      userId,
      [BROADCAST_SUBJECT, userSubject(userId)],
    );

    return {
      ...credentials,
      wsUrl: this.configService.get("nats.wsUrl", { infer: true }),
    };
  }
}
