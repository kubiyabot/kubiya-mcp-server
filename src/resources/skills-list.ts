/**
 * MCP Resource: Available Skills
 *
 * Provides a list of available skills (toolsets) with their configurations.
 * This helps users understand what skills can be assigned to agents and teams.
 */

import type { ResourceDefinition } from '../types/resources.js';
import type { ControlPlaneClient } from '../client/index.js';
import type { Skill } from '../types/api.js';

export const skillsListResource: ResourceDefinition = {
  uri: 'skills://list',
  name: 'Available Skills',
  description: 'List of all available skills (toolsets) with their configurations',
  mimeType: 'application/json',
  handler: async (client: ControlPlaneClient) => {
    const skills = await client.skills.list();

    const formattedSkills = skills.map((skill: Skill) => ({
      id: skill.id,
      name: skill.name,
      type: skill.type,
      description: skill.description || 'No description provided',
      enabled: skill.enabled,
      created_at: skill.created_at,
      updated_at: skill.updated_at,
    }));

    return JSON.stringify(
      {
        count: formattedSkills.length,
        skills: formattedSkills,
        usage_hint: 'Use skill IDs when creating or updating agents and teams',
      },
      null,
      2
    );
  },
};
