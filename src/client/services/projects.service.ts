/**
 * Project service - handles all project-related API calls
 */

import type { BaseClient } from '../base-client.js';
import type { Project } from '../../types/api.js';

export interface ListProjectsParams {
  status_filter?: string;
}

export class ProjectService {
  constructor(private client: BaseClient) {}

  async list(params?: ListProjectsParams): Promise<Project[]> {
    return this.client.get<Project[]>('/api/v1/projects', { params });
  }

  async get(id: string): Promise<Project> {
    return this.client.get<Project>(`/api/v1/projects/${id}`);
  }

  async create(data: any): Promise<Project> {
    return this.client.post<Project>('/api/v1/projects', data);
  }

  async update(id: string, data: any): Promise<Project> {
    return this.client.patch<Project>(`/api/v1/projects/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await this.client.delete(`/api/v1/projects/${id}`);
  }
}
