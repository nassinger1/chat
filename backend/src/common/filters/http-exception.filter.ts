import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";
import { throwError } from "rxjs";
import type { AppError } from "../interfaces/app-error.interface.js";

type ExceptionBody = {
  code?: string;
  message?: unknown;
  details?: unknown;
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const status = exception.getStatus();
    const response = exception.getResponse();
    const body: ExceptionBody = typeof response === "object" ? response : {};

    const error: AppError = {
      code: body.code ?? `HTTP-${status}`,
      status,
      message:
        typeof body.message === "string" ? body.message : exception.message,
      timestamp: new Date().toISOString(),
    };

    if (body.details) error.details = body.details;

    this.logger.error(`${error.code}: ${error.message}`);

    if (host.getType() === "rpc") return throwError(() => error);

    host.switchToHttp().getResponse<Response>().status(status).json(error);
  }
}
