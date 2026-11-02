import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import type { PaginatedResult } from "@/common/interfaces/paginated-result.interface.js";
import { type PageOptions, toPaginatedResult } from "@/common/pagination.js";
import { MessageDocument } from "../message.schema.js";
import type { CreateMessageInput, Message } from "../messages.types.js";
import { toMessage } from "./message.mapper.js";

@Injectable()
export class MessageRepository {
  constructor(
    @InjectModel(MessageDocument.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async create({
    conversationId,
    senderId,
    text,
  }: CreateMessageInput): Promise<Message> {
    const created = await this.messageModel.create({
      conversation: new Types.ObjectId(conversationId),
      sender: new Types.ObjectId(senderId),
      text,
    });

    return toMessage(created.toObject());
  }

  async findByConversation(
    conversationId: string,
    options: PageOptions,
  ): Promise<PaginatedResult<Message>> {
    const filter = { conversation: new Types.ObjectId(conversationId) };
    const skip = (options.page - 1) * options.limit;

    const [documents, itemCount] = await Promise.all([
      this.messageModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(options.limit)
        .lean<MessageDocument[]>(),
      this.messageModel.countDocuments(filter),
    ]);

    return toPaginatedResult(documents.map(toMessage), itemCount, options);
  }
}
