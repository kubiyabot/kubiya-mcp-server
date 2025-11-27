/**
 * Get execution tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { GetExecutionSchema } from '../../schemas/executions.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('GetExecution');

export const getExecutionTool: ToolDefinition = {
  name: 'get_execution',
  description: 'Get detailed information about a specific execution by ID, including results and logs',
  category: 'executions',
  inputSchema: GetExecutionSchema,
  handler: async (args, client) => {
    try {
      const { id } = GetExecutionSchema.parse(args);
      logger.info('Getting execution', { id });

      const execution = await client.executions.get(id);

      return formatToolResponse(execution);
    } catch (error) {
      logger.error('Failed to get execution', error);
      return formatErrorResponse(error);
    }
  },
};
