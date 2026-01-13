/**
 * Create skill tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { CreateSkillSchema } from '../../schemas/skills.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('CreateSkill');

export const createSkillTool: ToolDefinition = {
  name: 'create_skill',
  description: 'Create a new skill (toolset)',
  category: 'skills',
  inputSchema: CreateSkillSchema,
  handler: async (args, client) => {
    try {
      const skillData = CreateSkillSchema.parse(args);
      logger.info('Creating skill', { name: skillData.name, type: skillData.type });

      const skill = await client.skills.create(skillData);

      logger.info('Skill created successfully', { id: skill.id });
      return formatToolResponse(skill);
    } catch (error) {
      logger.error('Failed to create skill', error);
      return formatErrorResponse(error);
    }
  },
};
