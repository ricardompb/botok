import { IsEmail, IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsInt()
  companyId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(70)
  name: string;

  @IsEmail()
  @MaxLength(120)
  email: string;
}
