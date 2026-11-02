import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerModule } from "@nestjs/throttler";
import { BrokerModule } from "./broker/broker.module.js";
import { LoggerModule } from "./common/logger/logger.module.js";
import {
  type AppConfig,
  AppEnvironment,
  appConfig,
} from "./config/app-config.js";
import { validateAppConfig } from "./config/app-config-validation.js";
import { globalProviders } from "./global-providers.js";
import { HealthModule } from "./health/health.module.js";
import { AuthenticationModule } from "./security/authentication/authentication.module.js";
import { SessionModule } from "./security/session/session.module.js";
import { UsersModule } from "./users/users.module.js";

const THROTTLED_ENVIRONMENTS: string[] = [
  AppEnvironment.PRODUCTION,
  AppEnvironment.STAGING,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate: validateAppConfig,
      envFilePath: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        uri: config.get("mongoConn", { infer: true }),
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 10 }],
      skipIf: () => !THROTTLED_ENVIRONMENTS.includes(process.env.APP_ENV ?? ""),
    }),
    LoggerModule,
    BrokerModule,
    SessionModule,
    AuthenticationModule,
    HealthModule,
    UsersModule,
  ],
  providers: globalProviders,
})
export class AppModule {}
