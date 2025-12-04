/**
 * Team service - handles all team-related API calls
 */

import type { BaseClient } from '../base-client.js';
import type { Team } from '../../types/api.js';
import type { PaginationParams } from '../../types/client.js';

export class TeamService {
  constructor(private client: BaseClient) {}

  async list(params?: PaginationParams): Promise<Team[]> {
    return this.client.get<Team[]>('/api/v1/teams', { params });
  }

  async get(id: string): Promise<Team> {
    return this.client.get<Team>(`/api/v1/teams/${id}`);
  }

  async create(data: any): Promise<Team> {
    return this.client.post<Team>('/api/v1/teams', data);
  }

  async update(id: string, data: any): Promise<Team> {
    return this.client.patch<Team>(`/api/v1/teams/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await this.client.delete(`/api/v1/teams/${id}`);
  }

  async execute(id: string, data: any): Promise<any> {
    return this.client.post(`/api/v1/teams/${id}/execute`, data);
  }
}
