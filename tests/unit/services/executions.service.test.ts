/**
 * Execution Service Unit Tests
 *
 * Tests for the ExecutionService class including:
 * - list, get, getMessages, cancel operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecutionService } from '../../../src/client/services/executions.service.js';
import type { BaseClient } from '../../../src/client/base-client.js';
import { createMockExecution, mockExecutions } from '../../fixtures/index.js';

describe('ExecutionService', () => {
  let service: ExecutionService;
  let mockClient: {
    get: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      patch: vi.fn(),
    };
    service = new ExecutionService(mockClient as unknown as BaseClient);
  });

  // ==========================================================================
  // list()
  // ==========================================================================
  describe('list', () => {
    it('should call GET /api/v1/executions', async () => {
      mockClient.get.mockResolvedValue(mockExecutions);

      const result = await service.list();

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/executions', { params: undefined });
      expect(result).toEqual(mockExecutions);
    });

    it('should pass pagination params', async () => {
      mockClient.get.mockResolvedValue(mockExecutions);

      await service.list({ skip: 10, limit: 25 });

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/executions', {
        params: { skip: 10, limit: 25 },
      });
    });

    it('should pass status_filter', async () => {
      mockClient.get.mockResolvedValue(mockExecutions);

      await service.list({ status_filter: 'completed' });

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/executions', {
        params: { status_filter: 'completed' },
      });
    });

    it('should pass execution_type', async () => {
      mockClient.get.mockResolvedValue(mockExecutions);

      await service.list({ execution_type: 'agent' });

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/executions', {
        params: { execution_type: 'agent' },
      });
    });

    it('should pass all filters combined', async () => {
      mockClient.get.mockResolvedValue(mockExecutions);

      await service.list({
        skip: 0,
        limit: 50,
        status_filter: 'running',
        execution_type: 'team',
      });

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/executions', {
        params: {
          skip: 0,
          limit: 50,
          status_filter: 'running',
          execution_type: 'team',
        },
      });
    });

    it('should return empty array when no executions', async () => {
      mockClient.get.mockResolvedValue([]);

      const result = await service.list();

      expect(result).toEqual([]);
    });
  });

  // ==========================================================================
  // get()
  // ==========================================================================
  describe('get', () => {
    it('should call GET /api/v1/executions/{id}', async () => {
      const execution = mockExecutions[0];
      mockClient.get.mockResolvedValue(execution);

      const result = await service.get('exec-1');

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/executions/exec-1');
      expect(result).toEqual(execution);
    });

    it('should return completed execution with response', async () => {
      const completedExec = createMockExecution({
        id: 'exec-complete',
        status: 'completed',
        response: 'Task completed successfully',
      });
      mockClient.get.mockResolvedValue(completedExec);

      const result = await service.get('exec-complete');

      expect(result.status).toBe('completed');
      expect(result.response).toBe('Task completed successfully');
    });

    it('should return failed execution with error_message', async () => {
      const failedExec = createMockExecution({
        id: 'exec-failed',
        status: 'failed',
        error_message: 'Execution failed due to timeout',
      });
      mockClient.get.mockResolvedValue(failedExec);

      const result = await service.get('exec-failed');

      expect(result.status).toBe('failed');
      expect(result.error_message).toBe('Execution failed due to timeout');
    });

    it('should propagate not found errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Execution not found'));

      await expect(service.get('nonexistent')).rejects.toThrow('Execution not found');
    });
  });

  // ==========================================================================
  // getMessages()
  // ==========================================================================
  describe('getMessages', () => {
    const mockMessages = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
      { role: 'user', content: 'What can you do?' },
    ];

    it('should call GET /api/v1/executions/{id}/messages', async () => {
      mockClient.get.mockResolvedValue(mockMessages);

      const result = await service.getMessages('exec-1');

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/executions/exec-1/messages', {
        params: undefined,
      });
      expect(result).toEqual(mockMessages);
    });

    it('should pass pagination params', async () => {
      mockClient.get.mockResolvedValue(mockMessages);

      await service.getMessages('exec-1', { skip: 5, limit: 10 });

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/executions/exec-1/messages', {
        params: { skip: 5, limit: 10 },
      });
    });

    it('should return empty array when no messages', async () => {
      mockClient.get.mockResolvedValue([]);

      const result = await service.getMessages('exec-new');

      expect(result).toEqual([]);
    });

    it('should propagate not found errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Execution not found'));

      await expect(service.getMessages('nonexistent')).rejects.toThrow('Execution not found');
    });
  });

  // ==========================================================================
  // cancel()
  // ==========================================================================
  describe('cancel', () => {
    it('should call PATCH /api/v1/executions/{id}/status with cancelled status', async () => {
      mockClient.patch.mockResolvedValue(undefined);

      await service.cancel('exec-1');

      expect(mockClient.patch).toHaveBeenCalledWith('/api/v1/executions/exec-1/status', {
        status: 'cancelled',
      });
    });

    it('should not throw on successful cancel', async () => {
      mockClient.patch.mockResolvedValue(undefined);

      await expect(service.cancel('exec-1')).resolves.not.toThrow();
    });

    it('should propagate errors when execution cannot be cancelled', async () => {
      mockClient.patch.mockRejectedValue(new Error('Execution already completed'));

      await expect(service.cancel('exec-completed')).rejects.toThrow('Execution already completed');
    });

    it('should propagate not found errors', async () => {
      mockClient.patch.mockRejectedValue(new Error('Execution not found'));

      await expect(service.cancel('nonexistent')).rejects.toThrow('Execution not found');
    });
  });
});
