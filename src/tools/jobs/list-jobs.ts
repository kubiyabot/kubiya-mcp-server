/**
 * List jobs tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { ListJobsSchema } from '../../schemas/jobs.js';
import { formatListResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('ListJobs');

export const listJobsTool: ToolDefinition = {
  name: 'list_jobs',
  description: 'List all jobs in the organization',
  category: 'jobs',
  inputSchema: ListJobsSchema,
  handler: async (args, client) => {
    try {
      const params = ListJobsSchema.parse(args);
      logger.info('Listing jobs', params);

      const jobs = await client.jobs.list(params);

      logger.info('Retrieved jobs', { count: jobs.length });
      return formatListResponse(jobs);
    } catch (error) {
      logger.error('Failed to list jobs', error);
      return formatErrorResponse(error);
    }
  },
};
