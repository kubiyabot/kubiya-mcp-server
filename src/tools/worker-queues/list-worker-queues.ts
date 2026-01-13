/**
 * List worker queues tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { ListWorkerQueuesSchema } from '../../schemas/worker-queues.js';
import { formatListResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('ListWorkerQueues');

export const listWorkerQueuesTool: ToolDefinition = {
  name: 'list_worker_queues',
  description: 'List all worker queues across all environments',
  category: 'worker-queues',
  inputSchema: ListWorkerQueuesSchema,
  handler: async (_args, client) => {
    try {
      logger.info('Listing worker queues');

      const queues = await client.workerQueues.list();

      logger.info('Retrieved worker queues', { count: queues.length });
      return formatListResponse(queues);
    } catch (error) {
      logger.error('Failed to list worker queues', error);
      return formatErrorResponse(error);
    }
  },
};
