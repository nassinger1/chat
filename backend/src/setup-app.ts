import { ConfigService } from "@nestjs/config";
import type { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
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
}
