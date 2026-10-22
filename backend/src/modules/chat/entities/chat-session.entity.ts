import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Metadados de consumo de uma conversa. O conteúdo das mensagens nunca é
 * persistido no portal: o contexto vive na conversa do Foundry, que é apagada
 * ao encerrar a sessão (explicitamente ou por inatividade).
 */
@Entity('chat_sessions')
@Index(['endedAt', 'lastActivityAt'])
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 60 })
  agentId: string;

  @Column('int')
  tenantId: number;

  @Column('uuid')
  userId: string;

  @Column('int', { default: 0 })
  messageCount: number;

  /** Projeto do Foundry usado na sessão (para o descarte, mesmo se o cadastro mudar). */
  @Column({ type: 'varchar', length: 500, nullable: true })
  remoteEndpoint: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  remoteConversationId: string | null;

  /** Respostas geradas no Foundry, apagadas junto com a conversa. */
  @Column('jsonb', { default: [] })
  remoteResponseIds: string[];

  @CreateDateColumn({ type: 'timestamptz', default: () => 'clock_timestamp()' })
  startedAt: Date;

  @Column('timestamptz', { default: () => 'clock_timestamp()' })
  lastActivityAt: Date;

  @Column('timestamptz', { nullable: true })
  endedAt: Date | null;
}
