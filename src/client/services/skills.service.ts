/**
 * Skill service - handles all skill/toolset-related API calls
 */

import type { BaseClient } from '../base-client.js';
import type { Skill } from '../../types/api.js';

export class SkillService {
  constructor(private client: BaseClient) {}

  async list(): Promise<Skill[]> {
    return this.client.get<Skill[]>('/api/v1/skills');
  }

  async get(id: string): Promise<Skill> {
    return this.client.get<Skill>(`/api/v1/skills/${id}`);
  }

  async create(data: any): Promise<Skill> {
    return this.client.post<Skill>('/api/v1/skills', data);
  }

  async update(id: string, data: any): Promise<Skill> {
    return this.client.patch<Skill>(`/api/v1/skills/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await this.client.delete(`/api/v1/skills/${id}`);
  }
}
