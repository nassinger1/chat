import type { UserDocument } from "../user.schema.js";
import type { User } from "../users.types.js";

export function toUser(document: UserDocument): User {
  return {
    id: document._id.toString(),
    name: document.name,
    email: document.email,
    status: document.status,
    lastSeenAt: document.lastSeenAt,
    createdAt: document.createdAt as Date,
  };
}
