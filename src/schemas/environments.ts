/**
 * Environment-related validation schemas
 */

import { z } from 'zod';

export const ListEnvironmentsSchema = z.object({
  status_filter: z.string().optional(),
});

export const GetEnvironmentSchema = z.object({
  id: z.string().min(1, 'Environment ID is required'),
});

export const CreateEnvironmentSchema = z.object({
  name: z.string().min(2).max(100, 'Name must be 2-100 characters'),
  display_name: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  settings: z.record(z.any()).optional(),
});

export const UpdateEnvironmentSchema = z.object({
  id: z.string().min(1, 'Environment ID is required'),
  name: z.string().min(2).max(100).optional(),
  display_name: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  settings: z.record(z.any()).optional(),
  status: z.string().optional(),
});

export const DeleteEnvironmentSchema = z.object({
  id: z.string().min(1, 'Environment ID is required'),
});
