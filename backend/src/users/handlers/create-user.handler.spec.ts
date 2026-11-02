import type { EventPublisher } from "@/events/event-publisher.service.js";
import type { HashingService } from "@/security/hashing/hashing.service.js";
import type { UserRepository } from "../repositories/user.repository.js";
import { CreateUserHandler } from "./create-user.handler.js";

describe("CreateUserHandler", () => {
  const user = { id: "1", name: "Ana", email: "ana@test.com" };
  const userRepository = { create: vi.fn().mockResolvedValue(user) };
  const hashingService = { hash: vi.fn().mockResolvedValue("stored-hash") };
  const eventPublisher = { toEveryone: vi.fn() };
  const handler = new CreateUserHandler(
    userRepository as unknown as UserRepository,
    hashingService as unknown as HashingService,
    eventPublisher as unknown as EventPublisher,
  );

  it("saves the hash and tells everyone", async () => {
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
    expect(eventPublisher.toEveryone).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({ name: "user-created" }),
      }),
    );
  });
});
