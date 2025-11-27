/**
 * Workflow service - handles all workflow-related API calls
 */

import type { BaseClient } from '../base-client.js';
import type { Workflow } from '../../types/api.js';

export class WorkflowService {
  constructor(private client: BaseClient) {}

  async list(params?: any): Promise<Workflow[]> {
    return this.client.get<Workflow[]>('/api/v1/workflows', { params });
  }

  async get(id: string): Promise<Workflow> {
    return this.client.get<Workflow>(`/api/v1/workflows/${id}`);
  }

  async create(data: any): Promise<Workflow> {
    return this.client.post<Workflow>('/api/v1/workflows', data);
  }

  async update(id: string, data: any): Promise<Workflow> {
    return this.client.patch<Workflow>(`/api/v1/workflows/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await this.client.delete(`/api/v1/workflows/${id}`);
  }
}
