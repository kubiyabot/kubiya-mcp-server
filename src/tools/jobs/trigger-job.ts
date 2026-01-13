/**
 * Trigger job tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { TriggerJobSchema } from '../../schemas/jobs.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('TriggerJob');

export const triggerJobTool: ToolDefinition = {
  name: 'trigger_job',
  description: 'Manually trigger a job execution',
  category: 'jobs',
  inputSchema: TriggerJobSchema,
  handler: async (args, client) => {
    try {
      const { id, variables } = TriggerJobSchema.parse(args);
      logger.info('Triggering job', { id });

      const result = await client.jobs.trigger(id, variables ? { variables } : undefined);

      logger.info('Job triggered successfully', { id });
      return formatToolResponse(result);
    } catch (error) {
      logger.error('Failed to trigger job', error);
      return formatErrorResponse(error);
    }
  },
};
