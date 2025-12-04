/**
 * Update environment tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { UpdateEnvironmentSchema } from '../../schemas/environments.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('UpdateEnvironment');

export const updateEnvironmentTool: ToolDefinition = {
  name: 'update_environment',
  description: 'Update an existing environment',
  category: 'environments',
  inputSchema: UpdateEnvironmentSchema,
  handler: async (args, client) => {
    try {
      const { id, ...updateData } = UpdateEnvironmentSchema.parse(args);
      logger.info('Updating environment', { id });

      const environment = await client.environments.update(id, updateData);

      logger.info('Environment updated successfully', { id: environment.id });
      return formatToolResponse(environment);
    } catch (error) {
      logger.error('Failed to update environment', error);
      return formatErrorResponse(error);
    }
  },
};
