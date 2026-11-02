import { UnauthorizedException } from "@nestjs/common";
import { createError } from "@/common/errors/create-error.js";

export class AuthenticationErrors {
  static invalidCredentials() {
    return createError({
      error: UnauthorizedException,
      code: "IAM-001",
      message: "Invalid email or password",
    });
  }
}
