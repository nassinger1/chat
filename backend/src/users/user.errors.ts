import { ConflictException, NotFoundException } from "@nestjs/common";
import { createError } from "@/common/errors/create-error.js";

export class UserErrors {
  static emailAlreadyRegistered() {
    return createError({
      error: ConflictException,
      code: "USR-001",
      message: "Email already registered",
    });
  }

  static notFound({ id }: { id: string }) {
    return createError({
      error: NotFoundException,
      code: "USR-002",
      message: "User not found",
      details: { id },
    });
  }
}
