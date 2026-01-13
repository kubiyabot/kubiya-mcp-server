/**
 * Delete skill tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { DeleteSkillSchema } from '../../schemas/skills.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('DeleteSkill');

export const deleteSkillTool: ToolDefinition = {
  name: 'delete_skill',
  description: 'Delete a skill (toolset) by ID',
  category: 'skills',
  inputSchema: DeleteSkillSchema,
  handler: async (args, client) => {
    try {
      const { id } = DeleteSkillSchema.parse(args);
      logger.info('Deleting skill', { id });

      await client.skills.delete(id);

      logger.info('Skill deleted successfully', { id });
      return formatToolResponse({ success: true, message: `Skill ${id} deleted successfully` });
    } catch (error) {
      logger.error('Failed to delete skill', error);
      return formatErrorResponse(error);
    }
  },
};
