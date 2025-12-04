/**
 * Update agent tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { UpdateAgentSchema } from '../../schemas/agents.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('UpdateAgent');

export const updateAgentTool: ToolDefinition = {
  name: 'update_agent',
  description: 'Update an existing agent configuration',
  category: 'agents',
  inputSchema: UpdateAgentSchema,
  handler: async (args, client) => {
    try {
      const { id, ...updateData } = UpdateAgentSchema.parse(args);
      logger.info('Updating agent', { id });

      const agent = await client.agents.update(id, updateData);

      logger.info('Agent updated successfully', { id: agent.id });
      return formatToolResponse(agent);
    } catch (error) {
      logger.error('Failed to update agent', error);
      return formatErrorResponse(error);
    }
  },
};
