/**
 * Update worker queue tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { UpdateWorkerQueueSchema } from '../../schemas/worker-queues.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('UpdateWorkerQueue');

export const updateWorkerQueueTool: ToolDefinition = {
  name: 'update_worker_queue',
  description: 'Update an existing worker queue',
  category: 'worker-queues',
  inputSchema: UpdateWorkerQueueSchema,
  handler: async (args, client) => {
    try {
      const { id, ...updateData } = UpdateWorkerQueueSchema.parse(args);
      logger.info('Updating worker queue', { id });

      const queue = await client.workerQueues.update(id, updateData);

      logger.info('Worker queue updated successfully', { id: queue.id });
      return formatToolResponse(queue);
    } catch (error) {
      logger.error('Failed to update worker queue', error);
      return formatErrorResponse(error);
    }
  },
};
