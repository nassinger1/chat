import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { RespondWith } from "@/common/decorators/respond-with.decorator.js";
import { PaginationQueryReqDto } from "@/common/dto/pagination-query-req.dto.js";
import { IsObjectIdPipe } from "@/common/pipes/is-object-id.pipe.js";
import type { AuthenticatedContext } from "@/security/authentication/authentication.types.js";
import { GetAuthenticatedContext } from "@/security/authentication/decorators/get-authenticated-context.decorator.js";
import {
  toMessageListResDto,
  toMessageResDto,
} from "../dtos/message-res.dto.js";
import { SendMessageReqDto } from "../dtos/send-message-req.dto.js";
import { FindMessagesHandler } from "../handlers/find-messages.handler.js";
import { SendMessageHandler } from "../handlers/send-message.handler.js";

@Controller("conversations/:id/messages")
export class MessagesHttpController {
  constructor(
    private readonly sendMessageHandler: SendMessageHandler,
    private readonly findMessagesHandler: FindMessagesHandler,
  ) {}

  @RespondWith(toMessageResDto)
  @Post()
  send(
    @GetAuthenticatedContext() { userId }: AuthenticatedContext,
    @Param("id", IsObjectIdPipe) conversationId: string,
    @Body() { text }: SendMessageReqDto,
  ) {
    return this.sendMessageHandler.execute({
      conversationId,
      senderId: userId,
      text,
    });
  }

  @RespondWith(toMessageListResDto)
  @Get()
  find(
    @GetAuthenticatedContext() { userId }: AuthenticatedContext,
    @Param("id", IsObjectIdPipe) conversationId: string,
    @Query() { page, limit }: PaginationQueryReqDto,
  ) {
    return this.findMessagesHandler.execute({
      conversationId,
      userId,
      page,
      limit,
    });
  }
}
