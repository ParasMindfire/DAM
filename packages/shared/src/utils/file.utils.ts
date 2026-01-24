import { AssetType } from '../types/enums';
import { STORAGE_CONSTANTS } from '../constants';

export class FileUtils {
  static getAssetType(mimeType: string): AssetType {
    if ((STORAGE_CONSTANTS.ALLOWED_MIME_TYPES.IMAGE as readonly string[]).includes(mimeType)) {
      return AssetType.IMAGE;
    }
    if ((STORAGE_CONSTANTS.ALLOWED_MIME_TYPES.VIDEO as readonly string[]).includes(mimeType)) {
      return AssetType.VIDEO;
    }
    if ((STORAGE_CONSTANTS.ALLOWED_MIME_TYPES.DOCUMENT as readonly string[]).includes(mimeType)) {
      return AssetType.DOCUMENT;
    }
    if ((STORAGE_CONSTANTS.ALLOWED_MIME_TYPES.AUDIO as readonly string[]).includes(mimeType)) {
      return AssetType.AUDIO;
    }
    return AssetType.OTHER;
  }

  static sanitizeFileName(fileName: string): string {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  static getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  static isValidFileSize(size: number): boolean {
    return size <= STORAGE_CONSTANTS.MAX_FILE_SIZE;
  }

  static isValidMimeType(mimeType: string): boolean {
    const allTypes = [
      ...STORAGE_CONSTANTS.ALLOWED_MIME_TYPES.IMAGE,
      ...STORAGE_CONSTANTS.ALLOWED_MIME_TYPES.VIDEO,
      ...STORAGE_CONSTANTS.ALLOWED_MIME_TYPES.DOCUMENT,
      ...STORAGE_CONSTANTS.ALLOWED_MIME_TYPES.AUDIO,
    ];
    return (allTypes as string[]).includes(mimeType);
  }
}
