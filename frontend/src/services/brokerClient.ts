import {
  jwtAuthenticator,
  type Msg,
  type NatsConnection,
  wsconnect,
} from "@nats-io/nats-core";
import type { ChatEvent, OutputBrokerCredentials } from "./api.types";

const BROADCAST_SUBJECT = "chat.events";

export type BrokerConnection = NatsConnection;

export const openBrokerConnection = async (
  { jwt, seed, wsUrl }: OutputBrokerCredentials,
  userId: string,
  onEvent: (event: ChatEvent) => void,
): Promise<BrokerConnection> => {
  const connection = await wsconnect({
    servers: wsUrl,
    authenticator: jwtAuthenticator(jwt, new TextEncoder().encode(seed)),
  });

  const handleMessage = (error: Error | null, message: Msg) => {
    if (error) {
      console.error(error);
      return;
    }

    onEvent(message.json<ChatEvent>());
  };

  connection.subscribe(BROADCAST_SUBJECT, { callback: handleMessage });
  connection.subscribe(`${BROADCAST_SUBJECT}.${userId}`, {
    callback: handleMessage,
  });

  return connection;
};

export const watchReconnects = async (
  connection: BrokerConnection,
  onReconnect: () => void,
) => {
  for await (const status of connection.status()) {
    if (status.type === "reconnect") onReconnect();
  }
};
