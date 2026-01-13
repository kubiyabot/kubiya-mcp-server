/**
 * Agent Service Unit Tests
 *
 * Tests for the AgentService class including:
 * - list, get, create, update, delete, execute operations
 * - Proper URL construction
 * - Parameter passing
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentService } from '../../../src/client/services/agents.service.js';
import type { BaseClient } from '../../../src/client/base-client.js';
import { createMockAgent, mockAgents } from '../../fixtures/index.js';

describe('AgentService', () => {
  let service: AgentService;
  let mockClient: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };
    service = new AgentService(mockClient as unknown as BaseClient);
  });

  // ==========================================================================
  // list()
  // ==========================================================================
  describe('list', () => {
    it('should call GET /api/v1/agents', async () => {
      mockClient.get.mockResolvedValue(mockAgents);

      const result = await service.list();

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/agents', { params: undefined });
      expect(result).toEqual(mockAgents);
    });

    it('should pass pagination params', async () => {
      mockClient.get.mockResolvedValue(mockAgents);

      await service.list({ skip: 10, limit: 50 });

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/agents', {
        params: { skip: 10, limit: 50 },
      });
    });

    it('should return empty array when no agents', async () => {
      mockClient.get.mockResolvedValue([]);

      const result = await service.list();

      expect(result).toEqual([]);
    });

    it('should propagate errors from client', async () => {
      const error = new Error('API Error');
      mockClient.get.mockRejectedValue(error);

      await expect(service.list()).rejects.toThrow('API Error');
    });
  });

  // ==========================================================================
  // get()
  // ==========================================================================
  describe('get', () => {
    it('should call GET /api/v1/agents/{id}', async () => {
      const agent = mockAgents[0];
      mockClient.get.mockResolvedValue(agent);

      const result = await service.get('agent-1');

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/agents/agent-1');
      expect(result).toEqual(agent);
    });

    it('should handle special characters in id', async () => {
      mockClient.get.mockResolvedValue(mockAgents[0]);

      await service.get('agent-123-abc-456');

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/agents/agent-123-abc-456');
    });

    it('should propagate not found errors', async () => {
      const error = new Error('Agent not found');
      mockClient.get.mockRejectedValue(error);

      await expect(service.get('nonexistent')).rejects.toThrow('Agent not found');
    });
  });

  // ==========================================================================
  // create()
  // ==========================================================================
  describe('create', () => {
    it('should call POST /api/v1/agents with data', async () => {
      const newAgent = createMockAgent({ name: 'New Agent' });
      mockClient.post.mockResolvedValue(newAgent);

      const data = { name: 'New Agent', instructions: 'Test' };
      const result = await service.create(data);

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/agents', data);
      expect(result.name).toBe('New Agent');
    });

    it('should pass all agent fields', async () => {
      const fullData = {
        name: 'Full Agent',
        description: 'Description',
        instructions: 'Instructions',
        model: 'gpt-4',
        runtime: 'default',
        runner_name: 'runner',
      };
      mockClient.post.mockResolvedValue(createMockAgent(fullData));

      await service.create(fullData);

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/agents', fullData);
    });

    it('should propagate validation errors', async () => {
      const error = new Error('Validation failed');
      mockClient.post.mockRejectedValue(error);

      await expect(service.create({ name: '' })).rejects.toThrow('Validation failed');
    });
  });

  // ==========================================================================
  // update()
  // ==========================================================================
  describe('update', () => {
    it('should call PATCH /api/v1/agents/{id} with data', async () => {
      const updated = { ...mockAgents[0], name: 'Updated' };
      mockClient.patch.mockResolvedValue(updated);

      const result = await service.update('agent-1', { name: 'Updated' });

      expect(mockClient.patch).toHaveBeenCalledWith('/api/v1/agents/agent-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should allow partial updates', async () => {
      mockClient.patch.mockResolvedValue(mockAgents[0]);

      await service.update('agent-1', { description: 'New description' });

      expect(mockClient.patch).toHaveBeenCalledWith('/api/v1/agents/agent-1', {
        description: 'New description',
      });
    });

    it('should propagate not found errors', async () => {
      const error = new Error('Agent not found');
      mockClient.patch.mockRejectedValue(error);

      await expect(service.update('nonexistent', {})).rejects.toThrow('Agent not found');
    });
  });

  // ==========================================================================
  // delete()
  // ==========================================================================
  describe('delete', () => {
    it('should call DELETE /api/v1/agents/{id}', async () => {
      mockClient.delete.mockResolvedValue(undefined);

      await service.delete('agent-1');

      expect(mockClient.delete).toHaveBeenCalledWith('/api/v1/agents/agent-1');
    });

    it('should not throw on successful delete', async () => {
      mockClient.delete.mockResolvedValue(undefined);

      await expect(service.delete('agent-1')).resolves.not.toThrow();
    });

    it('should propagate not found errors', async () => {
      const error = new Error('Agent not found');
      mockClient.delete.mockRejectedValue(error);

      await expect(service.delete('nonexistent')).rejects.toThrow('Agent not found');
    });
  });

  // ==========================================================================
  // execute()
  // ==========================================================================
  describe('execute', () => {
    it('should call POST /api/v1/agents/{id}/execute with data', async () => {
      const execution = { execution_id: 'exec-123' };
      mockClient.post.mockResolvedValue(execution);

      const data = { prompt: 'Hello' };
      const result = await service.execute('agent-1', data);

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/agents/agent-1/execute', data);
      expect(result).toEqual(execution);
    });

    it('should pass environment_id when provided', async () => {
      mockClient.post.mockResolvedValue({ execution_id: 'exec-123' });

      await service.execute('agent-1', { prompt: 'Test', environment_id: 'env-1' });

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/agents/agent-1/execute', {
        prompt: 'Test',
        environment_id: 'env-1',
      });
    });

    it('should propagate execution errors', async () => {
      const error = new Error('Execution failed');
      mockClient.post.mockRejectedValue(error);

      await expect(service.execute('agent-1', { prompt: 'Test' })).rejects.toThrow(
        'Execution failed'
      );
    });
  });
});
