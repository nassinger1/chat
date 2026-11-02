import { SetMetadata } from "@nestjs/common";

export const RESPOND_WITH_METADATA = "respond_with_metadata";

type ResponseFunction<Input> = (body: Input) => unknown;

type RespondWithDecorator<Input> = (
  target: object,
  propertyKey: string | symbol,
  descriptor: { value?: (...args: never[]) => Input | Promise<Input> },
) => void;

export function RespondWith<Input>(
  responseFunction: ResponseFunction<Input> | null,
): RespondWithDecorator<Input> {
  return SetMetadata(RESPOND_WITH_METADATA, responseFunction);
}
