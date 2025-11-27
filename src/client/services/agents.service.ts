/**
 * Agent service - handles all agent-related API calls
 */

import type { BaseClient } from '../base-client.js';
import type { Agent } from '../../types/api.js';
import type { PaginationParams } from '../../types/client.js';

export class AgentService {
  constructor(private client: BaseClient) {}

  async list(params?: PaginationParams): Promise<Agent[]> {
    return this.client.get<Agent[]>('/api/v1/agents', { params });
  }

  async get(id: string): Promise<Agent> {
    return this.client.get<Agent>(`/api/v1/agents/${id}`);
  }

  async create(data: any): Promise<Agent> {
    return this.client.post<Agent>('/api/v1/agents', data);
  }

  async update(id: string, data: any): Promise<Agent> {
    return this.client.patch<Agent>(`/api/v1/agents/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await this.client.delete(`/api/v1/agents/${id}`);
  }

  async execute(id: string, data: any): Promise<any> {
    return this.client.post(`/api/v1/agents/${id}/execute`, data);
  }
}
