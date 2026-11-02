import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";
import { mongo } from "mongoose";
import { throwError } from "rxjs";
import type { AppError } from "../interfaces/app-error.interface.js";
import { isDuplicateKeyError } from "../utils.js";

@Catch(mongo.MongoServerError)
export class MongoExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongoExceptionFilter.name);

  catch(exception: mongo.MongoServerError, host: ArgumentsHost) {
    const isDuplicate = isDuplicateKeyError(exception);
    const status = isDuplicate
      ? HttpStatus.CONFLICT
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const error: AppError = {
      code: isDuplicate ? "E0005" : "E0006",
      status,
      message: isDuplicate ? "Value already exists" : "Database error",
      timestamp: new Date().toISOString(),
    };

    if (isDuplicate) error.details = Object.keys(exception.keyPattern ?? {});

    this.logger.error(`${error.code}: ${exception.message}`);

    if (host.getType() === "rpc") return throwError(() => error);

    host.switchToHttp().getResponse<Response>().status(status).json(error);
  }
}
