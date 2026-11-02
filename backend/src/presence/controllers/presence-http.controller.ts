import { Controller, HttpCode, Post } from "@nestjs/common";
import type { AuthenticatedContext } from "@/security/authentication/authentication.types.js";
import { GetAuthenticatedContext } from "@/security/authentication/decorators/get-authenticated-context.decorator.js";
import { HeartbeatHandler } from "../handlers/heartbeat.handler.js";

@Controller("presence")
export class PresenceHttpController {
  constructor(private readonly heartbeatHandler: HeartbeatHandler) {}

  @HttpCode(200)
  @Post("heartbeat")
  async heartbeat(@GetAuthenticatedContext() { userId }: AuthenticatedContext) {
    await this.heartbeatHandler.execute(userId);

    return { result: true };
  }
}
