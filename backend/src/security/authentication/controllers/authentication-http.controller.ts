import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { Request } from "express";
import { RespondWith } from "@/common/decorators/respond-with.decorator.js";
import { SessionService } from "@/security/session/services/session.service.js";
import type { AuthenticatedContext } from "../authentication.types.js";
import { GetAuthenticatedContext } from "../decorators/get-authenticated-context.decorator.js";
import { SkipAuthentication } from "../decorators/skip-authentication.decorator.js";
import { toBrokerCredentialsResDto } from "../dtos/broker-credentials-res.dto.js";
import { LoginReqDto } from "../dtos/login-req.dto.js";
import { toSessionResDto } from "../dtos/session-res.dto.js";
import { IssueBrokerCredentialsHandler } from "../handlers/issue-broker-credentials.handler.js";
import { LoginHandler } from "../handlers/login.handler.js";
import { LogoutHandler } from "../handlers/logout.handler.js";

@Controller("auth")
export class AuthenticationHttpController {
  constructor(
    private readonly loginHandler: LoginHandler,
    private readonly logoutHandler: LogoutHandler,
    private readonly issueBrokerCredentialsHandler: IssueBrokerCredentialsHandler,
    private readonly sessionService: SessionService,
  ) {}

  @RespondWith(toSessionResDto)
  @SkipAuthentication()
  @UseGuards(ThrottlerGuard)
  @HttpCode(200)
  @Post("login")
  async login(
    @Req() req: Request,
    @Body() { email, password, rememberMe }: LoginReqDto,
  ) {
    const authenticatedContext = await this.loginHandler.execute({
      email,
      password,
    });

    await this.sessionService.start(
      req,
      authenticatedContext,
      rememberMe ?? false,
    );

    return authenticatedContext;
  }

  @RespondWith(toSessionResDto)
  @SkipAuthentication()
  @Get("session")
  getSession(@Req() req: Request) {
    return req.session.authenticatedContext;
  }

  @RespondWith(toSessionResDto)
  @HttpCode(200)
  @Post("logout")
  async logout(
    @Req() req: Request,
    @GetAuthenticatedContext() { userId }: AuthenticatedContext,
  ) {
    await this.logoutHandler.execute(userId);
    await this.sessionService.destroy(req);
  }

  @RespondWith(toBrokerCredentialsResDto)
  @HttpCode(200)
  @Post("broker-credentials")
  issueBrokerCredentials(
    @GetAuthenticatedContext() authenticatedContext: AuthenticatedContext,
  ) {
    return this.issueBrokerCredentialsHandler.execute(authenticatedContext);
  }
}
