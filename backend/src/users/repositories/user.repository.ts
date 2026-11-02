import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { isDuplicateKeyError } from "@/common/utils.js";
import { UserErrors } from "../user.errors.js";
import { UserDocument } from "../user.schema.js";
import type {
  CreateUserInput,
  User,
  UserWithPassword,
} from "../users.types.js";
import { toUser } from "./user.mapper.js";

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(input: CreateUserInput): Promise<User> {
    try {
      const created = await this.userModel.create(input);

      return toUser(created.toObject());
    } catch (error) {
      if (isDuplicateKeyError(error)) throw UserErrors.emailAlreadyRegistered();
      throw error;
    }
  }

  async getById(id: string): Promise<User | null> {
    const document = await this.userModel.findById(id).lean<UserDocument>();

    return document ? toUser(document) : null;
  }

  async getByEmailWithPassword(
    email: string,
  ): Promise<UserWithPassword | null> {
    const document = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .select("+password")
      .lean<UserDocument>();

    return document
      ? { ...toUser(document), password: document.password }
      : null;
  }
}
