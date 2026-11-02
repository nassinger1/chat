import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { RespondWith } from "@/common/decorators/respond-with.decorator.js";
import { SkipAuthentication } from "@/security/authentication/decorators/skip-authentication.decorator.js";
import { CreateUserReqDto } from "../dtos/create-user-req.dto.js";
import { toUserResDto } from "../dtos/user-res.dto.js";
import { CreateUserHandler } from "../handlers/create-user.handler.js";

@Controller("users")
export class UsersHttpController {
  constructor(private readonly createUserHandler: CreateUserHandler) {}

  @RespondWith(toUserResDto)
  @SkipAuthentication()
  @UseGuards(ThrottlerGuard)
  @Post()
  create(@Body() body: CreateUserReqDto) {
    return this.createUserHandler.execute(body);
  }
}
