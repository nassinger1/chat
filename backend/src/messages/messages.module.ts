import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConversationsModule } from "@/conversations/conversations.module.js";
import { MessagesHttpController } from "./controllers/messages-http.controller.js";
import { FindMessagesHandler } from "./handlers/find-messages.handler.js";
import { SendMessageHandler } from "./handlers/send-message.handler.js";
import { MessageDocument, MessageSchema } from "./message.schema.js";
import { MessageRepository } from "./repositories/message.repository.js";

@Module({
  imports: [
    ConversationsModule,
    MongooseModule.forFeature([
      { name: MessageDocument.name, schema: MessageSchema },
    ]),
  ],
  controllers: [MessagesHttpController],
  providers: [MessageRepository, SendMessageHandler, FindMessagesHandler],
})
export class MessagesModule {}
