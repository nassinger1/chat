import { applyDecorators } from "@nestjs/common";
import { IsMongoId, IsString } from "class-validator";

export const IsObjectId = () => applyDecorators(IsString(), IsMongoId());
