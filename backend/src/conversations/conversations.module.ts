import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersModule } from "@/users/users.module.js";
import { ConversationsHttpController } from "./controllers/conversations-http.controller.js";
import {
  ConversationDocument,
  ConversationSchema,
} from "./conversation.schema.js";
import { FindConversationsHandler } from "./handlers/find-conversations.handler.js";
import { MarkConversationReadHandler } from "./handlers/mark-conversation-read.handler.js";
import { OpenConversationHandler } from "./handlers/open-conversation.handler.js";
import { ConversationRepository } from "./repositories/conversation.repository.js";

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: ConversationDocument.name, schema: ConversationSchema },
    ]),
  ],
  controllers: [ConversationsHttpController],
  providers: [
    ConversationRepository,
    OpenConversationHandler,
    FindConversationsHandler,
    MarkConversationReadHandler,
  ],
  exports: [ConversationRepository],
})
export class ConversationsModule {}
