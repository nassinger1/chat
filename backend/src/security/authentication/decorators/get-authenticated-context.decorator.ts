import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

export const GetAuthenticatedContext = createParamDecorator(
  (_: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest<Request>().authenticatedContext,
);
