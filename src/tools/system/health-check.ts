/**
 * Health check tool
 */

import { z } from 'zod';
import type { ToolDefinition } from '../../types/tools.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('HealthCheck');

export const healthCheckTool: ToolDefinition = {
  name: 'health_check',
  description: 'Check the health status of the Control Plane API',
  category: 'system',
  inputSchema: z.object({}),
  handler: async (_args, client) => {
    try {
      logger.info('Checking API health');

      const health = await client.system.health();

      return formatToolResponse(health);
    } catch (error) {
      logger.error('Health check failed', error);
      return formatErrorResponse(error);
    }
  },
};
