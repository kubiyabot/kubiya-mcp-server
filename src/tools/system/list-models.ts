/**
 * List models tool
 */

import { z } from 'zod';
import type { ToolDefinition } from '../../types/tools.js';
import { formatListResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('ListModels');

export const listModelsTool: ToolDefinition = {
  name: 'list_models',
  description: 'List available LLM models',
  category: 'system',
  inputSchema: z.object({}),
  handler: async (_args, client) => {
    try {
      logger.info('Listing available models');

      const models = await client.system.listModels();

      return formatListResponse(models);
    } catch (error) {
      logger.error('Failed to list models', error);
      return formatErrorResponse(error);
    }
  },
};
