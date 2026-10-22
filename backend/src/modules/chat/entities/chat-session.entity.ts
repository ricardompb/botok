import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Metadados de consumo de uma conversa. O conteúdo das mensagens nunca é
 * persistido: apenas empresa, usuário, assistente e contagem de turnos.
 */
@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 60 })
  agentId: string;

  @Column('int')
  companyId: number;

  @Column('uuid')
  userId: string;

  @Column('int', { default: 0 })
  messageCount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  startedAt: Date;
}
