import { IAsset } from '../entities';
import { IPaginatedResponse } from '../api';

export interface IUseAssetsReturn {
  assets: IAsset[];
  pagination: IPaginatedResponse<IAsset>['pagination'] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface IUseAssetReturn {
  asset: IAsset | null;
  isLoading: boolean;
  error: Error | null;
}

export interface IUploadAssetParams {
  file: File;
  tags?: string[];
  description?: string;
}
