import { IsArray, IsString } from 'class-validator';

export class UpdateEntitlementsDto {
  @IsArray()
  @IsString({ each: true })
  agentIds: string[];
}
