/**
 * Create environment tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { CreateEnvironmentSchema } from '../../schemas/environments.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('CreateEnvironment');

export const createEnvironmentTool: ToolDefinition = {
  name: 'create_environment',
  description: 'Create a new environment',
  category: 'environments',
  inputSchema: CreateEnvironmentSchema,
  handler: async (args, client) => {
    try {
      const envData = CreateEnvironmentSchema.parse(args);
      logger.info('Creating environment', { name: envData.name });

      const environment = await client.environments.create(envData);

      logger.info('Environment created successfully', { id: environment.id });
      return formatToolResponse(environment);
    } catch (error) {
      logger.error('Failed to create environment', error);
      return formatErrorResponse(error);
    }
  },
};
