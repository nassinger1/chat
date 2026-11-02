import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { BrokerModule } from "./broker/broker.module.js";
import { LoggerModule } from "./common/logger/logger.module.js";
import { type AppConfig, appConfig } from "./config/app-config.js";
import { validateAppConfig } from "./config/app-config-validation.js";
import { globalProviders } from "./global-providers.js";

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
    LoggerModule,
    BrokerModule,
  ],
  providers: globalProviders,
})
export class AppModule {}
