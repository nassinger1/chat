import type { NestExpressApplication } from "@nestjs/platform-express";
import { bootstrapE2eApp } from "@test/utils/bootstrap-e2e-app.js";
import { createTestMongoUri } from "@test/utils/in-memory-mongo.js";
import request from "supertest";

describe("POST /users", () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await bootstrapE2eApp(createTestMongoUri());
  });

  afterAll(async () => {
    await app.close();
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
