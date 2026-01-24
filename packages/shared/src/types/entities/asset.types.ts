import { AssetType, AssetStatus } from '../enums';

export interface IAssetMetadata {
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  size: number;
  mimeType: string;
}

export interface IAsset {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  type: AssetType;
  status: AssetStatus;
  metadata: IAssetMetadata;
  thumbnailUrl?: string;
  previewUrl?: string;
  downloadUrl: string;
  tags: string[];
  description?: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssetUpload {
  file: File | Buffer;
  fileName: string;
  mimeType: string;
  tags?: string[];
  description?: string;
}

export interface IAssetUpdate {
  fileName?: string;
  tags?: string[];
  description?: string;
  status?: AssetStatus;
}
