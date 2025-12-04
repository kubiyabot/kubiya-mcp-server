/**
 * Environment service - handles all environment-related API calls
 */

import type { BaseClient } from '../base-client.js';
import type { Environment } from '../../types/api.js';

export interface ListEnvironmentsParams {
  status_filter?: string;
}

export class EnvironmentService {
  constructor(private client: BaseClient) {}

  async list(params?: ListEnvironmentsParams): Promise<Environment[]> {
    return this.client.get<Environment[]>('/api/v1/environments', { params });
  }

  async get(id: string): Promise<Environment> {
    return this.client.get<Environment>(`/api/v1/environments/${id}`);
  }

  async create(data: any): Promise<Environment> {
    return this.client.post<Environment>('/api/v1/environments', data);
  }

  async update(id: string, data: any): Promise<Environment> {
    return this.client.patch<Environment>(`/api/v1/environments/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await this.client.delete(`/api/v1/environments/${id}`);
  }
}
