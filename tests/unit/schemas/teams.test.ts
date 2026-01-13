/**
 * Team Schema Unit Tests
 *
 * Comprehensive validation tests for team-related schemas including:
 * - ListTeamsSchema
 * - GetTeamSchema
 * - CreateTeamSchema
 * - UpdateTeamSchema
 * - DeleteTeamSchema
 * - ExecuteTeamSchema
 */

import { describe, it, expect } from 'vitest';
import {
  ListTeamsSchema,
  GetTeamSchema,
  CreateTeamSchema,
  UpdateTeamSchema,
  DeleteTeamSchema,
  ExecuteTeamSchema,
} from '../../../src/schemas/teams.js';

describe('Team Schemas', () => {
  // ==========================================================================
  // ListTeamsSchema
  // ==========================================================================
  describe('ListTeamsSchema', () => {
    it('should accept valid pagination params', () => {
      const result = ListTeamsSchema.safeParse({ skip: 0, limit: 50 });
      expect(result.success).toBe(true);
    });

    it('should accept status_filter', () => {
      const result = ListTeamsSchema.safeParse({ status_filter: 'active' });
      expect(result.success).toBe(true);
    });

    it('should accept all params combined', () => {
      const result = ListTeamsSchema.safeParse({
        skip: 10,
        limit: 25,
        status_filter: 'inactive',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const result = ListTeamsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject invalid skip', () => {
      const result = ListTeamsSchema.safeParse({ skip: -1 });
      expect(result.success).toBe(false);
    });

    it('should reject limit exceeding max', () => {
      const result = ListTeamsSchema.safeParse({ limit: 1001 });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // GetTeamSchema
  // ==========================================================================
  describe('GetTeamSchema', () => {
    it('should accept valid id', () => {
      const result = GetTeamSchema.safeParse({ id: 'team-123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = GetTeamSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Team ID is required');
      }
    });

    it('should reject missing id', () => {
      const result = GetTeamSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // CreateTeamSchema
  // ==========================================================================
  describe('CreateTeamSchema', () => {
    it('should accept minimal valid team', () => {
      const result = CreateTeamSchema.safeParse({ name: 'Engineering Team' });
      expect(result.success).toBe(true);
    });

    it('should accept fully populated team', () => {
      const fullTeam = {
        name: 'Production Team',
        description: 'Handles production workloads',
        runtime: 'claude_code',
        configuration: { max_workers: 10 },
        skill_ids: ['skill-1', 'skill-2'],
        skill_configurations: {
          'skill-1': { enabled: true },
          'skill-2': { timeout: 30 },
        },
      };

      const result = CreateTeamSchema.safeParse(fullTeam);
      expect(result.success).toBe(true);
    });

    it('should apply default runtime', () => {
      const result = CreateTeamSchema.safeParse({ name: 'Test Team' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.runtime).toBe('default');
      }
    });

    // Required fields
    it('should reject missing name', () => {
      const result = CreateTeamSchema.safeParse({ description: 'test' });
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const result = CreateTeamSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
    });

    it('should reject name exceeding 255 characters', () => {
      const result = CreateTeamSchema.safeParse({ name: 'a'.repeat(256) });
      expect(result.success).toBe(false);
    });

    // Runtime enum validation
    it('should accept runtime: default', () => {
      const result = CreateTeamSchema.safeParse({ name: 'Test', runtime: 'default' });
      expect(result.success).toBe(true);
    });

    it('should accept runtime: claude_code', () => {
      const result = CreateTeamSchema.safeParse({ name: 'Test', runtime: 'claude_code' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid runtime', () => {
      const result = CreateTeamSchema.safeParse({ name: 'Test', runtime: 'invalid' });
      expect(result.success).toBe(false);
    });

    // Optional array fields
    it('should accept empty skill_ids array', () => {
      const result = CreateTeamSchema.safeParse({ name: 'Test', skill_ids: [] });
      expect(result.success).toBe(true);
    });

    it('should reject non-string in skill_ids', () => {
      const result = CreateTeamSchema.safeParse({ name: 'Test', skill_ids: [123] });
      expect(result.success).toBe(false);
    });

    // Edge cases
    it('should accept name at max length (255)', () => {
      const result = CreateTeamSchema.safeParse({ name: 'a'.repeat(255) });
      expect(result.success).toBe(true);
    });

    it('should accept complex configuration object', () => {
      const result = CreateTeamSchema.safeParse({
        name: 'Test',
        configuration: {
          nested: { deeply: { nested: 'value' } },
          array: [1, 2, 3],
        },
      });
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // UpdateTeamSchema
  // ==========================================================================
  describe('UpdateTeamSchema', () => {
    it('should accept id with no updates', () => {
      const result = UpdateTeamSchema.safeParse({ id: 'team-123' });
      expect(result.success).toBe(true);
    });

    it('should accept id with partial updates', () => {
      const result = UpdateTeamSchema.safeParse({
        id: 'team-123',
        name: 'Updated Name',
        status: 'inactive',
      });
      expect(result.success).toBe(true);
    });

    it('should accept id with all fields', () => {
      const result = UpdateTeamSchema.safeParse({
        id: 'team-123',
        name: 'Updated Name',
        description: 'Updated description',
        status: 'active',
        runtime: 'claude_code',
        configuration: { updated: true },
        skill_ids: ['skill-new'],
        skill_configurations: { 'skill-new': {} },
        environment_ids: ['env-1'],
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing id', () => {
      const result = UpdateTeamSchema.safeParse({ name: 'Test' });
      expect(result.success).toBe(false);
    });

    it('should reject empty id', () => {
      const result = UpdateTeamSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Team ID is required');
      }
    });

    it('should reject name exceeding 255 characters', () => {
      const result = UpdateTeamSchema.safeParse({
        id: 'team-123',
        name: 'a'.repeat(256),
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty name if provided', () => {
      const result = UpdateTeamSchema.safeParse({
        id: 'team-123',
        name: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid runtime', () => {
      const result = UpdateTeamSchema.safeParse({
        id: 'team-123',
        runtime: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // DeleteTeamSchema
  // ==========================================================================
  describe('DeleteTeamSchema', () => {
    it('should accept valid id', () => {
      const result = DeleteTeamSchema.safeParse({ id: 'team-123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = DeleteTeamSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Team ID is required');
      }
    });

    it('should reject missing id', () => {
      const result = DeleteTeamSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // ExecuteTeamSchema
  // ==========================================================================
  describe('ExecuteTeamSchema', () => {
    it('should accept valid execution params', () => {
      const result = ExecuteTeamSchema.safeParse({
        team_id: 'team-123',
        prompt: 'Hello, team!',
      });
      expect(result.success).toBe(true);
    });

    it('should accept with optional environment_id', () => {
      const result = ExecuteTeamSchema.safeParse({
        team_id: 'team-123',
        prompt: 'Hello!',
        environment_id: 'env-1',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing team_id', () => {
      const result = ExecuteTeamSchema.safeParse({ prompt: 'Hello!' });
      expect(result.success).toBe(false);
    });

    it('should reject empty team_id', () => {
      const result = ExecuteTeamSchema.safeParse({
        team_id: '',
        prompt: 'Hello!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Team ID is required');
      }
    });

    it('should reject missing prompt', () => {
      const result = ExecuteTeamSchema.safeParse({ team_id: 'team-123' });
      expect(result.success).toBe(false);
    });

    it('should reject empty prompt', () => {
      const result = ExecuteTeamSchema.safeParse({
        team_id: 'team-123',
        prompt: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Prompt is required');
      }
    });

    it('should accept very long prompt', () => {
      const result = ExecuteTeamSchema.safeParse({
        team_id: 'team-123',
        prompt: 'a'.repeat(50000),
      });
      expect(result.success).toBe(true);
    });
  });
});
