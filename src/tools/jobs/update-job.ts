/**
 * Update job tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { UpdateJobSchema } from '../../schemas/jobs.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('UpdateJob');

export const updateJobTool: ToolDefinition = {
  name: 'update_job',
  description: 'Update an existing job configuration',
  category: 'jobs',
  inputSchema: UpdateJobSchema,
  handler: async (args, client) => {
    try {
      const { id, ...updateData } = UpdateJobSchema.parse(args);
      logger.info('Updating job', { id });

      const job = await client.jobs.update(id, updateData);

      logger.info('Job updated successfully', { id: job.id });
      return formatToolResponse(job);
    } catch (error) {
      logger.error('Failed to update job', error);
      return formatErrorResponse(error);
    }
  },
};
