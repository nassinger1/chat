import type { AuthenticatedContext } from "./authentication/authentication.types.js";

declare global {
  namespace Express {
    interface Request {
      authenticatedContext?: AuthenticatedContext;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    authenticatedContext?: AuthenticatedContext;
  }
}
