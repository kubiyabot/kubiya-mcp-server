/**
 * Team Service Unit Tests
 *
 * Tests for the TeamService class including:
 * - list, get, create, update, delete, execute operations
 * - Proper URL construction
 * - Parameter passing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeamService } from '../../../src/client/services/teams.service.js';
import type { BaseClient } from '../../../src/client/base-client.js';
import { createMockTeam, mockTeams } from '../../fixtures/index.js';

describe('TeamService', () => {
  let service: TeamService;
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
    service = new TeamService(mockClient as unknown as BaseClient);
  });

  // ==========================================================================
  // list()
  // ==========================================================================
  describe('list', () => {
    it('should call GET /api/v1/teams', async () => {
      mockClient.get.mockResolvedValue(mockTeams);

      const result = await service.list();

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/teams', { params: undefined });
      expect(result).toEqual(mockTeams);
    });

    it('should pass pagination params', async () => {
      mockClient.get.mockResolvedValue(mockTeams);

      await service.list({ skip: 0, limit: 25 });

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/teams', {
        params: { skip: 0, limit: 25 },
      });
    });
  });

  // ==========================================================================
  // get()
  // ==========================================================================
  describe('get', () => {
    it('should call GET /api/v1/teams/{id}', async () => {
      const team = mockTeams[0];
      mockClient.get.mockResolvedValue(team);

      const result = await service.get('team-1');

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/teams/team-1');
      expect(result).toEqual(team);
    });
  });

  // ==========================================================================
  // create()
  // ==========================================================================
  describe('create', () => {
    it('should call POST /api/v1/teams with data', async () => {
      const newTeam = createMockTeam({ name: 'New Team' });
      mockClient.post.mockResolvedValue(newTeam);

      const data = { name: 'New Team' };
      const result = await service.create(data);

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/teams', data);
      expect(result.name).toBe('New Team');
    });

    it('should pass all team fields', async () => {
      const fullData = {
        name: 'Full Team',
        description: 'Team description',
        runtime: 'claude_code',
        configuration: { max_workers: 10 },
        skill_ids: ['skill-1'],
      };
      mockClient.post.mockResolvedValue(createMockTeam(fullData));

      await service.create(fullData);

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/teams', fullData);
    });
  });

  // ==========================================================================
  // update()
  // ==========================================================================
  describe('update', () => {
    it('should call PATCH /api/v1/teams/{id} with data', async () => {
      const updated = { ...mockTeams[0], name: 'Updated Team' };
      mockClient.patch.mockResolvedValue(updated);

      const result = await service.update('team-1', { name: 'Updated Team' });

      expect(mockClient.patch).toHaveBeenCalledWith('/api/v1/teams/team-1', {
        name: 'Updated Team',
      });
      expect(result.name).toBe('Updated Team');
    });
  });

  // ==========================================================================
  // delete()
  // ==========================================================================
  describe('delete', () => {
    it('should call DELETE /api/v1/teams/{id}', async () => {
      mockClient.delete.mockResolvedValue(undefined);

      await service.delete('team-1');

      expect(mockClient.delete).toHaveBeenCalledWith('/api/v1/teams/team-1');
    });
  });

  // ==========================================================================
  // execute()
  // ==========================================================================
  describe('execute', () => {
    it('should call POST /api/v1/teams/{id}/execute with data', async () => {
      const execution = { execution_id: 'exec-123' };
      mockClient.post.mockResolvedValue(execution);

      const data = { prompt: 'Team task' };
      const result = await service.execute('team-1', data);

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/teams/team-1/execute', data);
      expect(result).toEqual(execution);
    });
  });
});
