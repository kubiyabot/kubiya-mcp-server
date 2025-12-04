/**
 * Update skill tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { UpdateSkillSchema } from '../../schemas/skills.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('UpdateSkill');

export const updateSkillTool: ToolDefinition = {
  name: 'update_skill',
  description: 'Update an existing skill (toolset)',
  category: 'skills',
  inputSchema: UpdateSkillSchema,
  handler: async (args, client) => {
    try {
      const { id, ...updateData } = UpdateSkillSchema.parse(args);
      logger.info('Updating skill', { id });

      const skill = await client.skills.update(id, updateData);

      logger.info('Skill updated successfully', { id: skill.id });
      return formatToolResponse(skill);
    } catch (error) {
      logger.error('Failed to update skill', error);
      return formatErrorResponse(error);
    }
  },
};
