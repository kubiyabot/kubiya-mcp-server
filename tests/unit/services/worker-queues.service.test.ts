/**
 * Worker Queues Service Unit Tests
 *
 * Tests for the WorkerQueuesService class including:
 * - list, listByEnvironment, get, create, update, delete operations
 * - Note: create requires environment_id in URL path
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkerQueuesService } from '../../../src/client/services/worker-queues.service.js';
import type { BaseClient } from '../../../src/client/base-client.js';
import { createMockWorkerQueue, mockWorkerQueues } from '../../fixtures/index.js';

describe('WorkerQueuesService', () => {
  let service: WorkerQueuesService;
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
    service = new WorkerQueuesService(mockClient as unknown as BaseClient);
  });

  // ==========================================================================
  // list()
  // ==========================================================================
  describe('list', () => {
    it('should call GET /api/v1/worker-queues', async () => {
      mockClient.get.mockResolvedValue(mockWorkerQueues);

      const result = await service.list();

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/worker-queues');
      expect(result).toEqual(mockWorkerQueues);
    });

    it('should return empty array when no queues', async () => {
      mockClient.get.mockResolvedValue([]);

      const result = await service.list();

      expect(result).toEqual([]);
    });
  });

  // ==========================================================================
  // listByEnvironment()
  // ==========================================================================
  describe('listByEnvironment', () => {
    it('should call GET /api/v1/environments/{id}/worker-queues', async () => {
      mockClient.get.mockResolvedValue(mockWorkerQueues);

      const result = await service.listByEnvironment('env-123');

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/environments/env-123/worker-queues');
      expect(result).toEqual(mockWorkerQueues);
    });

    it('should return empty array when environment has no queues', async () => {
      mockClient.get.mockResolvedValue([]);

      const result = await service.listByEnvironment('env-empty');

      expect(result).toEqual([]);
    });

    it('should propagate not found errors for invalid environment', async () => {
      mockClient.get.mockRejectedValue(new Error('Environment not found'));

      await expect(service.listByEnvironment('nonexistent')).rejects.toThrow('Environment not found');
    });
  });

  // ==========================================================================
  // get()
  // ==========================================================================
  describe('get', () => {
    it('should call GET /api/v1/worker-queues/{id}', async () => {
      const queue = mockWorkerQueues[0];
      mockClient.get.mockResolvedValue(queue);

      const result = await service.get('queue-1');

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/worker-queues/queue-1');
      expect(result).toEqual(queue);
    });

    it('should propagate not found errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Worker queue not found'));

      await expect(service.get('nonexistent')).rejects.toThrow('Worker queue not found');
    });
  });

  // ==========================================================================
  // create()
  // ==========================================================================
  describe('create', () => {
    it('should call POST /api/v1/environments/{envId}/worker-queues with data', async () => {
      const newQueue = createMockWorkerQueue({ name: 'new-queue' });
      mockClient.post.mockResolvedValue(newQueue);

      const data = { name: 'new-queue', display_name: 'New Queue' };
      const result = await service.create('env-123', data);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/api/v1/environments/env-123/worker-queues',
        data
      );
      expect(result.name).toBe('new-queue');
    });

    it('should pass all worker queue fields', async () => {
      const fullData = {
        name: 'production-queue',
        display_name: 'Production Queue',
        description: 'Queue for production workloads',
        max_workers: 20,
        heartbeat_interval: 30,
        tags: ['production', 'critical'],
        settings: { autoscale: true },
      };
      mockClient.post.mockResolvedValue(createMockWorkerQueue(fullData));

      await service.create('env-prod', fullData);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/api/v1/environments/env-prod/worker-queues',
        fullData
      );
    });

    it('should propagate validation errors', async () => {
      mockClient.post.mockRejectedValue(new Error('Invalid queue name'));

      await expect(service.create('env-1', { name: '' })).rejects.toThrow('Invalid queue name');
    });

    it('should propagate environment not found errors', async () => {
      mockClient.post.mockRejectedValue(new Error('Environment not found'));

      await expect(service.create('nonexistent', { name: 'test' })).rejects.toThrow(
        'Environment not found'
      );
    });
  });

  // ==========================================================================
  // update()
  // ==========================================================================
  describe('update', () => {
    it('should call PATCH /api/v1/worker-queues/{id} with data', async () => {
      const updated = { ...mockWorkerQueues[0], max_workers: 30 };
      mockClient.patch.mockResolvedValue(updated);

      const result = await service.update('queue-1', { max_workers: 30 });

      expect(mockClient.patch).toHaveBeenCalledWith('/api/v1/worker-queues/queue-1', {
        max_workers: 30,
      });
      expect(result.max_workers).toBe(30);
    });

    it('should allow partial updates', async () => {
      mockClient.patch.mockResolvedValue(mockWorkerQueues[0]);

      await service.update('queue-1', { status: 'inactive' });

      expect(mockClient.patch).toHaveBeenCalledWith('/api/v1/worker-queues/queue-1', {
        status: 'inactive',
      });
    });

    it('should update multiple fields', async () => {
      const updateData = {
        display_name: 'Updated Queue',
        max_workers: 50,
        heartbeat_interval: 120,
        tags: ['updated'],
      };
      mockClient.patch.mockResolvedValue({ ...mockWorkerQueues[0], ...updateData });

      await service.update('queue-1', updateData);

      expect(mockClient.patch).toHaveBeenCalledWith('/api/v1/worker-queues/queue-1', updateData);
    });
  });

  // ==========================================================================
  // delete()
  // ==========================================================================
  describe('delete', () => {
    it('should call DELETE /api/v1/worker-queues/{id}', async () => {
      mockClient.delete.mockResolvedValue(undefined);

      await service.delete('queue-1');

      expect(mockClient.delete).toHaveBeenCalledWith('/api/v1/worker-queues/queue-1');
    });

    it('should not throw on successful delete', async () => {
      mockClient.delete.mockResolvedValue(undefined);

      await expect(service.delete('queue-1')).resolves.not.toThrow();
    });

    it('should propagate errors when queue has active workers', async () => {
      mockClient.delete.mockRejectedValue(new Error('Cannot delete queue with active workers'));

      await expect(service.delete('queue-active')).rejects.toThrow(
        'Cannot delete queue with active workers'
      );
    });

    it('should propagate not found errors', async () => {
      mockClient.delete.mockRejectedValue(new Error('Worker queue not found'));

      await expect(service.delete('nonexistent')).rejects.toThrow('Worker queue not found');
    });
  });
});
