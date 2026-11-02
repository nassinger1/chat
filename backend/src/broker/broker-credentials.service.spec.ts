import { decode } from "@nats-io/jwt";
import { createAccount } from "@nats-io/nkeys";
import type { ConfigService } from "@nestjs/config";
import type { AppConfig } from "@/config/app-config.js";
import { BrokerCredentialsService } from "./broker-credentials.service.js";

describe("BrokerCredentialsService", () => {
  const accountSeed = new TextDecoder().decode(createAccount().getSeed());
  const configService = { get: () => accountSeed };
  const service = new BrokerCredentialsService(
    configService as unknown as ConfigService<AppConfig, true>,
  );

  it("creates a credential that can only listen", async () => {
    const { jwt } = await service.mintSubscribeOnly("ana", ["chat.events"]);
    const { exp, nats } = decode<{
      pub: { deny: string[] };
      sub: { allow: string[] };
    }>(jwt);

    expect(nats.pub?.deny).toEqual([">"]);
    expect(nats.sub?.allow).toEqual(["chat.events"]);
    expect(exp).toBeGreaterThan(Date.now() / 1000);
  });
});
