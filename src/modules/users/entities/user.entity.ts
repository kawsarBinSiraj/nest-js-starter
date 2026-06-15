/**
 * File: src/modules/users/entities/user.entity.ts
 * Purpose: TypeORM User entity — mirrors the former Prisma schema.
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../../shared/constants/roles.constant.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true, type: 'varchar' })
  firstName: string | null;

  @Column({ nullable: true, type: 'varchar' })
  lastName: string | null;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ type: 'text', nullable: true })
  refreshToken: string | null;

  @Column({ nullable: true, type: 'varchar' })
  resetPasswordToken: string | null;

  @Column({ nullable: true, type: 'timestamptz' })
  resetPasswordExpiry: Date | null;

  @Column({ default: false })
  isEmailVerified: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
