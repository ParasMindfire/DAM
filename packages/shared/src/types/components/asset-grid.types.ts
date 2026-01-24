import { IAsset } from '../entities';

export interface IAssetGridProps {
  searchParams?: IAssetSearchFilters;
  onAssetClick?: (asset: IAsset) => void;
  onAssetDelete?: (assetId: string) => void;
  columns?: number;
  showActions?: boolean;
}

export interface IAssetCardProps {
  asset: IAsset;
  onDelete?: (assetId: string) => void;
  onDownload?: (assetId: string) => void;
  onClick?: (asset: IAsset) => void;
  showActions?: boolean;
}

export interface IAssetSearchFilters {
  query?: string;
  type?: string;
  tags?: string[];
  status?: string;
  page?: number;
  limit?: number;
}
