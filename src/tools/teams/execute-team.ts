/**
 * Execute team tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { ExecuteTeamSchema } from '../../schemas/teams.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('ExecuteTeam');

export const executeTeamTool: ToolDefinition = {
  name: 'execute_team',
  description: 'Execute a team with a specific prompt/task',
  category: 'teams',
  inputSchema: ExecuteTeamSchema,
  handler: async (args, client) => {
    try {
      const { team_id, prompt, environment_id } = ExecuteTeamSchema.parse(args);
      logger.info('Executing team', { team_id, promptLength: prompt.length });

      const result = await client.teams.execute(team_id, {
        prompt,
        ...(environment_id && { environment_id }),
      });

      logger.info('Team execution started', { execution_id: result.id || result.execution_id });
      return formatToolResponse(result);
    } catch (error) {
      logger.error('Failed to execute team', error);
      return formatErrorResponse(error);
    }
  },
};
