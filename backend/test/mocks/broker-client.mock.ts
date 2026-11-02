import type { Mock } from "vitest";

export const createBrokerClientMock = (): Record<string, Mock> => ({
  publish: vi.fn(),
  jsPublish: vi.fn().mockResolvedValue(undefined),
  subscribe: vi.fn(),
  reply: vi.fn(),
  disconnect: vi.fn(),
});
