import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import type { PaginatedResult } from "@/common/interfaces/paginated-result.interface.js";
import { type PageOptions, toPaginatedResult } from "@/common/pagination.js";
import { isDuplicateKeyError } from "@/common/utils.js";
import { UserErrors } from "../user.errors.js";
import { UserDocument } from "../user.schema.js";
import {
  type CreateUserInput,
  type User,
  UserStatus,
  type UserWithPassword,
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

  async findByIds(ids: string[]): Promise<User[]> {
    const documents = await this.userModel
      .find({ _id: { $in: ids } })
      .lean<UserDocument[]>();

    return documents.map(toUser);
  }

  async findOthers(
    userId: string,
    options: PageOptions,
  ): Promise<PaginatedResult<User>> {
    const filter = { _id: { $ne: userId } };
    const skip = (options.page - 1) * options.limit;

    const [documents, itemCount] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(options.limit)
        .lean<UserDocument[]>(),
      this.userModel.countDocuments(filter),
    ]);

    return toPaginatedResult(documents.map(toUser), itemCount, options);
  }

  async markOnline(id: string): Promise<boolean> {
    const previous = await this.userModel
      .findByIdAndUpdate(id, {
        $set: { status: UserStatus.ONLINE, lastSeenAt: new Date() },
      })
      .lean<UserDocument>();

    return previous?.status === UserStatus.OFFLINE;
  }

  async markOffline(id: string): Promise<User | null> {
    const document = await this.userModel
      .findOneAndUpdate(
        { _id: id, status: UserStatus.ONLINE },
        { $set: { status: UserStatus.OFFLINE } },
        { returnDocument: "after" },
      )
      .lean<UserDocument>();

    return document ? toUser(document) : null;
  }

  async findStaleOnline(before: Date): Promise<User[]> {
    const documents = await this.userModel
      .find({ status: UserStatus.ONLINE, lastSeenAt: { $lt: before } })
      .lean<UserDocument[]>();

    return documents.map(toUser);
  }
}
