/**
 * Team-related validation schemas
 */

import { z } from 'zod';
import { ListParamsSchema } from './common.js';

export const ListTeamsSchema = ListParamsSchema.extend({
  status_filter: z.string().optional(),
});

export const GetTeamSchema = z.object({
  id: z.string().min(1, 'Team ID is required'),
});

export const CreateTeamSchema = z.object({
  name: z.string().min(1).max(255, 'Name must be 1-255 characters'),
  description: z.string().optional(),
  runtime: z.enum(['default', 'claude_code']).optional().default('default'),
  configuration: z.record(z.any()).optional(),
  skill_ids: z.array(z.string()).optional(),
  skill_configurations: z.record(z.record(z.any())).optional(),
});

export const UpdateTeamSchema = z.object({
  id: z.string().min(1, 'Team ID is required'),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  runtime: z.enum(['default', 'claude_code']).optional(),
  configuration: z.record(z.any()).optional(),
  skill_ids: z.array(z.string()).optional(),
  skill_configurations: z.record(z.record(z.any())).optional(),
  environment_ids: z.array(z.string()).optional(),
});

export const DeleteTeamSchema = z.object({
  id: z.string().min(1, 'Team ID is required'),
});

export const ExecuteTeamSchema = z.object({
  team_id: z.string().min(1, 'Team ID is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  environment_id: z.string().optional(),
});
