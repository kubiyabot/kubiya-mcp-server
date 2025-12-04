/**
 * Create project tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { CreateProjectSchema } from '../../schemas/projects.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('CreateProject');

export const createProjectTool: ToolDefinition = {
  name: 'create_project',
  description: 'Create a new project',
  category: 'projects',
  inputSchema: CreateProjectSchema,
  handler: async (args, client) => {
    try {
      const projectData = CreateProjectSchema.parse(args);
      logger.info('Creating project', { name: projectData.name, key: projectData.key });

      const project = await client.projects.create(projectData);

      logger.info('Project created successfully', { id: project.id });
      return formatToolResponse(project);
    } catch (error) {
      logger.error('Failed to create project', error);
      return formatErrorResponse(error);
    }
  },
};
