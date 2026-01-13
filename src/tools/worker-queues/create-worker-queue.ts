/**
 * Create worker queue tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { CreateWorkerQueueSchema } from '../../schemas/worker-queues.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('CreateWorkerQueue');

export const createWorkerQueueTool: ToolDefinition = {
  name: 'create_worker_queue',
  description: 'Create a new worker queue in an environment',
  category: 'worker-queues',
  inputSchema: CreateWorkerQueueSchema,
  handler: async (args, client) => {
    try {
      const { environment_id, ...queueData } = CreateWorkerQueueSchema.parse(args);
      logger.info('Creating worker queue', { name: queueData.name, environment_id });

      const queue = await client.workerQueues.create(environment_id, queueData);

      logger.info('Worker queue created successfully', { id: queue.id });
      return formatToolResponse(queue);
    } catch (error) {
      logger.error('Failed to create worker queue', error);
      return formatErrorResponse(error);
    }
  },
};
