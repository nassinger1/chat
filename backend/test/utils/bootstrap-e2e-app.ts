import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import session from "express-session";
import { AppModule } from "@/app.module.js";
import { NATS_CONNECTION } from "@/broker/broker.types.js";
import { BrokerClientService } from "@/broker/broker-client.service.js";
import { RedisClientService } from "@/security/session/services/redis-client.service.js";
import { SessionStoreService } from "@/security/session/services/session-store.service.js";
import { setupApp } from "@/setup-app.js";
import { createBrokerClientMock } from "../mocks/broker-client.mock.js";

export async function bootstrapE2eApp(mongoUri: string) {
  process.env.MONGO_CONN = mongoUri;

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(NATS_CONNECTION)
    .useValue({ isClosed: () => false, isDraining: () => false })
    .overrideProvider(BrokerClientService)
    .useValue(createBrokerClientMock())
    .overrideProvider(RedisClientService)
    .useValue({ getClient: vi.fn() })
    .overrideProvider(SessionStoreService)
    .useValue(new session.MemoryStore())
    .compile();

  const app = moduleRef.createNestApplication<NestExpressApplication>();

  setupApp(app);
  await app.init();

  return app;
}
