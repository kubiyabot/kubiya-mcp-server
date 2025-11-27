/**
 * MCP Resource: Available Agents
 *
 * Provides a list of available agents with their configurations and capabilities.
 * This helps users understand what agents they can execute and what each agent does.
 */

import type { ResourceDefinition } from '../types/resources.js';
import type { ControlPlaneClient } from '../client/index.js';
import type { Agent } from '../types/api.js';

export const agentsListResource: ResourceDefinition = {
  uri: 'agents://list',
  name: 'Available Agents',
  description: 'List of all available agents with their configurations, skills, and capabilities',
  mimeType: 'application/json',
  handler: async (client: ControlPlaneClient) => {
    // Fetch all agents (up to 100)
    const agents = await client.agents.list({ skip: 0, limit: 100 });

    // Format agents for easy consumption
    const formattedAgents = agents.map((agent: Agent) => ({
      id: agent.id,
      name: agent.name,
      description: agent.description || 'No description provided',
      image: agent.image,
      runner_config: agent.runner || {},
      secrets: agent.secrets || [],
      environment_variables: agent.environment_variables || {},
      integrations: agent.integrations || [],
      created_at: agent.created_at,
      updated_at: agent.updated_at,
    }));

    return JSON.stringify(
      {
        count: formattedAgents.length,
        agents: formattedAgents,
        usage_hint: 'Use agent IDs from this list when calling execute_agent tool',
      },
      null,
      2
    );
  },
};
