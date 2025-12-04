/**
 * Get policy tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { GetPolicySchema } from '../../schemas/policies.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('GetPolicy');

export const getPolicyTool: ToolDefinition = {
  name: 'get_policy',
  description: 'Get a specific OPA policy by ID',
  category: 'policies',
  inputSchema: GetPolicySchema,
  handler: async (args, client) => {
    try {
      const { id } = GetPolicySchema.parse(args);
      logger.info('Getting policy', { id });

      const policy = await client.policies.get(id);

      logger.info('Retrieved policy', { id: policy.id });
      return formatToolResponse(policy);
    } catch (error) {
      logger.error('Failed to get policy', error);
      return formatErrorResponse(error);
    }
  },
};
