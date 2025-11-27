/**
 * Create agent tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { CreateAgentSchema } from '../../schemas/agents.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('CreateAgent');

export const createAgentTool: ToolDefinition = {
  name: 'create_agent',
  description: 'Create a new agent with instructions and configuration',
  category: 'agents',
  inputSchema: CreateAgentSchema,
  handler: async (args, client) => {
    try {
      const agentData = CreateAgentSchema.parse(args);
      logger.info('Creating agent', { name: agentData.name });

      const agent = await client.agents.create(agentData);

      logger.info('Agent created successfully', { id: agent.id });
      return formatToolResponse(agent);
    } catch (error) {
      logger.error('Failed to create agent', error);
      return formatErrorResponse(error);
    }
  },
};
