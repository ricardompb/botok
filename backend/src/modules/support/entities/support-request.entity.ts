import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Solicitação estruturada do “Fale conosco”, sem anexos nem conteúdo de conversa. */
@Entity('support_requests')
export class SupportRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, default: '' })
  protocol: string;

  @Column({ length: 80 })
  category: string;

  @Column({ length: 80 })
  issue: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  agentId: string | null;

  @Column({ length: 30 })
  impact: string;

  @Column({ length: 120 })
  email: string;

  @Column('uuid', { nullable: true })
  userId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
