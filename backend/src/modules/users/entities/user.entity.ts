import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import type { UserRole } from '../../../common/auth/auth-user.js';
import { Company } from '../../companies/entities/company.entity.js';

@Entity('users')
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

  @Column('int', { nullable: true })
  companyId: number | null;

  @ManyToOne(() => Company, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Relation<Company> | null;

  @Column('timestamptz', { nullable: true })
  lastAccessAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
