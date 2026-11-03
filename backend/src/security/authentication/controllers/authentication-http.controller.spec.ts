import type { NestExpressApplication } from "@nestjs/platform-express";
import { bootstrapE2eApp } from "@test/utils/bootstrap-e2e-app.js";
import { createTestMongoUri } from "@test/utils/in-memory-mongo.js";
import request from "supertest";

describe("Authentication routes", () => {
  let app: NestExpressApplication;

  const credentials = { email: "ana@test.com", password: "password123" };

  beforeAll(async () => {
    app = await bootstrapE2eApp(createTestMongoUri());

    await request(app.getHttpServer())
      .post("/users")
      .send({ name: "Ana", ...credentials })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it("logs in, keeps the session, and logs out", async () => {
    const agent = request.agent(app.getHttpServer());

    await agent.post("/auth/login").send(credentials).expect(200);

    const session = await agent.get("/auth/session").expect(200);

    expect(session.body).toEqual({
      isAuthenticated: true,
      user: {
        id: expect.any(String),
        name: "Ana",
        email: "ana@test.com",
      },
    });

    await agent.post("/auth/logout").expect(200);

    const afterLogout = await agent.get("/auth/session").expect(200);

    expect(afterLogout.body).toEqual({ isAuthenticated: false, user: null });
  });

  it("gives IAM-001 for a wrong password", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ ...credentials, password: "wrong-password" })
      .expect(401);

    expect(response.body.code).toBe("IAM-001");
  });

  it("refuses logout without a session", async () => {
    await request(app.getHttpServer()).post("/auth/logout").expect(401);
  });
});
