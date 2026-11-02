import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { map } from "rxjs/operators";
import { RESPOND_WITH_METADATA } from "../decorators/respond-with.decorator.js";

@Injectable()
export class ResponseSerializerInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const toResponse = this.reflector.get<((body: unknown) => unknown) | null>(
      RESPOND_WITH_METADATA,
      context.getHandler(),
    );

    if (!toResponse) return next.handle();

    return next.handle().pipe(map((body) => toResponse(body)));
  }
}
