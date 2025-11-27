/**
 * Execution service - handles all execution-related API calls
 */

import type { BaseClient } from '../base-client.js';
import type { Execution } from '../../types/api.js';

export class ExecutionService {
  constructor(private client: BaseClient) {}

  async list(params?: any): Promise<Execution[]> {
    return this.client.get<Execution[]>('/api/v1/executions', { params });
  }

  async get(id: string): Promise<Execution> {
    return this.client.get<Execution>(`/api/v1/executions/${id}`);
  }

  async getMessages(id: string, params?: any): Promise<any[]> {
    return this.client.get<any[]>(`/api/v1/executions/${id}/messages`, { params });
  }

  async cancel(id: string): Promise<void> {
    await this.client.patch(`/api/v1/executions/${id}/status`, { status: 'cancelled' });
  }
}
