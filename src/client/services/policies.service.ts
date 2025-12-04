/**
 * Policy service - handles all policy-related API calls
 */

import type { BaseClient } from '../base-client.js';
import type { Policy } from '../../types/api.js';

export interface ListPoliciesParams {
  page?: number;
  limit?: number;
  enabled?: boolean;
  search?: string;
}

export class PolicyService {
  constructor(private client: BaseClient) {}

  async list(params?: ListPoliciesParams): Promise<Policy[]> {
    return this.client.get<Policy[]>('/api/v1/policies', { params });
  }

  async get(id: string): Promise<Policy> {
    return this.client.get<Policy>(`/api/v1/policies/${id}`);
  }

  async create(data: any): Promise<Policy> {
    return this.client.post<Policy>('/api/v1/policies', data);
  }

  async update(id: string, data: any): Promise<Policy> {
    return this.client.put<Policy>(`/api/v1/policies/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await this.client.delete(`/api/v1/policies/${id}`);
  }
}
