/**
 * Get team tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { GetTeamSchema } from '../../schemas/teams.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('GetTeam');

export const getTeamTool: ToolDefinition = {
  name: 'get_team',
  description: 'Get detailed information about a specific team by ID',
  category: 'teams',
  inputSchema: GetTeamSchema,
  handler: async (args, client) => {
    try {
      const { id } = GetTeamSchema.parse(args);
      logger.info('Getting team', { id });

      const team = await client.teams.get(id);

      return formatToolResponse(team);
    } catch (error) {
      logger.error('Failed to get team', error);
      return formatErrorResponse(error);
    }
  },
};
