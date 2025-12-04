/**
 * List environments tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { ListEnvironmentsSchema } from '../../schemas/environments.js';
import { formatListResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('ListEnvironments');

export const listEnvironmentsTool: ToolDefinition = {
  name: 'list_environments',
  description: 'List all environments in the organization',
  category: 'environments',
  inputSchema: ListEnvironmentsSchema,
  handler: async (args, client) => {
    try {
      const params = ListEnvironmentsSchema.parse(args);
      logger.info('Listing environments', params);

      const environments = await client.environments.list(params);

      logger.info('Retrieved environments', { count: environments.length });
      return formatListResponse(environments);
    } catch (error) {
      logger.error('Failed to list environments', error);
      return formatErrorResponse(error);
    }
  },
};
