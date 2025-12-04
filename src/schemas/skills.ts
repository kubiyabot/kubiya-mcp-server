/**
 * Skill/ToolSet-related validation schemas
 */

import { z } from 'zod';

export const ListSkillsSchema = z.object({});

export const GetSkillSchema = z.object({
  id: z.string().min(1, 'Skill ID is required'),
});

export const CreateSkillSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  description: z.string().optional(),
  icon: z.string().optional().default('Wrench'),
  enabled: z.boolean().optional().default(true),
  configuration: z.record(z.any()).optional(),
});

export const UpdateSkillSchema = z.object({
  id: z.string().min(1, 'Skill ID is required'),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  enabled: z.boolean().optional(),
  configuration: z.record(z.any()).optional(),
});

export const DeleteSkillSchema = z.object({
  id: z.string().min(1, 'Skill ID is required'),
});
