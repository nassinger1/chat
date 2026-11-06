import type { UserRepository } from "../repositories/user.repository.js";
import { FindUsersHandler } from "./find-users.handler.js";

describe("FindUsersHandler", () => {
  const userRepository = { findOthers: vi.fn() };
  const handler = new FindUsersHandler(
    userRepository as unknown as UserRepository,
  );

  beforeEach(() => vi.clearAllMocks());

  it("lists everyone except you, on the page you asked for", async () => {
    const page = { items: [{ id: "bruno" }], meta: { page: 3 } };

    userRepository.findOthers.mockResolvedValue(page);

    await expect(
      handler.execute({ userId: "ana", page: 3, limit: 10 }),
    ).resolves.toBe(page);
    expect(userRepository.findOthers).toHaveBeenCalledWith("ana", {
      page: 3,
      limit: 10,
    });
  });
});
