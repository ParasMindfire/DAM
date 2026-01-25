import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AssetType, AssetStatus, IAssetMetadata } from '@dam/shared';
import { User } from './user.model';

@Entity('assets')
@Index(['status'])
@Index(['type'])
@Index(['createdAt'])
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'file_name' })
  fileName!: string;

  @Column({ name: 'original_name' })
  originalName!: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize!: number;

  @Column({ name: 'mime_type' })
  mimeType!: string;

  @Column({
    type: 'enum',
    enum: AssetType,
  })
  type!: AssetType;

  @Column({
    type: 'enum',
    enum: AssetStatus,
    default: AssetStatus.UPLOADING,
  })
  status!: AssetStatus;

  @Column({ type: 'jsonb' })
  metadata!: IAssetMetadata;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl?: string;

  @Column({ name: 'preview_url', nullable: true })
  previewUrl?: string;

  @Column({ name: 'download_url' })
  downloadUrl!: string;

  @Column({ type: 'simple-array', default: '' })
  tags!: string[];

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'uploaded_by' })
  uploadedBy!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploader!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
