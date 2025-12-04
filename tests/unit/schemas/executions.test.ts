/**
 * Execution Schema Unit Tests
 *
 * Comprehensive validation tests for execution-related schemas including:
 * - ListExecutionsSchema
 * - GetExecutionSchema
 * - GetExecutionMessagesSchema
 * - StreamExecutionSchema
 * - GetExecutionEventsSchema
 */

import { describe, it, expect } from 'vitest';
import {
  ListExecutionsSchema,
  GetExecutionSchema,
  GetExecutionMessagesSchema,
  StreamExecutionSchema,
  GetExecutionEventsSchema,
} from '../../../src/schemas/executions.js';

describe('Execution Schemas', () => {
  // ==========================================================================
  // ListExecutionsSchema
  // ==========================================================================
  describe('ListExecutionsSchema', () => {
    it('should accept empty object', () => {
      const result = ListExecutionsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept pagination params', () => {
      const result = ListExecutionsSchema.safeParse({ skip: 10, limit: 50 });
      expect(result.success).toBe(true);
    });

    it('should accept status_filter', () => {
      const result = ListExecutionsSchema.safeParse({ status_filter: 'completed' });
      expect(result.success).toBe(true);
    });

    it('should accept execution_type', () => {
      const result = ListExecutionsSchema.safeParse({ execution_type: 'agent' });
      expect(result.success).toBe(true);
    });

    it('should accept all params combined', () => {
      const result = ListExecutionsSchema.safeParse({
        skip: 0,
        limit: 25,
        status_filter: 'running',
        execution_type: 'team',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid skip', () => {
      const result = ListExecutionsSchema.safeParse({ skip: -1 });
      expect(result.success).toBe(false);
    });

    it('should reject limit exceeding max', () => {
      const result = ListExecutionsSchema.safeParse({ limit: 1001 });
      expect(result.success).toBe(false);
    });

    it('should reject limit below 1', () => {
      const result = ListExecutionsSchema.safeParse({ limit: 0 });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // GetExecutionSchema
  // ==========================================================================
  describe('GetExecutionSchema', () => {
    it('should accept valid id', () => {
      const result = GetExecutionSchema.safeParse({ id: 'exec-123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = GetExecutionSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Execution ID is required');
      }
    });

    it('should reject missing id', () => {
      const result = GetExecutionSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // GetExecutionMessagesSchema
  // ==========================================================================
  describe('GetExecutionMessagesSchema', () => {
    it('should accept valid id', () => {
      const result = GetExecutionMessagesSchema.safeParse({ id: 'exec-123' });
      expect(result.success).toBe(true);
    });

    it('should accept id with pagination', () => {
      const result = GetExecutionMessagesSchema.safeParse({
        id: 'exec-123',
        skip: 10,
        limit: 50,
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = GetExecutionMessagesSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Execution ID is required');
      }
    });

    it('should reject missing id', () => {
      const result = GetExecutionMessagesSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject invalid skip', () => {
      const result = GetExecutionMessagesSchema.safeParse({
        id: 'exec-123',
        skip: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject limit below 1', () => {
      const result = GetExecutionMessagesSchema.safeParse({
        id: 'exec-123',
        limit: 0,
      });
      expect(result.success).toBe(false);
    });

    it('should reject limit exceeding max', () => {
      const result = GetExecutionMessagesSchema.safeParse({
        id: 'exec-123',
        limit: 1001,
      });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // StreamExecutionSchema
  // ==========================================================================
  describe('StreamExecutionSchema', () => {
    it('should accept valid execution_id', () => {
      const result = StreamExecutionSchema.safeParse({ execution_id: 'exec-123' });
      expect(result.success).toBe(true);
    });

    it('should apply default timeout_seconds', () => {
      const result = StreamExecutionSchema.safeParse({ execution_id: 'exec-123' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.timeout_seconds).toBe(270);
      }
    });

    it('should accept custom timeout_seconds', () => {
      const result = StreamExecutionSchema.safeParse({
        execution_id: 'exec-123',
        timeout_seconds: 60,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.timeout_seconds).toBe(60);
      }
    });

    it('should accept event_filter', () => {
      const result = StreamExecutionSchema.safeParse({
        execution_id: 'exec-123',
        event_filter: ['message', 'status', 'done'],
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty execution_id', () => {
      const result = StreamExecutionSchema.safeParse({ execution_id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Execution ID is required');
      }
    });

    it('should reject missing execution_id', () => {
      const result = StreamExecutionSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    // Timeout validation
    it('should accept timeout_seconds at min (1)', () => {
      const result = StreamExecutionSchema.safeParse({
        execution_id: 'exec-123',
        timeout_seconds: 1,
      });
      expect(result.success).toBe(true);
    });

    it('should reject timeout_seconds < 1', () => {
      const result = StreamExecutionSchema.safeParse({
        execution_id: 'exec-123',
        timeout_seconds: 0,
      });
      expect(result.success).toBe(false);
    });

    it('should accept timeout_seconds at max (300)', () => {
      const result = StreamExecutionSchema.safeParse({
        execution_id: 'exec-123',
        timeout_seconds: 300,
      });
      expect(result.success).toBe(true);
    });

    it('should reject timeout_seconds > 300', () => {
      const result = StreamExecutionSchema.safeParse({
        execution_id: 'exec-123',
        timeout_seconds: 301,
      });
      expect(result.success).toBe(false);
    });

    // Event filter validation
    it('should accept empty event_filter', () => {
      const result = StreamExecutionSchema.safeParse({
        execution_id: 'exec-123',
        event_filter: [],
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-string in event_filter', () => {
      const result = StreamExecutionSchema.safeParse({
        execution_id: 'exec-123',
        event_filter: [123],
      });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // GetExecutionEventsSchema
  // ==========================================================================
  describe('GetExecutionEventsSchema', () => {
    it('should accept valid execution_id', () => {
      const result = GetExecutionEventsSchema.safeParse({ execution_id: 'exec-123' });
      expect(result.success).toBe(true);
    });

    it('should apply default limit', () => {
      const result = GetExecutionEventsSchema.safeParse({ execution_id: 'exec-123' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
      }
    });

    it('should accept last_event_id', () => {
      const result = GetExecutionEventsSchema.safeParse({
        execution_id: 'exec-123',
        last_event_id: 'event-456',
      });
      expect(result.success).toBe(true);
    });

    it('should accept custom limit', () => {
      const result = GetExecutionEventsSchema.safeParse({
        execution_id: 'exec-123',
        limit: 25,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(25);
      }
    });

    it('should accept all params combined', () => {
      const result = GetExecutionEventsSchema.safeParse({
        execution_id: 'exec-123',
        last_event_id: 'event-100',
        limit: 75,
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty execution_id', () => {
      const result = GetExecutionEventsSchema.safeParse({ execution_id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Execution ID is required');
      }
    });

    it('should reject missing execution_id', () => {
      const result = GetExecutionEventsSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    // Limit validation
    it('should accept limit at min (1)', () => {
      const result = GetExecutionEventsSchema.safeParse({
        execution_id: 'exec-123',
        limit: 1,
      });
      expect(result.success).toBe(true);
    });

    it('should reject limit < 1', () => {
      const result = GetExecutionEventsSchema.safeParse({
        execution_id: 'exec-123',
        limit: 0,
      });
      expect(result.success).toBe(false);
    });

    it('should accept limit at max (100)', () => {
      const result = GetExecutionEventsSchema.safeParse({
        execution_id: 'exec-123',
        limit: 100,
      });
      expect(result.success).toBe(true);
    });

    it('should reject limit > 100', () => {
      const result = GetExecutionEventsSchema.safeParse({
        execution_id: 'exec-123',
        limit: 101,
      });
      expect(result.success).toBe(false);
    });
  });
});
