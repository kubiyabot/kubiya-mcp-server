/**
 * Delete job tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { DeleteJobSchema } from '../../schemas/jobs.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('DeleteJob');

export const deleteJobTool: ToolDefinition = {
  name: 'delete_job',
  description: 'Delete a job by ID',
  category: 'jobs',
  inputSchema: DeleteJobSchema,
  handler: async (args, client) => {
    try {
      const { id } = DeleteJobSchema.parse(args);
      logger.info('Deleting job', { id });

      await client.jobs.delete(id);

      logger.info('Job deleted successfully', { id });
      return formatToolResponse({ success: true, message: `Job ${id} deleted successfully` });
    } catch (error) {
      logger.error('Failed to delete job', error);
      return formatErrorResponse(error);
    }
  },
};
