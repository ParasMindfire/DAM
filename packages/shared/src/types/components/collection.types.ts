import { ICollection } from '../entities';

export interface ICollectionListProps {
  onCollectionClick?: (collection: ICollection) => void;
  onCollectionCreate?: () => void;
  showCreateButton?: boolean;
}

export interface ICollectionCardProps {
  collection: ICollection;
  onClick?: (collection: ICollection) => void;
  onDelete?: (collectionId: string) => void;
}

export interface ICollectionFormProps {
  collectionId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}
