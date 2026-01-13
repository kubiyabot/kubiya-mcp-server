/**
 * Policy-related validation schemas
 */

import { z } from 'zod';

export const ListPoliciesSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
  enabled: z.boolean().optional(),
  search: z.string().optional(),
});

export const GetPolicySchema = z.object({
  id: z.string().min(1, 'Policy ID is required'),
});

export const CreatePolicySchema = z.object({
  name: z.string().min(1).max(255, 'Name must be 1-255 characters'),
  policy_content: z.string().min(1, 'Policy content is required'),
  description: z.string().optional(),
  enabled: z.boolean().optional().default(true),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export const UpdatePolicySchema = z.object({
  id: z.string().min(1, 'Policy ID is required'),
  name: z.string().min(1).max(255).optional(),
  policy_content: z.string().min(1).optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export const DeletePolicySchema = z.object({
  id: z.string().min(1, 'Policy ID is required'),
});
