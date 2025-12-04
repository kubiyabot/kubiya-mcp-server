/**
 * Create job tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { CreateJobSchema } from '../../schemas/jobs.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('CreateJob');

export const createJobTool: ToolDefinition = {
  name: 'create_job',
  description: 'Create a new job with cron, webhook, or manual trigger',
  category: 'jobs',
  inputSchema: CreateJobSchema,
  handler: async (args, client) => {
    try {
      const jobData = CreateJobSchema.parse(args);
      logger.info('Creating job', { name: jobData.name, trigger_type: jobData.trigger_type });

      const job = await client.jobs.create(jobData);

      logger.info('Job created successfully', { id: job.id });
      return formatToolResponse(job);
    } catch (error) {
      logger.error('Failed to create job', error);
      return formatErrorResponse(error);
    }
  },
};
