/**
 * MCP Resource: Available Jobs
 *
 * Provides a list of available jobs with their configurations.
 * This helps users understand what scheduled jobs exist and their triggers.
 */

import type { ResourceDefinition } from '../types/resources.js';
import type { ControlPlaneClient } from '../client/index.js';
import type { Job } from '../types/api.js';

export const jobsListResource: ResourceDefinition = {
  uri: 'jobs://list',
  name: 'Available Jobs',
  description: 'List of all available scheduled jobs with their configurations',
  mimeType: 'application/json',
  handler: async (client: ControlPlaneClient) => {
    const jobs = await client.jobs.list();

    const formattedJobs = jobs.map((job: Job) => ({
      id: job.id,
      name: job.name,
      description: job.description || 'No description provided',
      entity_type: job.entity_type,
      entity_id: job.entity_id,
      trigger_type: job.trigger_type,
      schedule: job.schedule,
      status: job.status,
      created_at: job.created_at,
      updated_at: job.updated_at,
    }));

    return JSON.stringify(
      {
        count: formattedJobs.length,
        jobs: formattedJobs,
        usage_hint: 'Use job IDs to trigger, enable, disable, or manage jobs',
      },
      null,
      2
    );
  },
};
