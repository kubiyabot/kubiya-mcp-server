/**
 * MCP Resource: Available Projects
 *
 * Provides a list of available projects with their configurations.
 * This helps users understand what projects are available for organizing agents.
 */

import type { ResourceDefinition } from '../types/resources.js';
import type { ControlPlaneClient } from '../client/index.js';
import type { Project } from '../types/api.js';

export const projectsListResource: ResourceDefinition = {
  uri: 'projects://list',
  name: 'Available Projects',
  description: 'List of all available projects with their configurations',
  mimeType: 'application/json',
  handler: async (client: ControlPlaneClient) => {
    const projects = await client.projects.list();

    const formattedProjects = projects.map((project: Project) => ({
      id: project.id,
      name: project.name,
      key: project.key,
      description: project.description || 'No description provided',
      status: project.status,
      created_at: project.created_at,
      updated_at: project.updated_at,
    }));

    return JSON.stringify(
      {
        count: formattedProjects.length,
        projects: formattedProjects,
        usage_hint: 'Use project IDs when creating or updating agents',
      },
      null,
      2
    );
  },
};
