/**
 * MCP Resource: Available Policies
 *
 * Provides a list of available OPA policies with their configurations.
 * This helps users understand what policies are available for access control.
 */

import type { ResourceDefinition } from '../types/resources.js';
import type { ControlPlaneClient } from '../client/index.js';
import type { Policy } from '../types/api.js';

export const policiesListResource: ResourceDefinition = {
  uri: 'policies://list',
  name: 'Available Policies',
  description: 'List of all available OPA policies for access control',
  mimeType: 'application/json',
  handler: async (client: ControlPlaneClient) => {
    const policies = await client.policies.list({ limit: 100 });

    const formattedPolicies = policies.map((policy: Policy) => ({
      id: policy.id,
      name: policy.name,
      description: policy.description || 'No description provided',
      policy_type: policy.policy_type,
      created_at: policy.created_at,
      updated_at: policy.updated_at,
    }));

    return JSON.stringify(
      {
        count: formattedPolicies.length,
        policies: formattedPolicies,
        usage_hint: 'Use policy IDs when creating or updating projects and agents',
      },
      null,
      2
    );
  },
};
