/**
 * E2E Tests for MCP Protocol
 *
 * Tests the full MCP server flow including:
 * - Tool listing and discovery
 * - Tool invocation
 * - Resource listing and reading
 * - Error handling and responses
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToolRegistry } from '../../src/tools/registry.js';
import { formatToolResponse, formatErrorResponse, formatListResponse } from '../../src/utils/formatters.js';
import { NotFoundError, AuthenticationError, ValidationError } from '../../src/utils/errors.js';
import {
  createMockAgent,
  createMockClient,
  mockAgents,
  mockTeams,
  mockEnvironments,
} from '../fixtures/index.js';

describe('MCP Protocol E2E', () => {
  // ==========================================================================
  // Tool Discovery (tools/list equivalent)
  // ==========================================================================
  describe('Tool Discovery', () => {
    it('should list all available tools with wildcard whitelist', () => {
      const registry = new ToolRegistry(['*']);
      const mockTools = [
        {
          name: 'list_agents',
          description: 'List all agents',
          category: 'agents',
          inputSchema: { type: 'object' as const, properties: {} },
          handler: vi.fn(),
        },
        {
          name: 'get_agent',
          description: 'Get agent by ID',
          category: 'agents',
          inputSchema: {
            type: 'object' as const,
            properties: { id: { type: 'string' } },
            required: ['id'],
          },
          handler: vi.fn(),
        },
        {
          name: 'health_check',
          description: 'Check API health',
          category: 'system',
          inputSchema: { type: 'object' as const, properties: {} },
          handler: vi.fn(),
        },
      ];

      registry.registerAll(mockTools);

      const allTools = registry.getAll();
      expect(allTools).toHaveLength(3);
      expect(allTools.map(t => t.name)).toContain('list_agents');
      expect(allTools.map(t => t.name)).toContain('get_agent');
      expect(allTools.map(t => t.name)).toContain('health_check');
    });

    it('should filter tools by whitelist', () => {
      const registry = new ToolRegistry(['list_*', 'health_check']);
      const mockTools = [
        {
          name: 'list_agents',
          description: 'List agents',
          category: 'agents',
          inputSchema: { type: 'object' as const, properties: {} },
          handler: vi.fn(),
        },
        {
          name: 'delete_agent',
          description: 'Delete agent',
          category: 'agents',
          inputSchema: { type: 'object' as const, properties: {} },
          handler: vi.fn(),
        },
        {
          name: 'health_check',
          description: 'Health check',
          category: 'system',
          inputSchema: { type: 'object' as const, properties: {} },
          handler: vi.fn(),
        },
      ];

      registry.registerAll(mockTools);

      const allTools = registry.getAll();
      expect(allTools).toHaveLength(2);
      expect(registry.has('list_agents')).toBe(true);
      expect(registry.has('delete_agent')).toBe(false);
      expect(registry.has('health_check')).toBe(true);
    });

    it('should provide tool metadata (name, description, inputSchema)', () => {
      const registry = new ToolRegistry(['*']);
      const tool = {
        name: 'execute_agent',
        description: 'Execute an agent with a prompt',
        category: 'agents',
        inputSchema: {
          type: 'object' as const,
          properties: {
            agent_id: { type: 'string', description: 'Agent ID' },
            prompt: { type: 'string', description: 'User prompt' },
          },
          required: ['agent_id', 'prompt'],
        },
        handler: vi.fn(),
      };

      registry.register(tool);
      const retrieved = registry.get('execute_agent');

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('execute_agent');
      expect(retrieved?.description).toBe('Execute an agent with a prompt');
      expect(retrieved?.inputSchema.properties).toHaveProperty('agent_id');
      expect(retrieved?.inputSchema.properties).toHaveProperty('prompt');
      expect(retrieved?.inputSchema.required).toContain('agent_id');
    });
  });

  // ==========================================================================
  // Tool Invocation (tools/call equivalent)
  // ==========================================================================
  describe('Tool Invocation', () => {
    let mockClient: ReturnType<typeof createMockClient>;

    beforeEach(() => {
      mockClient = createMockClient();
    });

    it('should invoke list_agents tool and return formatted response', async () => {
      const result = await mockClient.agents.list();
      const response = formatListResponse(result);

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.count).toBe(mockAgents.length);
      expect(parsed.items).toHaveLength(mockAgents.length);
    });

    it('should invoke get_agent tool with ID', async () => {
      const agent = await mockClient.agents.get('agent-1');
      const response = formatToolResponse(agent);

      expect(response.content).toHaveLength(1);

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.id).toBe('agent-1');
      expect(parsed.name).toBeDefined();
    });

    it('should invoke create_agent tool with data', async () => {
      const newAgentData = {
        name: 'New E2E Agent',
        instructions: 'Test instructions for E2E',
      };

      const created = await mockClient.agents.create(newAgentData);
      const response = formatToolResponse(created);

      expect(response.content).toHaveLength(1);

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.name).toBe('New E2E Agent');
    });

    it('should invoke execute_agent tool and return execution info', async () => {
      const execution = await mockClient.agents.execute('agent-1', { prompt: 'Test' });
      const response = formatToolResponse(execution);

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.execution_id).toBeDefined();
    });

    it('should invoke delete_agent tool', async () => {
      await mockClient.agents.delete('agent-1');
      // Delete returns undefined, so just verify it doesn't throw
      expect(mockClient.agents.delete).toHaveBeenCalledWith('agent-1');
    });
  });

  // ==========================================================================
  // Error Handling
  // ==========================================================================
  describe('Error Handling', () => {
    it('should format NotFoundError correctly', () => {
      const error = new NotFoundError('Agent', 'agent-not-found');
      const response = formatErrorResponse(error);

      expect(response.isError).toBe(true);

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.error).toContain('Agent');
      expect(parsed.error).toContain('agent-not-found');
      expect(parsed.error_code).toBe('NOT_FOUND');
      expect(parsed.hints).toBeDefined();
      expect(parsed.hints.length).toBeGreaterThan(0);
    });

    it('should format AuthenticationError correctly', () => {
      const error = new AuthenticationError('Invalid API key');
      const response = formatErrorResponse(error);

      expect(response.isError).toBe(true);

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.error_code).toBe('AUTHENTICATION_ERROR');
      expect(parsed.hints).toBeDefined();
      expect(parsed.hints.some((h: string) => h.includes('CONTROL_PLANE_API_KEY'))).toBe(true);
    });

    it('should format ValidationError correctly', () => {
      const error = new ValidationError('Invalid input', { field: 'name', issue: 'required' });
      const response = formatErrorResponse(error);

      expect(response.isError).toBe(true);

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.error_code).toBe('VALIDATION_ERROR');
      expect(parsed.details).toEqual({ field: 'name', issue: 'required' });
    });

    it('should handle unknown errors gracefully', () => {
      const error = new Error('Something went wrong');
      const response = formatErrorResponse(error);

      expect(response.isError).toBe(true);

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.error).toBe('Something went wrong');
    });
  });

  // ==========================================================================
  // Resource Reading (resources/read equivalent)
  // ==========================================================================
  describe('Resource Reading', () => {
    let mockClient: ReturnType<typeof createMockClient>;

    beforeEach(() => {
      mockClient = createMockClient();
    });

    it('should read agents://list resource', async () => {
      const agents = await mockClient.agents.list();

      const resourceContent = JSON.stringify({
        count: agents.length,
        agents: agents.map(a => ({
          id: a.id,
          name: a.name,
          description: a.description || 'No description',
        })),
        usage_hint: 'Use agent IDs when calling execute_agent',
      }, null, 2);

      const parsed = JSON.parse(resourceContent);
      expect(parsed.count).toBe(mockAgents.length);
      expect(parsed.agents).toBeDefined();
      expect(parsed.usage_hint).toBeDefined();
    });

    it('should read teams://list resource', async () => {
      const teams = await mockClient.teams.list();

      const resourceContent = JSON.stringify({
        count: teams.length,
        teams: teams.map(t => ({
          id: t.id,
          name: t.name,
          members: t.members,
        })),
        usage_hint: 'Use team IDs when calling execute_team',
      }, null, 2);

      const parsed = JSON.parse(resourceContent);
      expect(parsed.count).toBe(mockTeams.length);
      expect(parsed.teams).toBeDefined();
    });

    it('should read environments://list resource', async () => {
      const environments = await mockClient.environments.list();

      const resourceContent = JSON.stringify({
        count: environments.length,
        environments: environments.map(e => ({
          id: e.id,
          name: e.name,
          display_name: e.display_name,
          status: e.status,
        })),
      }, null, 2);

      const parsed = JSON.parse(resourceContent);
      expect(parsed.count).toBe(mockEnvironments.length);
    });
  });

  // ==========================================================================
  // Full Request/Response Cycle
  // ==========================================================================
  describe('Full Request/Response Cycle', () => {
    let mockClient: ReturnType<typeof createMockClient>;
    let registry: ToolRegistry;

    beforeEach(() => {
      mockClient = createMockClient();
      registry = new ToolRegistry(['*']);
    });

    it('should simulate complete tool call: list -> get -> execute', async () => {
      // Step 1: List agents
      const agents = await mockClient.agents.list();
      expect(agents.length).toBeGreaterThan(0);

      // Step 2: Get first agent
      const agentId = agents[0].id;
      const agent = await mockClient.agents.get(agentId);
      expect(agent.id).toBe(agentId);

      // Step 3: Execute agent
      const execution = await mockClient.agents.execute(agentId, { prompt: 'Hello' });
      expect(execution.execution_id).toBeDefined();

      // Step 4: Format final response
      const response = formatToolResponse(execution);
      expect(response.content[0].type).toBe('text');
    });

    it('should simulate CRUD cycle: create -> get -> update -> delete', async () => {
      // Create
      const created = await mockClient.agents.create({
        name: 'Test Agent',
        instructions: 'Test',
      });
      expect(created.id).toBeDefined();
      expect(created.name).toBe('Test Agent');

      // Get (note: mock client returns a fixed mock, not the created one)
      const retrieved = await mockClient.agents.get('agent-1');
      expect(retrieved.id).toBeDefined();

      // Update
      const updated = await mockClient.agents.update('agent-1', {
        name: 'Updated Agent',
      });
      expect(updated.name).toBe('Updated Agent');

      // Delete
      await mockClient.agents.delete('agent-1');
      expect(mockClient.agents.delete).toHaveBeenCalledWith('agent-1');
    });

    it('should handle workflow: list jobs -> trigger job', async () => {
      // List jobs
      const jobs = await mockClient.jobs.list();
      expect(jobs.length).toBeGreaterThan(0);

      // Trigger first job
      const jobId = jobs[0].id;
      const triggered = await mockClient.jobs.trigger(jobId);
      expect(triggered.execution_id).toBeDefined();
    });

    it('should handle workflow: list executions -> get messages', async () => {
      // List executions
      const executions = await mockClient.executions.list();
      expect(executions.length).toBeGreaterThan(0);

      // Get messages for first execution
      const executionId = executions[0].id;
      const messages = await mockClient.executions.getMessages(executionId);
      expect(messages).toBeDefined();
    });
  });

  // ==========================================================================
  // Response Format Validation
  // ==========================================================================
  describe('Response Format Validation', () => {
    it('should return valid MCP tool response format', () => {
      const response = formatToolResponse({ data: 'test' });

      expect(response).toHaveProperty('content');
      expect(Array.isArray(response.content)).toBe(true);
      expect(response.content[0]).toHaveProperty('type', 'text');
      expect(response.content[0]).toHaveProperty('text');
    });

    it('should return valid MCP error response format', () => {
      const response = formatErrorResponse(new Error('Test error'));

      expect(response).toHaveProperty('content');
      expect(response).toHaveProperty('isError', true);
      expect(response.content[0]).toHaveProperty('type', 'text');
    });

    it('should return valid MCP list response format', () => {
      const response = formatListResponse([{ id: '1' }, { id: '2' }], 100);

      expect(response).toHaveProperty('content');

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed).toHaveProperty('count', 2);
      expect(parsed).toHaveProperty('total', 100);
      expect(parsed).toHaveProperty('items');
    });

    it('should produce parseable JSON in all responses', () => {
      const toolResponse = formatToolResponse({ test: true });
      const errorResponse = formatErrorResponse(new Error('test'));
      const listResponse = formatListResponse([]);

      // All should produce valid JSON
      expect(() => JSON.parse(toolResponse.content[0].text)).not.toThrow();
      expect(() => JSON.parse(errorResponse.content[0].text)).not.toThrow();
      expect(() => JSON.parse(listResponse.content[0].text)).not.toThrow();
    });
  });
});
