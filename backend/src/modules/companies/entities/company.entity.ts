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

  @ManyToMany(() => Agent)
  @JoinTable({ name: 'company_agents' })
  allowedAgents: Relation<Agent[]>;

  @CreateDateColumn()
  createdAt: Date;
}
