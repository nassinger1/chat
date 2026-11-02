import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PresenceModule } from "@/presence/presence.module.js";
import { HashingModule } from "@/security/hashing/hashing.module.js";
import { SessionModule } from "@/security/session/session.module.js";
import { UsersModule } from "@/users/users.module.js";
import { AuthenticationHttpController } from "./controllers/authentication-http.controller.js";
import { AuthenticationGuard } from "./guards/authentication.guard.js";
import { IssueBrokerCredentialsHandler } from "./handlers/issue-broker-credentials.handler.js";
import { LoginHandler } from "./handlers/login.handler.js";
import { LogoutHandler } from "./handlers/logout.handler.js";

@Module({
  imports: [HashingModule, SessionModule, UsersModule, PresenceModule],
  controllers: [AuthenticationHttpController],
  providers: [
    LoginHandler,
    LogoutHandler,
    IssueBrokerCredentialsHandler,
    { provide: APP_GUARD, useClass: AuthenticationGuard },
  ],
})
export class AuthenticationModule {}
