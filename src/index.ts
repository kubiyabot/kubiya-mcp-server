#!/usr/bin/env node

/**
 * Kubiya Agent Control Plane MCP Server
 *
 * Production-ready Model Context Protocol server with full API coverage,
 * multi-profile configuration, and comprehensive error handling.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { loadConfig } from './config/index.js';
import { ControlPlaneClient } from './client/index.js';
import { ToolRegistry } from './tools/registry.js';
import { Logger, logger } from './utils/logger.js';

// Import Phase 1 tools
import * as agentTools from './tools/agents/index.js';
import * as teamTools from './tools/teams/index.js';
import * as executionTools from './tools/executions/index.js';
import * as workflowTools from './tools/workflows/index.js';
import * as systemTools from './tools/system/index.js';

// Import resources
import {
  resourceRegistry,
  agentsListResource,
  teamsListResource,
  workerQueuesListResource,
} from './resources/index.js';

const log = logger;

/**
 * Convert Zod schema to JSON Schema for MCP
 */
function zodToJsonSchema(_zodSchema: any): any {
  // Basic conversion - for production, consider using zod-to-json-schema library
  return {
    type: 'object',
    properties: {},
    additionalProperties: true,
  };
}

/**
 * Main server initialization
 */
async function main() {
  log.info('🚀 Starting Kubiya Control Plane MCP Server...');

  // Load configuration
  let config;
  try {
    config = loadConfig();
    Logger.setLogLevel(config.logLevel);
    log.info('✅ Configuration loaded successfully', {
      profile: config.profile,
      apiBaseUrl: config.apiBaseUrl,
    });
  } catch (error) {
    log.error('❌ Configuration error', error);
    process.exit(1);
  }

  // Initialize API client
  const client = new ControlPlaneClient(config);
  log.info('✅ API client initialized');

  // Validate connection and authentication
  try {
    await client.validateConnection();
  } catch (error) {
    log.error('❌ Failed to validate API connection', error);
    log.error('');
    log.error('Please check:');
    log.error('  1. CONTROL_PLANE_API_KEY is set and valid');
    log.error('  2. API endpoint is accessible:', config.apiBaseUrl);
    log.error('  3. Network connectivity is working');
    log.error('');
    process.exit(1);
  }

  // Initialize tool registry with whitelist
  const registry = new ToolRegistry(config.allowedTools);

  // Register Phase 1 tools (only allowed tools will be registered)
  registry.registerAll(Object.values(agentTools));
  registry.registerAll(Object.values(teamTools));
  registry.registerAll(Object.values(executionTools));
  registry.registerAll(Object.values(workflowTools));
  registry.registerAll(Object.values(systemTools));

  const registeredCount = registry.count();
  const allowedToolsStr = config.allowedTools.join(', ');

  log.info(`✅ Registered ${registeredCount} tools across ${registry.getCategories().length} categories`);
  log.info(`🔒 Tool whitelist: ${allowedToolsStr}`);

  // Register resources
  resourceRegistry.registerAll([
    agentsListResource,
    teamsListResource,
    workerQueuesListResource,
  ]);

  log.info(`✅ Registered ${resourceRegistry.size} resources for context injection`);

  // Create MCP server
  const server = new Server(
    {
      name: 'kubiya-control-plane',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // Handle tool listing
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools = registry.getAll();

    return {
      tools: tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: zodToJsonSchema(tool.inputSchema),
      })),
    };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const tool = registry.get(name);
    if (!tool) {
      log.error(`Tool not found: ${name}`);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: `Unknown tool: ${name}` }, null, 2),
          },
        ],
        isError: true,
      };
    }

    try {
      log.info(`Executing tool: ${name}`);
      const result = await tool.handler(args || {}, client);
      return result as any; // MCP SDK type compatibility
    } catch (error) {
      log.error(`Tool execution failed: ${name}`, error);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: error instanceof Error ? error.message : String(error),
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      } as any; // MCP SDK type compatibility
    }
  });

  // Handle resource listing
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const resources = resourceRegistry.list();

    return {
      resources: resources.map(resource => ({
        uri: resource.uri,
        name: resource.name,
        description: resource.description,
        mimeType: resource.mimeType,
      })),
    };
  });

  // Handle resource reading
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    if (!resourceRegistry.has(uri)) {
      log.error(`Resource not found: ${uri}`);
      throw new Error(`Unknown resource: ${uri}`);
    }

    try {
      log.info(`Reading resource: ${uri}`);
      const content = await resourceRegistry.getResourceContent(uri, client);

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: content,
          },
        ],
      };
    } catch (error) {
      log.error(`Resource read failed: ${uri}`, error);
      throw error;
    }
  });

  // Connect to transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  log.info('✨ MCP Server running on stdio');
  log.info('🎯 Ready to accept requests');
  log.info('');
  log.info('Available tool categories:');
  registry.getCategories().forEach(category => {
    const tools = registry.getByCategory(category);
    log.info(`  - ${category}: ${tools.length} tools`);
  });
}

// Error handling
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection:', reason as Error);
  process.exit(1);
});

// Run the server
main().catch((error) => {
  log.error('Fatal error:', error);
  process.exit(1);
});
