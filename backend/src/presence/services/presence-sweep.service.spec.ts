import type { UserRepository } from "@/users/repositories/user.repository.js";
import type { PresenceService } from "./presence.service.js";
import { PresenceSweepService } from "./presence-sweep.service.js";

describe("PresenceSweepService", () => {
  it("marks every stale user offline", async () => {
    const userRepository = {
      findStaleOnline: vi.fn().mockResolvedValue([{ id: "1" }, { id: "2" }]),
    };
    const presenceService = { markOffline: vi.fn() };
    const service = new PresenceSweepService(
      userRepository as unknown as UserRepository,
      presenceService as unknown as PresenceService,
    );

    await service.sweep();

    expect(presenceService.markOffline.mock.calls).toEqual([["1"], ["2"]]);
  });
});
