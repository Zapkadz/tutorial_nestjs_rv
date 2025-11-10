import { IsEmail, IsOptional, MinLength, IsString, MaxLength } from 'class-validator';

const PASSWORD_MIN_LENGTH = 6;

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username?: string;

  @IsOptional()
  @MinLength(PASSWORD_MIN_LENGTH)
  password?: string;

  @IsOptional()
  @IsString()
  image?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  bio?: string | null;
}


