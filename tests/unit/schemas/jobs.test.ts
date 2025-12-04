/**
 * Job Schema Unit Tests
 *
 * Comprehensive validation tests for job-related schemas including:
 * - ListJobsSchema
 * - GetJobSchema
 * - CreateJobSchema
 * - UpdateJobSchema
 * - DeleteJobSchema
 * - TriggerJobSchema
 */

import { describe, it, expect } from 'vitest';
import {
  ListJobsSchema,
  GetJobSchema,
  CreateJobSchema,
  UpdateJobSchema,
  DeleteJobSchema,
  TriggerJobSchema,
} from '../../../src/schemas/jobs.js';

describe('Job Schemas', () => {
  // ==========================================================================
  // ListJobsSchema
  // ==========================================================================
  describe('ListJobsSchema', () => {
    it('should accept empty object', () => {
      const result = ListJobsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept enabled filter', () => {
      const result = ListJobsSchema.safeParse({ enabled: true });
      expect(result.success).toBe(true);
    });

    it('should accept trigger_type: cron', () => {
      const result = ListJobsSchema.safeParse({ trigger_type: 'cron' });
      expect(result.success).toBe(true);
    });

    it('should accept trigger_type: webhook', () => {
      const result = ListJobsSchema.safeParse({ trigger_type: 'webhook' });
      expect(result.success).toBe(true);
    });

    it('should accept trigger_type: manual', () => {
      const result = ListJobsSchema.safeParse({ trigger_type: 'manual' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid trigger_type', () => {
      const result = ListJobsSchema.safeParse({ trigger_type: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('should accept combined filters', () => {
      const result = ListJobsSchema.safeParse({
        enabled: false,
        trigger_type: 'cron',
      });
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // GetJobSchema
  // ==========================================================================
  describe('GetJobSchema', () => {
    it('should accept valid id', () => {
      const result = GetJobSchema.safeParse({ id: 'job-123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = GetJobSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Job ID is required');
      }
    });

    it('should reject missing id', () => {
      const result = GetJobSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // CreateJobSchema
  // ==========================================================================
  describe('CreateJobSchema', () => {
    const validJob = {
      name: 'Daily Report',
      trigger_type: 'cron',
      prompt_template: 'Generate daily report for {{date}}',
    };

    it('should accept minimal valid cron job', () => {
      const result = CreateJobSchema.safeParse(validJob);
      expect(result.success).toBe(true);
    });

    it('should accept fully populated cron job', () => {
      const fullJob = {
        name: 'Production Report',
        description: 'Daily production metrics report',
        enabled: true,
        trigger_type: 'cron',
        cron_schedule: '0 9 * * *',
        cron_timezone: 'America/New_York',
        planning_mode: 'predefined_agent',
        entity_type: 'agent',
        entity_id: 'agent-123',
        prompt_template: 'Generate report for {{date}}',
        system_prompt: 'You are a reporting assistant.',
        executor_type: 'specific_queue',
        worker_queue_name: 'high-priority',
        environment_name: 'production',
        config: { retries: 3 },
      };

      const result = CreateJobSchema.safeParse(fullJob);
      expect(result.success).toBe(true);
    });

    it('should accept webhook trigger_type', () => {
      const result = CreateJobSchema.safeParse({
        ...validJob,
        trigger_type: 'webhook',
      });
      expect(result.success).toBe(true);
    });

    it('should accept manual trigger_type', () => {
      const result = CreateJobSchema.safeParse({
        ...validJob,
        trigger_type: 'manual',
      });
      expect(result.success).toBe(true);
    });

    // Default values
    it('should apply default enabled', () => {
      const result = CreateJobSchema.safeParse(validJob);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.enabled).toBe(true);
      }
    });

    it('should apply default cron_timezone', () => {
      const result = CreateJobSchema.safeParse(validJob);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cron_timezone).toBe('UTC');
      }
    });

    it('should apply default planning_mode', () => {
      const result = CreateJobSchema.safeParse(validJob);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.planning_mode).toBe('predefined_agent');
      }
    });

    it('should apply default executor_type', () => {
      const result = CreateJobSchema.safeParse(validJob);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.executor_type).toBe('auto');
      }
    });

    // Name validation
    it('should reject missing name', () => {
      const result = CreateJobSchema.safeParse({
        trigger_type: 'cron',
        prompt_template: 'test',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const result = CreateJobSchema.safeParse({
        name: '',
        trigger_type: 'cron',
        prompt_template: 'test',
      });
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 255 characters', () => {
      const result = CreateJobSchema.safeParse({
        name: 'a'.repeat(256),
        trigger_type: 'cron',
        prompt_template: 'test',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('1-255 characters');
      }
    });

    // Trigger type validation
    it('should reject missing trigger_type', () => {
      const result = CreateJobSchema.safeParse({
        name: 'Test',
        prompt_template: 'test',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid trigger_type', () => {
      const result = CreateJobSchema.safeParse({
        name: 'Test',
        trigger_type: 'invalid',
        prompt_template: 'test',
      });
      expect(result.success).toBe(false);
    });

    // Prompt template validation
    it('should reject missing prompt_template', () => {
      const result = CreateJobSchema.safeParse({
        name: 'Test',
        trigger_type: 'cron',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty prompt_template', () => {
      const result = CreateJobSchema.safeParse({
        name: 'Test',
        trigger_type: 'cron',
        prompt_template: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('required');
      }
    });

    // Planning mode enum validation
    it('should accept all valid planning_mode values', () => {
      const modes = ['on_the_fly', 'predefined_agent', 'predefined_team', 'predefined_workflow'];

      for (const mode of modes) {
        const result = CreateJobSchema.safeParse({
          ...validJob,
          planning_mode: mode,
        });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid planning_mode', () => {
      const result = CreateJobSchema.safeParse({
        ...validJob,
        planning_mode: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    // Entity type enum validation
    it('should accept all valid entity_type values', () => {
      const types = ['agent', 'team', 'workflow'];

      for (const type of types) {
        const result = CreateJobSchema.safeParse({
          ...validJob,
          entity_type: type,
        });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid entity_type', () => {
      const result = CreateJobSchema.safeParse({
        ...validJob,
        entity_type: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    // Executor type enum validation
    it('should accept all valid executor_type values', () => {
      const types = ['auto', 'specific_queue', 'environment'];

      for (const type of types) {
        const result = CreateJobSchema.safeParse({
          ...validJob,
          executor_type: type,
        });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid executor_type', () => {
      const result = CreateJobSchema.safeParse({
        ...validJob,
        executor_type: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    // Config validation
    it('should accept complex config object', () => {
      const result = CreateJobSchema.safeParse({
        ...validJob,
        config: {
          retries: 3,
          timeout: 300,
          notifications: { email: true },
        },
      });
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // UpdateJobSchema
  // ==========================================================================
  describe('UpdateJobSchema', () => {
    it('should accept id with no updates', () => {
      const result = UpdateJobSchema.safeParse({ id: 'job-123' });
      expect(result.success).toBe(true);
    });

    it('should accept id with partial updates', () => {
      const result = UpdateJobSchema.safeParse({
        id: 'job-123',
        name: 'Updated Job',
        enabled: false,
      });
      expect(result.success).toBe(true);
    });

    it('should accept id with all fields', () => {
      const result = UpdateJobSchema.safeParse({
        id: 'job-123',
        name: 'Updated Job',
        description: 'Updated description',
        enabled: false,
        trigger_type: 'webhook',
        cron_schedule: '0 10 * * *',
        cron_timezone: 'Europe/London',
        planning_mode: 'predefined_team',
        entity_type: 'team',
        entity_id: 'team-456',
        prompt_template: 'Updated template',
        system_prompt: 'Updated system prompt',
        executor_type: 'environment',
        worker_queue_name: 'new-queue',
        environment_name: 'staging',
        config: { updated: true },
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing id', () => {
      const result = UpdateJobSchema.safeParse({ name: 'Test' });
      expect(result.success).toBe(false);
    });

    it('should reject empty id', () => {
      const result = UpdateJobSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Job ID is required');
      }
    });

    it('should reject name longer than 255 characters when provided', () => {
      const result = UpdateJobSchema.safeParse({
        id: 'job-123',
        name: 'a'.repeat(256),
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid trigger_type when provided', () => {
      const result = UpdateJobSchema.safeParse({
        id: 'job-123',
        trigger_type: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid planning_mode when provided', () => {
      const result = UpdateJobSchema.safeParse({
        id: 'job-123',
        planning_mode: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // DeleteJobSchema
  // ==========================================================================
  describe('DeleteJobSchema', () => {
    it('should accept valid id', () => {
      const result = DeleteJobSchema.safeParse({ id: 'job-123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = DeleteJobSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Job ID is required');
      }
    });

    it('should reject missing id', () => {
      const result = DeleteJobSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // TriggerJobSchema
  // ==========================================================================
  describe('TriggerJobSchema', () => {
    it('should accept valid id', () => {
      const result = TriggerJobSchema.safeParse({ id: 'job-123' });
      expect(result.success).toBe(true);
    });

    it('should accept id with variables', () => {
      const result = TriggerJobSchema.safeParse({
        id: 'job-123',
        variables: {
          date: '2025-01-01',
          region: 'us-east-1',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept complex variables', () => {
      const result = TriggerJobSchema.safeParse({
        id: 'job-123',
        variables: {
          nested: { deep: true },
          array: [1, 2, 3],
          null: null,
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty variables', () => {
      const result = TriggerJobSchema.safeParse({
        id: 'job-123',
        variables: {},
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing id', () => {
      const result = TriggerJobSchema.safeParse({ variables: {} });
      expect(result.success).toBe(false);
    });

    it('should reject empty id', () => {
      const result = TriggerJobSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Job ID is required');
      }
    });
  });
});
