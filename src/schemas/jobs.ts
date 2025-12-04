/**
 * Job-related validation schemas
 */

import { z } from 'zod';

export const ListJobsSchema = z.object({
  enabled: z.boolean().optional(),
  trigger_type: z.enum(['cron', 'webhook', 'manual']).optional(),
});

export const GetJobSchema = z.object({
  id: z.string().min(1, 'Job ID is required'),
});

export const CreateJobSchema = z.object({
  name: z.string().min(1).max(255, 'Name must be 1-255 characters'),
  description: z.string().optional(),
  enabled: z.boolean().optional().default(true),
  trigger_type: z.enum(['cron', 'webhook', 'manual']),
  cron_schedule: z.string().optional(),
  cron_timezone: z.string().optional().default('UTC'),
  planning_mode: z.enum(['on_the_fly', 'predefined_agent', 'predefined_team', 'predefined_workflow']).optional().default('predefined_agent'),
  entity_type: z.enum(['agent', 'team', 'workflow']).optional(),
  entity_id: z.string().optional(),
  prompt_template: z.string().min(1, 'Prompt template is required'),
  system_prompt: z.string().optional(),
  executor_type: z.enum(['auto', 'specific_queue', 'environment']).optional().default('auto'),
  worker_queue_name: z.string().optional(),
  environment_name: z.string().optional(),
  config: z.record(z.any()).optional(),
});

export const UpdateJobSchema = z.object({
  id: z.string().min(1, 'Job ID is required'),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  trigger_type: z.enum(['cron', 'webhook', 'manual']).optional(),
  cron_schedule: z.string().optional(),
  cron_timezone: z.string().optional(),
  planning_mode: z.enum(['on_the_fly', 'predefined_agent', 'predefined_team', 'predefined_workflow']).optional(),
  entity_type: z.enum(['agent', 'team', 'workflow']).optional(),
  entity_id: z.string().optional(),
  prompt_template: z.string().optional(),
  system_prompt: z.string().optional(),
  executor_type: z.enum(['auto', 'specific_queue', 'environment']).optional(),
  worker_queue_name: z.string().optional(),
  environment_name: z.string().optional(),
  config: z.record(z.any()).optional(),
});

export const DeleteJobSchema = z.object({
  id: z.string().min(1, 'Job ID is required'),
});

export const TriggerJobSchema = z.object({
  id: z.string().min(1, 'Job ID is required'),
  variables: z.record(z.any()).optional(),
});
