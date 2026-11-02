import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module.js";
import type { AppConfig } from "./config/app-config.js";
import { setupApp } from "./setup-app.js";

const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  bufferLogs: true,
});
const configService = app.get<ConfigService<AppConfig, true>>(ConfigService);

setupApp(app);

await app.startAllMicroservices();
app.enableShutdownHooks();
await app.listen(configService.get("port", { infer: true }));
