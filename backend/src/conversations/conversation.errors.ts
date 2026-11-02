import { BadRequestException, NotFoundException } from "@nestjs/common";
import { createError } from "@/common/errors/create-error.js";

export class ConversationErrors {
  static notFound({ id }: { id: string }) {
    return createError({
      error: NotFoundException,
      code: "CNV-001",
      message: "Conversation not found",
      details: { id },
    });
  }

  static cannotChatWithYourself() {
    return createError({
      error: BadRequestException,
      code: "CNV-002",
      message: "You cannot open a conversation with yourself",
    });
  }
}
