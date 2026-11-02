import { getModelToken, MongooseModule } from "@nestjs/mongoose";
import { Test, type TestingModule } from "@nestjs/testing";
import { startInMemoryMongo } from "@test/utils/in-memory-mongo.js";
import { type Model, Types } from "mongoose";
import {
  ConversationDocument,
  ConversationSchema,
} from "../conversation.schema.js";
import { ConversationRepository } from "./conversation.repository.js";

describe("ConversationRepository", () => {
  let mongo: Awaited<ReturnType<typeof startInMemoryMongo>>;
  let moduleRef: TestingModule;
  let repository: ConversationRepository;
  let model: Model<ConversationDocument>;

  const ana = new Types.ObjectId().toString();
  const bruno = new Types.ObjectId().toString();
  const carla = new Types.ObjectId().toString();

  beforeAll(async () => {
    mongo = await startInMemoryMongo();
    moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongo.uri),
        MongooseModule.forFeature([
          { name: ConversationDocument.name, schema: ConversationSchema },
        ]),
      ],
      providers: [ConversationRepository],
    }).compile();

    repository = moduleRef.get(ConversationRepository);
    model = moduleRef.get(getModelToken(ConversationDocument.name));
    await model.init();
  });

  afterEach(() => model.deleteMany({}));

  afterAll(async () => {
    await moduleRef.close();
    await mongo.stop();
  });

  it("gives one conversation for a pair, in either order", async () => {
    const first = await repository.findOrCreateDirect(ana, bruno);
    const second = await repository.findOrCreateDirect(bruno, ana);

    expect(second.id).toBe(first.id);
  });

  it("adds an unread message for the other person only", async () => {
    const { id } = await repository.findOrCreateDirect(ana, bruno);

    await repository.recordMessage({
      id,
      senderId: ana,
      text: "Hi",
      sentAt: new Date(),
    });

    const conversation = await repository.getById(id);
    const counts = Object.fromEntries(
      conversation?.participants.map((participant) => [
        participant.userId,
        participant.unreadCount,
      ]) ?? [],
    );

    expect(counts).toEqual({ [ana]: 0, [bruno]: 1 });
  });

  it("clears the count on markRead", async () => {
    const { id } = await repository.findOrCreateDirect(ana, bruno);

    await repository.recordMessage({
      id,
      senderId: ana,
      text: "Hi",
      sentAt: new Date(),
    });
    await repository.markRead({ id, userId: bruno });

    const conversation = await repository.getById(id);

    expect(
      conversation?.participants.map((participant) => participant.unreadCount),
    ).toEqual([0, 0]);
  });

  it("returns null for someone outside the conversation", async () => {
    const { id } = await repository.findOrCreateDirect(ana, bruno);

    await expect(
      repository.getByIdForParticipant({ id, userId: carla }),
    ).resolves.toBeNull();
  });
});
