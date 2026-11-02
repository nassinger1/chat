import type { HttpException } from "@nestjs/common";
import type { AppError } from "../interfaces/app-error.interface.js";

type ErrorParams = {
  error: new (body: AppError) => HttpException;
  code: string;
  message: string;
  details?: unknown;
};

export const createError = ({ error, code, message, details }: ErrorParams) =>
  new error({ code, message, details });
