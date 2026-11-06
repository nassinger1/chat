import type { NestExpressApplication } from "@nestjs/platform-express";
import { bootstrapE2eApp } from "@test/utils/bootstrap-e2e-app.js";
import { createTestMongoUri } from "@test/utils/in-memory-mongo.js";
import { Types } from "mongoose";
import request from "supertest";

type SignedUpUser = {
  agent: ReturnType<typeof request.agent>;
  id: string;
};

describe("Conversation routes", () => {
  let app: NestExpressApplication;
  let ana: SignedUpUser;
  let bruno: SignedUpUser;
  let carla: SignedUpUser;

  const signUp = async (name: string): Promise<SignedUpUser> => {
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

  const openConversation = async (
    opener: SignedUpUser,
    participantId: string,
  ) => {
    const { body } = await opener.agent
      .post("/conversations")
      .send({ participantId })
      .expect(201);

    return body;
  };

  beforeAll(async () => {
    app = await bootstrapE2eApp(createTestMongoUri());

    ana = await signUp("ana");
    bruno = await signUp("bruno");
    carla = await signUp("carla");
  });

  afterAll(async () => {
    await app.close();
  });

  it("opens a conversation with the other person as the peer", async () => {
    const conversation = await openConversation(ana, bruno.id);

    expect(conversation).toMatchObject({
      id: expect.any(String),
      unreadCount: 0,
      lastMessage: null,
      peer: { id: bruno.id, name: "bruno", email: "bruno@test.com" },
    });
    expect(conversation.peer).not.toHaveProperty("password");
  });

  it("gives the same conversation no matter who opens it", async () => {
    const openedByAna = await openConversation(ana, bruno.id);
    const openedByBruno = await openConversation(bruno, ana.id);

    expect(openedByBruno.id).toBe(openedByAna.id);
    expect(openedByBruno.peer.id).toBe(ana.id);
  });

  it("gives CNV-002 for a conversation with yourself", async () => {
    const { body } = await ana.agent
      .post("/conversations")
      .send({ participantId: ana.id })
      .expect(400);

    expect(body.code).toBe("CNV-002");
  });

  it("gives USR-002 for a user that does not exist", async () => {
    const unknownUserId = new Types.ObjectId().toString();

    const { body } = await ana.agent
      .post("/conversations")
      .send({ participantId: unknownUserId })
      .expect(404);

    expect(body.code).toBe("USR-002");
  });

  it("gives VAL-001 for a participant id that is not an id", async () => {
    const { body } = await ana.agent
      .post("/conversations")
      .send({ participantId: "not-an-id" })
      .expect(400);

    expect(body.code).toBe("VAL-001");
  });

  it("lists only your own conversations", async () => {
    const anaWithBruno = await openConversation(ana, bruno.id);
    const brunoWithCarla = await openConversation(bruno, carla.id);

    const { body } = await ana.agent.get("/conversations").expect(200);
    const listedIds = body.map(({ id }: { id: string }) => id);

    expect(listedIds).toContain(anaWithBruno.id);
    expect(listedIds).not.toContain(brunoWithCarla.id);
  });

  it("clears your unread count when you read the conversation", async () => {
    const conversation = await openConversation(ana, bruno.id);

    await ana.agent
      .post(`/conversations/${conversation.id}/messages`)
      .send({ text: "Hi" })
      .expect(201);

    const { body: readResult } = await bruno.agent
      .post(`/conversations/${conversation.id}/read`)
      .expect(200);

    const { body: brunoConversations } = await bruno.agent
      .get("/conversations")
      .expect(200);
    const readConversation = brunoConversations.find(
      ({ id }: { id: string }) => id === conversation.id,
    );

    expect(readResult).toEqual({ result: true });
    expect(readConversation.unreadCount).toBe(0);
  });

  it("does not let a stranger mark a conversation as read", async () => {
    const conversation = await openConversation(ana, bruno.id);

    const { body } = await carla.agent
      .post(`/conversations/${conversation.id}/read`)
      .expect(404);

    expect(body.code).toBe("CNV-001");
  });

  it("gives BRQ-001 for a conversation id in the URL that is not an id", async () => {
    const { body } = await ana.agent
      .post("/conversations/not-an-id/read")
      .expect(400);

    expect(body.code).toBe("BRQ-001");
  });

  it("refuses a request with no session", async () => {
    await request(app.getHttpServer()).get("/conversations").expect(401);
  });
});
