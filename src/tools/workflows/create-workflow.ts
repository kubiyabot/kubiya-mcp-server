/**
 * Create workflow tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { CreateWorkflowSchema } from '../../schemas/workflows.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('CreateWorkflow');

export const createWorkflowTool: ToolDefinition = {
  name: 'create_workflow',
  description: 'Create a new workflow with steps and configuration',
  category: 'workflows',
  inputSchema: CreateWorkflowSchema,
  handler: async (args, client) => {
    try {
      const workflowData = CreateWorkflowSchema.parse(args);
      logger.info('Creating workflow', { name: workflowData.name });

      const workflow = await client.workflows.create(workflowData);

      logger.info('Workflow created successfully', { id: workflow.id });
      return formatToolResponse(workflow);
    } catch (error) {
      logger.error('Failed to create workflow', error);
      return formatErrorResponse(error);
    }
  },
};
