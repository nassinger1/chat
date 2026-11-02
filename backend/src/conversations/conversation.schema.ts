import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Document } from "@/common/schema/base-schema.js";
import { documentSchemaOptions } from "@/common/schema/schema-options.js";

@Schema({ _id: false })
export class ParticipantDocument {
  @Prop({ type: Types.ObjectId, required: true })
  user: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  unreadCount: number;
}

@Schema({ _id: false })
export class LastMessageDocument {
  @Prop({ required: true })
  text: string;

  @Prop({ type: Types.ObjectId, required: true })
  sender: Types.ObjectId;

  @Prop({ type: Date, required: true })
  sentAt: Date;
}

const ParticipantSchema = SchemaFactory.createForClass(ParticipantDocument);
const LastMessageSchema = SchemaFactory.createForClass(LastMessageDocument);

@Schema({ ...documentSchemaOptions, collection: "conversations" })
export class ConversationDocument extends Document {
  @Prop({ type: [ParticipantSchema], required: true })
  participants: ParticipantDocument[];

  @Prop({ required: true, unique: true })
  participantsKey: string;

  @Prop({ type: LastMessageSchema, default: null })
  lastMessage: LastMessageDocument | null;
}

export const ConversationSchema =
  SchemaFactory.createForClass(ConversationDocument);

ConversationSchema.index({ "participants.user": 1 });
