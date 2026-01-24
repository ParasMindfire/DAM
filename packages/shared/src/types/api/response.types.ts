export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IAuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  token: string;
}
