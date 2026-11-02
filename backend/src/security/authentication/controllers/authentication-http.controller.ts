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
import { SkipAuthentication } from "../decorators/skip-authentication.decorator.js";
import { LoginReqDto } from "../dtos/login-req.dto.js";
import { toSessionResDto } from "../dtos/session-res.dto.js";
import { LoginHandler } from "../handlers/login.handler.js";

@Controller("auth")
export class AuthenticationHttpController {
  constructor(
    private readonly loginHandler: LoginHandler,
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
  logout(@Req() req: Request) {
    return this.sessionService.destroy(req);
  }
}
