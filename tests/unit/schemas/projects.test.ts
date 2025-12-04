/**
 * Project Schema Unit Tests
 *
 * Comprehensive validation tests for project-related schemas including:
 * - ListProjectsSchema
 * - GetProjectSchema
 * - CreateProjectSchema
 * - UpdateProjectSchema
 * - DeleteProjectSchema
 */

import { describe, it, expect } from 'vitest';
import {
  ListProjectsSchema,
  GetProjectSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
  DeleteProjectSchema,
} from '../../../src/schemas/projects.js';

describe('Project Schemas', () => {
  // ==========================================================================
  // ListProjectsSchema
  // ==========================================================================
  describe('ListProjectsSchema', () => {
    it('should accept empty object', () => {
      const result = ListProjectsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept status_filter', () => {
      const result = ListProjectsSchema.safeParse({ status_filter: 'active' });
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // GetProjectSchema
  // ==========================================================================
  describe('GetProjectSchema', () => {
    it('should accept valid id', () => {
      const result = GetProjectSchema.safeParse({ id: 'proj-123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = GetProjectSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Project ID is required');
      }
    });

    it('should reject missing id', () => {
      const result = GetProjectSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // CreateProjectSchema
  // ==========================================================================
  describe('CreateProjectSchema', () => {
    const validProject = {
      name: 'Test Project',
      key: 'TEST',
    };

    it('should accept minimal valid project', () => {
      const result = CreateProjectSchema.safeParse(validProject);
      expect(result.success).toBe(true);
    });

    it('should accept fully populated project', () => {
      const fullProject = {
        name: 'Production Project',
        key: 'PROD',
        description: 'Main production project',
        goals: 'Handle all production workloads',
        settings: { notifications: true },
        visibility: 'org',
        restrict_to_environment: true,
        policy_ids: ['policy-1', 'policy-2'],
        default_model: 'gpt-4',
      };

      const result = CreateProjectSchema.safeParse(fullProject);
      expect(result.success).toBe(true);
    });

    it('should apply default visibility', () => {
      const result = CreateProjectSchema.safeParse(validProject);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.visibility).toBe('private');
      }
    });

    it('should apply default restrict_to_environment', () => {
      const result = CreateProjectSchema.safeParse(validProject);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.restrict_to_environment).toBe(false);
      }
    });

    // Name validation
    it('should reject missing name', () => {
      const result = CreateProjectSchema.safeParse({ key: 'TEST' });
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const result = CreateProjectSchema.safeParse({ name: '', key: 'TEST' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('required');
      }
    });

    // Key validation
    it('should reject missing key', () => {
      const result = CreateProjectSchema.safeParse({ name: 'Test' });
      expect(result.success).toBe(false);
    });

    it('should reject key shorter than 2 characters', () => {
      const result = CreateProjectSchema.safeParse({ name: 'Test', key: 'A' });
      expect(result.success).toBe(false);
    });

    it('should accept key at minimum length (2)', () => {
      const result = CreateProjectSchema.safeParse({ name: 'Test', key: 'AB' });
      expect(result.success).toBe(true);
    });

    it('should reject key longer than 50 characters', () => {
      const result = CreateProjectSchema.safeParse({ name: 'Test', key: 'A'.repeat(51) });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('2-50 characters');
      }
    });

    it('should accept key at maximum length (50)', () => {
      const result = CreateProjectSchema.safeParse({ name: 'Test', key: 'A'.repeat(50) });
      expect(result.success).toBe(true);
    });

    // Visibility enum validation
    it('should accept visibility: private', () => {
      const result = CreateProjectSchema.safeParse({ ...validProject, visibility: 'private' });
      expect(result.success).toBe(true);
    });

    it('should accept visibility: org', () => {
      const result = CreateProjectSchema.safeParse({ ...validProject, visibility: 'org' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid visibility', () => {
      const result = CreateProjectSchema.safeParse({ ...validProject, visibility: 'public' });
      expect(result.success).toBe(false);
    });

    // Optional array fields
    it('should accept empty policy_ids array', () => {
      const result = CreateProjectSchema.safeParse({ ...validProject, policy_ids: [] });
      expect(result.success).toBe(true);
    });

    it('should reject non-string in policy_ids', () => {
      const result = CreateProjectSchema.safeParse({ ...validProject, policy_ids: [123] });
      expect(result.success).toBe(false);
    });

    // Settings validation
    it('should accept complex settings object', () => {
      const result = CreateProjectSchema.safeParse({
        ...validProject,
        settings: {
          notifications: { email: true, slack: false },
          limits: { maxAgents: 10 },
        },
      });
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // UpdateProjectSchema
  // ==========================================================================
  describe('UpdateProjectSchema', () => {
    it('should accept id with no updates', () => {
      const result = UpdateProjectSchema.safeParse({ id: 'proj-123' });
      expect(result.success).toBe(true);
    });

    it('should accept id with partial updates', () => {
      const result = UpdateProjectSchema.safeParse({
        id: 'proj-123',
        name: 'Updated Name',
        status: 'inactive',
      });
      expect(result.success).toBe(true);
    });

    it('should accept id with all fields', () => {
      const result = UpdateProjectSchema.safeParse({
        id: 'proj-123',
        name: 'Updated Name',
        key: 'UPD',
        description: 'Updated description',
        goals: 'Updated goals',
        settings: { updated: true },
        status: 'active',
        visibility: 'org',
        restrict_to_environment: true,
        policy_ids: ['policy-new'],
        default_model: 'claude-3',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing id', () => {
      const result = UpdateProjectSchema.safeParse({ name: 'Test' });
      expect(result.success).toBe(false);
    });

    it('should reject empty id', () => {
      const result = UpdateProjectSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Project ID is required');
      }
    });

    // Key validation when provided
    it('should reject key shorter than 2 characters when provided', () => {
      const result = UpdateProjectSchema.safeParse({ id: 'proj-123', key: 'A' });
      expect(result.success).toBe(false);
    });

    it('should reject key longer than 50 characters when provided', () => {
      const result = UpdateProjectSchema.safeParse({ id: 'proj-123', key: 'A'.repeat(51) });
      expect(result.success).toBe(false);
    });

    it('should accept valid key when provided', () => {
      const result = UpdateProjectSchema.safeParse({ id: 'proj-123', key: 'VALID' });
      expect(result.success).toBe(true);
    });

    // Visibility validation when provided
    it('should reject invalid visibility when provided', () => {
      const result = UpdateProjectSchema.safeParse({ id: 'proj-123', visibility: 'public' });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // DeleteProjectSchema
  // ==========================================================================
  describe('DeleteProjectSchema', () => {
    it('should accept valid id', () => {
      const result = DeleteProjectSchema.safeParse({ id: 'proj-123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = DeleteProjectSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Project ID is required');
      }
    });

    it('should reject missing id', () => {
      const result = DeleteProjectSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
