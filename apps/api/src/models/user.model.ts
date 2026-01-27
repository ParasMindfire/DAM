import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import bcrypt from 'bcryptjs';
import { UserRole, APP_CONSTANTS } from '@dam/shared';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true }) // Added type: 'varchar'
  email!: string;

  @Column({ type: 'varchar' }) // Added type: 'varchar'
  password!: string;

  @Column({ name: 'first_name', type: 'varchar' }) // Added type: 'varchar'
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar' }) // Added type: 'varchar'
  lastName!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VIEWER,
  })
  role!: UserRole;

  @Column({ name: 'is_active', type: 'boolean', default: true }) // Added type: 'boolean'
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, APP_CONSTANTS.BCRYPT_ROUNDS);
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}
