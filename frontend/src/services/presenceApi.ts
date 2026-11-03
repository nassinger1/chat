import { httpClient } from "./httpClient";

export class PresenceApi {
  static async heartbeat() {
    await httpClient.post("/presence/heartbeat");
  }
}
