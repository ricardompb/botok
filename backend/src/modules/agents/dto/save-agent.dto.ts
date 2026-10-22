import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { AgentAuth, AgentScope, AgentStatus } from '../entities/agent.entity.js';

export class SaveAgentDto {
  @IsString() @MaxLength(160) internalName: string;
  @IsString() @MaxLength(160) name: string;
  @IsString() @MaxLength(160) short: string;
  @IsIn(['draft', 'active', 'suspended', 'archived']) status: AgentStatus;
  @IsString() @MaxLength(400) description: string;
  @IsIn(['generic', 'exclusive']) scope: AgentScope;

  @IsOptional() @Type(() => Number) @IsInt() clientId?: number | null;

  @IsString() @MaxLength(160) version: string;
  @IsString() @MaxLength(160) owner: string;
  @IsOptional() @IsString() @MaxLength(10) approved?: string;
  @IsOptional() @IsString() @MaxLength(160) title?: string;

  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  prompts: string[];

  @IsString() @MaxLength(500) endpoint: string;
  @IsString() @MaxLength(160) remoteId: string;
  @IsIn(['entra', 'vault']) auth: AgentAuth;
  @IsOptional() @IsString() @MaxLength(160) secretRef?: string;
  @IsOptional() @IsString() @MaxLength(500) manualUrl?: string;
  @IsOptional() @IsString() @MaxLength(160) manualVersion?: string;

  /** Resultado do teste simulado de conexão realizado no formulário. */
  @IsBoolean() tested: boolean;
}
