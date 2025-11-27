/**
 * MCP Resource: Available Teams
 *
 * Provides a list of available teams with their members, skills, and configurations.
 * This helps users understand what teams they can execute and what each team specializes in.
 */

import type { ResourceDefinition } from '../types/resources.js';
import type { ControlPlaneClient } from '../client/index.js';
import type { Team } from '../types/api.js';

export const teamsListResource: ResourceDefinition = {
  uri: 'teams://list',
  name: 'Available Teams',
  description: 'List of all available teams with their members, skills, and capabilities',
  mimeType: 'application/json',
  handler: async (client: ControlPlaneClient) => {
    // Fetch all teams (up to 100)
    const teams = await client.teams.list({ skip: 0, limit: 100 });

    // Format teams for easy consumption
    const formattedTeams = teams.map((team: Team) => ({
      id: team.id,
      name: team.name,
      description: team.description || 'No description provided',
      members: team.members || [],
      skills: team.skills || [],
      runner_config: team.runner || {},
      communication_config: team.communication || {},
      created_at: team.created_at,
      updated_at: team.updated_at,
    }));

    return JSON.stringify(
      {
        count: formattedTeams.length,
        teams: formattedTeams,
        usage_hint: 'Use team IDs from this list when calling execute_team tool',
      },
      null,
      2
    );
  },
};
