import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from "@nestjs/common";
import { isMongoId } from "class-validator";
import { createError } from "../errors/create-error.js";

@Injectable()
export class IsObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string) {
    if (isMongoId(value)) return value;

    throw createError({
      error: BadRequestException,
      code: "BRQ-001",
      message: "Invalid ID",
      details: { value },
    });
  }
}
