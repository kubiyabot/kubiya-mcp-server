/**
 * Team-related validation schemas
 */

import { z } from 'zod';
import { ListParamsSchema } from './common.js';

export const ListTeamsSchema = ListParamsSchema;

export const GetTeamSchema = z.object({
  id: z.string().min(1, 'Team ID is required'),
});

export const CreateTeamSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  members: z.array(z.string()).optional(),
});

export const UpdateTeamSchema = z.object({
  id: z.string().min(1, 'Team ID is required'),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  members: z.array(z.string()).optional(),
});

export const ExecuteTeamSchema = z.object({
  team_id: z.string().min(1, 'Team ID is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  environment_id: z.string().optional(),
});
