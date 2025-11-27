/**
 * MCP Resource: Available Worker Queues
 *
 * Provides a list of available worker queues for task assignment.
 * This helps users understand what worker queues they can use when executing agents/teams.
 */

import type { ResourceDefinition } from '../types/resources.js';
import type { ControlPlaneClient } from '../client/index.js';
import type { WorkerQueue } from '../types/api.js';

export const workerQueuesListResource: ResourceDefinition = {
  uri: 'worker-queues://list',
  name: 'Available Worker Queues',
  description: 'List of all available worker queues with their status and active workers',
  mimeType: 'application/json',
  handler: async (client: ControlPlaneClient) => {
    // Fetch all worker queues
    const queues = await client.workerQueues.list();

    // Format worker queues for easy consumption
    const formattedQueues = queues.map((queue: WorkerQueue) => ({
      id: queue.id,
      name: queue.name,
      display_name: queue.display_name || queue.name,
      description: queue.description || 'No description provided',
      status: queue.status,
      environment_id: queue.environment_id,
      active_workers: queue.active_workers || 0,
      max_workers: queue.max_workers || null,
      heartbeat_interval: queue.heartbeat_interval,
      tags: queue.tags || [],
      task_queue_name: queue.task_queue_name || queue.id,
      created_at: queue.created_at,
      updated_at: queue.updated_at,
    }));

    return JSON.stringify(
      {
        count: formattedQueues.length,
        worker_queues: formattedQueues,
        usage_hint: 'Use worker queue IDs from this list when executing agents or teams with the worker_queue_id parameter',
      },
      null,
      2
    );
  },
};
