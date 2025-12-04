/**
 * Get environment tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { GetEnvironmentSchema } from '../../schemas/environments.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('GetEnvironment');

export const getEnvironmentTool: ToolDefinition = {
  name: 'get_environment',
  description: 'Get a specific environment by ID',
  category: 'environments',
  inputSchema: GetEnvironmentSchema,
  handler: async (args, client) => {
    try {
      const { id } = GetEnvironmentSchema.parse(args);
      logger.info('Getting environment', { id });

      const environment = await client.environments.get(id);

      logger.info('Retrieved environment', { id: environment.id });
      return formatToolResponse(environment);
    } catch (error) {
      logger.error('Failed to get environment', error);
      return formatErrorResponse(error);
    }
  },
};
