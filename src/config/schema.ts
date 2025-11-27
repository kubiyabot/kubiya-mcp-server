/**
 * Zod schemas for configuration validation
 */

import { z } from 'zod';

export const LogLevelSchema = z.enum(['debug', 'info', 'warn', 'error']);
export const ProfileNameSchema = z.enum(['dev', 'staging', 'prod']);

export const ProfileConfigSchema = z.object({
  apiBaseUrl: z.string().url(),
  timeout: z.number().positive(),
  retryAttempts: z.number().min(0).max(10),
  retryDelay: z.number().positive(),
  logLevel: LogLevelSchema,
  allowedTools: z.array(z.string()).optional(),
});

export const ServerConfigSchema = ProfileConfigSchema.extend({
  apiKey: z.string().min(1, 'API key is required'),
  profile: ProfileNameSchema,
  allowedTools: z.array(z.string()).min(1, 'At least one tool pattern required'),
});
