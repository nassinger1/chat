import type { EventPublisher } from "@/events/event-publisher.service.js";
import type { UserRepository } from "@/users/repositories/user.repository.js";
import { PresenceService } from "./presence.service.js";

describe("PresenceService", () => {
  const userRepository = { markOnline: vi.fn(), markOffline: vi.fn() };
  const eventPublisher = { toEveryone: vi.fn() };
  const service = new PresenceService(
    userRepository as unknown as UserRepository,
    eventPublisher as unknown as EventPublisher,
  );

  beforeEach(() => vi.clearAllMocks());

  it("broadcasts when a user comes online", async () => {
    userRepository.markOnline.mockResolvedValue(true);

    await service.markOnline("1");

    expect(eventPublisher.toEveryone).toHaveBeenCalledOnce();
  });

  it("stays quiet when the user was already online", async () => {
    userRepository.markOnline.mockResolvedValue(false);

    await service.heartbeat("1");

    expect(eventPublisher.toEveryone).not.toHaveBeenCalled();
  });

  it("stays quiet when the user was already offline", async () => {
    userRepository.markOffline.mockResolvedValue(null);

    await service.markOffline("1");

    expect(eventPublisher.toEveryone).not.toHaveBeenCalled();
  });
});
