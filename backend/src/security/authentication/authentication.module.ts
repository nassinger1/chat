import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthenticationGuard } from "./guards/authentication.guard.js";

@Module({
  providers: [{ provide: APP_GUARD, useClass: AuthenticationGuard }],
})
export class AuthenticationModule {}
