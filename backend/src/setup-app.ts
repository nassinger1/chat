import { ConfigService } from "@nestjs/config";
import type { MicroserviceOptions } from "@nestjs/microservices";
import type { NestExpressApplication } from "@nestjs/platform-express";
import session from "express-session";
import helmet from "helmet";
import { BrokerClientService } from "./broker/broker-client.service.js";
import { BrokerServer } from "./broker/broker-server.js";
import { BrokerStreamConsumerService } from "./broker/broker-stream-consumer.service.js";
import { AppLogger } from "./common/logger/logger.js";
import { type AppConfig, AppEnvironment } from "./config/app-config.js";
import { SessionStoreService } from "./security/session/services/session-store.service.js";

const TWELVE_HOURS_IN_MS = 12 * 60 * 60 * 1000;

export function setupApp(app: NestExpressApplication) {
  const configService = app.get<ConfigService<AppConfig, true>>(ConfigService);
  const appEnv = configService.get("appEnv", { infer: true });

  app.useLogger(app.get(AppLogger));
  app.set("trust proxy", 1);
  app.use(helmet());
  app.enableCors({
    credentials: true,
    origin: configService.get("frontendOrigin", { infer: true }),
  });
  app.use(
    session({
      secret: configService.get("sessionSecret", { infer: true }),
      store: app.get(SessionStoreService),
      rolling: true,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: appEnv === AppEnvironment.PRODUCTION,
        sameSite: "lax",
        maxAge: TWELVE_HOURS_IN_MS,
      },
    }),
  );

  app.connectMicroservice<MicroserviceOptions>(
    {
      strategy: new BrokerServer(
        app.get(BrokerClientService),
        app.get(BrokerStreamConsumerService),
        {
          queue: configService.get("nats.queue", { infer: true }),
          subscriptions: ["chat.service.health.check"],
        },
      ),
    },
    { inheritAppConfig: true },
  );
}
