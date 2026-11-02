import { Injectable } from "@nestjs/common";
import type { ICommandHandler } from "@/common/interfaces/command-handler.interface.js";
import { HashingService } from "@/security/hashing/hashing.service.js";
import type { CreateUserReqDto } from "../dtos/create-user-req.dto.js";
import { UserRepository } from "../repositories/user.repository.js";
import type { User } from "../users.types.js";

@Injectable()
export class CreateUserHandler
  implements ICommandHandler<CreateUserReqDto, User>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
  ) {}

  async execute({ name, email, password }: CreateUserReqDto): Promise<User> {
    const passwordHash = await this.hashingService.hash(password);

    return this.userRepository.create({
      name,
      email,
      password: passwordHash,
    });
  }
}
