/**
 * MCP Resources
 *
 * Resources provide dynamic context data that MCP clients can access.
 * This helps users understand available agents, teams, and worker queues.
 */

export { resourceRegistry } from './registry.js';
export { agentsListResource } from './agents-list.js';
export { teamsListResource } from './teams-list.js';
export { workerQueuesListResource } from './worker-queues-list.js';
export { environmentsListResource } from './environments-list.js';
export { projectsListResource } from './projects-list.js';
export { skillsListResource } from './skills-list.js';
export { policiesListResource } from './policies-list.js';
export { jobsListResource } from './jobs-list.js';
