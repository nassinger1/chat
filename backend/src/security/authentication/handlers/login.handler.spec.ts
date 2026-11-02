import type { HashingService } from "@/security/hashing/hashing.service.js";
import type { UserRepository } from "@/users/repositories/user.repository.js";
import { LoginHandler } from "./login.handler.js";

describe("LoginHandler", () => {
  const userRepository = { getByEmailWithPassword: vi.fn() };
  const hashingService = { compare: vi.fn() };
  const handler = new LoginHandler(
    userRepository as unknown as UserRepository,
    hashingService as unknown as HashingService,
  );
  const command = { email: "ana@test.com", password: "password123" };
  const user = {
    id: "1",
    name: "Ana",
    email: "ana@test.com",
    password: "stored-hash",
  };

  beforeEach(() => vi.clearAllMocks());

  it("returns the context for the right password", async () => {
    userRepository.getByEmailWithPassword.mockResolvedValue(user);
    hashingService.compare.mockResolvedValue(true);

    await expect(handler.execute(command)).resolves.toEqual({
      userId: "1",
      userName: "Ana",
      userEmail: "ana@test.com",
    });
  });

  it("gives IAM-001 for a wrong password", async () => {
    userRepository.getByEmailWithPassword.mockResolvedValue(user);
    hashingService.compare.mockResolvedValue(false);

    await expect(handler.execute(command)).rejects.toMatchObject({
      response: { code: "IAM-001" },
    });
  });

  it("gives IAM-001 for an unknown email, after comparing", async () => {
    userRepository.getByEmailWithPassword.mockResolvedValue(null);
    hashingService.compare.mockResolvedValue(false);

    await expect(handler.execute(command)).rejects.toMatchObject({
      response: { code: "IAM-001" },
    });
    expect(hashingService.compare).toHaveBeenCalledOnce();
  });
});
