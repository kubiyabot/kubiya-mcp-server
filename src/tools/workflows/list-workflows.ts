/**
 * List workflows tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { ListWorkflowsSchema } from '../../schemas/workflows.js';
import { formatListResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('ListWorkflows');

export const listWorkflowsTool: ToolDefinition = {
  name: 'list_workflows',
  description: 'List all workflows with optional filtering by status or team',
  category: 'workflows',
  inputSchema: ListWorkflowsSchema,
  handler: async (args, client) => {
    try {
      const params = ListWorkflowsSchema.parse(args);
      logger.info('Listing workflows', params);

      const workflows = await client.workflows.list(params);

      return formatListResponse(workflows);
    } catch (error) {
      logger.error('Failed to list workflows', error);
      return formatErrorResponse(error);
    }
  },
};
