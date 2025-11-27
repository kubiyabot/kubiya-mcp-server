/**
 * System service - handles health checks and system-level API calls
 */

import type { BaseClient } from '../base-client.js';
import type { HealthStatus, LLMModel } from '../../types/api.js';

export class SystemService {
  constructor(private client: BaseClient) {}

  async health(): Promise<HealthStatus> {
    return this.client.get<HealthStatus>('/api/health');
  }

  async listModels(): Promise<LLMModel[]> {
    return this.client.get<LLMModel[]>('/api/v1/models');
  }
}
