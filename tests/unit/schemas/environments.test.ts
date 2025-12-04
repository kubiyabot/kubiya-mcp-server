/**
 * Environment Schema Unit Tests
 *
 * Comprehensive validation tests for environment-related schemas including:
 * - ListEnvironmentsSchema
 * - GetEnvironmentSchema
 * - CreateEnvironmentSchema
 * - UpdateEnvironmentSchema
 * - DeleteEnvironmentSchema
 */

import { describe, it, expect } from 'vitest';
import {
  ListEnvironmentsSchema,
  GetEnvironmentSchema,
  CreateEnvironmentSchema,
  UpdateEnvironmentSchema,
  DeleteEnvironmentSchema,
} from '../../../src/schemas/environments.js';

describe('Environment Schemas', () => {
  // ==========================================================================
  // ListEnvironmentsSchema
  // ==========================================================================
  describe('ListEnvironmentsSchema', () => {
    it('should accept empty object', () => {
      const result = ListEnvironmentsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept status_filter', () => {
      const result = ListEnvironmentsSchema.safeParse({ status_filter: 'active' });
      expect(result.success).toBe(true);
    });

    it('should accept any status_filter string', () => {
      const result = ListEnvironmentsSchema.safeParse({ status_filter: 'custom_status' });
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // GetEnvironmentSchema
  // ==========================================================================
  describe('GetEnvironmentSchema', () => {
    it('should accept valid id', () => {
      const result = GetEnvironmentSchema.safeParse({ id: 'env-123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = GetEnvironmentSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Environment ID is required');
      }
    });

    it('should reject missing id', () => {
      const result = GetEnvironmentSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // CreateEnvironmentSchema
  // ==========================================================================
  describe('CreateEnvironmentSchema', () => {
    it('should accept minimal valid environment', () => {
      const result = CreateEnvironmentSchema.safeParse({ name: 'production' });
      expect(result.success).toBe(true);
    });

    it('should accept fully populated environment', () => {
      const fullEnv = {
        name: 'staging',
        display_name: 'Staging Environment',
        description: 'Environment for staging deployments',
        tags: ['staging', 'test'],
        settings: { region: 'us-east-1', tier: 'standard' },
      };

      const result = CreateEnvironmentSchema.safeParse(fullEnv);
      expect(result.success).toBe(true);
    });

    // Name validation
    it('should reject name shorter than 2 characters', () => {
      const result = CreateEnvironmentSchema.safeParse({ name: 'a' });
      expect(result.success).toBe(false);
    });

    it('should accept name at minimum length (2)', () => {
      const result = CreateEnvironmentSchema.safeParse({ name: 'ab' });
      expect(result.success).toBe(true);
    });

    it('should reject name longer than 100 characters', () => {
      const result = CreateEnvironmentSchema.safeParse({ name: 'a'.repeat(101) });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('2-100 characters');
      }
    });

    it('should accept name at maximum length (100)', () => {
      const result = CreateEnvironmentSchema.safeParse({ name: 'a'.repeat(100) });
      expect(result.success).toBe(true);
    });

    it('should reject missing name', () => {
      const result = CreateEnvironmentSchema.safeParse({ description: 'test' });
      expect(result.success).toBe(false);
    });

    // Tags validation
    it('should accept empty tags array', () => {
      const result = CreateEnvironmentSchema.safeParse({ name: 'test', tags: [] });
      expect(result.success).toBe(true);
    });

    it('should reject non-string in tags', () => {
      const result = CreateEnvironmentSchema.safeParse({ name: 'test', tags: [123] });
      expect(result.success).toBe(false);
    });

    it('should accept multiple tags', () => {
      const result = CreateEnvironmentSchema.safeParse({
        name: 'test',
        tags: ['tag1', 'tag2', 'tag3'],
      });
      expect(result.success).toBe(true);
    });

    // Settings validation
    it('should accept nested settings object', () => {
      const result = CreateEnvironmentSchema.safeParse({
        name: 'test',
        settings: {
          nested: { deeply: { nested: 'value' } },
          array: [1, 2, 3],
          bool: true,
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty settings object', () => {
      const result = CreateEnvironmentSchema.safeParse({ name: 'test', settings: {} });
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // UpdateEnvironmentSchema
  // ==========================================================================
  describe('UpdateEnvironmentSchema', () => {
    it('should accept id with no updates', () => {
      const result = UpdateEnvironmentSchema.safeParse({ id: 'env-123' });
      expect(result.success).toBe(true);
    });

    it('should accept id with partial updates', () => {
      const result = UpdateEnvironmentSchema.safeParse({
        id: 'env-123',
        display_name: 'Updated Display Name',
      });
      expect(result.success).toBe(true);
    });

    it('should accept id with all fields', () => {
      const result = UpdateEnvironmentSchema.safeParse({
        id: 'env-123',
        name: 'updated-name',
        display_name: 'Updated Name',
        description: 'Updated description',
        tags: ['updated', 'tags'],
        settings: { updated: true },
        status: 'inactive',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing id', () => {
      const result = UpdateEnvironmentSchema.safeParse({ name: 'test' });
      expect(result.success).toBe(false);
    });

    it('should reject empty id', () => {
      const result = UpdateEnvironmentSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Environment ID is required');
      }
    });

    // Name validation when provided
    it('should reject name shorter than 2 characters when provided', () => {
      const result = UpdateEnvironmentSchema.safeParse({ id: 'env-123', name: 'a' });
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 100 characters when provided', () => {
      const result = UpdateEnvironmentSchema.safeParse({
        id: 'env-123',
        name: 'a'.repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid name when provided', () => {
      const result = UpdateEnvironmentSchema.safeParse({
        id: 'env-123',
        name: 'valid-name',
      });
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // DeleteEnvironmentSchema
  // ==========================================================================
  describe('DeleteEnvironmentSchema', () => {
    it('should accept valid id', () => {
      const result = DeleteEnvironmentSchema.safeParse({ id: 'env-123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = DeleteEnvironmentSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Environment ID is required');
      }
    });

    it('should reject missing id', () => {
      const result = DeleteEnvironmentSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject null id', () => {
      const result = DeleteEnvironmentSchema.safeParse({ id: null });
      expect(result.success).toBe(false);
    });
  });
});
