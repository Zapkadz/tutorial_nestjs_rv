import { IsString, IsEmail, MinLength, MaxLength, IsOptional } from 'class-validator';

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;
const PASSWORD_MIN_LENGTH = 6;

export class CreateUserDto {
  @IsString()
  @MinLength(USERNAME_MIN_LENGTH)
  @MaxLength(USERNAME_MAX_LENGTH)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  bio?: string;
}
