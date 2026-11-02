import type { Types } from "mongoose";

export class Document {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
