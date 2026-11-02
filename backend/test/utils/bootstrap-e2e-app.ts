import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import { AppModule } from "@/app.module.js";
import { NATS_CONNECTION } from "@/broker/broker.types.js";
import { BrokerClientService } from "@/broker/broker-client.service.js";
import { setupApp } from "@/setup-app.js";
import { createBrokerClientMock } from "../mocks/broker-client.mock.js";

export async function bootstrapE2eApp(mongoUri: string) {
  process.env.MONGO_CONN = mongoUri;

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(NATS_CONNECTION)
    .useValue({ isClosed: () => false, isDraining: () => false })
    .overrideProvider(BrokerClientService)
    .useValue(createBrokerClientMock())
    .compile();

  const app = moduleRef.createNestApplication<NestExpressApplication>();

  setupApp(app);
  await app.init();

  return app;
}
