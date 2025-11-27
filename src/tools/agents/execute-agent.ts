/**
 * Execute agent tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { ExecuteAgentSchema } from '../../schemas/agents.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('ExecuteAgent');

export const executeAgentTool: ToolDefinition = {
  name: 'execute_agent',
  description: 'Execute an agent with a specific prompt/task',
  category: 'agents',
  inputSchema: ExecuteAgentSchema,
  handler: async (args, client) => {
    try {
      const { agent_id, prompt, environment_id } = ExecuteAgentSchema.parse(args);
      logger.info('Executing agent', { agent_id, promptLength: prompt.length });

      const result = await client.agents.execute(agent_id, {
        prompt,
        ...(environment_id && { environment_id }),
      });

      logger.info('Agent execution started', { execution_id: result.id || result.execution_id });
      return formatToolResponse(result);
    } catch (error) {
      logger.error('Failed to execute agent', error);
      return formatErrorResponse(error);
    }
  },
};
