/**
 * MCP resource type definitions
 */

import type { ControlPlaneClient } from '../client/index.js';

export interface ResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  handler: (client: ControlPlaneClient) => Promise<string>;
}

export interface ResourceListItem {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}
