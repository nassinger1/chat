import type { NestExpressApplication } from "@nestjs/platform-express";
import { bootstrapE2eApp } from "@test/utils/bootstrap-e2e-app.js";
import { startInMemoryMongo } from "@test/utils/in-memory-mongo.js";
import request from "supertest";

describe("Message routes", () => {
  let mongo: Awaited<ReturnType<typeof startInMemoryMongo>>;
  let app: NestExpressApplication;
  let ana: ReturnType<typeof request.agent>;
  let bruno: ReturnType<typeof request.agent>;
  let carla: ReturnType<typeof request.agent>;
  let conversationId: string;

  const signUp = async (name: string) => {
    const agent = request.agent(app.getHttpServer());
    const credentials = {
      email: `${name}@test.com`,
      password: "password123",
    };
    const { body } = await agent
      .post("/users")
      .send({ name, ...credentials })
      .expect(201);

    await agent.post("/auth/login").send(credentials).expect(200);

    return { agent, id: body.id as string };
  };

  beforeAll(async () => {
    mongo = await startInMemoryMongo();
    app = await bootstrapE2eApp(mongo.uri);

    const first = await signUp("ana");
    const second = await signUp("bruno");
    const third = await signUp("carla");

    ana = first.agent;
    bruno = second.agent;
    carla = third.agent;

    const { body } = await ana
      .post("/conversations")
      .send({ participantId: second.id })
      .expect(201);

    conversationId = body.id;

    await ana
      .post(`/conversations/${conversationId}/messages`)
      .send({ text: "Hi" })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
    await mongo.stop();
  });

  it("shows the message to the other participant", async () => {
    const { body } = await bruno
      .get(`/conversations/${conversationId}/messages`)
      .expect(200);

    expect(body.items).toEqual([
      expect.objectContaining({ text: "Hi", conversationId }),
    ]);
  });

  it("counts it as unread for the other participant", async () => {
    const { body } = await bruno.get("/conversations").expect(200);

    expect(body[0]).toMatchObject({
      unreadCount: 1,
      peer: { name: "ana" },
    });
  });

  it("does not let a stranger read", async () => {
    const { body } = await carla
      .get(`/conversations/${conversationId}/messages`)
      .expect(404);

    expect(body.code).toBe("CNV-001");
  });

  it("does not let a stranger write", async () => {
    const { body } = await carla
      .post(`/conversations/${conversationId}/messages`)
      .send({ text: "Hello" })
      .expect(404);

    expect(body.code).toBe("CNV-001");
  });

  it("refuses a request with no session", async () => {
    await request(app.getHttpServer())
      .get(`/conversations/${conversationId}/messages`)
      .expect(401);
  });
});
