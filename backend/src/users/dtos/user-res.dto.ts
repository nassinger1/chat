import type { User, UserStatus } from "../users.types.js";

export type UserResDto = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  lastSeenAt: Date | null;
};

export function toUserResDto(user: User): UserResDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    lastSeenAt: user.lastSeenAt,
  };
}
