/**
 * Worker Queue Schema Unit Tests
 *
 * Comprehensive validation tests for worker queue-related schemas including:
 * - ListWorkerQueuesSchema
 * - ListWorkerQueuesByEnvironmentSchema
 * - GetWorkerQueueSchema
 * - CreateWorkerQueueSchema
 * - UpdateWorkerQueueSchema
 * - DeleteWorkerQueueSchema
 */

import { describe, it, expect } from 'vitest';
import {
  ListWorkerQueuesSchema,
  ListWorkerQueuesByEnvironmentSchema,
  GetWorkerQueueSchema,
  CreateWorkerQueueSchema,
  UpdateWorkerQueueSchema,
  DeleteWorkerQueueSchema,
} from '../../../src/schemas/worker-queues.js';

describe('Worker Queue Schemas', () => {
  // ==========================================================================
  // ListWorkerQueuesSchema
  // ==========================================================================
  describe('ListWorkerQueuesSchema', () => {
    it('should accept empty object', () => {
      const result = ListWorkerQueuesSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // ListWorkerQueuesByEnvironmentSchema
  // ==========================================================================
  describe('ListWorkerQueuesByEnvironmentSchema', () => {
    it('should accept valid environment_id', () => {
      const result = ListWorkerQueuesByEnvironmentSchema.safeParse({
        environment_id: 'env-123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty environment_id', () => {
      const result = ListWorkerQueuesByEnvironmentSchema.safeParse({
        environment_id: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Environment ID is required');
      }
    });

    it('should reject missing environment_id', () => {
      const result = ListWorkerQueuesByEnvironmentSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // GetWorkerQueueSchema
  // ==========================================================================
  describe('GetWorkerQueueSchema', () => {
    it('should accept valid id', () => {
      const result = GetWorkerQueueSchema.safeParse({ id: 'queue-123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = GetWorkerQueueSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Worker Queue ID is required');
      }
    });

    it('should reject missing id', () => {
      const result = GetWorkerQueueSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // CreateWorkerQueueSchema
  // ==========================================================================
  describe('CreateWorkerQueueSchema', () => {
    const validQueue = {
      environment_id: 'env-123',
      name: 'default-queue',
    };

    it('should accept minimal valid queue', () => {
      const result = CreateWorkerQueueSchema.safeParse(validQueue);
      expect(result.success).toBe(true);
    });

    it('should accept fully populated queue', () => {
      const fullQueue = {
        environment_id: 'env-123',
        name: 'high-priority-queue',
        display_name: 'High Priority Queue',
        description: 'Queue for high priority tasks',
        max_workers: 20,
        heartbeat_interval: 30,
        tags: ['priority', 'production'],
        settings: { autoscale: true, min_workers: 5 },
      };

      const result = CreateWorkerQueueSchema.safeParse(fullQueue);
      expect(result.success).toBe(true);
    });

    it('should apply default heartbeat_interval', () => {
      const result = CreateWorkerQueueSchema.safeParse(validQueue);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.heartbeat_interval).toBe(60);
      }
    });

    // Environment ID validation
    it('should reject missing environment_id', () => {
      const result = CreateWorkerQueueSchema.safeParse({ name: 'test' });
      expect(result.success).toBe(false);
    });

    it('should reject empty environment_id', () => {
      const result = CreateWorkerQueueSchema.safeParse({
        environment_id: '',
        name: 'test',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Environment ID is required');
      }
    });

    // Name validation
    it('should reject missing name', () => {
      const result = CreateWorkerQueueSchema.safeParse({ environment_id: 'env-123' });
      expect(result.success).toBe(false);
    });

    it('should reject name shorter than 2 characters', () => {
      const result = CreateWorkerQueueSchema.safeParse({
        environment_id: 'env-123',
        name: 'a',
      });
      expect(result.success).toBe(false);
    });

    it('should accept name at minimum length (2)', () => {
      const result = CreateWorkerQueueSchema.safeParse({
        environment_id: 'env-123',
        name: 'ab',
      });
      expect(result.success).toBe(true);
    });

    it('should reject name longer than 50 characters', () => {
      const result = CreateWorkerQueueSchema.safeParse({
        environment_id: 'env-123',
        name: 'a'.repeat(51),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('2-50 characters');
      }
    });

    it('should accept name at maximum length (50)', () => {
      const result = CreateWorkerQueueSchema.safeParse({
        environment_id: 'env-123',
        name: 'a'.repeat(50),
      });
      expect(result.success).toBe(true);
    });

    // Max workers validation
    it('should accept max_workers >= 1', () => {
      const result = CreateWorkerQueueSchema.safeParse({
        ...validQueue,
        max_workers: 1,
      });
      expect(result.success).toBe(true);
    });

    it('should reject max_workers < 1', () => {
      const result = CreateWorkerQueueSchema.safeParse({
        ...validQueue,
        max_workers: 0,
      });
      expect(result.success).toBe(false);
    });

    // Heartbeat interval validation
    it('should accept heartbeat_interval at min (10)', () => {
      const result = CreateWorkerQueueSchema.safeParse({
        ...validQueue,
        heartbeat_interval: 10,
      });
      expect(result.success).toBe(true);
    });

    it('should reject heartbeat_interval < 10', () => {
      const result = CreateWorkerQueueSchema.safeParse({
        ...validQueue,
        heartbeat_interval: 9,
      });
      expect(result.success).toBe(false);
    });

    it('should accept heartbeat_interval at max (300)', () => {
      const result = CreateWorkerQueueSchema.safeParse({
        ...validQueue,
        heartbeat_interval: 300,
      });
      expect(result.success).toBe(true);
    });

    it('should reject heartbeat_interval > 300', () => {
      const result = CreateWorkerQueueSchema.safeParse({
        ...validQueue,
        heartbeat_interval: 301,
      });
      expect(result.success).toBe(false);
    });

    // Tags validation
    it('should accept empty tags array', () => {
      const result = CreateWorkerQueueSchema.safeParse({
        ...validQueue,
        tags: [],
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-string in tags', () => {
      const result = CreateWorkerQueueSchema.safeParse({
        ...validQueue,
        tags: [123],
      });
      expect(result.success).toBe(false);
    });

    // Settings validation
    it('should accept complex settings object', () => {
      const result = CreateWorkerQueueSchema.safeParse({
        ...validQueue,
        settings: {
          nested: { deep: true },
          array: [1, 2, 3],
        },
      });
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // UpdateWorkerQueueSchema
  // ==========================================================================
  describe('UpdateWorkerQueueSchema', () => {
    it('should accept id with no updates', () => {
      const result = UpdateWorkerQueueSchema.safeParse({ id: 'queue-123' });
      expect(result.success).toBe(true);
    });

    it('should accept id with partial updates', () => {
      const result = UpdateWorkerQueueSchema.safeParse({
        id: 'queue-123',
        display_name: 'Updated Queue',
        status: 'inactive',
      });
      expect(result.success).toBe(true);
    });

    it('should accept id with all fields', () => {
      const result = UpdateWorkerQueueSchema.safeParse({
        id: 'queue-123',
        name: 'updated-queue',
        display_name: 'Updated Queue',
        description: 'Updated description',
        status: 'active',
        max_workers: 30,
        heartbeat_interval: 45,
        tags: ['updated'],
        settings: { updated: true },
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing id', () => {
      const result = UpdateWorkerQueueSchema.safeParse({ name: 'test' });
      expect(result.success).toBe(false);
    });

    it('should reject empty id', () => {
      const result = UpdateWorkerQueueSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Worker Queue ID is required');
      }
    });

    // Name validation when provided
    it('should reject name shorter than 2 characters when provided', () => {
      const result = UpdateWorkerQueueSchema.safeParse({
        id: 'queue-123',
        name: 'a',
      });
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 50 characters when provided', () => {
      const result = UpdateWorkerQueueSchema.safeParse({
        id: 'queue-123',
        name: 'a'.repeat(51),
      });
      expect(result.success).toBe(false);
    });

    // Heartbeat interval validation when provided
    it('should reject heartbeat_interval < 10 when provided', () => {
      const result = UpdateWorkerQueueSchema.safeParse({
        id: 'queue-123',
        heartbeat_interval: 9,
      });
      expect(result.success).toBe(false);
    });

    it('should reject heartbeat_interval > 300 when provided', () => {
      const result = UpdateWorkerQueueSchema.safeParse({
        id: 'queue-123',
        heartbeat_interval: 301,
      });
      expect(result.success).toBe(false);
    });

    // Max workers validation when provided
    it('should reject max_workers < 1 when provided', () => {
      const result = UpdateWorkerQueueSchema.safeParse({
        id: 'queue-123',
        max_workers: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // DeleteWorkerQueueSchema
  // ==========================================================================
  describe('DeleteWorkerQueueSchema', () => {
    it('should accept valid id', () => {
      const result = DeleteWorkerQueueSchema.safeParse({ id: 'queue-123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = DeleteWorkerQueueSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Worker Queue ID is required');
      }
    });

    it('should reject missing id', () => {
      const result = DeleteWorkerQueueSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
