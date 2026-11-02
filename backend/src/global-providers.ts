import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { createError } from "./common/errors/create-error.js";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter.js";
import { MongoExceptionFilter } from "./common/filters/mongo-exception.filter.js";
import { ResponseSerializerInterceptor } from "./common/interceptors/response-serializer.interceptor.js";
import { getAllConstraints } from "./common/utils.js";

const validationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  exceptionFactory: (errors = []) =>
    createError({
      error: BadRequestException,
      code: "VAL-001",
      message: "Invalid payload",
      details: getAllConstraints(errors),
    }),
});

export const globalProviders = [
  { provide: APP_PIPE, useValue: validationPipe },
  { provide: APP_FILTER, useClass: HttpExceptionFilter },
  { provide: APP_FILTER, useClass: MongoExceptionFilter },
  { provide: APP_INTERCEPTOR, useClass: ResponseSerializerInterceptor },
];
