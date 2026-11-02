import { MongoMemoryServer } from "mongodb-memory-server";

export async function startInMemoryMongo() {
  const server = await MongoMemoryServer.create();

  return { uri: server.getUri(), stop: () => server.stop() };
}
