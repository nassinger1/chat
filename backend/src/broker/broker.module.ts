import { jwtAuthenticator } from "@nats-io/nats-core";
import { connect } from "@nats-io/transport-node";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type AppConfig, AppEnvironment } from "@/config/app-config.js";
import { NATS_CONNECTION } from "./broker.types.js";
import { BrokerClientService } from "./broker-client.service.js";
import { BrokerCredentialsService } from "./broker-credentials.service.js";
import { BrokerStreamConsumerService } from "./broker-stream-consumer.service.js";

const brokerConnectionProvider = {
  provide: NATS_CONNECTION,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService<AppConfig, true>) => {
    const nats = configService.get("nats", { infer: true });
    const appEnv = configService.get("appEnv", { infer: true });
    const userSeed = new TextEncoder().encode(nats.userSeed);

    return connect({
      name: `chat-backend-${appEnv}-${process.pid}`,
      servers: nats.servers,
      authenticator: jwtAuthenticator(nats.userJwt, userSeed),
      inboxPrefix: "chat-backend._INBOX",
      noEcho: appEnv === AppEnvironment.PRODUCTION,
      maxReconnectAttempts: -1,
      reconnectTimeWait: 2000,
    });
  },
};

@Global()
@Module({
  providers: [
    brokerConnectionProvider,
    BrokerClientService,
    BrokerCredentialsService,
    BrokerStreamConsumerService,
  ],
  exports: [
    brokerConnectionProvider,
    BrokerClientService,
    BrokerCredentialsService,
    BrokerStreamConsumerService,
  ],
})
export class BrokerModule {}
