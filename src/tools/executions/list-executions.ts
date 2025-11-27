/**
 * List executions tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { ListExecutionsSchema } from '../../schemas/executions.js';
import { formatListResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('ListExecutions');

export const listExecutionsTool: ToolDefinition = {
  name: 'list_executions',
  description: 'List execution history with optional filtering by status or type',
  category: 'executions',
  inputSchema: ListExecutionsSchema,
  handler: async (args, client) => {
    try {
      const params = ListExecutionsSchema.parse(args);
      logger.info('Listing executions', params);

      const executions = await client.executions.list(params);

      return formatListResponse(executions);
    } catch (error) {
      logger.error('Failed to list executions', error);
      return formatErrorResponse(error);
    }
  },
};
