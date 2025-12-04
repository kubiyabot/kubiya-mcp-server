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
import { EnvironmentService } from './services/environments.service.js';
import { ProjectService } from './services/projects.service.js';
import { SkillService } from './services/skills.service.js';
import { PolicyService } from './services/policies.service.js';
import { JobService } from './services/jobs.service.js';

export class ControlPlaneClient {
  public agents: AgentService;
  public teams: TeamService;
  public workflows: WorkflowService;
  public executions: ExecutionService;
  public system: SystemService;
  public workerQueues: WorkerQueuesService;
  public environments: EnvironmentService;
  public projects: ProjectService;
  public skills: SkillService;
  public policies: PolicyService;
  public jobs: JobService;
  private baseClient: BaseClient;

  constructor(config: ServerConfig) {
    this.baseClient = new BaseClient(config);

    this.agents = new AgentService(this.baseClient);
    this.teams = new TeamService(this.baseClient);
    this.workflows = new WorkflowService(this.baseClient);
    this.executions = new ExecutionService(this.baseClient);
    this.system = new SystemService(this.baseClient);
    this.workerQueues = new WorkerQueuesService(this.baseClient);
    this.environments = new EnvironmentService(this.baseClient);
    this.projects = new ProjectService(this.baseClient);
    this.skills = new SkillService(this.baseClient);
    this.policies = new PolicyService(this.baseClient);
    this.jobs = new JobService(this.baseClient);
  }

  /**
   * Validate connection and authentication during startup
   */
  async validateConnection(): Promise<void> {
    await this.baseClient.validateConnection();
  }
}

export { BaseClient } from './base-client.js';
