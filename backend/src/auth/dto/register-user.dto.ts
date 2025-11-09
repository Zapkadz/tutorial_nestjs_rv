import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

const PASSWORD_MIN_LENGTH = 6;

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  username: string;

  @MinLength(PASSWORD_MIN_LENGTH)
  password: string;
}

