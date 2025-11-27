/**
 * Workflow-related validation schemas
 */

import { z } from 'zod';
import { ListParamsSchema } from './common.js';

export const ListWorkflowsSchema = ListParamsSchema.extend({
  status: z.string().optional(),
  team_id: z.string().optional(),
});

export const GetWorkflowSchema = z.object({
  id: z.string().min(1, 'Workflow ID is required'),
});

export const CreateWorkflowSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  steps: z.array(z.any()).optional(),
  configuration: z.record(z.any()).optional(),
  team_id: z.string().optional(),
});

export const UpdateWorkflowSchema = z.object({
  id: z.string().min(1, 'Workflow ID is required'),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  steps: z.array(z.any()).optional(),
  configuration: z.record(z.any()).optional(),
  status: z.string().optional(),
});
