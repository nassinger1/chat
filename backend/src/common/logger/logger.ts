import { Injectable, type LoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type Level, type Logger, pino } from "pino";
import { type AppConfig, AppEnvironment } from "@/config/app-config.js";
import { safeStringify } from "../utils.js";

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: Logger;

  constructor(configService: ConfigService<AppConfig, true>) {
    const appEnv = configService.get("appEnv", { infer: true });
    const isProduction = appEnv === AppEnvironment.PRODUCTION;

    this.logger = pino({
      level: configService.get("logLevel", { infer: true }),
      transport: isProduction ? undefined : { target: "pino-pretty" },
    });
  }

  log(message: unknown, ...params: unknown[]) {
    this.write("info", message, params);
  }

  error(message: unknown, ...params: unknown[]) {
    this.write("error", message, params);
  }

  warn(message: unknown, ...params: unknown[]) {
    this.write("warn", message, params);
  }

  debug(message: unknown, ...params: unknown[]) {
    this.write("debug", message, params);
  }

  verbose(message: unknown, ...params: unknown[]) {
    this.write("trace", message, params);
  }

  fatal(message: unknown, ...params: unknown[]) {
    this.write("fatal", message, params);
  }

  private write(level: Level, message: unknown, params: unknown[]) {
    const context = params.at(-1);
    const fields = typeof context === "string" ? { context } : {};

    if (message instanceof Error) {
      this.logger[level]({ ...fields, err: message });
      return;
    }

    if (typeof message === "object") {
      this.logger[level]({ ...fields, data: safeStringify(message) });
      return;
    }

    this.logger[level](fields, String(message));
  }
}
