import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Registro de alterações do catálogo, sem credenciais e sem conversas. */
@Entity('agent_audit')
export class AgentAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 400 })
  action: string;

  @Column({ length: 160 })
  author: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
