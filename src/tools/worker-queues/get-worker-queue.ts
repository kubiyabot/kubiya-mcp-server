/**
 * Get worker queue tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { GetWorkerQueueSchema } from '../../schemas/worker-queues.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('GetWorkerQueue');

export const getWorkerQueueTool: ToolDefinition = {
  name: 'get_worker_queue',
  description: 'Get a specific worker queue by ID',
  category: 'worker-queues',
  inputSchema: GetWorkerQueueSchema,
  handler: async (args, client) => {
    try {
      const { id } = GetWorkerQueueSchema.parse(args);
      logger.info('Getting worker queue', { id });

      const queue = await client.workerQueues.get(id);

      logger.info('Retrieved worker queue', { id: queue.id });
      return formatToolResponse(queue);
    } catch (error) {
      logger.error('Failed to get worker queue', error);
      return formatErrorResponse(error);
    }
  },
};
