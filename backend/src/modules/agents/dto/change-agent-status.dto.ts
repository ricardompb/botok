import { IsIn } from 'class-validator';

export class ChangeAgentStatusDto {
  @IsIn(['suspended', 'archived'])
  status: 'suspended' | 'archived';
}
