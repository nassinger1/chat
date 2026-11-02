import type { Msg } from "@nats-io/nats-core";
import { jwtAuthenticator, wsconnect } from "@nats-io/nats-core";

const [userId, jwt, seed] = process.argv.slice(2);

const connection = await wsconnect({
  servers: "ws://localhost:8080",
  authenticator: jwtAuthenticator(jwt, new TextEncoder().encode(seed)),
});

const printEvent = (error: Error | null, message: Msg) => {
  if (error) {
    console.error(String(error));
    return;
  }

  console.log(message.subject, JSON.stringify(message.json()));
};

connection.subscribe("chat.events", { callback: printEvent });
connection.subscribe(`chat.events.${userId}`, { callback: printEvent });

console.log(`Listening as ${userId}`);
