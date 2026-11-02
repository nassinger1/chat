import type { AuthenticatedContext } from "../authentication.types.js";

export type SessionResDto = {
  isAuthenticated: boolean;
  user: { id: string; name: string; email: string } | null;
};

export function toSessionResDto(
  context: AuthenticatedContext | undefined | void,
): SessionResDto {
  if (!context) return { isAuthenticated: false, user: null };

  return {
    isAuthenticated: true,
    user: {
      id: context.userId,
      name: context.userName,
      email: context.userEmail,
    },
  };
}
