/**
 * Test Fixtures
 *
 * Contains mock data and factory functions for creating test objects.
 * These fixtures represent realistic data that matches API responses.
 */

import type { Agent, Team, Environment, Project, Skill, Policy, Job, WorkerQueue, Execution, Workflow } from '../../src/types/api.js';

// ============================================================================
// UUID Generator for consistent test IDs
// ============================================================================

let idCounter = 0;
export function generateTestId(prefix: string = 'test'): string {
  return `${prefix}-${++idCounter}-${Date.now()}`;
}

export function resetIdCounter(): void {
  idCounter = 0;
}

// ============================================================================
// Agent Fixtures
// ============================================================================

export function createMockAgent(overrides: Partial<Agent> = {}): Agent {
  const id = overrides.id || generateTestId('agent');
  return {
    id,
    organization_id: 'org-test-123',
    name: `Test Agent ${id}`,
    description: 'A test agent for unit testing',
    instructions: 'You are a helpful test assistant.',
    image: 'test-image:latest',
    model: 'gpt-4',
    runtime: 'default',
    runner: { type: 'default' },
    runner_name: 'default-runner',
    team_id: undefined,
    status: 'active',
    secrets: ['SECRET_KEY'],
    environment_variables: { NODE_ENV: 'test' },
    integrations: [],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    projects: [],
    environments: [],
    skills: [],
    ...overrides,
  };
}

export const mockAgents: Agent[] = [
  createMockAgent({ id: 'agent-1', name: 'Production Agent', status: 'active' }),
  createMockAgent({ id: 'agent-2', name: 'Development Agent', status: 'active' }),
  createMockAgent({ id: 'agent-3', name: 'Staging Agent', status: 'inactive' }),
];

// ============================================================================
// Team Fixtures
// ============================================================================

export function createMockTeam(overrides: Partial<Team> = {}): Team {
  const id = overrides.id || generateTestId('team');
  return {
    id,
    organization_id: 'org-test-123',
    name: `Test Team ${id}`,
    description: 'A test team for unit testing',
    members: ['agent-1', 'agent-2'],
    skills: [],
    runner: { type: 'default' },
    communication: { mode: 'async' },
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

export const mockTeams: Team[] = [
  createMockTeam({ id: 'team-1', name: 'Engineering Team' }),
  createMockTeam({ id: 'team-2', name: 'Support Team' }),
];

// ============================================================================
// Environment Fixtures
// ============================================================================

export function createMockEnvironment(overrides: Partial<Environment> = {}): Environment {
  const id = overrides.id || generateTestId('env');
  return {
    id,
    organization_id: 'org-test-123',
    name: `test-environment-${id}`,
    display_name: `Test Environment ${id}`,
    description: 'A test environment for unit testing',
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

export const mockEnvironments: Environment[] = [
  createMockEnvironment({ id: 'env-1', name: 'production', display_name: 'Production' }),
  createMockEnvironment({ id: 'env-2', name: 'staging', display_name: 'Staging' }),
  createMockEnvironment({ id: 'env-3', name: 'development', display_name: 'Development' }),
];

// ============================================================================
// Project Fixtures
// ============================================================================

export function createMockProject(overrides: Partial<Project> = {}): Project {
  const id = overrides.id || generateTestId('proj');
  return {
    id,
    organization_id: 'org-test-123',
    name: `Test Project ${id}`,
    key: `PROJ${id.slice(-3).toUpperCase()}`,
    description: 'A test project for unit testing',
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

export const mockProjects: Project[] = [
  createMockProject({ id: 'proj-1', name: 'Main Project', key: 'MAIN' }),
  createMockProject({ id: 'proj-2', name: 'Secondary Project', key: 'SEC' }),
];

// ============================================================================
// Skill Fixtures
// ============================================================================

export function createMockSkill(overrides: Partial<Skill> = {}): Skill {
  const id = overrides.id || generateTestId('skill');
  return {
    id,
    organization_id: 'org-test-123',
    name: `Test Skill ${id}`,
    description: 'A test skill for unit testing',
    type: 'file_system',
    enabled: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

export const mockSkills: Skill[] = [
  createMockSkill({ id: 'skill-1', name: 'File System', type: 'file_system' }),
  createMockSkill({ id: 'skill-2', name: 'Shell Commands', type: 'shell' }),
  createMockSkill({ id: 'skill-3', name: 'Docker', type: 'docker', enabled: false }),
];

// ============================================================================
// Policy Fixtures
// ============================================================================

export function createMockPolicy(overrides: Partial<Policy> = {}): Policy {
  const id = overrides.id || generateTestId('policy');
  return {
    id,
    organization_id: 'org-test-123',
    name: `Test Policy ${id}`,
    description: 'A test policy for unit testing',
    policy_type: 'access_control',
    rules: { allow: ['read'], deny: ['delete'] },
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

export const mockPolicies: Policy[] = [
  createMockPolicy({ id: 'policy-1', name: 'Read Only Policy', policy_type: 'access_control' }),
  createMockPolicy({ id: 'policy-2', name: 'Admin Policy', policy_type: 'admin' }),
];

// ============================================================================
// Job Fixtures
// ============================================================================

export function createMockJob(overrides: Partial<Job> = {}): Job {
  const id = overrides.id || generateTestId('job');
  return {
    id,
    organization_id: 'org-test-123',
    name: `Test Job ${id}`,
    description: 'A test job for unit testing',
    entity_type: 'agent',
    entity_id: 'agent-1',
    schedule: '0 9 * * *',
    trigger_type: 'cron',
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

export const mockJobs: Job[] = [
  createMockJob({ id: 'job-1', name: 'Daily Report', trigger_type: 'cron', schedule: '0 9 * * *' }),
  createMockJob({ id: 'job-2', name: 'Webhook Handler', trigger_type: 'webhook', schedule: undefined }),
  createMockJob({ id: 'job-3', name: 'Manual Task', trigger_type: 'manual', schedule: undefined }),
];

// ============================================================================
// Worker Queue Fixtures
// ============================================================================

export function createMockWorkerQueue(overrides: Partial<WorkerQueue> = {}): WorkerQueue {
  const id = overrides.id || generateTestId('queue');
  return {
    id,
    organization_id: 'org-test-123',
    environment_id: 'env-1',
    name: `test-queue-${id}`,
    display_name: `Test Queue ${id}`,
    description: 'A test worker queue for unit testing',
    status: 'active',
    max_workers: 10,
    heartbeat_interval: 60,
    tags: ['test', 'unit'],
    settings: {},
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    active_workers: 3,
    task_queue_name: `task-queue-${id}`,
    ...overrides,
  };
}

export const mockWorkerQueues: WorkerQueue[] = [
  createMockWorkerQueue({ id: 'queue-1', name: 'default-queue', active_workers: 5 }),
  createMockWorkerQueue({ id: 'queue-2', name: 'high-priority-queue', max_workers: 20 }),
];

// ============================================================================
// Execution Fixtures
// ============================================================================

export function createMockExecution(overrides: Partial<Execution> = {}): Execution {
  const id = overrides.id || generateTestId('exec');
  return {
    id,
    organization_id: 'org-test-123',
    execution_type: 'agent',
    entity_id: 'agent-1',
    entity_name: 'Test Agent',
    prompt: 'Test prompt for execution',
    status: 'completed',
    response: 'Test response from execution',
    error_message: undefined,
    usage: { tokens: 100, cost: 0.01 },
    created_at: '2025-01-01T00:00:00Z',
    started_at: '2025-01-01T00:00:01Z',
    completed_at: '2025-01-01T00:00:10Z',
    updated_at: '2025-01-01T00:00:10Z',
    ...overrides,
  };
}

export const mockExecutions: Execution[] = [
  createMockExecution({ id: 'exec-1', status: 'completed' }),
  createMockExecution({ id: 'exec-2', status: 'running', completed_at: undefined }),
  createMockExecution({ id: 'exec-3', status: 'failed', error_message: 'Test error' }),
];

// ============================================================================
// Workflow Fixtures
// ============================================================================

export function createMockWorkflow(overrides: Partial<Workflow> = {}): Workflow {
  const id = overrides.id || generateTestId('workflow');
  return {
    id,
    name: `Test Workflow ${id}`,
    description: 'A test workflow for unit testing',
    status: 'active',
    steps: [
      { id: 'step-1', name: 'Step 1', type: 'action' },
      { id: 'step-2', name: 'Step 2', type: 'action' },
    ],
    configuration: { timeout: 300 },
    team_id: undefined,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

export const mockWorkflows: Workflow[] = [
  createMockWorkflow({ id: 'workflow-1', name: 'CI/CD Pipeline' }),
  createMockWorkflow({ id: 'workflow-2', name: 'Data Processing' }),
];

// ============================================================================
// Error Response Fixtures
// ============================================================================

export const mockErrorResponses = {
  badRequest: {
    status: 400,
    data: { detail: 'Invalid request parameters' },
  },
  unauthorized: {
    status: 401,
    data: { detail: 'Invalid or expired API key' },
  },
  forbidden: {
    status: 403,
    data: { detail: 'Access denied to this resource' },
  },
  notFound: {
    status: 404,
    data: { detail: 'Resource not found' },
  },
  conflict: {
    status: 409,
    data: { detail: 'Resource already exists' },
  },
  rateLimited: {
    status: 429,
    data: { detail: 'Rate limit exceeded' },
    headers: { 'retry-after': '60' },
  },
  serverError: {
    status: 500,
    data: { detail: 'Internal server error' },
  },
};

// ============================================================================
// Mock Client Factory
// ============================================================================

export function createMockClient() {
  return {
    agents: {
      list: vi.fn().mockResolvedValue(mockAgents),
      get: vi.fn().mockResolvedValue(mockAgents[0]),
      create: vi.fn().mockImplementation((data) => Promise.resolve(createMockAgent(data))),
      update: vi.fn().mockImplementation((id, data) => Promise.resolve({ ...mockAgents[0], ...data, id })),
      delete: vi.fn().mockResolvedValue(undefined),
      execute: vi.fn().mockResolvedValue({ execution_id: 'exec-new' }),
    },
    teams: {
      list: vi.fn().mockResolvedValue(mockTeams),
      get: vi.fn().mockResolvedValue(mockTeams[0]),
      create: vi.fn().mockImplementation((data) => Promise.resolve(createMockTeam(data))),
      update: vi.fn().mockImplementation((id, data) => Promise.resolve({ ...mockTeams[0], ...data, id })),
      delete: vi.fn().mockResolvedValue(undefined),
      execute: vi.fn().mockResolvedValue({ execution_id: 'exec-new' }),
    },
    environments: {
      list: vi.fn().mockResolvedValue(mockEnvironments),
      get: vi.fn().mockResolvedValue(mockEnvironments[0]),
      create: vi.fn().mockImplementation((data) => Promise.resolve(createMockEnvironment(data))),
      update: vi.fn().mockImplementation((id, data) => Promise.resolve({ ...mockEnvironments[0], ...data, id })),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    projects: {
      list: vi.fn().mockResolvedValue(mockProjects),
      get: vi.fn().mockResolvedValue(mockProjects[0]),
      create: vi.fn().mockImplementation((data) => Promise.resolve(createMockProject(data))),
      update: vi.fn().mockImplementation((id, data) => Promise.resolve({ ...mockProjects[0], ...data, id })),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    skills: {
      list: vi.fn().mockResolvedValue(mockSkills),
      get: vi.fn().mockResolvedValue(mockSkills[0]),
      create: vi.fn().mockImplementation((data) => Promise.resolve(createMockSkill(data))),
      update: vi.fn().mockImplementation((id, data) => Promise.resolve({ ...mockSkills[0], ...data, id })),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    policies: {
      list: vi.fn().mockResolvedValue(mockPolicies),
      get: vi.fn().mockResolvedValue(mockPolicies[0]),
      create: vi.fn().mockImplementation((data) => Promise.resolve(createMockPolicy(data))),
      update: vi.fn().mockImplementation((id, data) => Promise.resolve({ ...mockPolicies[0], ...data, id })),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    jobs: {
      list: vi.fn().mockResolvedValue(mockJobs),
      get: vi.fn().mockResolvedValue(mockJobs[0]),
      create: vi.fn().mockImplementation((data) => Promise.resolve(createMockJob(data))),
      update: vi.fn().mockImplementation((id, data) => Promise.resolve({ ...mockJobs[0], ...data, id })),
      delete: vi.fn().mockResolvedValue(undefined),
      trigger: vi.fn().mockResolvedValue({ execution_id: 'exec-triggered' }),
      enable: vi.fn().mockResolvedValue({ ...mockJobs[0], status: 'active' }),
      disable: vi.fn().mockResolvedValue({ ...mockJobs[0], status: 'inactive' }),
    },
    workerQueues: {
      list: vi.fn().mockResolvedValue(mockWorkerQueues),
      listByEnvironment: vi.fn().mockResolvedValue(mockWorkerQueues),
      get: vi.fn().mockResolvedValue(mockWorkerQueues[0]),
      create: vi.fn().mockImplementation((envId, data) => Promise.resolve(createMockWorkerQueue({ ...data, environment_id: envId }))),
      update: vi.fn().mockImplementation((id, data) => Promise.resolve({ ...mockWorkerQueues[0], ...data, id })),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    executions: {
      list: vi.fn().mockResolvedValue(mockExecutions),
      get: vi.fn().mockResolvedValue(mockExecutions[0]),
      getMessages: vi.fn().mockResolvedValue([{ role: 'assistant', content: 'Test message' }]),
      getEvents: vi.fn().mockResolvedValue([{ type: 'message', data: 'Test event' }]),
    },
    workflows: {
      list: vi.fn().mockResolvedValue(mockWorkflows),
      get: vi.fn().mockResolvedValue(mockWorkflows[0]),
      create: vi.fn().mockImplementation((data) => Promise.resolve(createMockWorkflow(data))),
    },
    system: {
      healthCheck: vi.fn().mockResolvedValue({ status: 'healthy', timestamp: new Date().toISOString() }),
      listModels: vi.fn().mockResolvedValue([
        { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
        { id: 'claude-3', name: 'Claude 3', provider: 'anthropic' },
      ]),
    },
  };
}

// Import vi for mock functions
import { vi } from 'vitest';
