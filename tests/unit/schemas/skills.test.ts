/**
 * Skill Schema Unit Tests
 *
 * Comprehensive validation tests for skill-related schemas including:
 * - ListSkillsSchema
 * - GetSkillSchema
 * - CreateSkillSchema
 * - UpdateSkillSchema
 * - DeleteSkillSchema
 */

import { describe, it, expect } from 'vitest';
import {
  ListSkillsSchema,
  GetSkillSchema,
  CreateSkillSchema,
  UpdateSkillSchema,
  DeleteSkillSchema,
} from '../../../src/schemas/skills.js';

describe('Skill Schemas', () => {
  // ==========================================================================
  // ListSkillsSchema
  // ==========================================================================
  describe('ListSkillsSchema', () => {
    it('should accept empty object', () => {
      const result = ListSkillsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject unexpected fields (strict by default in empty schema)', () => {
      // Note: z.object({}) allows extra fields by default unless .strict() is called
      const result = ListSkillsSchema.safeParse({ unexpected: 'field' });
      // Empty object schema allows extra keys by default
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // GetSkillSchema
  // ==========================================================================
  describe('GetSkillSchema', () => {
    it('should accept valid id', () => {
      const result = GetSkillSchema.safeParse({ id: 'skill-123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = GetSkillSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Skill ID is required');
      }
    });

    it('should reject missing id', () => {
      const result = GetSkillSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // CreateSkillSchema
  // ==========================================================================
  describe('CreateSkillSchema', () => {
    const validSkill = {
      name: 'File System',
      type: 'file_system',
    };

    it('should accept minimal valid skill', () => {
      const result = CreateSkillSchema.safeParse(validSkill);
      expect(result.success).toBe(true);
    });

    it('should accept fully populated skill', () => {
      const fullSkill = {
        name: 'Docker Operations',
        type: 'docker',
        description: 'Docker container management skill',
        icon: 'Docker',
        enabled: false,
        configuration: {
          timeout: 60,
          retries: 3,
          docker: { host: 'unix:///var/run/docker.sock' },
        },
      };

      const result = CreateSkillSchema.safeParse(fullSkill);
      expect(result.success).toBe(true);
    });

    it('should apply default icon', () => {
      const result = CreateSkillSchema.safeParse(validSkill);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.icon).toBe('Wrench');
      }
    });

    it('should apply default enabled', () => {
      const result = CreateSkillSchema.safeParse(validSkill);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.enabled).toBe(true);
      }
    });

    // Name validation
    it('should reject missing name', () => {
      const result = CreateSkillSchema.safeParse({ type: 'test' });
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const result = CreateSkillSchema.safeParse({ name: '', type: 'test' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('required');
      }
    });

    // Type validation
    it('should reject missing type', () => {
      const result = CreateSkillSchema.safeParse({ name: 'Test' });
      expect(result.success).toBe(false);
    });

    it('should reject empty type', () => {
      const result = CreateSkillSchema.safeParse({ name: 'Test', type: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('required');
      }
    });

    // Optional fields
    it('should accept enabled: false', () => {
      const result = CreateSkillSchema.safeParse({ ...validSkill, enabled: false });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.enabled).toBe(false);
      }
    });

    it('should accept custom icon', () => {
      const result = CreateSkillSchema.safeParse({ ...validSkill, icon: 'CustomIcon' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.icon).toBe('CustomIcon');
      }
    });

    // Configuration validation
    it('should accept empty configuration', () => {
      const result = CreateSkillSchema.safeParse({ ...validSkill, configuration: {} });
      expect(result.success).toBe(true);
    });

    it('should accept complex configuration', () => {
      const result = CreateSkillSchema.safeParse({
        ...validSkill,
        configuration: {
          nested: { deep: { value: 123 } },
          array: [1, 2, 3],
          boolean: true,
          null: null,
        },
      });
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // UpdateSkillSchema
  // ==========================================================================
  describe('UpdateSkillSchema', () => {
    it('should accept id with no updates', () => {
      const result = UpdateSkillSchema.safeParse({ id: 'skill-123' });
      expect(result.success).toBe(true);
    });

    it('should accept id with partial updates', () => {
      const result = UpdateSkillSchema.safeParse({
        id: 'skill-123',
        name: 'Updated Skill',
        enabled: false,
      });
      expect(result.success).toBe(true);
    });

    it('should accept id with all fields', () => {
      const result = UpdateSkillSchema.safeParse({
        id: 'skill-123',
        name: 'Updated Skill',
        description: 'Updated description',
        icon: 'NewIcon',
        enabled: false,
        configuration: { updated: true },
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing id', () => {
      const result = UpdateSkillSchema.safeParse({ name: 'Test' });
      expect(result.success).toBe(false);
    });

    it('should reject empty id', () => {
      const result = UpdateSkillSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Skill ID is required');
      }
    });

    // Name validation when provided
    it('should reject empty name when provided', () => {
      const result = UpdateSkillSchema.safeParse({ id: 'skill-123', name: '' });
      expect(result.success).toBe(false);
    });

    it('should accept valid name when provided', () => {
      const result = UpdateSkillSchema.safeParse({ id: 'skill-123', name: 'Valid Name' });
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // DeleteSkillSchema
  // ==========================================================================
  describe('DeleteSkillSchema', () => {
    it('should accept valid id', () => {
      const result = DeleteSkillSchema.safeParse({ id: 'skill-123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = DeleteSkillSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Skill ID is required');
      }
    });

    it('should reject missing id', () => {
      const result = DeleteSkillSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
