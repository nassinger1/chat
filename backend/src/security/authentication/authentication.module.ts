import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { HashingModule } from "@/security/hashing/hashing.module.js";
import { SessionModule } from "@/security/session/session.module.js";
import { UsersModule } from "@/users/users.module.js";
import { AuthenticationHttpController } from "./controllers/authentication-http.controller.js";
import { AuthenticationGuard } from "./guards/authentication.guard.js";
import { IssueBrokerCredentialsHandler } from "./handlers/issue-broker-credentials.handler.js";
import { LoginHandler } from "./handlers/login.handler.js";

@Module({
  imports: [HashingModule, SessionModule, UsersModule],
  controllers: [AuthenticationHttpController],
  providers: [
    LoginHandler,
    IssueBrokerCredentialsHandler,
    { provide: APP_GUARD, useClass: AuthenticationGuard },
  ],
})
export class AuthenticationModule {}
