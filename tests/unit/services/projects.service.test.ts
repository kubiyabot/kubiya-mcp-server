/**
 * Project Service Unit Tests
 *
 * Tests for the ProjectService class including:
 * - list, get, create, update, delete operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectService } from '../../../src/client/services/projects.service.js';
import type { BaseClient } from '../../../src/client/base-client.js';
import { createMockProject, mockProjects } from '../../fixtures/index.js';

describe('ProjectService', () => {
  let service: ProjectService;
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
    service = new ProjectService(mockClient as unknown as BaseClient);
  });

  // ==========================================================================
  // list()
  // ==========================================================================
  describe('list', () => {
    it('should call GET /api/v1/projects', async () => {
      mockClient.get.mockResolvedValue(mockProjects);

      const result = await service.list();

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/projects', { params: undefined });
      expect(result).toEqual(mockProjects);
    });

    it('should pass status_filter param', async () => {
      mockClient.get.mockResolvedValue(mockProjects);

      await service.list({ status_filter: 'active' });

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/projects', {
        params: { status_filter: 'active' },
      });
    });
  });

  // ==========================================================================
  // get()
  // ==========================================================================
  describe('get', () => {
    it('should call GET /api/v1/projects/{id}', async () => {
      const project = mockProjects[0];
      mockClient.get.mockResolvedValue(project);

      const result = await service.get('proj-1');

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/projects/proj-1');
      expect(result).toEqual(project);
    });
  });

  // ==========================================================================
  // create()
  // ==========================================================================
  describe('create', () => {
    it('should call POST /api/v1/projects with data', async () => {
      const newProject = createMockProject({ name: 'New Project', key: 'NEW' });
      mockClient.post.mockResolvedValue(newProject);

      const data = { name: 'New Project', key: 'NEW' };
      const result = await service.create(data);

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/projects', data);
      expect(result.name).toBe('New Project');
    });

    it('should pass all project fields', async () => {
      const fullData = {
        name: 'Full Project',
        key: 'FULL',
        description: 'Project description',
        goals: 'Project goals',
        settings: { notifications: true },
        visibility: 'org',
        restrict_to_environment: true,
        policy_ids: ['policy-1'],
        default_model: 'gpt-4',
      };
      mockClient.post.mockResolvedValue(createMockProject(fullData));

      await service.create(fullData);

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/projects', fullData);
    });
  });

  // ==========================================================================
  // update()
  // ==========================================================================
  describe('update', () => {
    it('should call PATCH /api/v1/projects/{id} with data', async () => {
      const updated = { ...mockProjects[0], name: 'Updated Project' };
      mockClient.patch.mockResolvedValue(updated);

      const result = await service.update('proj-1', { name: 'Updated Project' });

      expect(mockClient.patch).toHaveBeenCalledWith('/api/v1/projects/proj-1', {
        name: 'Updated Project',
      });
      expect(result.name).toBe('Updated Project');
    });
  });

  // ==========================================================================
  // delete()
  // ==========================================================================
  describe('delete', () => {
    it('should call DELETE /api/v1/projects/{id}', async () => {
      mockClient.delete.mockResolvedValue(undefined);

      await service.delete('proj-1');

      expect(mockClient.delete).toHaveBeenCalledWith('/api/v1/projects/proj-1');
    });
  });
});
