/**
 * Delete project tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { DeleteProjectSchema } from '../../schemas/projects.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('DeleteProject');

export const deleteProjectTool: ToolDefinition = {
  name: 'delete_project',
  description: 'Delete a project by ID',
  category: 'projects',
  inputSchema: DeleteProjectSchema,
  handler: async (args, client) => {
    try {
      const { id } = DeleteProjectSchema.parse(args);
      logger.info('Deleting project', { id });

      await client.projects.delete(id);

      logger.info('Project deleted successfully', { id });
      return formatToolResponse({ success: true, message: `Project ${id} deleted successfully` });
    } catch (error) {
      logger.error('Failed to delete project', error);
      return formatErrorResponse(error);
    }
  },
};
