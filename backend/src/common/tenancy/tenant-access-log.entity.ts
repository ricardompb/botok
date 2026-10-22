import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/** Registro de cada operação da administração IT’s OK nos dados de uma empresa. */
@Entity('tenant_access_log')
@Index(['tenantId', 'createdAt'])
export class TenantAccessLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  tenantId: number;

  @Column('uuid')
  actorId: string;

  @Column({ length: 120 })
  actorEmail: string;

  /** Método e rota, ex.: GET /companies/:companyId/users. Sem conteúdo. */
  @Column({ length: 200 })
  action: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'clock_timestamp()' })
  createdAt: Date;
}
