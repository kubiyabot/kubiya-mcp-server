/**
 * Environment Service Unit Tests
 *
 * Tests for the EnvironmentService class including:
 * - list, get, create, update, delete operations
 * - Status filter parameter
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnvironmentService } from '../../../src/client/services/environments.service.js';
import type { BaseClient } from '../../../src/client/base-client.js';
import { createMockEnvironment, mockEnvironments } from '../../fixtures/index.js';

describe('EnvironmentService', () => {
  let service: EnvironmentService;
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
    service = new EnvironmentService(mockClient as unknown as BaseClient);
  });

  // ==========================================================================
  // list()
  // ==========================================================================
  describe('list', () => {
    it('should call GET /api/v1/environments', async () => {
      mockClient.get.mockResolvedValue(mockEnvironments);

      const result = await service.list();

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/environments', { params: undefined });
      expect(result).toEqual(mockEnvironments);
    });

    it('should pass status_filter param', async () => {
      mockClient.get.mockResolvedValue(mockEnvironments);

      await service.list({ status_filter: 'active' });

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/environments', {
        params: { status_filter: 'active' },
      });
    });

    it('should return empty array when no environments', async () => {
      mockClient.get.mockResolvedValue([]);

      const result = await service.list();

      expect(result).toEqual([]);
    });
  });

  // ==========================================================================
  // get()
  // ==========================================================================
  describe('get', () => {
    it('should call GET /api/v1/environments/{id}', async () => {
      const env = mockEnvironments[0];
      mockClient.get.mockResolvedValue(env);

      const result = await service.get('env-1');

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/environments/env-1');
      expect(result).toEqual(env);
    });

    it('should propagate errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Not found'));

      await expect(service.get('nonexistent')).rejects.toThrow('Not found');
    });
  });

  // ==========================================================================
  // create()
  // ==========================================================================
  describe('create', () => {
    it('should call POST /api/v1/environments with data', async () => {
      const newEnv = createMockEnvironment({ name: 'new-env' });
      mockClient.post.mockResolvedValue(newEnv);

      const data = { name: 'new-env', display_name: 'New Environment' };
      const result = await service.create(data);

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/environments', data);
      expect(result.name).toBe('new-env');
    });

    it('should pass all environment fields', async () => {
      const fullData = {
        name: 'production',
        display_name: 'Production',
        description: 'Production environment',
        tags: ['production', 'critical'],
        settings: { region: 'us-east-1' },
      };
      mockClient.post.mockResolvedValue(createMockEnvironment(fullData));

      await service.create(fullData);

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/environments', fullData);
    });
  });

  // ==========================================================================
  // update()
  // ==========================================================================
  describe('update', () => {
    it('should call PATCH /api/v1/environments/{id} with data', async () => {
      const updated = { ...mockEnvironments[0], display_name: 'Updated' };
      mockClient.patch.mockResolvedValue(updated);

      const result = await service.update('env-1', { display_name: 'Updated' });

      expect(mockClient.patch).toHaveBeenCalledWith('/api/v1/environments/env-1', {
        display_name: 'Updated',
      });
      expect(result.display_name).toBe('Updated');
    });

    it('should allow partial updates', async () => {
      mockClient.patch.mockResolvedValue(mockEnvironments[0]);

      await service.update('env-1', { status: 'inactive' });

      expect(mockClient.patch).toHaveBeenCalledWith('/api/v1/environments/env-1', {
        status: 'inactive',
      });
    });
  });

  // ==========================================================================
  // delete()
  // ==========================================================================
  describe('delete', () => {
    it('should call DELETE /api/v1/environments/{id}', async () => {
      mockClient.delete.mockResolvedValue(undefined);

      await service.delete('env-1');

      expect(mockClient.delete).toHaveBeenCalledWith('/api/v1/environments/env-1');
    });

    it('should not throw on successful delete', async () => {
      mockClient.delete.mockResolvedValue(undefined);

      await expect(service.delete('env-1')).resolves.not.toThrow();
    });
  });
});
