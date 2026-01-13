/**
 * Agent Schema Unit Tests
 *
 * Comprehensive validation tests for agent-related schemas including:
 * - ListAgentsSchema
 * - GetAgentSchema
 * - CreateAgentSchema
 * - UpdateAgentSchema
 * - DeleteAgentSchema
 * - ExecuteAgentSchema
 */

import { describe, it, expect } from 'vitest';
import {
  ListAgentsSchema,
  GetAgentSchema,
  CreateAgentSchema,
  UpdateAgentSchema,
  DeleteAgentSchema,
  ExecuteAgentSchema,
} from '../../../src/schemas/agents.js';

describe('Agent Schemas', () => {
  // ==========================================================================
  // ListAgentsSchema
  // ==========================================================================
  describe('ListAgentsSchema', () => {
    it('should accept valid pagination params', () => {
      const result = ListAgentsSchema.safeParse({ skip: 0, limit: 50 });
      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const result = ListAgentsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject invalid skip', () => {
      const result = ListAgentsSchema.safeParse({ skip: -1 });
      expect(result.success).toBe(false);
    });

    it('should reject invalid limit', () => {
      const result = ListAgentsSchema.safeParse({ limit: 0 });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // GetAgentSchema
  // ==========================================================================
  describe('GetAgentSchema', () => {
    it('should accept valid id', () => {
      const result = GetAgentSchema.safeParse({ id: 'agent-123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = GetAgentSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Agent ID is required');
      }
    });

    it('should reject missing id', () => {
      const result = GetAgentSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // CreateAgentSchema
  // ==========================================================================
  describe('CreateAgentSchema', () => {
    const validAgent = {
      name: 'Test Agent',
      instructions: 'You are a helpful assistant.',
    };

    it('should accept minimal valid agent', () => {
      const result = CreateAgentSchema.safeParse(validAgent);
      expect(result.success).toBe(true);
    });

    it('should accept fully populated agent', () => {
      const fullAgent = {
        name: 'Production Agent',
        description: 'A production-ready agent',
        instructions: 'Help users with their questions.',
        model: 'gpt-4',
        runtime: 'default',
        runner_name: 'default-runner',
        project_ids: ['proj-1', 'proj-2'],
        environment_ids: ['env-1'],
      };

      const result = CreateAgentSchema.safeParse(fullAgent);
      expect(result.success).toBe(true);
    });

    // Required fields
    it('should reject missing name', () => {
      const result = CreateAgentSchema.safeParse({ instructions: 'test' });
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const result = CreateAgentSchema.safeParse({ name: '', instructions: 'test' });
      expect(result.success).toBe(false);
    });

    it('should reject name exceeding 255 characters', () => {
      const result = CreateAgentSchema.safeParse({
        name: 'a'.repeat(256),
        instructions: 'test',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing instructions', () => {
      const result = CreateAgentSchema.safeParse({ name: 'Test' });
      expect(result.success).toBe(false);
    });

    it('should reject empty instructions', () => {
      const result = CreateAgentSchema.safeParse({ name: 'Test', instructions: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Instructions are required');
      }
    });

    // Optional fields
    it('should accept empty arrays for project_ids', () => {
      const result = CreateAgentSchema.safeParse({
        ...validAgent,
        project_ids: [],
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty arrays for environment_ids', () => {
      const result = CreateAgentSchema.safeParse({
        ...validAgent,
        environment_ids: [],
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-string in project_ids array', () => {
      const result = CreateAgentSchema.safeParse({
        ...validAgent,
        project_ids: [123],
      });
      expect(result.success).toBe(false);
    });

    // Edge cases
    it('should accept name at max length (255)', () => {
      const result = CreateAgentSchema.safeParse({
        name: 'a'.repeat(255),
        instructions: 'test',
      });
      expect(result.success).toBe(true);
    });

    it('should accept very long instructions', () => {
      const result = CreateAgentSchema.safeParse({
        name: 'Test',
        instructions: 'a'.repeat(10000),
      });
      expect(result.success).toBe(true);
    });

    it('should accept whitespace-only name (not trimmed)', () => {
      const result = CreateAgentSchema.safeParse({
        name: '   ',
        instructions: 'test',
      });
      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // UpdateAgentSchema
  // ==========================================================================
  describe('UpdateAgentSchema', () => {
    it('should accept id with no updates', () => {
      const result = UpdateAgentSchema.safeParse({ id: 'agent-123' });
      expect(result.success).toBe(true);
    });

    it('should accept id with partial updates', () => {
      const result = UpdateAgentSchema.safeParse({
        id: 'agent-123',
        name: 'Updated Name',
      });
      expect(result.success).toBe(true);
    });

    it('should accept id with all fields', () => {
      const result = UpdateAgentSchema.safeParse({
        id: 'agent-123',
        name: 'Updated Name',
        description: 'Updated description',
        instructions: 'New instructions',
        model: 'claude-3',
        runtime: 'special',
        runner_name: 'new-runner',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing id', () => {
      const result = UpdateAgentSchema.safeParse({ name: 'Test' });
      expect(result.success).toBe(false);
    });

    it('should reject empty id', () => {
      const result = UpdateAgentSchema.safeParse({ id: '', name: 'Test' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Agent ID is required');
      }
    });

    it('should reject name exceeding 255 characters', () => {
      const result = UpdateAgentSchema.safeParse({
        id: 'agent-123',
        name: 'a'.repeat(256),
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty name if provided', () => {
      const result = UpdateAgentSchema.safeParse({
        id: 'agent-123',
        name: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty instructions if provided', () => {
      const result = UpdateAgentSchema.safeParse({
        id: 'agent-123',
        instructions: '',
      });
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // DeleteAgentSchema
  // ==========================================================================
  describe('DeleteAgentSchema', () => {
    it('should accept valid id', () => {
      const result = DeleteAgentSchema.safeParse({ id: 'agent-123' });
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const result = DeleteAgentSchema.safeParse({ id: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Agent ID is required');
      }
    });

    it('should reject missing id', () => {
      const result = DeleteAgentSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // ==========================================================================
  // ExecuteAgentSchema
  // ==========================================================================
  describe('ExecuteAgentSchema', () => {
    it('should accept valid execution params', () => {
      const result = ExecuteAgentSchema.safeParse({
        agent_id: 'agent-123',
        prompt: 'Hello, agent!',
      });
      expect(result.success).toBe(true);
    });

    it('should accept with optional environment_id', () => {
      const result = ExecuteAgentSchema.safeParse({
        agent_id: 'agent-123',
        prompt: 'Hello!',
        environment_id: 'env-1',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing agent_id', () => {
      const result = ExecuteAgentSchema.safeParse({ prompt: 'Hello!' });
      expect(result.success).toBe(false);
    });

    it('should reject empty agent_id', () => {
      const result = ExecuteAgentSchema.safeParse({
        agent_id: '',
        prompt: 'Hello!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Agent ID is required');
      }
    });

    it('should reject missing prompt', () => {
      const result = ExecuteAgentSchema.safeParse({ agent_id: 'agent-123' });
      expect(result.success).toBe(false);
    });

    it('should reject empty prompt', () => {
      const result = ExecuteAgentSchema.safeParse({
        agent_id: 'agent-123',
        prompt: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Prompt is required');
      }
    });

    it('should accept very long prompt', () => {
      const result = ExecuteAgentSchema.safeParse({
        agent_id: 'agent-123',
        prompt: 'a'.repeat(50000),
      });
      expect(result.success).toBe(true);
    });
  });
});
