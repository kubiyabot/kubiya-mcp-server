/**
 * Tool registry for managing MCP tools with whitelist filtering
 */

import type { ToolDefinition } from '../types/tools.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('ToolRegistry');

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private categories: Map<string, Set<string>> = new Map();
  private allowedTools: string[];

  constructor(allowedTools: string[] = ['*']) {
    this.allowedTools = allowedTools;
    logger.info('Tool registry initialized', {
      allowedTools: allowedTools.length > 5 ? `${allowedTools.slice(0, 5).join(', ')}...` : allowedTools.join(', ')
    });
  }

  /**
   * Check if a tool is allowed based on whitelist
   */
  private isToolAllowed(toolName: string): boolean {
    // If whitelist contains "*", all tools are allowed
    if (this.allowedTools.includes('*')) {
      return true;
    }

    // Check if tool name is in whitelist
    if (this.allowedTools.includes(toolName)) {
      return true;
    }

    // Check for wildcard patterns (e.g., "list_*", "*_agent")
    for (const pattern of this.allowedTools) {
      if (pattern.includes('*')) {
        const regexPattern = pattern.replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        if (regex.test(toolName)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Register a single tool (only if allowed by whitelist)
   */
  register(tool: ToolDefinition): void {
    // Check if tool is allowed
    if (!this.isToolAllowed(tool.name)) {
      logger.debug(`Tool "${tool.name}" not in whitelist, skipping registration`);
      return;
    }

    if (this.tools.has(tool.name)) {
      logger.warn(`Tool "${tool.name}" is already registered, overwriting`);
    }

    this.tools.set(tool.name, tool);

    // Track by category
    if (!this.categories.has(tool.category)) {
      this.categories.set(tool.category, new Set());
    }
    this.categories.get(tool.category)!.add(tool.name);

    logger.debug(`Registered tool: ${tool.name} (${tool.category})`);
  }

  /**
   * Register multiple tools at once
   */
  registerAll(tools: ToolDefinition[]): void {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  /**
   * Get a specific tool by name
   */
  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools
   */
  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by category
   */
  getByCategory(category: string): ToolDefinition[] {
    const toolNames = this.categories.get(category);
    if (!toolNames) {
      return [];
    }

    return Array.from(toolNames)
      .map(name => this.tools.get(name))
      .filter((tool): tool is ToolDefinition => tool !== undefined);
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    return Array.from(this.categories.keys());
  }

  /**
   * Get count of registered tools
   */
  count(): number {
    return this.tools.size;
  }

  /**
   * Check if a tool is registered
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get the current whitelist
   */
  getAllowedTools(): string[] {
    return [...this.allowedTools];
  }

  /**
   * Get filtered tool names (only registered tools)
   */
  getRegisteredToolNames(): string[] {
    return Array.from(this.tools.keys());
  }
}
