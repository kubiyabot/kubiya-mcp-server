/**
 * Common Schema Unit Tests
 *
 * Tests for shared validation schemas including:
 * - IdParamSchema for UUID validation
 * - ListParamsSchema for pagination
 * - StringIdSchema for string IDs
 */

import { describe, it, expect } from 'vitest';
import { IdParamSchema, ListParamsSchema, StringIdSchema } from '../../../src/schemas/common.js';

describe('Common Schemas', () => {
  // ==========================================================================
  // IdParamSchema
  // ==========================================================================
  describe('IdParamSchema', () => {
    it('should accept valid UUID', () => {
      const validUUIDs = [
        { id: '123e4567-e89b-12d3-a456-426614174000' },
        { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
        { id: '550e8400-e29b-41d4-a716-446655440000' },
      ];

      for (const uuid of validUUIDs) {
        const result = IdParamSchema.safeParse(uuid);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid UUID format', () => {
      const invalidUUIDs = [
        { id: 'not-a-uuid' },
        { id: '123' },
        { id: '123e4567-e89b-12d3-a456' }, // Incomplete
        { id: '123e4567-e89b-12d3-a456-426614174000-extra' }, // Extra
        { id: '123e4567e89b12d3a456426614174000' }, // No dashes
        { id: 'gggggggg-gggg-gggg-gggg-gggggggggggg' }, // Invalid hex
      ];

      for (const uuid of invalidUUIDs) {
        const result = IdParamSchema.safeParse(uuid);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toContain('Invalid ID format');
        }
      }
    });

    it('should reject empty id', () => {
      const result = IdParamSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
    });

    it('should reject missing id', () => {
      const result = IdParamSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject null id', () => {
      const result = IdParamSchema.safeParse({ id: null });
      expect(result.success).toBe(false);
    });

    it('should reject number id', () => {
      const result = IdParamSchema.safeParse({ id: 123 });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // ListParamsSchema
  // ==========================================================================
  describe('ListParamsSchema', () => {
    it('should accept valid pagination params', () => {
      const validParams = [
        { skip: 0, limit: 10 },
        { skip: 100, limit: 50 },
        { skip: 0, limit: 1 },
        { skip: 0, limit: 1000 },
      ];

      for (const params of validParams) {
        const result = ListParamsSchema.safeParse(params);
        expect(result.success).toBe(true);
      }
    });

    it('should accept empty object', () => {
      const result = ListParamsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept skip only', () => {
      const result = ListParamsSchema.safeParse({ skip: 10 });
      expect(result.success).toBe(true);
    });

    it('should accept limit only', () => {
      const result = ListParamsSchema.safeParse({ limit: 50 });
      expect(result.success).toBe(true);
    });

    it('should reject negative skip', () => {
      const result = ListParamsSchema.safeParse({ skip: -1 });
      expect(result.success).toBe(false);
    });

    it('should reject limit below 1', () => {
      const result = ListParamsSchema.safeParse({ limit: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject limit above 1000', () => {
      const result = ListParamsSchema.safeParse({ limit: 1001 });
      expect(result.success).toBe(false);
    });

    it('should reject non-number skip', () => {
      const result = ListParamsSchema.safeParse({ skip: 'ten' });
      expect(result.success).toBe(false);
    });

    it('should reject non-number limit', () => {
      const result = ListParamsSchema.safeParse({ limit: 'fifty' });
      expect(result.success).toBe(false);
    });

    it('should accept float values and coerce them', () => {
      const result = ListParamsSchema.safeParse({ skip: 10.5, limit: 20.9 });
      // Zod numbers accept floats
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // StringIdSchema
  // ==========================================================================
  describe('StringIdSchema', () => {
    it('should accept any non-empty string id', () => {
      const validIds = [
        { id: 'agent-123' },
        { id: 'some-long-identifier-with-numbers-456' },
        { id: '1' },
        { id: 'special_chars-and.dots' },
      ];

      for (const idObj of validIds) {
        const result = StringIdSchema.safeParse(idObj);
        expect(result.success).toBe(true);
      }
    });

    it('should reject empty string', () => {
      const result = StringIdSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('ID is required');
      }
    });

    it('should reject missing id', () => {
      const result = StringIdSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject null id', () => {
      const result = StringIdSchema.safeParse({ id: null });
      expect(result.success).toBe(false);
    });

    it('should reject number id', () => {
      const result = StringIdSchema.safeParse({ id: 123 });
      expect(result.success).toBe(false);
    });

    it('should accept whitespace-only as valid (but trimming not enforced)', () => {
      const result = StringIdSchema.safeParse({ id: '   ' });
      // Note: min(1) checks length, and whitespace counts as characters
      expect(result.success).toBe(true);
    });
  });
});
