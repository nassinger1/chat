import { Injectable } from "@nestjs/common";
import type { ICommandHandler } from "@/common/interfaces/command-handler.interface.js";
import {
  ChangeType,
  createChangeEvent,
  EventNamespace,
} from "@/events/event.types.js";
import { EventPublisher } from "@/events/event-publisher.service.js";
import { HashingService } from "@/security/hashing/hashing.service.js";
import type { CreateUserReqDto } from "../dtos/create-user-req.dto.js";
import { toUserResDto } from "../dtos/user-res.dto.js";
import { UserRepository } from "../repositories/user.repository.js";
import type { User } from "../users.types.js";

@Injectable()
export class CreateUserHandler
  implements ICommandHandler<CreateUserReqDto, User>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({ name, email, password }: CreateUserReqDto): Promise<User> {
    const passwordHash = await this.hashingService.hash(password);

    const user = await this.userRepository.create({
      name,
      email,
      password: passwordHash,
    });

    this.eventPublisher.toEveryone(
      createChangeEvent({
        namespace: EventNamespace.USERS,
        name: "user-created",
        type: ChangeType.CREATED,
        actorId: user.id,
        data: toUserResDto(user),
      }),
    );

    return user;
  }
}
