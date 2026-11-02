import type { PaginatedResult } from "@/common/interfaces/paginated-result.interface.js";
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

export function toUserListResDto(result: PaginatedResult<User>) {
  return { items: result.items.map(toUserResDto), meta: result.meta };
}
