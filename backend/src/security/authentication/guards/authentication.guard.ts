import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { PUBLIC_ROUTE_KEY } from "../decorators/skip-authentication.decorator.js";

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) return true;
    if (context.getType() !== "http") throw new UnauthorizedException();

    const request = context.switchToHttp().getRequest<Request>();
    const authenticatedContext = request.session.authenticatedContext;

    if (!authenticatedContext) throw new UnauthorizedException();

    request.authenticatedContext = authenticatedContext;

    return true;
  }
}
