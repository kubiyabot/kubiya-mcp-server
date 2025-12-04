/**
 * Tool Registry Unit Tests
 *
 * Comprehensive tests for the ToolRegistry class including:
 * - Tool registration
 * - Whitelist filtering with wildcards
 * - Category management
 * - Tool retrieval
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ToolRegistry } from '../../../src/tools/registry.js';
import type { ToolDefinition } from '../../../src/types/tools.js';

// Helper function to create mock tools
function createMockTool(overrides: Partial<ToolDefinition> = {}): ToolDefinition {
  const name = overrides.name || 'test_tool';
  return {
    name,
    description: `Description for ${name}`,
    category: 'test',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
    handler: async () => ({ content: [{ type: 'text', text: 'ok' }] }),
    ...overrides,
  };
}

describe('ToolRegistry', () => {
  // ==========================================================================
  // Constructor and Initialization
  // ==========================================================================
  describe('constructor', () => {
    it('should create registry with default wildcard whitelist', () => {
      const registry = new ToolRegistry();

      expect(registry.getAllowedTools()).toEqual(['*']);
    });

    it('should create registry with custom whitelist', () => {
      const registry = new ToolRegistry(['list_agents', 'get_agent']);

      expect(registry.getAllowedTools()).toEqual(['list_agents', 'get_agent']);
    });

    it('should create empty registry', () => {
      const registry = new ToolRegistry();

      expect(registry.count()).toBe(0);
    });
  });

  // ==========================================================================
  // Tool Registration
  // ==========================================================================
  describe('register', () => {
    it('should register a tool when whitelist is wildcard', () => {
      const registry = new ToolRegistry(['*']);
      const tool = createMockTool({ name: 'list_agents' });

      registry.register(tool);

      expect(registry.has('list_agents')).toBe(true);
      expect(registry.count()).toBe(1);
    });

    it('should register a tool when it matches whitelist exactly', () => {
      const registry = new ToolRegistry(['list_agents', 'get_agent']);
      const tool = createMockTool({ name: 'list_agents' });

      registry.register(tool);

      expect(registry.has('list_agents')).toBe(true);
    });

    it('should NOT register a tool when not in whitelist', () => {
      const registry = new ToolRegistry(['list_agents']);
      const tool = createMockTool({ name: 'delete_agent' });

      registry.register(tool);

      expect(registry.has('delete_agent')).toBe(false);
      expect(registry.count()).toBe(0);
    });

    it('should overwrite existing tool with same name', () => {
      const registry = new ToolRegistry(['*']);
      const tool1 = createMockTool({ name: 'test_tool', description: 'First' });
      const tool2 = createMockTool({ name: 'test_tool', description: 'Second' });

      registry.register(tool1);
      registry.register(tool2);

      expect(registry.count()).toBe(1);
      expect(registry.get('test_tool')?.description).toBe('Second');
    });

    it('should track tool by category', () => {
      const registry = new ToolRegistry(['*']);
      const tool = createMockTool({ name: 'list_agents', category: 'agents' });

      registry.register(tool);

      expect(registry.getByCategory('agents')).toHaveLength(1);
      expect(registry.getCategories()).toContain('agents');
    });
  });

  // ==========================================================================
  // Whitelist Wildcard Patterns
  // ==========================================================================
  describe('whitelist patterns', () => {
    it('should match prefix wildcard pattern (list_*)', () => {
      const registry = new ToolRegistry(['list_*']);

      registry.register(createMockTool({ name: 'list_agents' }));
      registry.register(createMockTool({ name: 'list_teams' }));
      registry.register(createMockTool({ name: 'get_agents' }));

      expect(registry.has('list_agents')).toBe(true);
      expect(registry.has('list_teams')).toBe(true);
      expect(registry.has('get_agents')).toBe(false);
      expect(registry.count()).toBe(2);
    });

    it('should match suffix wildcard pattern (*_agent)', () => {
      const registry = new ToolRegistry(['*_agent']);

      registry.register(createMockTool({ name: 'list_agent' }));
      registry.register(createMockTool({ name: 'get_agent' }));
      registry.register(createMockTool({ name: 'delete_agent' }));
      registry.register(createMockTool({ name: 'list_agents' })); // Note: plural

      expect(registry.has('list_agent')).toBe(true);
      expect(registry.has('get_agent')).toBe(true);
      expect(registry.has('delete_agent')).toBe(true);
      expect(registry.has('list_agents')).toBe(false);
    });

    it('should match middle wildcard pattern (get_*_details)', () => {
      const registry = new ToolRegistry(['get_*_details']);

      registry.register(createMockTool({ name: 'get_agent_details' }));
      registry.register(createMockTool({ name: 'get_team_details' }));
      registry.register(createMockTool({ name: 'get_agent_status' }));

      expect(registry.has('get_agent_details')).toBe(true);
      expect(registry.has('get_team_details')).toBe(true);
      expect(registry.has('get_agent_status')).toBe(false);
    });

    it('should handle multiple wildcard patterns', () => {
      const registry = new ToolRegistry(['list_*', 'get_*', '*_execute']);

      registry.register(createMockTool({ name: 'list_agents' }));
      registry.register(createMockTool({ name: 'get_agent' }));
      registry.register(createMockTool({ name: 'agent_execute' }));
      registry.register(createMockTool({ name: 'delete_agent' }));

      expect(registry.has('list_agents')).toBe(true);
      expect(registry.has('get_agent')).toBe(true);
      expect(registry.has('agent_execute')).toBe(true);
      expect(registry.has('delete_agent')).toBe(false);
    });

    it('should combine exact matches with wildcards', () => {
      const registry = new ToolRegistry(['list_*', 'health_check']);

      registry.register(createMockTool({ name: 'list_agents' }));
      registry.register(createMockTool({ name: 'health_check' }));
      registry.register(createMockTool({ name: 'get_agent' }));

      expect(registry.has('list_agents')).toBe(true);
      expect(registry.has('health_check')).toBe(true);
      expect(registry.has('get_agent')).toBe(false);
    });

    it('should handle empty whitelist', () => {
      const registry = new ToolRegistry([]);

      registry.register(createMockTool({ name: 'list_agents' }));

      expect(registry.has('list_agents')).toBe(false);
      expect(registry.count()).toBe(0);
    });
  });

  // ==========================================================================
  // registerAll
  // ==========================================================================
  describe('registerAll', () => {
    it('should register multiple tools', () => {
      const registry = new ToolRegistry(['*']);
      const tools = [
        createMockTool({ name: 'tool1' }),
        createMockTool({ name: 'tool2' }),
        createMockTool({ name: 'tool3' }),
      ];

      registry.registerAll(tools);

      expect(registry.count()).toBe(3);
    });

    it('should only register allowed tools', () => {
      const registry = new ToolRegistry(['tool1', 'tool3']);
      const tools = [
        createMockTool({ name: 'tool1' }),
        createMockTool({ name: 'tool2' }),
        createMockTool({ name: 'tool3' }),
      ];

      registry.registerAll(tools);

      expect(registry.count()).toBe(2);
      expect(registry.has('tool1')).toBe(true);
      expect(registry.has('tool2')).toBe(false);
      expect(registry.has('tool3')).toBe(true);
    });

    it('should handle empty array', () => {
      const registry = new ToolRegistry(['*']);

      registry.registerAll([]);

      expect(registry.count()).toBe(0);
    });
  });

  // ==========================================================================
  // get and getAll
  // ==========================================================================
  describe('get and getAll', () => {
    let registry: ToolRegistry;
    let tools: ToolDefinition[];

    beforeEach(() => {
      registry = new ToolRegistry(['*']);
      tools = [
        createMockTool({ name: 'list_agents', category: 'agents' }),
        createMockTool({ name: 'get_agent', category: 'agents' }),
        createMockTool({ name: 'list_teams', category: 'teams' }),
      ];
      registry.registerAll(tools);
    });

    it('should get tool by name', () => {
      const tool = registry.get('list_agents');

      expect(tool).toBeDefined();
      expect(tool?.name).toBe('list_agents');
    });

    it('should return undefined for non-existent tool', () => {
      const tool = registry.get('nonexistent');

      expect(tool).toBeUndefined();
    });

    it('should get all tools', () => {
      const allTools = registry.getAll();

      expect(allTools).toHaveLength(3);
    });

    it('should return empty array when no tools registered', () => {
      const emptyRegistry = new ToolRegistry(['*']);

      expect(emptyRegistry.getAll()).toEqual([]);
    });
  });

  // ==========================================================================
  // getByCategory and getCategories
  // ==========================================================================
  describe('category management', () => {
    let registry: ToolRegistry;

    beforeEach(() => {
      registry = new ToolRegistry(['*']);
      registry.registerAll([
        createMockTool({ name: 'list_agents', category: 'agents' }),
        createMockTool({ name: 'get_agent', category: 'agents' }),
        createMockTool({ name: 'delete_agent', category: 'agents' }),
        createMockTool({ name: 'list_teams', category: 'teams' }),
        createMockTool({ name: 'get_team', category: 'teams' }),
        createMockTool({ name: 'health_check', category: 'system' }),
      ]);
    });

    it('should get tools by category', () => {
      const agentTools = registry.getByCategory('agents');

      expect(agentTools).toHaveLength(3);
      expect(agentTools.every(t => t.category === 'agents')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      const tools = registry.getByCategory('nonexistent');

      expect(tools).toEqual([]);
    });

    it('should get all categories', () => {
      const categories = registry.getCategories();

      expect(categories).toHaveLength(3);
      expect(categories).toContain('agents');
      expect(categories).toContain('teams');
      expect(categories).toContain('system');
    });
  });

  // ==========================================================================
  // count and has
  // ==========================================================================
  describe('count and has', () => {
    it('should return correct count', () => {
      const registry = new ToolRegistry(['*']);
      registry.registerAll([
        createMockTool({ name: 'tool1' }),
        createMockTool({ name: 'tool2' }),
      ]);

      expect(registry.count()).toBe(2);
    });

    it('should return true for existing tool', () => {
      const registry = new ToolRegistry(['*']);
      registry.register(createMockTool({ name: 'existing_tool' }));

      expect(registry.has('existing_tool')).toBe(true);
    });

    it('should return false for non-existing tool', () => {
      const registry = new ToolRegistry(['*']);

      expect(registry.has('nonexistent')).toBe(false);
    });
  });

  // ==========================================================================
  // getRegisteredToolNames
  // ==========================================================================
  describe('getRegisteredToolNames', () => {
    it('should return array of registered tool names', () => {
      const registry = new ToolRegistry(['*']);
      registry.registerAll([
        createMockTool({ name: 'tool_a' }),
        createMockTool({ name: 'tool_b' }),
        createMockTool({ name: 'tool_c' }),
      ]);

      const names = registry.getRegisteredToolNames();

      expect(names).toHaveLength(3);
      expect(names).toContain('tool_a');
      expect(names).toContain('tool_b');
      expect(names).toContain('tool_c');
    });

    it('should return empty array for empty registry', () => {
      const registry = new ToolRegistry(['*']);

      expect(registry.getRegisteredToolNames()).toEqual([]);
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================
  describe('edge cases', () => {
    it('should handle special characters in tool names', () => {
      const registry = new ToolRegistry(['*']);
      const tool = createMockTool({ name: 'tool-with-dashes' });

      registry.register(tool);

      expect(registry.has('tool-with-dashes')).toBe(true);
    });

    it('should handle unicode in tool names', () => {
      const registry = new ToolRegistry(['*']);
      const tool = createMockTool({ name: 'tool_日本語' });

      registry.register(tool);

      expect(registry.has('tool_日本語')).toBe(true);
    });

    it('should preserve getAllowedTools immutability', () => {
      const registry = new ToolRegistry(['tool1', 'tool2']);
      const allowedTools = registry.getAllowedTools();

      allowedTools.push('tool3');

      expect(registry.getAllowedTools()).toEqual(['tool1', 'tool2']);
    });

    it('should handle regex special characters in whitelist patterns', () => {
      // Test that * is converted correctly but other regex chars don't break
      const registry = new ToolRegistry(['tool.*', 'list_*']);

      registry.register(createMockTool({ name: 'tool.test' }));
      registry.register(createMockTool({ name: 'list_agents' }));

      expect(registry.has('list_agents')).toBe(true);
    });
  });
});
