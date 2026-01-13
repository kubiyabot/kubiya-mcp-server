/**
 * Job service - handles all job-related API calls
 */

import type { BaseClient } from '../base-client.js';
import type { Job } from '../../types/api.js';

export interface ListJobsParams {
  enabled?: boolean;
  trigger_type?: string;
}

export class JobService {
  constructor(private client: BaseClient) {}

  async list(params?: ListJobsParams): Promise<Job[]> {
    return this.client.get<Job[]>('/api/v1/jobs', { params });
  }

  async get(id: string): Promise<Job> {
    return this.client.get<Job>(`/api/v1/jobs/${id}`);
  }

  async create(data: any): Promise<Job> {
    return this.client.post<Job>('/api/v1/jobs', data);
  }

  async update(id: string, data: any): Promise<Job> {
    return this.client.patch<Job>(`/api/v1/jobs/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await this.client.delete(`/api/v1/jobs/${id}`);
  }

  async trigger(id: string, data?: any): Promise<any> {
    return this.client.post(`/api/v1/jobs/${id}/trigger`, data || {});
  }

  async enable(id: string): Promise<Job> {
    return this.client.post<Job>(`/api/v1/jobs/${id}/enable`, {});
  }

  async disable(id: string): Promise<Job> {
    return this.client.post<Job>(`/api/v1/jobs/${id}/disable`, {});
  }
}
