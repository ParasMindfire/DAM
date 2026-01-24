export interface IApiServiceConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface IApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}
