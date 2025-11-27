/**
 * Main API client with all domain services
 */

import type { ServerConfig } from '../types/config.js';
import { BaseClient } from './base-client.js';
import { AgentService } from './services/agents.service.js';
import { TeamService } from './services/teams.service.js';
import { WorkflowService } from './services/workflows.service.js';
import { ExecutionService } from './services/executions.service.js';
import { SystemService } from './services/system.service.js';
import { WorkerQueuesService } from './services/worker-queues.service.js';

export class ControlPlaneClient {
  public agents: AgentService;
  public teams: TeamService;
  public workflows: WorkflowService;
  public executions: ExecutionService;
  public system: SystemService;
  public workerQueues: WorkerQueuesService;
  private baseClient: BaseClient;

  constructor(config: ServerConfig) {
    this.baseClient = new BaseClient(config);

    this.agents = new AgentService(this.baseClient);
    this.teams = new TeamService(this.baseClient);
    this.workflows = new WorkflowService(this.baseClient);
    this.executions = new ExecutionService(this.baseClient);
    this.system = new SystemService(this.baseClient);
    this.workerQueues = new WorkerQueuesService(this.baseClient);
  }

  /**
   * Validate connection and authentication during startup
   */
  async validateConnection(): Promise<void> {
    await this.baseClient.validateConnection();
  }
}

export { BaseClient } from './base-client.js';
