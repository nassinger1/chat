import { resolve } from "node:path";
import { config } from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";
import type { TestProject } from "vitest/node";

const MONGO_LAUNCH_TIMEOUT_IN_MS = 60_000;

declare module "vitest" {
  export interface ProvidedContext {
    mongoUri: string;
  }
}

export default async function globalSetup(project: TestProject) {
  config({ path: resolve(process.cwd(), ".env.test"), quiet: true });

  const mongo = await MongoMemoryServer.create({
    instance: { launchTimeout: MONGO_LAUNCH_TIMEOUT_IN_MS },
  });

  project.provide("mongoUri", mongo.getUri());

  return async () => {
    await mongo.stop();
  };
}
