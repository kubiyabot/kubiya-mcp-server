/**
 * List agents tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { ListAgentsSchema } from '../../schemas/agents.js';
import { formatListResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('ListAgents');

export const listAgentsTool: ToolDefinition = {
  name: 'list_agents',
  description: 'List all agents in the organization with optional pagination',
  category: 'agents',
  inputSchema: ListAgentsSchema,
  handler: async (args, client) => {
    try {
      const params = ListAgentsSchema.parse(args);
      logger.info('Listing agents', params);

      const agents = await client.agents.list(params);

      return formatListResponse(agents);
    } catch (error) {
      logger.error('Failed to list agents', error);
      return formatErrorResponse(error);
    }
  },
};
