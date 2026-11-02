import type { SchemaOptions } from "@nestjs/mongoose";

export const documentSchemaOptions: SchemaOptions = {
  timestamps: true,
  versionKey: false,
};
