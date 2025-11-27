/**
 * Get agent tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { GetAgentSchema } from '../../schemas/agents.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('GetAgent');

export const getAgentTool: ToolDefinition = {
  name: 'get_agent',
  description: 'Get detailed information about a specific agent by ID',
  category: 'agents',
  inputSchema: GetAgentSchema,
  handler: async (args, client) => {
    try {
      const { id } = GetAgentSchema.parse(args);
      logger.info('Getting agent', { id });

      const agent = await client.agents.get(id);

      return formatToolResponse(agent);
    } catch (error) {
      logger.error('Failed to get agent', error);
      return formatErrorResponse(error);
    }
  },
};
