/**
 * MCP Resource Registry
 *
 * Centralized registry for all MCP resources that provide context data.
 */

import type { ResourceDefinition, ResourceListItem } from '../types/resources.js';
import type { ControlPlaneClient } from '../client/index.js';

export class ResourceRegistry {
  private resources: Map<string, ResourceDefinition> = new Map();

  /**
   * Register a single resource
   */
  register(resource: ResourceDefinition): void {
    this.resources.set(resource.uri, resource);
  }

  /**
   * Register multiple resources at once
   */
  registerAll(resources: ResourceDefinition[]): void {
    for (const resource of resources) {
      this.register(resource);
    }
  }

  /**
   * Get a resource by URI
   */
  get(uri: string): ResourceDefinition | undefined {
    return this.resources.get(uri);
  }

  /**
   * List all registered resources
   */
  list(): ResourceListItem[] {
    return Array.from(this.resources.values()).map((resource) => ({
      uri: resource.uri,
      name: resource.name,
      description: resource.description,
      mimeType: resource.mimeType,
    }));
  }

  /**
   * Execute a resource handler and return its content
   */
  async getResourceContent(uri: string, client: ControlPlaneClient): Promise<string> {
    const resource = this.resources.get(uri);
    if (!resource) {
      throw new Error(`Resource not found: ${uri}`);
    }

    return resource.handler(client);
  }

  /**
   * Check if a resource exists
   */
  has(uri: string): boolean {
    return this.resources.has(uri);
  }

  /**
   * Get total number of registered resources
   */
  get size(): number {
    return this.resources.size;
  }
}

// Export singleton instance
export const resourceRegistry = new ResourceRegistry();
