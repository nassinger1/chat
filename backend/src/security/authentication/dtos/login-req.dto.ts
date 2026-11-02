import { IsBoolean, IsEmail, IsOptional, IsString } from "class-validator";

export class LoginReqDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;

  @IsOptional()
  @IsBoolean()
  readonly rememberMe?: boolean;
}
