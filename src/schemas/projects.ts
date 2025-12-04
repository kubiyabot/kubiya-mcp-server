/**
 * Project-related validation schemas
 */

import { z } from 'zod';

export const ListProjectsSchema = z.object({
  status_filter: z.string().optional(),
});

export const GetProjectSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  key: z.string().min(2).max(50, 'Key must be 2-50 characters'),
  description: z.string().optional(),
  goals: z.string().optional(),
  settings: z.record(z.any()).optional(),
  visibility: z.enum(['private', 'org']).optional().default('private'),
  restrict_to_environment: z.boolean().optional().default(false),
  policy_ids: z.array(z.string()).optional(),
  default_model: z.string().optional(),
});

export const UpdateProjectSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  name: z.string().min(1).optional(),
  key: z.string().min(2).max(50).optional(),
  description: z.string().optional(),
  goals: z.string().optional(),
  settings: z.record(z.any()).optional(),
  status: z.string().optional(),
  visibility: z.enum(['private', 'org']).optional(),
  restrict_to_environment: z.boolean().optional(),
  policy_ids: z.array(z.string()).optional(),
  default_model: z.string().optional(),
});

export const DeleteProjectSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
});
