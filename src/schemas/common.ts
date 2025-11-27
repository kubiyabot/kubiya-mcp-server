/**
 * Common validation schemas used across tools
 */

import { z } from 'zod';

export const IdParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const ListParamsSchema = z.object({
  skip: z.number().min(0).optional(),
  limit: z.number().min(1).max(1000).optional(),
});

export const StringIdSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});
