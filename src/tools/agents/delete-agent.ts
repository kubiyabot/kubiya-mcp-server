/**
 * Delete agent tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { DeleteAgentSchema } from '../../schemas/agents.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('DeleteAgent');

export const deleteAgentTool: ToolDefinition = {
  name: 'delete_agent',
  description: 'Delete an agent by ID',
  category: 'agents',
  inputSchema: DeleteAgentSchema,
  handler: async (args, client) => {
    try {
      const { id } = DeleteAgentSchema.parse(args);
      logger.info('Deleting agent', { id });

      await client.agents.delete(id);

      logger.info('Agent deleted successfully', { id });
      return formatToolResponse({ success: true, message: `Agent ${id} deleted successfully` });
    } catch (error) {
      logger.error('Failed to delete agent', error);
      return formatErrorResponse(error);
    }
  },
};
