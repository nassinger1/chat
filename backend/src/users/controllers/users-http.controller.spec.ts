import type { NestExpressApplication } from "@nestjs/platform-express";
import { bootstrapE2eApp } from "@test/utils/bootstrap-e2e-app.js";
import { startInMemoryMongo } from "@test/utils/in-memory-mongo.js";
import request from "supertest";

describe("POST /users", () => {
  let mongo: Awaited<ReturnType<typeof startInMemoryMongo>>;
  let app: NestExpressApplication;

  beforeAll(async () => {
    mongo = await startInMemoryMongo();
    app = await bootstrapE2eApp(mongo.uri);
  });

  afterAll(async () => {
    await app.close();
    await mongo.stop();
  });

  it("returns the user without the password", async () => {
    const response = await request(app.getHttpServer())
      .post("/users")
      .send({
        name: "Ana",
        email: "ana@test.com",
        password: "password123",
      })
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      name: "Ana",
      email: "ana@test.com",
      status: "offline",
      lastSeenAt: null,
    });
  });

  it("gives VAL-001 for an invalid body", async () => {
    const response = await request(app.getHttpServer())
      .post("/users")
      .send({ email: "bad" })
      .expect(400);

    expect(response.body.code).toBe("VAL-001");
  });
});
