export const QUEUE_CONSTANTS = {
  QUEUES: {
    ASSET_PROCESSING: 'asset-processing',
    THUMBNAIL_GENERATION: 'thumbnail-generation',
    METADATA_EXTRACTION: 'metadata-extraction',
  },
  EXCHANGES: {
    ASSET: 'asset-exchange',
  },
  ROUTING_KEYS: {
    ASSET_UPLOADED: 'asset.uploaded',
    ASSET_PROCESSED: 'asset.processed',
    THUMBNAIL_GENERATED: 'thumbnail.generated',
  },
} as const;
