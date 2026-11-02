import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "@/common/schema/base-schema.js";
import { documentSchemaOptions } from "@/common/schema/schema-options.js";
import { UserStatus } from "./users.types.js";

@Schema({ ...documentSchemaOptions, collection: "users" })
export class UserDocument extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.OFFLINE })
  status: UserStatus;

  @Prop({ type: Date, default: null })
  lastSeenAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
