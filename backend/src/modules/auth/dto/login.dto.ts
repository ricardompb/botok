import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  @MaxLength(120)
  email: string;

  @IsString()
  @MaxLength(200)
  password: string;
}
