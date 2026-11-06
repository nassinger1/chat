import type { PresenceService } from "@/presence/services/presence.service.js";
import { LogoutHandler } from "./logout.handler.js";

describe("LogoutHandler", () => {
  const presenceService = { markOffline: vi.fn() };
  const handler = new LogoutHandler(
    presenceService as unknown as PresenceService,
  );

  beforeEach(() => vi.clearAllMocks());

  it("marks the user offline right away", async () => {
    presenceService.markOffline.mockResolvedValue(undefined);

    await handler.execute("ana");

    expect(presenceService.markOffline).toHaveBeenCalledWith("ana");
  });

  it("fails when the user could not be marked offline", async () => {
    presenceService.markOffline.mockRejectedValue(new Error("Mongo is down"));

    await expect(handler.execute("ana")).rejects.toThrow("Mongo is down");
  });
});
