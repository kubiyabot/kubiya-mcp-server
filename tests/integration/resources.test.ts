/**
 * Integration Tests for MCP Resources
 *
 * Tests for all resource handlers including:
 * - agents://list
 * - teams://list
 * - worker-queues://list
 * - environments://list
 * - projects://list
 * - skills://list
 * - policies://list
 * - jobs://list
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { agentsListResource } from '../../src/resources/agents-list.js';
import { teamsListResource } from '../../src/resources/teams-list.js';
import { workerQueuesListResource } from '../../src/resources/worker-queues-list.js';
import { environmentsListResource } from '../../src/resources/environments-list.js';
import { projectsListResource } from '../../src/resources/projects-list.js';
import { skillsListResource } from '../../src/resources/skills-list.js';
import { policiesListResource } from '../../src/resources/policies-list.js';
import { jobsListResource } from '../../src/resources/jobs-list.js';
import {
  mockAgents,
  mockTeams,
  mockWorkerQueues,
  mockEnvironments,
  mockProjects,
  mockSkills,
  mockPolicies,
  mockJobs,
} from '../fixtures/index.js';

describe('MCP Resources Integration', () => {
  // ==========================================================================
  // agents://list
  // ==========================================================================
  describe('agentsListResource', () => {
    it('should have correct resource definition', () => {
      expect(agentsListResource.uri).toBe('agents://list');
      expect(agentsListResource.name).toBe('Available Agents');
      expect(agentsListResource.mimeType).toBe('application/json');
    });

    it('should return formatted agents list', async () => {
      const mockClient = {
        agents: {
          list: vi.fn().mockResolvedValue(mockAgents),
        },
      };

      const result = await agentsListResource.handler(mockClient as any);
      const parsed = JSON.parse(result);

      expect(mockClient.agents.list).toHaveBeenCalledWith({ skip: 0, limit: 100 });
      expect(parsed.count).toBe(mockAgents.length);
      expect(parsed.agents).toHaveLength(mockAgents.length);
      expect(parsed.usage_hint).toContain('execute_agent');
    });

    it('should handle empty agents list', async () => {
      const mockClient = {
        agents: {
          list: vi.fn().mockResolvedValue([]),
        },
      };

      const result = await agentsListResource.handler(mockClient as any);
      const parsed = JSON.parse(result);

      expect(parsed.count).toBe(0);
      expect(parsed.agents).toEqual([]);
    });

    it('should format agent properties correctly', async () => {
      const mockClient = {
        agents: {
          list: vi.fn().mockResolvedValue([mockAgents[0]]),
        },
      };

      const result = await agentsListResource.handler(mockClient as any);
      const parsed = JSON.parse(result);
      const agent = parsed.agents[0];

      expect(agent.id).toBe(mockAgents[0].id);
      expect(agent.name).toBe(mockAgents[0].name);
      expect(agent.description).toBeDefined();
    });

    it('should propagate API errors', async () => {
      const mockClient = {
        agents: {
          list: vi.fn().mockRejectedValue(new Error('API Error')),
        },
      };

      await expect(agentsListResource.handler(mockClient as any)).rejects.toThrow('API Error');
    });
  });

  // ==========================================================================
  // teams://list
  // ==========================================================================
  describe('teamsListResource', () => {
    it('should have correct resource definition', () => {
      expect(teamsListResource.uri).toBe('teams://list');
      expect(teamsListResource.name).toBe('Available Teams');
      expect(teamsListResource.mimeType).toBe('application/json');
    });

    it('should return formatted teams list', async () => {
      const mockClient = {
        teams: {
          list: vi.fn().mockResolvedValue(mockTeams),
        },
      };

      const result = await teamsListResource.handler(mockClient as any);
      const parsed = JSON.parse(result);

      expect(parsed.count).toBe(mockTeams.length);
      expect(parsed.teams).toHaveLength(mockTeams.length);
      expect(parsed.usage_hint).toContain('execute_team');
    });

    it('should handle empty teams list', async () => {
      const mockClient = {
        teams: {
          list: vi.fn().mockResolvedValue([]),
        },
      };

      const result = await teamsListResource.handler(mockClient as any);
      const parsed = JSON.parse(result);

      expect(parsed.count).toBe(0);
    });
  });

  // ==========================================================================
  // worker-queues://list
  // ==========================================================================
  describe('workerQueuesListResource', () => {
    it('should have correct resource definition', () => {
      expect(workerQueuesListResource.uri).toBe('worker-queues://list');
      expect(workerQueuesListResource.name).toBe('Available Worker Queues');
      expect(workerQueuesListResource.mimeType).toBe('application/json');
    });

    it('should return formatted worker queues list', async () => {
      const mockClient = {
        workerQueues: {
          list: vi.fn().mockResolvedValue(mockWorkerQueues),
        },
      };

      const result = await workerQueuesListResource.handler(mockClient as any);
      const parsed = JSON.parse(result);

      expect(parsed.count).toBe(mockWorkerQueues.length);
      expect(parsed.worker_queues).toHaveLength(mockWorkerQueues.length);
    });

    it('should include active workers in response', async () => {
      const mockClient = {
        workerQueues: {
          list: vi.fn().mockResolvedValue(mockWorkerQueues),
        },
      };

      const result = await workerQueuesListResource.handler(mockClient as any);
      const parsed = JSON.parse(result);

      expect(parsed.worker_queues[0].active_workers).toBeDefined();
    });
  });

  // ==========================================================================
  // environments://list
  // ==========================================================================
  describe('environmentsListResource', () => {
    it('should have correct resource definition', () => {
      expect(environmentsListResource.uri).toBe('environments://list');
      expect(environmentsListResource.name).toBe('Available Environments');
      expect(environmentsListResource.mimeType).toBe('application/json');
    });

    it('should return formatted environments list', async () => {
      const mockClient = {
        environments: {
          list: vi.fn().mockResolvedValue(mockEnvironments),
        },
      };

      const result = await environmentsListResource.handler(mockClient as any);
      const parsed = JSON.parse(result);

      expect(parsed.count).toBe(mockEnvironments.length);
      expect(parsed.environments).toHaveLength(mockEnvironments.length);
    });

    it('should handle empty environments list', async () => {
      const mockClient = {
        environments: {
          list: vi.fn().mockResolvedValue([]),
        },
      };

      const result = await environmentsListResource.handler(mockClient as any);
      const parsed = JSON.parse(result);

      expect(parsed.count).toBe(0);
      expect(parsed.environments).toEqual([]);
    });
  });

  // ==========================================================================
  // projects://list
  // ==========================================================================
  describe('projectsListResource', () => {
    it('should have correct resource definition', () => {
      expect(projectsListResource.uri).toBe('projects://list');
      expect(projectsListResource.name).toBe('Available Projects');
      expect(projectsListResource.mimeType).toBe('application/json');
    });

    it('should return formatted projects list', async () => {
      const mockClient = {
        projects: {
          list: vi.fn().mockResolvedValue(mockProjects),
        },
      };

      const result = await projectsListResource.handler(mockClient as any);
      const parsed = JSON.parse(result);

      expect(parsed.count).toBe(mockProjects.length);
      expect(parsed.projects).toHaveLength(mockProjects.length);
    });

    it('should include project keys in response', async () => {
      const mockClient = {
        projects: {
          list: vi.fn().mockResolvedValue(mockProjects),
        },
      };

      const result = await projectsListResource.handler(mockClient as any);
      const parsed = JSON.parse(result);

      expect(parsed.projects[0].key).toBeDefined();
    });
  });

  // ==========================================================================
  // skills://list
  // ==========================================================================
  describe('skillsListResource', () => {
    it('should have correct resource definition', () => {
      expect(skillsListResource.uri).toBe('skills://list');
      expect(skillsListResource.name).toBe('Available Skills');
      expect(skillsListResource.mimeType).toBe('application/json');
    });

    it('should return formatted skills list', async () => {
      const mockClient = {
        skills: {
          list: vi.fn().mockResolvedValue(mockSkills),
        },
      };

      const result = await skillsListResource.handler(mockClient as any);
      const parsed = JSON.parse(result);

      expect(parsed.count).toBe(mockSkills.length);
      expect(parsed.skills).toHaveLength(mockSkills.length);
    });

    it('should include enabled status', async () => {
      const mockClient = {
        skills: {
          list: vi.fn().mockResolvedValue(mockSkills),
        },
      };

      const result = await skillsListResource.handler(mockClient as any);
      const parsed = JSON.parse(result);

      // At least one skill should have enabled property
      expect(parsed.skills.some((s: any) => s.enabled !== undefined)).toBe(true);
    });
  });

  // ==========================================================================
  // policies://list
  // ==========================================================================
  describe('policiesListResource', () => {
    it('should have correct resource definition', () => {
      expect(policiesListResource.uri).toBe('policies://list');
      expect(policiesListResource.name).toBe('Available Policies');
      expect(policiesListResource.mimeType).toBe('application/json');
    });

    it('should return formatted policies list', async () => {
      const mockClient = {
        policies: {
          list: vi.fn().mockResolvedValue(mockPolicies),
        },
      };

      const result = await policiesListResource.handler(mockClient as any);
      const parsed = JSON.parse(result);

      expect(parsed.count).toBe(mockPolicies.length);
      expect(parsed.policies).toHaveLength(mockPolicies.length);
    });
  });

  // ==========================================================================
  // jobs://list
  // ==========================================================================
  describe('jobsListResource', () => {
    it('should have correct resource definition', () => {
      expect(jobsListResource.uri).toBe('jobs://list');
      expect(jobsListResource.name).toBe('Available Jobs');
      expect(jobsListResource.mimeType).toBe('application/json');
    });

    it('should return formatted jobs list', async () => {
      const mockClient = {
        jobs: {
          list: vi.fn().mockResolvedValue(mockJobs),
        },
      };

      const result = await jobsListResource.handler(mockClient as any);
      const parsed = JSON.parse(result);

      expect(parsed.count).toBe(mockJobs.length);
      expect(parsed.jobs).toHaveLength(mockJobs.length);
    });

    it('should include trigger_type in response', async () => {
      const mockClient = {
        jobs: {
          list: vi.fn().mockResolvedValue(mockJobs),
        },
      };

      const result = await jobsListResource.handler(mockClient as any);
      const parsed = JSON.parse(result);

      // Jobs should have trigger_type
      expect(parsed.jobs[0].trigger_type).toBeDefined();
    });
  });

  // ==========================================================================
  // Error Handling
  // ==========================================================================
  describe('error handling', () => {
    it('should propagate authentication errors', async () => {
      const mockClient = {
        agents: {
          list: vi.fn().mockRejectedValue(new Error('Authentication failed')),
        },
      };

      await expect(agentsListResource.handler(mockClient as any)).rejects.toThrow(
        'Authentication failed'
      );
    });

    it('should propagate network errors', async () => {
      const mockClient = {
        teams: {
          list: vi.fn().mockRejectedValue(new Error('Network error')),
        },
      };

      await expect(teamsListResource.handler(mockClient as any)).rejects.toThrow('Network error');
    });

    it('should propagate rate limit errors', async () => {
      const mockClient = {
        environments: {
          list: vi.fn().mockRejectedValue(new Error('Rate limit exceeded')),
        },
      };

      await expect(environmentsListResource.handler(mockClient as any)).rejects.toThrow(
        'Rate limit exceeded'
      );
    });
  });
});
