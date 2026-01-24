export interface IPaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IAssetSearchParams extends IPaginationParams {
  query?: string;
  type?: string;
  tags?: string[];
  status?: string;
  uploadedBy?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
