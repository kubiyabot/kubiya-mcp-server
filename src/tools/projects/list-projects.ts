/**
 * List projects tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { ListProjectsSchema } from '../../schemas/projects.js';
import { formatListResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('ListProjects');

export const listProjectsTool: ToolDefinition = {
  name: 'list_projects',
  description: 'List all projects in the organization',
  category: 'projects',
  inputSchema: ListProjectsSchema,
  handler: async (args, client) => {
    try {
      const params = ListProjectsSchema.parse(args);
      logger.info('Listing projects', params);

      const projects = await client.projects.list(params);

      logger.info('Retrieved projects', { count: projects.length });
      return formatListResponse(projects);
    } catch (error) {
      logger.error('Failed to list projects', error);
      return formatErrorResponse(error);
    }
  },
};
