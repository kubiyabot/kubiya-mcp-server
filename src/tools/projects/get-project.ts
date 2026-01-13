/**
 * Get project tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { GetProjectSchema } from '../../schemas/projects.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('GetProject');

export const getProjectTool: ToolDefinition = {
  name: 'get_project',
  description: 'Get a specific project by ID',
  category: 'projects',
  inputSchema: GetProjectSchema,
  handler: async (args, client) => {
    try {
      const { id } = GetProjectSchema.parse(args);
      logger.info('Getting project', { id });

      const project = await client.projects.get(id);

      logger.info('Retrieved project', { id: project.id });
      return formatToolResponse(project);
    } catch (error) {
      logger.error('Failed to get project', error);
      return formatErrorResponse(error);
    }
  },
};
