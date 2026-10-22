import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Agent } from '../../agents/entities/agent.entity.js';

/** Empresa cliente: cada empresa é um tenant (o `id` é o tenantId). */
@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 70 })
  name: string;

  @Column('int')
  licenses: number;

  /** Percentual da franquia utilizada no período. */
  @Column('int', { default: 0 })
  quota: number;

  @Column('date')
  until: string;

  /** Tenant Microsoft Entra da empresa, fixado no primeiro acesso de um usuário. */
  @Column('uuid', { nullable: true })
  entraTenantId: string | null;

  @ManyToMany(() => Agent)
  @JoinTable({
    name: 'company_agents',
    joinColumn: { name: 'tenantId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'agentId', referencedColumnName: 'id' },
  })
  allowedAgents: Relation<Agent[]>;

  @CreateDateColumn({ default: () => 'clock_timestamp()' })
  createdAt: Date;
}
