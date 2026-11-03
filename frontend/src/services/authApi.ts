import type {
  InputLogin,
  OutputBrokerCredentials,
  OutputSession,
} from "./api.types";
import { httpClient } from "./httpClient";

export class AuthApi {
  static async getSession() {
    const { data } = await httpClient.get<OutputSession>("/auth/session");

    return data;
  }

  static async login(input: InputLogin) {
    const { data } = await httpClient.post<OutputSession>("/auth/login", input);

    return data;
  }

  static async logout() {
    await httpClient.post("/auth/logout");
  }

  static async getBrokerCredentials() {
    const { data } = await httpClient.post<OutputBrokerCredentials>(
      "/auth/broker-credentials",
    );

    return data;
  }
}
