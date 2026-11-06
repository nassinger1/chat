import { decode } from "@nats-io/jwt";
import { createAccount } from "@nats-io/nkeys";
import type { ConfigService } from "@nestjs/config";
import { BrokerCredentialsService } from "@/broker/broker-credentials.service.js";
import type { AppConfig } from "@/config/app-config.js";
import { IssueBrokerCredentialsHandler } from "./issue-broker-credentials.handler.js";

type CredentialPermissions = {
  pub: { deny: string[] };
  sub: { allow: string[] };
};

const ONE_HOUR_IN_SECONDS = 60 * 60;

describe("IssueBrokerCredentialsHandler", () => {
  const accountSeed = new TextDecoder().decode(createAccount().getSeed());
  const settings: Record<string, string> = {
    "nats.accountSeed": accountSeed,
    "nats.wsUrl": "ws://localhost:8080",
  };
  const configService = { get: (key: string) => settings[key] };
  const handler = new IssueBrokerCredentialsHandler(
    new BrokerCredentialsService(
      configService as unknown as ConfigService<AppConfig, true>,
    ),
    configService as unknown as ConfigService<AppConfig, true>,
  );
  const authenticatedContext = {
    userId: "ana",
    userName: "Ana",
    userEmail: "ana@test.com",
  };

  it("lets you listen only to everyone's events and your own", async () => {
    const { jwt } = await handler.execute(authenticatedContext);
    const { nats } = decode<CredentialPermissions>(jwt);

    expect(nats.sub?.allow?.toSorted()).toEqual([
      "chat.events",
      "chat.events.ana",
    ]);
  });

  it("does not let you publish anything", async () => {
    const { jwt } = await handler.execute(authenticatedContext);
    const { nats } = decode<CredentialPermissions>(jwt);

    expect(nats.pub?.deny).toEqual([">"]);
  });

  it("expires in one hour", async () => {
    const nowInSeconds = Date.now() / 1000;

    const { expiresAt } = await handler.execute(authenticatedContext);
    const lifetimeInSeconds = expiresAt.getTime() / 1000 - nowInSeconds;

    expect(lifetimeInSeconds).toBeGreaterThan(ONE_HOUR_IN_SECONDS - 5);
    expect(lifetimeInSeconds).toBeLessThanOrEqual(ONE_HOUR_IN_SECONDS);
  });

  it("gives everything the browser needs to connect", async () => {
    const credentials = await handler.execute(authenticatedContext);

    expect(credentials).toEqual({
      jwt: expect.any(String),
      seed: expect.stringMatching(/^SU/),
      expiresAt: expect.any(Date),
      wsUrl: "ws://localhost:8080",
    });
  });
});
