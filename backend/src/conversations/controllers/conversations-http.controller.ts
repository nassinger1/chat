import { Body, Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
import { RespondWith } from "@/common/decorators/respond-with.decorator.js";
import { IsObjectIdPipe } from "@/common/pipes/is-object-id.pipe.js";
import type { AuthenticatedContext } from "@/security/authentication/authentication.types.js";
import { GetAuthenticatedContext } from "@/security/authentication/decorators/get-authenticated-context.decorator.js";
import {
  toConversationListResDto,
  toConversationResDto,
} from "../dtos/conversation-res.dto.js";
import { OpenConversationReqDto } from "../dtos/open-conversation-req.dto.js";
import { FindConversationsHandler } from "../handlers/find-conversations.handler.js";
import { MarkConversationReadHandler } from "../handlers/mark-conversation-read.handler.js";
import { OpenConversationHandler } from "../handlers/open-conversation.handler.js";

@Controller("conversations")
export class ConversationsHttpController {
  constructor(
    private readonly openConversationHandler: OpenConversationHandler,
    private readonly findConversationsHandler: FindConversationsHandler,
    private readonly markConversationReadHandler: MarkConversationReadHandler,
  ) {}

  @RespondWith(toConversationResDto)
  @Post()
  open(
    @GetAuthenticatedContext() { userId }: AuthenticatedContext,
    @Body() { participantId }: OpenConversationReqDto,
  ) {
    return this.openConversationHandler.execute({ userId, participantId });
  }

  @RespondWith(toConversationListResDto)
  @Get()
  find(@GetAuthenticatedContext() { userId }: AuthenticatedContext) {
    return this.findConversationsHandler.execute(userId);
  }

  @HttpCode(200)
  @Post(":id/read")
  async markRead(
    @GetAuthenticatedContext() { userId }: AuthenticatedContext,
    @Param("id", IsObjectIdPipe) id: string,
  ) {
    await this.markConversationReadHandler.execute({ id, userId });

    return { result: true };
  }
}
