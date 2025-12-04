/**
 * Delete policy tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { DeletePolicySchema } from '../../schemas/policies.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('DeletePolicy');

export const deletePolicyTool: ToolDefinition = {
  name: 'delete_policy',
  description: 'Delete an OPA policy by ID',
  category: 'policies',
  inputSchema: DeletePolicySchema,
  handler: async (args, client) => {
    try {
      const { id } = DeletePolicySchema.parse(args);
      logger.info('Deleting policy', { id });

      await client.policies.delete(id);

      logger.info('Policy deleted successfully', { id });
      return formatToolResponse({ success: true, message: `Policy ${id} deleted successfully` });
    } catch (error) {
      logger.error('Failed to delete policy', error);
      return formatErrorResponse(error);
    }
  },
};
