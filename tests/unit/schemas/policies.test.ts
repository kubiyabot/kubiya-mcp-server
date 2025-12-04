/**
 * Policy Schema Unit Tests
 *
 * Comprehensive validation tests for policy-related schemas including:
 * - ListPoliciesSchema
 * - GetPolicySchema
 * - CreatePolicySchema
 * - UpdatePolicySchema
 * - DeletePolicySchema
 */

import { describe, it, expect } from 'vitest';
import {
  ListPoliciesSchema,
  GetPolicySchema,
  CreatePolicySchema,
  UpdatePolicySchema,
  DeletePolicySchema,
} from '../../../src/schemas/policies.js';

describe('Policy Schemas', () => {
  // ==========================================================================
  // ListPoliciesSchema
  // ==========================================================================
  describe('ListPoliciesSchema', () => {
    it('should accept empty object with defaults', () => {
      const result = ListPoliciesSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should accept valid pagination params', () => {
      const result = ListPoliciesSchema.safeParse({ page: 5, limit: 50 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(5);
        expect(result.data.limit).toBe(50);
      }
    });

    it('should accept enabled filter', () => {
      const result = ListPoliciesSchema.safeParse({ enabled: true });
      expect(result.success).toBe(true);
    });

    it('should accept enabled: false filter', () => {
      const result = ListPoliciesSchema.safeParse({ enabled: false });
      expect(result.success).toBe(true);
    });

    it('should accept search parameter', () => {
      const result = ListPoliciesSchema.safeParse({ search: 'admin' });
      expect(result.success).toBe(true);
    });

    it('should accept all params combined', () => {
      const result = ListPoliciesSchema.safeParse({
        page: 2,
        limit: 25,
        enabled: true,
        search: 'security',
      });
      expect(result.success).toBe(true);
    });

    // Page validation
    it('should reject page less than 1', () => {
      const result = ListPoliciesSchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject negative page', () => {
      const result = ListPoliciesSchema.safeParse({ page: -1 });
      expect(result.success).toBe(false);
    });

    // Limit validation
    it('should reject limit less than 1', () => {
      const result = ListPoliciesSchema.safeParse({ limit: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject limit greater than 100', () => {
      const result = ListPoliciesSchema.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });

    it('should accept limit at max (100)', () => {
      const result = ListPoliciesSchema.safeParse({ limit: 100 });
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // GetPolicySchema
  // ==========================================================================
  describe('GetPolicySchema', () => {
    it('should accept valid id', () => {
      const result = GetPolicySchema.safeParse({ id: 'policy-123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = GetPolicySchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Policy ID is required');
      }
    });

    it('should reject missing id', () => {
      const result = GetPolicySchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // CreatePolicySchema
  // ==========================================================================
  describe('CreatePolicySchema', () => {
    const validPolicy = {
      name: 'Admin Access Policy',
      policy_content: 'package kubiya\n\ndefault allow = false',
    };

    it('should accept minimal valid policy', () => {
      const result = CreatePolicySchema.safeParse(validPolicy);
      expect(result.success).toBe(true);
    });

    it('should accept fully populated policy', () => {
      const fullPolicy = {
        name: 'Security Policy',
        policy_content: 'package security\n\ndefault deny = true',
        description: 'Comprehensive security policy',
        enabled: false,
        tags: ['security', 'production', 'critical'],
        metadata: {
          author: 'admin',
          version: '1.0',
          reviewed: true,
        },
      };

      const result = CreatePolicySchema.safeParse(fullPolicy);
      expect(result.success).toBe(true);
    });

    it('should apply default enabled', () => {
      const result = CreatePolicySchema.safeParse(validPolicy);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.enabled).toBe(true);
      }
    });

    // Name validation
    it('should reject missing name', () => {
      const result = CreatePolicySchema.safeParse({ policy_content: 'test' });
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const result = CreatePolicySchema.safeParse({ name: '', policy_content: 'test' });
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 255 characters', () => {
      const result = CreatePolicySchema.safeParse({
        name: 'a'.repeat(256),
        policy_content: 'test',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('1-255 characters');
      }
    });

    it('should accept name at max length (255)', () => {
      const result = CreatePolicySchema.safeParse({
        name: 'a'.repeat(255),
        policy_content: 'test',
      });
      expect(result.success).toBe(true);
    });

    // Policy content validation
    it('should reject missing policy_content', () => {
      const result = CreatePolicySchema.safeParse({ name: 'Test' });
      expect(result.success).toBe(false);
    });

    it('should reject empty policy_content', () => {
      const result = CreatePolicySchema.safeParse({ name: 'Test', policy_content: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('required');
      }
    });

    it('should accept very long policy_content', () => {
      const result = CreatePolicySchema.safeParse({
        name: 'Test',
        policy_content: 'a'.repeat(10000),
      });
      expect(result.success).toBe(true);
    });

    // Tags validation
    it('should accept empty tags array', () => {
      const result = CreatePolicySchema.safeParse({ ...validPolicy, tags: [] });
      expect(result.success).toBe(true);
    });

    it('should reject non-string in tags', () => {
      const result = CreatePolicySchema.safeParse({ ...validPolicy, tags: [123] });
      expect(result.success).toBe(false);
    });

    // Metadata validation
    it('should accept empty metadata', () => {
      const result = CreatePolicySchema.safeParse({ ...validPolicy, metadata: {} });
      expect(result.success).toBe(true);
    });

    it('should accept complex metadata', () => {
      const result = CreatePolicySchema.safeParse({
        ...validPolicy,
        metadata: {
          nested: { deep: true },
          array: [1, 2, 3],
        },
      });
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // UpdatePolicySchema
  // ==========================================================================
  describe('UpdatePolicySchema', () => {
    it('should accept id with no updates', () => {
      const result = UpdatePolicySchema.safeParse({ id: 'policy-123' });
      expect(result.success).toBe(true);
    });

    it('should accept id with partial updates', () => {
      const result = UpdatePolicySchema.safeParse({
        id: 'policy-123',
        name: 'Updated Policy',
        enabled: false,
      });
      expect(result.success).toBe(true);
    });

    it('should accept id with all fields', () => {
      const result = UpdatePolicySchema.safeParse({
        id: 'policy-123',
        name: 'Updated Policy',
        policy_content: 'package updated\n\ndefault allow = true',
        description: 'Updated description',
        enabled: false,
        tags: ['updated'],
        metadata: { version: '2.0' },
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing id', () => {
      const result = UpdatePolicySchema.safeParse({ name: 'Test' });
      expect(result.success).toBe(false);
    });

    it('should reject empty id', () => {
      const result = UpdatePolicySchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Policy ID is required');
      }
    });

    // Name validation when provided
    it('should reject name longer than 255 characters when provided', () => {
      const result = UpdatePolicySchema.safeParse({
        id: 'policy-123',
        name: 'a'.repeat(256),
      });
      expect(result.success).toBe(false);
    });

    // Policy content validation when provided
    it('should reject empty policy_content when provided', () => {
      const result = UpdatePolicySchema.safeParse({
        id: 'policy-123',
        policy_content: '',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid policy_content when provided', () => {
      const result = UpdatePolicySchema.safeParse({
        id: 'policy-123',
        policy_content: 'valid content',
      });
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // DeletePolicySchema
  // ==========================================================================
  describe('DeletePolicySchema', () => {
    it('should accept valid id', () => {
      const result = DeletePolicySchema.safeParse({ id: 'policy-123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = DeletePolicySchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Policy ID is required');
      }
    });

    it('should reject missing id', () => {
      const result = DeletePolicySchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
