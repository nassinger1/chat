import { IsObjectId } from "@/common/decorators/is-object-id.decorator.js";

export class OpenConversationReqDto {
  @IsObjectId()
  readonly participantId: string;
}
