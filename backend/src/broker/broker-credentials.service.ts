import { encodeUser } from "@nats-io/jwt";
import { createUser, fromSeed, type KeyPair } from "@nats-io/nkeys";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AppConfig } from "@/config/app-config.js";

const CREDENTIAL_LIFETIME_IN_SECONDS = 60 * 60;

export type BrokerCredentials = {
  jwt: string;
  seed: string;
  expiresAt: Date;
};

@Injectable()
export class BrokerCredentialsService {
  private readonly accountKey: KeyPair;

  constructor(configService: ConfigService<AppConfig, true>) {
    const accountSeed = configService.get("nats.accountSeed", { infer: true });

    this.accountKey = fromSeed(new TextEncoder().encode(accountSeed));
  }

  async mintSubscribeOnly(
    name: string,
    subjects: string[],
  ): Promise<BrokerCredentials> {
    const userKey = createUser();
    const expiresAtInSeconds =
      Math.floor(Date.now() / 1000) + CREDENTIAL_LIFETIME_IN_SECONDS;

    const jwt = await encodeUser(
      name,
      userKey,
      this.accountKey,
      { pub: { deny: [">"] }, sub: { allow: subjects } },
      { exp: expiresAtInSeconds },
    );

    return {
      jwt,
      seed: new TextDecoder().decode(userKey.getSeed()),
      expiresAt: new Date(expiresAtInSeconds * 1000),
    };
  }
}
