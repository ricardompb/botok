import { IsEmail, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { SUPPORT_CATEGORIES, SUPPORT_IMPACTS, SUPPORT_ISSUES } from '../support-options.js';

export class CreateSupportRequestDto {
  @IsIn(SUPPORT_CATEGORIES)
  category: string;

  @IsIn(SUPPORT_ISSUES)
  issue: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  agentId?: string;

  @IsIn(SUPPORT_IMPACTS)
  impact: string;

  /** Usado apenas quando a solicitação é feita antes de entrar. */
  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  email?: string;
}
