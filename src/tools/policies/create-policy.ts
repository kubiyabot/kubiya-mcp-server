/**
 * Create policy tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { CreatePolicySchema } from '../../schemas/policies.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('CreatePolicy');

export const createPolicyTool: ToolDefinition = {
  name: 'create_policy',
  description: 'Create a new OPA policy',
  category: 'policies',
  inputSchema: CreatePolicySchema,
  handler: async (args, client) => {
    try {
      const policyData = CreatePolicySchema.parse(args);
      logger.info('Creating policy', { name: policyData.name });

      const policy = await client.policies.create(policyData);

      logger.info('Policy created successfully', { id: policy.id });
      return formatToolResponse(policy);
    } catch (error) {
      logger.error('Failed to create policy', error);
      return formatErrorResponse(error);
    }
  },
};
