import { ConfigService } from "@nestjs/config";
import type { MicroserviceOptions } from "@nestjs/microservices";
import type { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { BrokerClientService } from "./broker/broker-client.service.js";
import { BrokerServer } from "./broker/broker-server.js";
import { BrokerStreamConsumerService } from "./broker/broker-stream-consumer.service.js";
import { AppLogger } from "./common/logger/logger.js";
import type { AppConfig } from "./config/app-config.js";

export function setupApp(app: NestExpressApplication) {
  const configService = app.get<ConfigService<AppConfig, true>>(ConfigService);

  app.useLogger(app.get(AppLogger));
  app.set("trust proxy", 1);
  app.use(helmet());
  app.enableCors({
    credentials: true,
    origin: configService.get("frontendOrigin", { infer: true }),
  });

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
