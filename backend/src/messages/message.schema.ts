import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Document } from "@/common/schema/base-schema.js";
import { documentSchemaOptions } from "@/common/schema/schema-options.js";

@Schema({ ...documentSchemaOptions, collection: "messages" })
export class MessageDocument extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  conversation: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  sender: Types.ObjectId;

  @Prop({ required: true })
  text: string;
}

export const MessageSchema = SchemaFactory.createForClass(MessageDocument);

MessageSchema.index({ conversation: 1, createdAt: -1 });
