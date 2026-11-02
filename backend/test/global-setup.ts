import { resolve } from "node:path";
import { config } from "dotenv";

export default async function globalSetup() {
  config({ path: resolve(process.cwd(), ".env.test"), quiet: true });
}
