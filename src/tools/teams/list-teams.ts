/**
 * List teams tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { ListTeamsSchema } from '../../schemas/teams.js';
import { formatListResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('ListTeams');

export const listTeamsTool: ToolDefinition = {
  name: 'list_teams',
  description: 'List all teams in the organization',
  category: 'teams',
  inputSchema: ListTeamsSchema,
  handler: async (args, client) => {
    try {
      const params = ListTeamsSchema.parse(args);
      logger.info('Listing teams', params);

      const teams = await client.teams.list(params);

      return formatListResponse(teams);
    } catch (error) {
      logger.error('Failed to list teams', error);
      return formatErrorResponse(error);
    }
  },
};
