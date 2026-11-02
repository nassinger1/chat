import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { compare, hash, hashSync } from "bcrypt";

const SALT_ROUNDS = 10;

@Injectable()
export class HashingService {
  private readonly dummyHash = hashSync(randomUUID(), SALT_ROUNDS);

  hash(password: string) {
    return hash(password, SALT_ROUNDS);
  }

  async compare(password: string, storedHash: string | null | undefined) {
    const isMatch = await compare(password, storedHash ?? this.dummyHash);

    return Boolean(storedHash) && isMatch;
  }
}
