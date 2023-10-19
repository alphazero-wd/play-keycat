import { IsEmail, IsStrongPassword, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @Length(1, 30)
  @Matches(/^[0-9a-zA-Z_]*$/)
  username: string;

  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;
}
