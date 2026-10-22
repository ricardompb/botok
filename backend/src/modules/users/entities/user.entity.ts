import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import type { UserRole } from '../../../common/auth/auth-user.js';
import { Company } from '../../companies/entities/company.entity.js';

@Entity('users')
@Index(['entraTenantId', 'entraObjectId'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 70 })
  name: string;

  @Column({ length: 120, unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ length: 10, default: 'user' })
  role: UserRole;

  @Column({ default: true })
  active: boolean;

  /** Empresa (tenant); null para a administração IT’s OK. */
  @Column('int', { nullable: true })
  tenantId: number | null;

  @ManyToOne(() => Company, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  company: Relation<Company> | null;

  /** Identidade Microsoft Entra vinculada no primeiro acesso (tid + oid). */
  @Column('uuid', { nullable: true })
  entraTenantId: string | null;

  @Column('uuid', { nullable: true })
  entraObjectId: string | null;

  @Column('timestamptz', { nullable: true })
  lastAccessAt: Date | null;

  @CreateDateColumn({ default: () => 'clock_timestamp()' })
  createdAt: Date;
}
