import { MessagePattern } from "@nestjs/microservices";

export const MessagePatternConsumer = (subject: string) =>
  MessagePattern(subject);
