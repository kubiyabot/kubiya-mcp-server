/**
 * Delete team tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { DeleteTeamSchema } from '../../schemas/teams.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('DeleteTeam');

export const deleteTeamTool: ToolDefinition = {
  name: 'delete_team',
  description: 'Delete a team by ID',
  category: 'teams',
  inputSchema: DeleteTeamSchema,
  handler: async (args, client) => {
    try {
      const { id } = DeleteTeamSchema.parse(args);
      logger.info('Deleting team', { id });

      await client.teams.delete(id);

      logger.info('Team deleted successfully', { id });
      return formatToolResponse({ success: true, message: `Team ${id} deleted successfully` });
    } catch (error) {
      logger.error('Failed to delete team', error);
      return formatErrorResponse(error);
    }
  },
};
