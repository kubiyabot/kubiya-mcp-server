/**
 * Get workflow tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { GetWorkflowSchema } from '../../schemas/workflows.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('GetWorkflow');

export const getWorkflowTool: ToolDefinition = {
  name: 'get_workflow',
  description: 'Get detailed information about a specific workflow by ID',
  category: 'workflows',
  inputSchema: GetWorkflowSchema,
  handler: async (args, client) => {
    try {
      const { id } = GetWorkflowSchema.parse(args);
      logger.info('Getting workflow', { id });

      const workflow = await client.workflows.get(id);

      return formatToolResponse(workflow);
    } catch (error) {
      logger.error('Failed to get workflow', error);
      return formatErrorResponse(error);
    }
  },
};
