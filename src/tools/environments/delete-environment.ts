/**
 * Delete environment tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { DeleteEnvironmentSchema } from '../../schemas/environments.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('DeleteEnvironment');

export const deleteEnvironmentTool: ToolDefinition = {
  name: 'delete_environment',
  description: 'Delete an environment by ID',
  category: 'environments',
  inputSchema: DeleteEnvironmentSchema,
  handler: async (args, client) => {
    try {
      const { id } = DeleteEnvironmentSchema.parse(args);
      logger.info('Deleting environment', { id });

      await client.environments.delete(id);

      logger.info('Environment deleted successfully', { id });
      return formatToolResponse({ success: true, message: `Environment ${id} deleted successfully` });
    } catch (error) {
      logger.error('Failed to delete environment', error);
      return formatErrorResponse(error);
    }
  },
};
