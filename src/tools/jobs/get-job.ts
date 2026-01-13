/**
 * Get job tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { GetJobSchema } from '../../schemas/jobs.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('GetJob');

export const getJobTool: ToolDefinition = {
  name: 'get_job',
  description: 'Get a specific job by ID',
  category: 'jobs',
  inputSchema: GetJobSchema,
  handler: async (args, client) => {
    try {
      const { id } = GetJobSchema.parse(args);
      logger.info('Getting job', { id });

      const job = await client.jobs.get(id);

      logger.info('Retrieved job', { id: job.id });
      return formatToolResponse(job);
    } catch (error) {
      logger.error('Failed to get job', error);
      return formatErrorResponse(error);
    }
  },
};
