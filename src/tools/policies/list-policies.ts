/**
 * List policies tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { ListPoliciesSchema } from '../../schemas/policies.js';
import { formatListResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('ListPolicies');

export const listPoliciesTool: ToolDefinition = {
  name: 'list_policies',
  description: 'List all OPA policies in the organization',
  category: 'policies',
  inputSchema: ListPoliciesSchema,
  handler: async (args, client) => {
    try {
      const params = ListPoliciesSchema.parse(args);
      logger.info('Listing policies', params);

      const policies = await client.policies.list(params);

      logger.info('Retrieved policies', { count: policies.length });
      return formatListResponse(policies);
    } catch (error) {
      logger.error('Failed to list policies', error);
      return formatErrorResponse(error);
    }
  },
};
