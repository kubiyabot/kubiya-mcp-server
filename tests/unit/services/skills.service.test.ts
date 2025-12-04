/**
 * Skill Service Unit Tests
 *
 * Tests for the SkillService class including:
 * - list, get, create, update, delete operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SkillService } from '../../../src/client/services/skills.service.js';
import type { BaseClient } from '../../../src/client/base-client.js';
import { createMockSkill, mockSkills } from '../../fixtures/index.js';

describe('SkillService', () => {
  let service: SkillService;
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
    service = new SkillService(mockClient as unknown as BaseClient);
  });

  // ==========================================================================
  // list()
  // ==========================================================================
  describe('list', () => {
    it('should call GET /api/v1/skills', async () => {
      mockClient.get.mockResolvedValue(mockSkills);

      const result = await service.list();

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/skills');
      expect(result).toEqual(mockSkills);
    });

    it('should return empty array when no skills', async () => {
      mockClient.get.mockResolvedValue([]);

      const result = await service.list();

      expect(result).toEqual([]);
    });
  });

  // ==========================================================================
  // get()
  // ==========================================================================
  describe('get', () => {
    it('should call GET /api/v1/skills/{id}', async () => {
      const skill = mockSkills[0];
      mockClient.get.mockResolvedValue(skill);

      const result = await service.get('skill-1');

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/skills/skill-1');
      expect(result).toEqual(skill);
    });

    it('should propagate not found errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Skill not found'));

      await expect(service.get('nonexistent')).rejects.toThrow('Skill not found');
    });
  });

  // ==========================================================================
  // create()
  // ==========================================================================
  describe('create', () => {
    it('should call POST /api/v1/skills with data', async () => {
      const newSkill = createMockSkill({ name: 'New Skill', type: 'custom' });
      mockClient.post.mockResolvedValue(newSkill);

      const data = { name: 'New Skill', type: 'custom' };
      const result = await service.create(data);

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/skills', data);
      expect(result.name).toBe('New Skill');
    });

    it('should pass all skill fields', async () => {
      const fullData = {
        name: 'Docker Skill',
        type: 'docker',
        description: 'Docker container management',
        icon: 'Docker',
        enabled: true,
        configuration: { host: 'unix:///var/run/docker.sock' },
      };
      mockClient.post.mockResolvedValue(createMockSkill(fullData));

      await service.create(fullData);

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/skills', fullData);
    });
  });

  // ==========================================================================
  // update()
  // ==========================================================================
  describe('update', () => {
    it('should call PATCH /api/v1/skills/{id} with data', async () => {
      const updated = { ...mockSkills[0], enabled: false };
      mockClient.patch.mockResolvedValue(updated);

      const result = await service.update('skill-1', { enabled: false });

      expect(mockClient.patch).toHaveBeenCalledWith('/api/v1/skills/skill-1', { enabled: false });
      expect(result.enabled).toBe(false);
    });

    it('should allow partial updates', async () => {
      mockClient.patch.mockResolvedValue(mockSkills[0]);

      await service.update('skill-1', { description: 'Updated description' });

      expect(mockClient.patch).toHaveBeenCalledWith('/api/v1/skills/skill-1', {
        description: 'Updated description',
      });
    });
  });

  // ==========================================================================
  // delete()
  // ==========================================================================
  describe('delete', () => {
    it('should call DELETE /api/v1/skills/{id}', async () => {
      mockClient.delete.mockResolvedValue(undefined);

      await service.delete('skill-1');

      expect(mockClient.delete).toHaveBeenCalledWith('/api/v1/skills/skill-1');
    });

    it('should not throw on successful delete', async () => {
      mockClient.delete.mockResolvedValue(undefined);

      await expect(service.delete('skill-1')).resolves.not.toThrow();
    });
  });
});
