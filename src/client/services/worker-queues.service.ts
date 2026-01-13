/**
 * Worker Queues Service
 * API service for worker queue operations
 */

import type { BaseClient } from '../base-client.js';
import type { WorkerQueue } from '../../types/api.js';

export class WorkerQueuesService {
  constructor(private client: BaseClient) {}

  /**
   * List all worker queues across all environments
   */
  async list(): Promise<WorkerQueue[]> {
    return this.client.get<WorkerQueue[]>('/api/v1/worker-queues');
  }

  /**
   * List worker queues for a specific environment
   */
  async listByEnvironment(environmentId: string): Promise<WorkerQueue[]> {
    return this.client.get<WorkerQueue[]>(`/api/v1/environments/${environmentId}/worker-queues`);
  }

  /**
   * Get a specific worker queue by ID
   */
  async get(queueId: string): Promise<WorkerQueue> {
    return this.client.get<WorkerQueue>(`/api/v1/worker-queues/${queueId}`);
  }

  /**
   * Create a new worker queue in an environment
   */
  async create(environmentId: string, data: any): Promise<WorkerQueue> {
    return this.client.post<WorkerQueue>(`/api/v1/environments/${environmentId}/worker-queues`, data);
  }

  /**
   * Update a worker queue
   */
  async update(queueId: string, data: any): Promise<WorkerQueue> {
    return this.client.patch<WorkerQueue>(`/api/v1/worker-queues/${queueId}`, data);
  }

  /**
   * Delete a worker queue
   */
  async delete(queueId: string): Promise<void> {
    await this.client.delete(`/api/v1/worker-queues/${queueId}`);
  }
}
