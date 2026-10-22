import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(70)
  name: string;

  @IsEmail()
  @MaxLength(120)
  email: string;
}
