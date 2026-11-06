import type { NestExpressApplication } from "@nestjs/platform-express";
import { bootstrapE2eApp } from "@test/utils/bootstrap-e2e-app.js";
import { createTestMongoUri } from "@test/utils/in-memory-mongo.js";
import request from "supertest";
import { BrokerClientService } from "@/broker/broker-client.service.js";
import type { ChatEvent } from "@/events/event.types.js";

type SignedUpUser = {
  agent: ReturnType<typeof request.agent>;
  id: string;
};

type PresenceChange = {
  userId: string;
  status: string;
};

describe("Presence routes", () => {
  let app: NestExpressApplication;
  let brokerClient: BrokerClientService;

  const loginAgain = async (name: string) => {
    const agent = request.agent(app.getHttpServer());

    await agent
      .post("/auth/login")
      .send({ email: `${name}@test.com`, password: "password123" })
      .expect(200);

    return agent;
  };

  const signUp = async (name: string): Promise<SignedUpUser> => {
    const { body } = await request(app.getHttpServer())
      .post("/users")
      .send({ name, email: `${name}@test.com`, password: "password123" })
      .expect(201);

    const agent = await loginAgain(name);

    return { agent, id: body.id as string };
  };

  const getStatusSeenBy = async (viewer: SignedUpUser, userId: string) => {
    const { body } = await viewer.agent.get("/users").expect(200);
    const user = body.items.find(({ id }: { id: string }) => id === userId);

    return user.status;
  };

  const presenceChangesFor = (userId: string) => {
    const publishCalls = vi.mocked(brokerClient.publish).mock.calls;

    return publishCalls.filter(([subject, payload]) => {
      const event = payload as ChatEvent<PresenceChange>;
      const isBroadcast = subject === "chat.events";
      const isPresenceChange = event.meta.name === "presence-changed";

      return isBroadcast && isPresenceChange && event.data.userId === userId;
    });
  };

  beforeAll(async () => {
    app = await bootstrapE2eApp(createTestMongoUri());
    brokerClient = app.get(BrokerClientService);
  });

  afterAll(async () => {
    await app.close();
  });

  it("accepts a heartbeat from a signed-in user", async () => {
    const ana = await signUp("ana");

    const { body } = await ana.agent.post("/presence/heartbeat").expect(200);

    expect(body).toEqual({ result: true });
  });

  it("puts you back online when another device is still open", async () => {
    const bruno = await signUp("bruno");
    const carla = await signUp("carla");
    const carlaOnPhone = await loginAgain("carla");

    await carlaOnPhone.post("/auth/logout").expect(200);

    expect(await getStatusSeenBy(bruno, carla.id)).toBe("offline");

    vi.mocked(brokerClient.publish).mockClear();

    await carla.agent.post("/presence/heartbeat").expect(200);

    expect(await getStatusSeenBy(bruno, carla.id)).toBe("online");
    expect(presenceChangesFor(carla.id)).toHaveLength(1);
  });

  it("tells no one when you were already online", async () => {
    const daniel = await signUp("daniel");

    vi.mocked(brokerClient.publish).mockClear();

    await daniel.agent.post("/presence/heartbeat").expect(200);

    expect(presenceChangesFor(daniel.id)).toHaveLength(0);
  });

  it("refuses a heartbeat with no session", async () => {
    await request(app.getHttpServer()).post("/presence/heartbeat").expect(401);
  });
});
