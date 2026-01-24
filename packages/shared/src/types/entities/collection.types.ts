export interface ICollection {
  id: string;
  name: string;
  description?: string;
  assetIds: string[];
  createdBy: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICollectionCreate {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface ICollectionUpdate {
  name?: string;
  description?: string;
  isPublic?: boolean;
  assetIds?: string[];
}
