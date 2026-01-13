/**
 * Update policy tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { UpdatePolicySchema } from '../../schemas/policies.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('UpdatePolicy');

export const updatePolicyTool: ToolDefinition = {
  name: 'update_policy',
  description: 'Update an existing OPA policy',
  category: 'policies',
  inputSchema: UpdatePolicySchema,
  handler: async (args, client) => {
    try {
      const { id, ...updateData } = UpdatePolicySchema.parse(args);
      logger.info('Updating policy', { id });

      const policy = await client.policies.update(id, updateData);

      logger.info('Policy updated successfully', { id: policy.id });
      return formatToolResponse(policy);
    } catch (error) {
      logger.error('Failed to update policy', error);
      return formatErrorResponse(error);
    }
  },
};
