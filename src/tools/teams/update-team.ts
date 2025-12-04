/**
 * Update team tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { UpdateTeamSchema } from '../../schemas/teams.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('UpdateTeam');

export const updateTeamTool: ToolDefinition = {
  name: 'update_team',
  description: 'Update an existing team configuration',
  category: 'teams',
  inputSchema: UpdateTeamSchema,
  handler: async (args, client) => {
    try {
      const { id, ...updateData } = UpdateTeamSchema.parse(args);
      logger.info('Updating team', { id });

      const team = await client.teams.update(id, updateData);

      logger.info('Team updated successfully', { id: team.id });
      return formatToolResponse(team);
    } catch (error) {
      logger.error('Failed to update team', error);
      return formatErrorResponse(error);
    }
  },
};
