import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class ListUsersDto {
  @Type(() => Number)
  @IsInt()
  companyId: number;
}
