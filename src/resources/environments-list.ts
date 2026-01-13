/**
 * MCP Resource: Available Environments
 *
 * Provides a list of available environments with their configurations.
 * This helps users understand what environments they can use for execution.
 */

import type { ResourceDefinition } from '../types/resources.js';
import type { ControlPlaneClient } from '../client/index.js';
import type { Environment } from '../types/api.js';

export const environmentsListResource: ResourceDefinition = {
  uri: 'environments://list',
  name: 'Available Environments',
  description: 'List of all available environments with their configurations',
  mimeType: 'application/json',
  handler: async (client: ControlPlaneClient) => {
    const environments = await client.environments.list();

    const formattedEnvironments = environments.map((env: Environment) => ({
      id: env.id,
      name: env.name,
      display_name: env.display_name,
      description: env.description || 'No description provided',
      status: env.status,
      created_at: env.created_at,
      updated_at: env.updated_at,
    }));

    return JSON.stringify(
      {
        count: formattedEnvironments.length,
        environments: formattedEnvironments,
        usage_hint: 'Use environment IDs when creating agents, teams, or worker queues',
      },
      null,
      2
    );
  },
};
