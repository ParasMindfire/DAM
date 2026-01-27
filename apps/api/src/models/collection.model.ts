import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.model';

@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' }) // Added type: 'varchar'
  name!: string;

  @Column({ type: 'text', nullable: true }) // Added type: 'text'
  description?: string;

  @Column({ name: 'asset_ids', type: 'simple-array', default: '' })
  assetIds!: string[];

  @Column({ name: 'created_by', type: 'uuid' }) // Added type: 'uuid'
  createdBy!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator!: User;

  @Column({ name: 'is_public', type: 'boolean', default: false }) // Added type: 'boolean'
  isPublic!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
