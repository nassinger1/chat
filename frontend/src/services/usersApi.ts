import type { InputRegister, Paginated, User } from "./api.types";
import { httpClient } from "./httpClient";

const MAX_PAGE_SIZE = 100;

export class UsersApi {
  static async register(input: InputRegister) {
    const { data } = await httpClient.post<User>("/users", input);

    return data;
  }

  static async find() {
    const { data } = await httpClient.get<Paginated<User>>("/users", {
      params: { limit: MAX_PAGE_SIZE },
    });

    return data.items;
  }
}
