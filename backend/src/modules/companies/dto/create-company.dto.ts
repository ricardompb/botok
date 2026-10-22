import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(70)
  name: string;

  @IsInt()
  @Min(1)
  @Max(1000)
  licenses: number;
}
