export interface IAssetUploadProps {
  onUploadSuccess?: (assetId: string) => void;
  onUploadError?: (error: Error) => void;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  multiple?: boolean;
}
