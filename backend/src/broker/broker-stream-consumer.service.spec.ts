import { type JsMsg, jetstream, jetstreamManager } from "@nats-io/jetstream";
import type { NatsConnection } from "@nats-io/nats-core";
import { Logger } from "@nestjs/common";
import { BrokerStreamConsumerService } from "./broker-stream-consumer.service.js";
import { brokerStreams } from "./broker-streams.js";

vi.mock("@nats-io/jetstream", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@nats-io/jetstream")>()),
  jetstream: vi.fn(),
  jetstreamManager: vi.fn(),
}));

const createQueueMessage = (deliveryCount: number) =>
  ({
    subject: "chat.service.messages.created",
    info: { deliveryCount },
    ack: vi.fn(),
    nak: vi.fn(),
    term: vi.fn(),
  }) as unknown as JsMsg;

const createQueue = (messages: JsMsg[]) => ({
  close: vi.fn().mockResolvedValue(undefined),
  async *[Symbol.asyncIterator]() {
    yield* messages;
  },
});

describe("BrokerStreamConsumerService", () => {
  const [streamConfig] = brokerStreams;
  const addStream = vi.fn();
  const addConsumer = vi.fn();
  const getConsumer = vi.fn();
  const connection = {} as NatsConnection;

  const startWith = async (
    messages: JsMsg[],
    handleMessage: (message: JsMsg) => Promise<void>,
  ) => {
    const queue = createQueue(messages);

    getConsumer.mockResolvedValue({
      consume: vi.fn().mockResolvedValue(queue),
    });

    const service = new BrokerStreamConsumerService(connection);

    await service.start(streamConfig, handleMessage);

    return { service, queue };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);

    vi.mocked(jetstreamManager).mockResolvedValue({
      streams: { add: addStream },
      consumers: { add: addConsumer },
    } as never);
    vi.mocked(jetstream).mockReturnValue({
      consumers: { get: getConsumer },
    } as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates the stream and the consumer before reading", async () => {
    await startWith([], vi.fn());

    const [streamCreated] = addStream.mock.invocationCallOrder;
    const [consumerCreated] = addConsumer.mock.invocationCallOrder;
    const [readingStarted] = getConsumer.mock.invocationCallOrder;

    expect(addStream).toHaveBeenCalledWith(streamConfig.stream);
    expect(addConsumer).toHaveBeenCalledWith(
      streamConfig.stream.name,
      streamConfig.consumer,
    );
    expect(streamCreated).toBeLessThan(consumerCreated);
    expect(consumerCreated).toBeLessThan(readingStarted);
  });

  it("confirms a message that was handled", async () => {
    const message = createQueueMessage(1);

    await startWith([message], vi.fn().mockResolvedValue(undefined));

    await vi.waitFor(() => expect(message.ack).toHaveBeenCalledOnce());
    expect(message.nak).not.toHaveBeenCalled();
  });

  it.each([
    { deliveryCount: 1, delayInMs: 1_000 },
    { deliveryCount: 2, delayInMs: 2_000 },
    { deliveryCount: 3, delayInMs: 5_000 },
    { deliveryCount: 4, delayInMs: 10_000 },
    { deliveryCount: 5, delayInMs: 30_000 },
  ])(
    "asks for delivery $deliveryCount to be tried again after $delayInMs ms",
    async ({ deliveryCount, delayInMs }) => {
      const message = createQueueMessage(deliveryCount);

      await startWith(
        [message],
        vi.fn().mockRejectedValue(new Error("Mongo is down")),
      );

      await vi.waitFor(() => expect(message.nak).toHaveBeenCalledOnce());
      expect(message.nak).toHaveBeenCalledWith(delayInMs);
      expect(message.ack).not.toHaveBeenCalled();
    },
  );

  it("takes the message out of the queue when the 6th delivery fails", async () => {
    const message = createQueueMessage(6);

    await startWith(
      [message],
      vi.fn().mockRejectedValue(new Error("Mongo is down")),
    );

    await vi.waitFor(() => expect(message.term).toHaveBeenCalledOnce());
    expect(message.nak).not.toHaveBeenCalled();
    expect(message.ack).not.toHaveBeenCalled();
  });

  it("confirms a message that works on the 6th delivery", async () => {
    const message = createQueueMessage(6);

    await startWith([message], vi.fn().mockResolvedValue(undefined));

    await vi.waitFor(() => expect(message.ack).toHaveBeenCalledOnce());
    expect(message.term).not.toHaveBeenCalled();
  });

  it("keeps reading after a message fails", async () => {
    const failing = createQueueMessage(1);
    const working = createQueueMessage(1);
    const handleMessage = vi
      .fn()
      .mockRejectedValueOnce(new Error("Mongo is down"))
      .mockResolvedValueOnce(undefined);

    await startWith([failing, working], handleMessage);

    await vi.waitFor(() => expect(working.ack).toHaveBeenCalledOnce());
    expect(failing.nak).toHaveBeenCalledOnce();
  });

  it("handles one message at a time", async () => {
    let finishFirst: () => void = () => undefined;
    const first = createQueueMessage(1);
    const second = createQueueMessage(1);
    const handleMessage = vi
      .fn()
      .mockReturnValueOnce(
        new Promise<void>((resolve) => {
          finishFirst = resolve;
        }),
      )
      .mockResolvedValueOnce(undefined);

    await startWith([first, second], handleMessage);

    await vi.waitFor(() => expect(handleMessage).toHaveBeenCalledOnce());

    finishFirst();

    await vi.waitFor(() => expect(second.ack).toHaveBeenCalledOnce());
    expect(handleMessage).toHaveBeenNthCalledWith(1, first);
    expect(handleMessage).toHaveBeenNthCalledWith(2, second);
  });

  it("stops reading when the app shuts down", async () => {
    const { service, queue } = await startWith([], vi.fn());

    await service.onModuleDestroy();

    expect(queue.close).toHaveBeenCalledOnce();
  });
});
