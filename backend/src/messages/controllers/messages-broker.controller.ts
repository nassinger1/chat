import { Controller } from "@nestjs/common";
import { Payload } from "@nestjs/microservices";
import { MESSAGE_CREATED_SUBJECT } from "@/broker/broker-streams.js";
import { MessagePatternConsumer } from "@/common/decorators/message-pattern-consumer.decorator.js";
import { SkipAuthentication } from "@/security/authentication/decorators/skip-authentication.decorator.js";
import type { MessageResDto } from "../dtos/message-res.dto.js";
import { DeliverMessageHandler } from "../handlers/deliver-message.handler.js";

@Controller()
export class MessagesBrokerController {
  constructor(private readonly deliverMessageHandler: DeliverMessageHandler) {}

  @SkipAuthentication()
  @MessagePatternConsumer(MESSAGE_CREATED_SUBJECT)
  deliver(@Payload() message: MessageResDto) {
    return this.deliverMessageHandler.execute(message);
  }
}
