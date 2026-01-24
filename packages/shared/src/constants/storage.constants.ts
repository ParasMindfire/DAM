export const STORAGE_CONSTANTS = {
  BUCKETS: {
    ASSETS: 'dam-assets',
    THUMBNAILS: 'dam-thumbnails',
    PREVIEWS: 'dam-previews',
  },
  MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
  ALLOWED_MIME_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    VIDEO: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    DOCUMENT: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
  },
  THUMBNAIL_SIZE: {
    WIDTH: 300,
    HEIGHT: 300,
  },
  PREVIEW_SIZE: {
    WIDTH: 1920,
    HEIGHT: 1080,
  },
} as const;
