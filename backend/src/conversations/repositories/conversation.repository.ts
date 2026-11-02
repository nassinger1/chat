import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { isDuplicateKeyError } from "@/common/utils.js";
import { ConversationDocument } from "../conversation.schema.js";
import type {
  Conversation,
  ParticipantLookup,
  RecordMessageInput,
} from "../conversations.types.js";
import { toConversation } from "./conversation.mapper.js";

@Injectable()
export class ConversationRepository {
  constructor(
    @InjectModel(ConversationDocument.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async findOrCreateDirect(
    firstUserId: string,
    secondUserId: string,
  ): Promise<Conversation> {
    try {
      return await this.upsertDirect(firstUserId, secondUserId);
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;

      return this.upsertDirect(firstUserId, secondUserId);
    }
  }

  private async upsertDirect(firstUserId: string, secondUserId: string) {
    const userIds = [firstUserId, secondUserId].sort();
    const participants = userIds.map((userId) => ({
      user: new Types.ObjectId(userId),
      unreadCount: 0,
    }));

    const document = await this.conversationModel
      .findOneAndUpdate(
        { participantsKey: userIds.join(":") },
        { $setOnInsert: { participants } },
        { upsert: true, returnDocument: "after" },
      )
      .lean<ConversationDocument>();

    return toConversation(document as ConversationDocument);
  }

  async getById(id: string): Promise<Conversation | null> {
    const document = await this.conversationModel
      .findById(id)
      .lean<ConversationDocument>();

    return document ? toConversation(document) : null;
  }

  async getByIdForParticipant({
    id,
    userId,
  }: ParticipantLookup): Promise<Conversation | null> {
    const document = await this.conversationModel
      .findOne({ _id: id, "participants.user": new Types.ObjectId(userId) })
      .lean<ConversationDocument>();

    return document ? toConversation(document) : null;
  }

  async findByParticipant(userId: string): Promise<Conversation[]> {
    const documents = await this.conversationModel
      .find({ "participants.user": new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .lean<ConversationDocument[]>();

    return documents.map(toConversation);
  }

  async recordMessage({ id, senderId, text, sentAt }: RecordMessageInput) {
    const sender = new Types.ObjectId(senderId);

    await this.conversationModel.updateOne(
      { _id: id },
      {
        $set: { lastMessage: { text, sender, sentAt } },
        $inc: { "participants.$[other].unreadCount": 1 },
      },
      { arrayFilters: [{ "other.user": { $ne: sender } }] },
    );
  }

  async markRead({ id, userId }: ParticipantLookup) {
    await this.conversationModel.updateOne(
      { _id: id, "participants.user": new Types.ObjectId(userId) },
      { $set: { "participants.$.unreadCount": 0 } },
    );
  }
}
