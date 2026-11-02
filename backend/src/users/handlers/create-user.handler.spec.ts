import type { HashingService } from "@/security/hashing/hashing.service.js";
import type { UserRepository } from "../repositories/user.repository.js";
import { CreateUserHandler } from "./create-user.handler.js";

describe("CreateUserHandler", () => {
  it("saves the hash, not the password", async () => {
    const userRepository = { create: vi.fn() };
    const hashingService = { hash: vi.fn().mockResolvedValue("stored-hash") };
    const handler = new CreateUserHandler(
      userRepository as unknown as UserRepository,
      hashingService as unknown as HashingService,
    );

    await handler.execute({
      name: "Ana",
      email: "ana@test.com",
      password: "password123",
    });

    expect(userRepository.create).toHaveBeenCalledWith({
      name: "Ana",
      email: "ana@test.com",
      password: "stored-hash",
    });
  });
});
