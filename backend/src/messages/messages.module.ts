import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConversationsModule } from "@/conversations/conversations.module.js";
import { MessagesBrokerController } from "./controllers/messages-broker.controller.js";
import { MessagesHttpController } from "./controllers/messages-http.controller.js";
import { DeliverMessageHandler } from "./handlers/deliver-message.handler.js";
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
  controllers: [MessagesHttpController, MessagesBrokerController],
  providers: [
    MessageRepository,
    SendMessageHandler,
    FindMessagesHandler,
    DeliverMessageHandler,
  ],
})
export class MessagesModule {}
