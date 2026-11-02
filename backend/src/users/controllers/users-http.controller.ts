import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { RespondWith } from "@/common/decorators/respond-with.decorator.js";
import { PaginationQueryReqDto } from "@/common/dto/pagination-query-req.dto.js";
import type { AuthenticatedContext } from "@/security/authentication/authentication.types.js";
import { GetAuthenticatedContext } from "@/security/authentication/decorators/get-authenticated-context.decorator.js";
import { SkipAuthentication } from "@/security/authentication/decorators/skip-authentication.decorator.js";
import { CreateUserReqDto } from "../dtos/create-user-req.dto.js";
import { toUserListResDto, toUserResDto } from "../dtos/user-res.dto.js";
import { CreateUserHandler } from "../handlers/create-user.handler.js";
import { FindUsersHandler } from "../handlers/find-users.handler.js";

@Controller("users")
export class UsersHttpController {
  constructor(
    private readonly createUserHandler: CreateUserHandler,
    private readonly findUsersHandler: FindUsersHandler,
  ) {}

  @RespondWith(toUserResDto)
  @SkipAuthentication()
  @UseGuards(ThrottlerGuard)
  @Post()
  create(@Body() body: CreateUserReqDto) {
    return this.createUserHandler.execute(body);
  }

  @RespondWith(toUserListResDto)
  @Get()
  find(
    @GetAuthenticatedContext() { userId }: AuthenticatedContext,
    @Query() { page, limit }: PaginationQueryReqDto,
  ) {
    return this.findUsersHandler.execute({ userId, page, limit });
  }
}
