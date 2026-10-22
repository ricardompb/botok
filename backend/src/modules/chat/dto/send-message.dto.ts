import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  agentId: string;

  /** Sessão em andamento; ausente na primeira mensagem. */
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(6000)
  message: string;
}
