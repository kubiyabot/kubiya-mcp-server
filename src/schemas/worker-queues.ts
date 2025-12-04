/**
 * Worker Queue-related validation schemas
 */

import { z } from 'zod';

export const ListWorkerQueuesSchema = z.object({});

export const ListWorkerQueuesByEnvironmentSchema = z.object({
  environment_id: z.string().min(1, 'Environment ID is required'),
});

export const GetWorkerQueueSchema = z.object({
  id: z.string().min(1, 'Worker Queue ID is required'),
});

export const CreateWorkerQueueSchema = z.object({
  environment_id: z.string().min(1, 'Environment ID is required'),
  name: z.string().min(2).max(50, 'Name must be 2-50 characters'),
  display_name: z.string().optional(),
  description: z.string().optional(),
  max_workers: z.number().min(1).optional(),
  heartbeat_interval: z.number().min(10).max(300).optional().default(60),
  tags: z.array(z.string()).optional(),
  settings: z.record(z.any()).optional(),
});

export const UpdateWorkerQueueSchema = z.object({
  id: z.string().min(1, 'Worker Queue ID is required'),
  name: z.string().min(2).max(50).optional(),
  display_name: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  max_workers: z.number().min(1).optional(),
  heartbeat_interval: z.number().min(10).max(300).optional(),
  tags: z.array(z.string()).optional(),
  settings: z.record(z.any()).optional(),
});

export const DeleteWorkerQueueSchema = z.object({
  id: z.string().min(1, 'Worker Queue ID is required'),
});
