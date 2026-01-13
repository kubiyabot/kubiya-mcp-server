/**
 * Create team tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { CreateTeamSchema } from '../../schemas/teams.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('CreateTeam');

export const createTeamTool: ToolDefinition = {
  name: 'create_team',
  description: 'Create a new team with configuration and member agents',
  category: 'teams',
  inputSchema: CreateTeamSchema,
  handler: async (args, client) => {
    try {
      const teamData = CreateTeamSchema.parse(args);
      logger.info('Creating team', { name: teamData.name });

      const team = await client.teams.create(teamData);

      logger.info('Team created successfully', { id: team.id });
      return formatToolResponse(team);
    } catch (error) {
      logger.error('Failed to create team', error);
      return formatErrorResponse(error);
    }
  },
};
