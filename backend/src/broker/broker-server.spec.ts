import type { JsMsg } from "@nats-io/jetstream";
import { throwError } from "rxjs";
import type { BrokerClientService } from "./broker-client.service.js";
import { BrokerServer } from "./broker-server.js";
import type { BrokerStreamConsumerService } from "./broker-stream-consumer.service.js";

type ServerInternals = {
  handleStreamMessage(message: JsMsg): Promise<void>;
  getHandlerByPattern: ReturnType<typeof vi.fn>;
};

describe("BrokerServer", () => {
  const createServer = () =>
    new BrokerServer(
      {} as BrokerClientService,
      {} as BrokerStreamConsumerService,
      { queue: "test", subscriptions: [] },
    ) as unknown as ServerInternals;

  const message = {
    subject: "chat.service.messages.created",
    json: () => ({}),
    term: vi.fn(),
  } as unknown as JsMsg;

  it("rejects when the handler fails", async () => {
    const server = createServer();

    server.getHandlerByPattern = vi
      .fn()
      .mockReturnValue(() => throwError(() => new Error("failed")));

    await expect(server.handleStreamMessage(message)).rejects.toThrow("failed");
  });

  it("resolves when the handler works", async () => {
    const server = createServer();

    server.getHandlerByPattern = vi.fn().mockReturnValue(async () => "done");

    await expect(server.handleStreamMessage(message)).resolves.toBeUndefined();
  });

  it("terminates a message with no handler", async () => {
    const server = createServer();

    server.getHandlerByPattern = vi.fn().mockReturnValue(undefined);

    await server.handleStreamMessage(message);

    expect(message.term).toHaveBeenCalledOnce();
  });
});
