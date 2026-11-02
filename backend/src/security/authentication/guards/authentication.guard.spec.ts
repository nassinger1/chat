import type { ExecutionContext } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { AuthenticationGuard } from "./authentication.guard.js";

const createContext = (type: string, session: object = {}) => {
  const request = { session };

  return {
    request,
    context: {
      getType: () => type,
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext,
  };
};

const createGuard = (isPublic: boolean) =>
  new AuthenticationGuard({
    getAllAndOverride: () => isPublic,
  } as unknown as Reflector);

describe("AuthenticationGuard", () => {
  it("lets public routes pass", () => {
    const { context } = createContext("http");

    expect(createGuard(true).canActivate(context)).toBe(true);
  });

  it("refuses a request with no session", () => {
    const { context } = createContext("http");

    expect(() => createGuard(false).canActivate(context)).toThrow(
      UnauthorizedException,
    );
  });

  it("copies the session user to the request", () => {
    const authenticatedContext = { userId: "1" };
    const { context, request } = createContext("http", {
      authenticatedContext,
    });

    createGuard(false).canActivate(context);

    expect(request).toMatchObject({ authenticatedContext });
  });

  it("refuses a NATS message without the public label", () => {
    const { context } = createContext("rpc");

    expect(() => createGuard(false).canActivate(context)).toThrow(
      UnauthorizedException,
    );
  });
});
