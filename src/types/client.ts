/**
 * API client type definitions
 */

export interface APIRequestConfig {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface ListResponse<T> {
  data: T[];
  total?: number;
}
