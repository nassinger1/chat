import type { OutputBrokerCredentials } from "@services/api.types";
import { AuthApi } from "@services/authApi";
import {
  type BrokerConnection,
  openBrokerConnection,
  watchReconnects,
} from "@services/brokerClient";
import { PresenceApi } from "@services/presenceApi";
import { act, render } from "@testing-library/react";
import { useEffect } from "react";
import { RealtimeContextProvider } from "./realtimeContext";
import { useAuth } from "./useAuth";
import { useRealtime } from "./useRealtime";

vi.mock("./useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("@services/authApi", () => ({
  AuthApi: { getBrokerCredentials: vi.fn() },
}));
vi.mock("@services/brokerClient", () => ({
  openBrokerConnection: vi.fn(),
  watchReconnects: vi.fn(),
}));
vi.mock("@services/presenceApi", () => ({
  PresenceApi: { heartbeat: vi.fn() },
}));

const credentials = {
  expiresAt: "2026-01-01T11:00:00.000Z",
} as OutputBrokerCredentials;

const connection = {
  close: vi.fn(),
} as unknown as BrokerConnection;

const onReconnect = vi.fn();

function ReconnectListener() {
  const { subscribeToReconnect } = useRealtime();

  useEffect(() => subscribeToReconnect(onReconnect), [subscribeToReconnect]);

  return null;
}

describe("RealtimeContextProvider", () => {
  const renderProvider = () =>
    render(
      <RealtimeContextProvider>
        <ReconnectListener />
      </RealtimeContextProvider>,
    );

  beforeEach(() => {
    vi.useFakeTimers({ now: new Date("2026-01-01T10:00:00.000Z") });
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(useAuth).mockReturnValue({ user: { id: "ana" } } as never);
    vi.mocked(AuthApi.getBrokerCredentials).mockReset();
    vi.mocked(openBrokerConnection).mockResolvedValue(connection);
    vi.mocked(watchReconnects).mockResolvedValue();
    vi.mocked(PresenceApi.heartbeat).mockResolvedValue(undefined as never);
    onReconnect.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("tries again after a failed connection and reloads the data", async () => {
    vi.mocked(AuthApi.getBrokerCredentials)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(credentials);

    renderProvider();

    await act(() => vi.advanceTimersByTimeAsync(0));

    expect(openBrokerConnection).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTimeAsync(5_000));

    expect(openBrokerConnection).toHaveBeenCalledTimes(1);
    expect(onReconnect).toHaveBeenCalledTimes(1);
  });

  it("stops trying after unmounting", async () => {
    vi.mocked(AuthApi.getBrokerCredentials).mockRejectedValue(
      new Error("offline"),
    );

    const { unmount } = renderProvider();

    await act(() => vi.advanceTimersByTimeAsync(0));

    unmount();

    await act(() => vi.advanceTimersByTimeAsync(20_000));

    expect(AuthApi.getBrokerCredentials).toHaveBeenCalledTimes(1);
  });
});
