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
   * Get a specific worker queue by ID
   */
  async get(queueId: string): Promise<WorkerQueue> {
    return this.client.get<WorkerQueue>(`/api/v1/worker-queues/${queueId}`);
  }
}
