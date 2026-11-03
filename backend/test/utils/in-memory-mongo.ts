import { randomUUID } from "node:crypto";
import { inject } from "vitest";

export const createTestMongoUri = () => `${inject("mongoUri")}${randomUUID()}`;
