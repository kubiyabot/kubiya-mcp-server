/**
 * List skills tool
 */

import type { ToolDefinition } from '../../types/tools.js';
import { ListSkillsSchema } from '../../schemas/skills.js';
import { formatListResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('ListSkills');

export const listSkillsTool: ToolDefinition = {
  name: 'list_skills',
  description: 'List all skills (toolsets) in the organization',
  category: 'skills',
  inputSchema: ListSkillsSchema,
  handler: async (_args, client) => {
    try {
      logger.info('Listing skills');

      const skills = await client.skills.list();

      logger.info('Retrieved skills', { count: skills.length });
      return formatListResponse(skills);
    } catch (error) {
      logger.error('Failed to list skills', error);
      return formatErrorResponse(error);
    }
  },
};
