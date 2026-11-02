import { Injectable } from "@nestjs/common";
import type { Request } from "express";
import type { AuthenticatedContext } from "@/security/authentication/authentication.types.js";

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class SessionService {
  start(
    req: Request,
    authenticatedContext: AuthenticatedContext,
    rememberMe: boolean,
  ) {
    return new Promise<void>((resolve, reject) => {
      req.session.regenerate((regenerateError) => {
        if (regenerateError) {
          reject(regenerateError);
          return;
        }

        req.session.authenticatedContext = authenticatedContext;

        if (rememberMe) req.session.cookie.maxAge = THIRTY_DAYS_IN_MS;

        req.session.save((saveError) =>
          saveError ? reject(saveError) : resolve(),
        );
      });
    });
  }

  destroy(req: Request) {
    return new Promise<void>((resolve, reject) => {
      req.session.destroy((error) => (error ? reject(error) : resolve()));
    });
  }
}
