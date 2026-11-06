import type { PresenceService } from "../services/presence.service.js";
import { HeartbeatHandler } from "./heartbeat.handler.js";

describe("HeartbeatHandler", () => {
  const presenceService = { heartbeat: vi.fn() };
  const handler = new HeartbeatHandler(
    presenceService as unknown as PresenceService,
  );

  beforeEach(() => vi.clearAllMocks());

  it("records the heartbeat for that user", async () => {
    presenceService.heartbeat.mockResolvedValue(undefined);

    await handler.execute("ana");

    expect(presenceService.heartbeat).toHaveBeenCalledWith("ana");
  });

  it("fails when the heartbeat could not be saved", async () => {
    presenceService.heartbeat.mockRejectedValue(new Error("Mongo is down"));

    await expect(handler.execute("ana")).rejects.toThrow("Mongo is down");
  });
});
