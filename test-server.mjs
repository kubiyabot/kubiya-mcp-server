#!/usr/bin/env node

/**
 * Simple MCP client to test the server
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

async function testServer() {
  console.log('🧪 Starting MCP Server Test...\n');

  // Start the server process
  const serverProcess = spawn('node', ['build/index.js'], {
    env: {
      ...process.env,
      CONTROL_PLANE_API_KEY: process.env.CONTROL_PLANE_API_KEY,
      MCP_PROFILE: process.env.MCP_PROFILE || 'prod',
      LOG_LEVEL: 'warn', // Reduce server log noise
    },
  });

  // Capture server logs for debugging
  serverProcess.stderr.on('data', (data) => {
    const log = data.toString();
    if (log.includes('ERROR') || log.includes('❌')) {
      console.error('Server Error:', log);
    }
  });

  // Create MCP client
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['build/index.js'],
    env: {
      CONTROL_PLANE_API_KEY: process.env.CONTROL_PLANE_API_KEY,
      MCP_PROFILE: process.env.MCP_PROFILE || 'prod',
      LOG_LEVEL: 'warn',
    },
  });

  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  try {
    // Connect to server
    console.log('📡 Connecting to MCP server...');
    await client.connect(transport);
    console.log('✅ Connected successfully!\n');

    // Test 1: List available tools
    console.log('📋 Test 1: Listing available tools...');
    const toolsResponse = await client.listTools();
    console.log(`✅ Found ${toolsResponse.tools.length} tools:\n`);

    toolsResponse.tools.forEach((tool, index) => {
      console.log(`   ${index + 1}. ${tool.name}`);
      console.log(`      ${tool.description.substring(0, 80)}...`);
    });
    console.log();

    // Verify we have all expected tools
    const expectedTools = [
      'list_agents', 'get_agent', 'create_agent', 'execute_agent',
      'list_teams', 'get_team', 'execute_team',
      'list_executions', 'get_execution', 'get_execution_messages',
      'list_workflows', 'get_workflow', 'create_workflow',
      'health_check', 'list_models'
    ];

    const toolNames = toolsResponse.tools.map(t => t.name);
    const missingTools = expectedTools.filter(name => !toolNames.includes(name));

    if (missingTools.length > 0) {
      console.log(`❌ Missing tools: ${missingTools.join(', ')}\n`);
    } else {
      console.log('✅ All 15 expected tools are available!\n');
    }

    // Test 2: Call health_check tool
    console.log('🏥 Test 2: Calling health_check tool...');
    const healthResult = await client.callTool({
      name: 'health_check',
      arguments: {},
    });

    if (healthResult.isError) {
      console.log('❌ Health check failed:', healthResult.content[0].text);
    } else {
      const healthData = JSON.parse(healthResult.content[0].text);
      console.log('✅ Health check passed!');
      console.log(`   Status: ${healthData.status}`);
      console.log(`   Service: ${healthData.service}`);
      console.log();
    }

    // Test 3: List agents with pagination
    console.log('👥 Test 3: Listing agents (first 5)...');
    const agentsResult = await client.callTool({
      name: 'list_agents',
      arguments: { skip: 0, limit: 5 },
    });

    if (agentsResult.isError) {
      console.log('❌ List agents failed:', agentsResult.content[0].text);
    } else {
      const agentsData = JSON.parse(agentsResult.content[0].text);
      console.log(`✅ Found ${agentsData.total || agentsData.count} total agents`);
      console.log(`   Retrieved ${agentsData.items.length} agents in this batch`);
      if (agentsData.items.length > 0) {
        console.log(`   First agent: ${agentsData.items[0].name} (${agentsData.items[0].uuid})`);
      }
      console.log();
    }

    // Test 4: List models
    console.log('🤖 Test 4: Listing available LLM models...');
    const modelsResult = await client.callTool({
      name: 'list_models',
      arguments: {},
    });

    if (modelsResult.isError) {
      console.log('❌ List models failed:', modelsResult.content[0].text);
    } else {
      const modelsData = JSON.parse(modelsResult.content[0].text);
      console.log(`✅ Found ${modelsData.items.length} available models`);
      if (modelsData.items.length > 0) {
        console.log(`   Examples: ${modelsData.items.slice(0, 3).join(', ')}`);
      }
      console.log();
    }

    console.log('✨ All tests completed successfully!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    // Cleanup
    await client.close();
    serverProcess.kill();
  }
}

// Run tests
testServer().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
