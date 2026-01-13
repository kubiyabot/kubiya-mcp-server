/**
 * Policy Service Unit Tests
 *
 * Tests for the PolicyService class including:
 * - list, get, create, update, delete operations
 * - Note: update uses PUT (not PATCH) for OPA policies
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PolicyService } from '../../../src/client/services/policies.service.js';
import type { BaseClient } from '../../../src/client/base-client.js';
import { createMockPolicy, mockPolicies } from '../../fixtures/index.js';

describe('PolicyService', () => {
  let service: PolicyService;
  let mockClient: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
    service = new PolicyService(mockClient as unknown as BaseClient);
  });

  // ==========================================================================
  // list()
  // ==========================================================================
  describe('list', () => {
    it('should call GET /api/v1/policies', async () => {
      mockClient.get.mockResolvedValue(mockPolicies);

      const result = await service.list();

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/policies', { params: undefined });
      expect(result).toEqual(mockPolicies);
    });

    it('should pass page and limit params', async () => {
      mockClient.get.mockResolvedValue(mockPolicies);

      await service.list({ page: 2, limit: 50 });

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/policies', {
        params: { page: 2, limit: 50 },
      });
    });

    it('should pass enabled filter', async () => {
      mockClient.get.mockResolvedValue(mockPolicies);

      await service.list({ enabled: true });

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/policies', {
        params: { enabled: true },
      });
    });

    it('should pass search param', async () => {
      mockClient.get.mockResolvedValue(mockPolicies);

      await service.list({ search: 'admin' });

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/policies', {
        params: { search: 'admin' },
      });
    });

    it('should pass all params combined', async () => {
      mockClient.get.mockResolvedValue(mockPolicies);

      await service.list({ page: 1, limit: 25, enabled: false, search: 'security' });

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/policies', {
        params: { page: 1, limit: 25, enabled: false, search: 'security' },
      });
    });
  });

  // ==========================================================================
  // get()
  // ==========================================================================
  describe('get', () => {
    it('should call GET /api/v1/policies/{id}', async () => {
      const policy = mockPolicies[0];
      mockClient.get.mockResolvedValue(policy);

      const result = await service.get('policy-1');

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/policies/policy-1');
      expect(result).toEqual(policy);
    });

    it('should propagate not found errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Policy not found'));

      await expect(service.get('nonexistent')).rejects.toThrow('Policy not found');
    });
  });

  // ==========================================================================
  // create()
  // ==========================================================================
  describe('create', () => {
    it('should call POST /api/v1/policies with data', async () => {
      const newPolicy = createMockPolicy({ name: 'New Policy' });
      mockClient.post.mockResolvedValue(newPolicy);

      const data = { name: 'New Policy', policy_content: 'package test' };
      const result = await service.create(data);

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/policies', data);
      expect(result.name).toBe('New Policy');
    });

    it('should pass all policy fields', async () => {
      const fullData = {
        name: 'Security Policy',
        policy_content: 'package security\ndefault allow = false',
        description: 'Comprehensive security policy',
        enabled: true,
        tags: ['security', 'production'],
        metadata: { author: 'admin' },
      };
      mockClient.post.mockResolvedValue(createMockPolicy(fullData));

      await service.create(fullData);

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/policies', fullData);
    });
  });

  // ==========================================================================
  // update() - Note: Uses PUT not PATCH
  // ==========================================================================
  describe('update', () => {
    it('should call PUT /api/v1/policies/{id} with data', async () => {
      const updated = { ...mockPolicies[0], name: 'Updated Policy' };
      mockClient.put.mockResolvedValue(updated);

      const result = await service.update('policy-1', { name: 'Updated Policy' });

      // Note: Policies use PUT for update
      expect(mockClient.put).toHaveBeenCalledWith('/api/v1/policies/policy-1', {
        name: 'Updated Policy',
      });
      expect(result.name).toBe('Updated Policy');
    });

    it('should pass full policy data for replacement', async () => {
      const fullUpdate = {
        name: 'Replaced Policy',
        policy_content: 'package replaced\ndefault deny = true',
        enabled: false,
      };
      mockClient.put.mockResolvedValue(createMockPolicy(fullUpdate));

      await service.update('policy-1', fullUpdate);

      expect(mockClient.put).toHaveBeenCalledWith('/api/v1/policies/policy-1', fullUpdate);
    });
  });

  // ==========================================================================
  // delete()
  // ==========================================================================
  describe('delete', () => {
    it('should call DELETE /api/v1/policies/{id}', async () => {
      mockClient.delete.mockResolvedValue(undefined);

      await service.delete('policy-1');

      expect(mockClient.delete).toHaveBeenCalledWith('/api/v1/policies/policy-1');
    });

    it('should not throw on successful delete', async () => {
      mockClient.delete.mockResolvedValue(undefined);

      await expect(service.delete('policy-1')).resolves.not.toThrow();
    });

    it('should propagate errors', async () => {
      mockClient.delete.mockRejectedValue(new Error('Cannot delete active policy'));

      await expect(service.delete('policy-1')).rejects.toThrow('Cannot delete active policy');
    });
  });
});
