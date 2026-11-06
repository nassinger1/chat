import { getModelToken, MongooseModule } from "@nestjs/mongoose";
import { Test, type TestingModule } from "@nestjs/testing";
import { createTestMongoUri } from "@test/utils/in-memory-mongo.js";
import { type Model, Types } from "mongoose";
import { MessageDocument, MessageSchema } from "../message.schema.js";
import { MessageRepository } from "./message.repository.js";

describe("MessageRepository", () => {
  let moduleRef: TestingModule;
  let repository: MessageRepository;
  let model: Model<MessageDocument>;

  const conversationId = new Types.ObjectId().toString();
  const otherConversationId = new Types.ObjectId().toString();
  const ana = new Types.ObjectId().toString();

  const sendInOrder = async (texts: string[]) => {
    for (const [index, text] of texts.entries()) {
      vi.setSystemTime(new Date(2026, 0, 1, 12, index));

      await repository.create({ conversationId, senderId: ana, text });
    }
  };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(createTestMongoUri()),
        MongooseModule.forFeature([
          { name: MessageDocument.name, schema: MessageSchema },
        ]),
      ],
      providers: [MessageRepository],
    }).compile();

    repository = moduleRef.get(MessageRepository);
    model = moduleRef.get(getModelToken(MessageDocument.name));
    await model.init();
  });

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
  });

  afterEach(async () => {
    vi.useRealTimers();
    await model.deleteMany({});
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it("saves a message and gives it back with plain ids", async () => {
    vi.setSystemTime(new Date("2026-01-01T12:00:00.000Z"));

    const message = await repository.create({
      conversationId,
      senderId: ana,
      text: "Hi",
    });

    expect(message).toEqual({
      id: expect.any(String),
      conversationId,
      senderId: ana,
      text: "Hi",
      createdAt: new Date("2026-01-01T12:00:00.000Z"),
    });
  });

  it("lists only the messages of that conversation", async () => {
    await repository.create({ conversationId, senderId: ana, text: "Hi" });
    await repository.create({
      conversationId: otherConversationId,
      senderId: ana,
      text: "Somewhere else",
    });

    const { items } = await repository.findByConversation(conversationId, {
      page: 1,
      limit: 20,
    });

    expect(items.map(({ text }) => text)).toEqual(["Hi"]);
  });

  it("starts with the newest messages", async () => {
    await sendInOrder(["first", "second", "third"]);

    const { items } = await repository.findByConversation(conversationId, {
      page: 1,
      limit: 2,
    });

    expect(items.map(({ text }) => text)).toEqual(["third", "second"]);
  });

  it("gives the older messages on the next page", async () => {
    await sendInOrder(["first", "second", "third"]);

    const { items, meta } = await repository.findByConversation(
      conversationId,
      { page: 2, limit: 2 },
    );

    expect(items.map(({ text }) => text)).toEqual(["first"]);
    expect(meta).toEqual({
      page: 2,
      limit: 2,
      itemCount: 3,
      pageCount: 2,
      hasPreviousPage: true,
      hasNextPage: false,
    });
  });
});
