import type { PresenceService } from "@/presence/services/presence.service.js";
import type { HashingService } from "@/security/hashing/hashing.service.js";
import type { UserRepository } from "@/users/repositories/user.repository.js";
import { LoginHandler } from "./login.handler.js";

describe("LoginHandler", () => {
  const userRepository = { getByEmailWithPassword: vi.fn() };
  const hashingService = { compare: vi.fn() };
  const presenceService = { markOnline: vi.fn() };
  const handler = new LoginHandler(
    userRepository as unknown as UserRepository,
    hashingService as unknown as HashingService,
    presenceService as unknown as PresenceService,
  );
  const command = { email: "ana@test.com", password: "password123" };
  const user = {
    id: "1",
    name: "Ana",
    email: "ana@test.com",
    password: "stored-hash",
  };

  beforeEach(() => vi.clearAllMocks());

  it("marks the user online on the right password", async () => {
    userRepository.getByEmailWithPassword.mockResolvedValue(user);
    hashingService.compare.mockResolvedValue(true);

    await expect(handler.execute(command)).resolves.toEqual({
      userId: "1",
      userName: "Ana",
      userEmail: "ana@test.com",
    });
    expect(presenceService.markOnline).toHaveBeenCalledWith("1");
  });

  it("gives IAM-001 for a wrong password", async () => {
    userRepository.getByEmailWithPassword.mockResolvedValue(user);
    hashingService.compare.mockResolvedValue(false);

    await expect(handler.execute(command)).rejects.toMatchObject({
      response: { code: "IAM-001" },
    });
    expect(presenceService.markOnline).not.toHaveBeenCalled();
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
