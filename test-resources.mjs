#!/usr/bin/env node

/**
 * Test MCP Resources functionality
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testResources() {
  console.log('🧪 Starting Resources Test...\n');

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
      name: 'resources-test-client',
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
    console.log('✅ Connected!\n');

    // Test 1: List all resources
    console.log('📋 Test 1: Listing all resources...');
    const resourcesResponse = await client.listResources();
    console.log(`✅ Found ${resourcesResponse.resources.length} resources:`);
    resourcesResponse.resources.forEach(resource => {
      console.log(`   - ${resource.name} (${resource.uri})`);
      console.log(`     ${resource.description}`);
    });
    console.log();

    // Test 2: Read agents resource
    console.log('👥 Test 2: Reading agents resource...');
    const agentsResource = await client.readResource({
      uri: 'agents://list',
    });
    const agentsData = JSON.parse(agentsResource.contents[0].text);
    console.log(`✅ Agents resource loaded:`);
    console.log(`   Count: ${agentsData.count}`);
    console.log(`   Usage hint: ${agentsData.usage_hint}`);
    if (agentsData.agents.length > 0) {
      const firstAgent = agentsData.agents[0];
      console.log(`   Sample agent: ${firstAgent.name} (${firstAgent.id})`);
      console.log(`   Description: ${firstAgent.description}`);
    }
    console.log();

    // Test 3: Read teams resource
    console.log('👨‍👩‍👧‍👦 Test 3: Reading teams resource...');
    const teamsResource = await client.readResource({
      uri: 'teams://list',
    });
    const teamsData = JSON.parse(teamsResource.contents[0].text);
    console.log(`✅ Teams resource loaded:`);
    console.log(`   Count: ${teamsData.count}`);
    console.log(`   Usage hint: ${teamsData.usage_hint}`);
    if (teamsData.teams.length > 0) {
      const firstTeam = teamsData.teams[0];
      console.log(`   Sample team: ${firstTeam.name} (${firstTeam.id})`);
      console.log(`   Members: ${firstTeam.members?.length || 0}`);
      console.log(`   Skills: ${firstTeam.skills?.length || 0}`);
    }
    console.log();

    // Test 4: Read worker queues resource
    console.log('⚙️ Test 4: Reading worker queues resource...');
    const workerQueuesResource = await client.readResource({
      uri: 'worker-queues://list',
    });
    const workerQueuesData = JSON.parse(workerQueuesResource.contents[0].text);
    console.log(`✅ Worker queues resource loaded:`);
    console.log(`   Count: ${workerQueuesData.count}`);
    console.log(`   Usage hint: ${workerQueuesData.usage_hint}`);
    if (workerQueuesData.worker_queues.length > 0) {
      const firstQueue = workerQueuesData.worker_queues[0];
      console.log(`   Sample queue: ${firstQueue.name} (${firstQueue.id})`);
      console.log(`   Status: ${firstQueue.status}`);
      console.log(`   Active workers: ${firstQueue.active_workers || 0}/${firstQueue.max_workers || '∞'}`);
    }
    console.log();

    // Test 5: Verify resource URIs are consistent
    console.log('🔍 Test 5: Verifying resource URIs...');
    const expectedUris = ['agents://list', 'teams://list', 'worker-queues://list'];
    const actualUris = resourcesResponse.resources.map(r => r.uri);

    const allPresent = expectedUris.every(uri => actualUris.includes(uri));
    if (allPresent) {
      console.log('✅ All expected resource URIs are present');
    } else {
      console.log('❌ Some expected resource URIs are missing');
      console.log(`   Expected: ${expectedUris.join(', ')}`);
      console.log(`   Actual: ${actualUris.join(', ')}`);
    }
    console.log();

    console.log('✨ All resource tests completed successfully!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    // Cleanup
    await client.close();
  }
}

// Run tests
testResources().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
