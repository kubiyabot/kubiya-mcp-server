/**
 * Update project tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { UpdateProjectSchema } from '../../schemas/projects.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('UpdateProject');

export const updateProjectTool: ToolDefinition = {
  name: 'update_project',
  description: 'Update an existing project',
  category: 'projects',
  inputSchema: UpdateProjectSchema,
  handler: async (args, client) => {
    try {
      const { id, ...updateData } = UpdateProjectSchema.parse(args);
      logger.info('Updating project', { id });

      const project = await client.projects.update(id, updateData);

      logger.info('Project updated successfully', { id: project.id });
      return formatToolResponse(project);
    } catch (error) {
      logger.error('Failed to update project', error);
      return formatErrorResponse(error);
    }
  },
};
