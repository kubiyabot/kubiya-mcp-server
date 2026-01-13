/**
 * Delete worker queue tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { DeleteWorkerQueueSchema } from '../../schemas/worker-queues.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('DeleteWorkerQueue');

export const deleteWorkerQueueTool: ToolDefinition = {
  name: 'delete_worker_queue',
  description: 'Delete a worker queue by ID',
  category: 'worker-queues',
  inputSchema: DeleteWorkerQueueSchema,
  handler: async (args, client) => {
    try {
      const { id } = DeleteWorkerQueueSchema.parse(args);
      logger.info('Deleting worker queue', { id });

      await client.workerQueues.delete(id);

      logger.info('Worker queue deleted successfully', { id });
      return formatToolResponse({ success: true, message: `Worker queue ${id} deleted successfully` });
    } catch (error) {
      logger.error('Failed to delete worker queue', error);
      return formatErrorResponse(error);
    }
  },
};
