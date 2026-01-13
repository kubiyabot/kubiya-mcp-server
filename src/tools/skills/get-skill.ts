/**
 * Get skill tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { GetSkillSchema } from '../../schemas/skills.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('GetSkill');

export const getSkillTool: ToolDefinition = {
  name: 'get_skill',
  description: 'Get a specific skill (toolset) by ID',
  category: 'skills',
  inputSchema: GetSkillSchema,
  handler: async (args, client) => {
    try {
      const { id } = GetSkillSchema.parse(args);
      logger.info('Getting skill', { id });

      const skill = await client.skills.get(id);

      logger.info('Retrieved skill', { id: skill.id });
      return formatToolResponse(skill);
    } catch (error) {
      logger.error('Failed to get skill', error);
      return formatErrorResponse(error);
    }
  },
};
