import { wsconnect } from "@nats-io/nats-core";
import type { OutputBrokerCredentials } from "./api.types";
import { openBrokerConnection } from "./brokerClient";

vi.mock("@nats-io/nats-core", () => ({
  jwtAuthenticator: vi.fn(),
  wsconnect: vi.fn(),
}));

describe("openBrokerConnection", () => {
  const credentials = {
    jwt: "jwt",
    seed: "seed",
    wsUrl: "ws://localhost",
  } as OutputBrokerCredentials;

  const open = async () => {
    const subscribe = vi.fn();
    const onEvent = vi.fn();

    vi.mocked(wsconnect).mockResolvedValue({ subscribe } as never);
    await openBrokerConnection(credentials, "ana", onEvent);

    return {
      callback: subscribe.mock.calls[0][1].callback,
      onEvent,
      subscribe,
    };
  };

  it("listens to the broadcast and the user's own channel", async () => {
    const { subscribe } = await open();

    expect(subscribe.mock.calls.map(([subject]) => subject)).toEqual([
      "chat.events",
      "chat.events.ana",
    ]);
  });

  it("passes a message to the app", async () => {
    const { callback, onEvent } = await open();
    const event = { type: "change" };

    callback(null, { json: () => event });

    expect(onEvent).toHaveBeenCalledWith(event);
  });

  it("ignores a subscription error", async () => {
    const { callback, onEvent } = await open();

    vi.spyOn(console, "error").mockImplementation(() => undefined);
    callback(new Error("denied"), undefined);

    expect(onEvent).not.toHaveBeenCalled();
  });
});
