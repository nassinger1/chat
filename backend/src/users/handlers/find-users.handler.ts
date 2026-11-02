import { Injectable } from "@nestjs/common";
import type { ICommandHandler } from "@/common/interfaces/command-handler.interface.js";
import type { PaginatedResult } from "@/common/interfaces/paginated-result.interface.js";
import type { PageOptions } from "@/common/pagination.js";
import { UserRepository } from "../repositories/user.repository.js";
import type { User } from "../users.types.js";

export type FindUsersCommand = PageOptions & { userId: string };

@Injectable()
export class FindUsersHandler
  implements ICommandHandler<FindUsersCommand, PaginatedResult<User>>
{
  constructor(private readonly userRepository: UserRepository) {}

  execute({ userId, page, limit }: FindUsersCommand) {
    return this.userRepository.findOthers(userId, { page, limit });
  }
}
