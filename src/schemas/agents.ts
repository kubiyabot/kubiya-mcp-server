/**
 * Agent-related validation schemas
 */

import { z } from 'zod';
import { ListParamsSchema } from './common.js';

export const ListAgentsSchema = ListParamsSchema;

export const GetAgentSchema = z.object({
  id: z.string().min(1, 'Agent ID is required'),
});

export const CreateAgentSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  instructions: z.string().min(1, 'Instructions are required'),
  model: z.string().optional(),
  runtime: z.string().optional(),
  runner_name: z.string().optional(),
  project_ids: z.array(z.string()).optional(),
  environment_ids: z.array(z.string()).optional(),
});

export const UpdateAgentSchema = z.object({
  id: z.string().min(1, 'Agent ID is required'),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  instructions: z.string().min(1).optional(),
  model: z.string().optional(),
  runtime: z.string().optional(),
  runner_name: z.string().optional(),
});

export const DeleteAgentSchema = z.object({
  id: z.string().min(1, 'Agent ID is required'),
});

export const ExecuteAgentSchema = z.object({
  agent_id: z.string().min(1, 'Agent ID is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  environment_id: z.string().optional(),
});
