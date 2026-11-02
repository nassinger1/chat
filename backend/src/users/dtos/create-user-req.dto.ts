import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateUserReqDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  readonly password: string;
}
