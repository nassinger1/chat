import { Injectable } from "@nestjs/common";
import type { ICommandHandler } from "@/common/interfaces/command-handler.interface.js";
import { PresenceService } from "@/presence/services/presence.service.js";
import { HashingService } from "@/security/hashing/hashing.service.js";
import { UserRepository } from "@/users/repositories/user.repository.js";
import { AuthenticationErrors } from "../authentication.errors.js";
import type { AuthenticatedContext } from "../authentication.types.js";

export type LoginCommand = {
  email: string;
  password: string;
};

@Injectable()
export class LoginHandler
  implements ICommandHandler<LoginCommand, AuthenticatedContext>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
    private readonly presenceService: PresenceService,
  ) {}

  async execute({
    email,
    password,
  }: LoginCommand): Promise<AuthenticatedContext> {
    const user = await this.userRepository.getByEmailWithPassword(email);
    const isPasswordMatch = await this.hashingService.compare(
      password,
      user?.password,
    );

    if (!user || !isPasswordMatch) {
      throw AuthenticationErrors.invalidCredentials();
    }

    await this.presenceService.markOnline(user.id);

    return { userId: user.id, userName: user.name, userEmail: user.email };
  }
}
