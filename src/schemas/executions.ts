/**
 * Execution-related validation schemas
 */

import { z } from 'zod';
import { ListParamsSchema } from './common.js';

export const ListExecutionsSchema = ListParamsSchema.extend({
  status_filter: z.string().optional(),
  execution_type: z.string().optional(),
});

export const GetExecutionSchema = z.object({
  id: z.string().min(1, 'Execution ID is required'),
});

export const GetExecutionMessagesSchema = z.object({
  id: z.string().min(1, 'Execution ID is required'),
  skip: z.number().min(0).optional(),
  limit: z.number().min(1).max(1000).optional(),
});

export const StreamExecutionSchema = z.object({
  execution_id: z.string().min(1, 'Execution ID is required'),
  timeout_seconds: z.number().min(1).max(300).optional().default(270),
  event_filter: z.array(z.string()).optional(),
});

export const GetExecutionEventsSchema = z.object({
  execution_id: z.string().min(1, 'Execution ID is required'),
  last_event_id: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(50),
});
