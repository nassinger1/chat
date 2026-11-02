import { getModelToken, MongooseModule } from "@nestjs/mongoose";
import { Test, type TestingModule } from "@nestjs/testing";
import { startInMemoryMongo } from "@test/utils/in-memory-mongo.js";
import type { Model } from "mongoose";
import { UserDocument, UserSchema } from "../user.schema.js";
import { UserRepository } from "./user.repository.js";

describe("UserRepository", () => {
  let mongo: Awaited<ReturnType<typeof startInMemoryMongo>>;
  let moduleRef: TestingModule;
  let repository: UserRepository;
  let model: Model<UserDocument>;

  const input = {
    name: "Ana",
    email: "ANA@test.com",
    password: "stored-hash",
  };

  beforeAll(async () => {
    mongo = await startInMemoryMongo();
    moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongo.uri),
        MongooseModule.forFeature([
          { name: UserDocument.name, schema: UserSchema },
        ]),
      ],
      providers: [UserRepository],
    }).compile();

    repository = moduleRef.get(UserRepository);
    model = moduleRef.get(getModelToken(UserDocument.name));
    await model.init();
  });

  afterEach(() => model.deleteMany({}));

  afterAll(async () => {
    await moduleRef.close();
    await mongo.stop();
  });

  it("stores the email in lowercase", async () => {
    const user = await repository.create(input);

    expect(user.email).toBe("ana@test.com");
  });

  it("does not return the password from getById", async () => {
    const user = await repository.create(input);

    await expect(repository.getById(user.id)).resolves.not.toHaveProperty(
      "password",
    );
  });

  it("returns the password only when asked", async () => {
    await repository.create(input);

    const user = await repository.getByEmailWithPassword("ana@test.com");

    expect(user?.password).toBe("stored-hash");
  });

  it("gives USR-001 for a repeated email", async () => {
    await repository.create(input);

    await expect(repository.create(input)).rejects.toMatchObject({
      response: { code: "USR-001" },
    });
  });
});
