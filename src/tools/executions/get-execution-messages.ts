/**
 * Get execution messages tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { GetExecutionMessagesSchema } from '../../schemas/executions.js';
import { formatListResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('GetExecutionMessages');

export const getExecutionMessagesTool: ToolDefinition = {
  name: 'get_execution_messages',
  description: 'Get messages and logs from a specific execution',
  category: 'executions',
  inputSchema: GetExecutionMessagesSchema,
  handler: async (args, client) => {
    try {
      const { id, skip, limit } = GetExecutionMessagesSchema.parse(args);
      logger.info('Getting execution messages', { id, skip, limit });

      const messages = await client.executions.getMessages(id, { skip, limit });

      return formatListResponse(messages);
    } catch (error) {
      logger.error('Failed to get execution messages', error);
      return formatErrorResponse(error);
    }
  },
};
