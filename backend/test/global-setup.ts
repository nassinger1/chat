import { config } from "dotenv";
import { resolve } from "node:path";

export default async function globalSetup() {
  config({ path: resolve(process.cwd(), ".env.test"), quiet: true });
}
