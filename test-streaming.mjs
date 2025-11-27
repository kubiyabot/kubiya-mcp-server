#!/usr/bin/env node

/**
 * Test streaming functionality
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testStreaming() {
  console.log('🧪 Starting Streaming Test...\n');

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
      name: 'streaming-test-client',
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

    // List tools to verify streaming tools exist
    console.log('📋 Verifying streaming tools...');
    const toolsResponse = await client.listTools();
    const streamingTools = toolsResponse.tools.filter(t =>
      t.name.includes('stream') || t.name.includes('event')
    );

    console.log(`✅ Found ${streamingTools.length} streaming tools:`);
    streamingTools.forEach(tool => {
      console.log(`   - ${tool.name}`);
    });
    console.log();

    // Test 1: List agents to find one we can execute
    console.log('👥 Test 1: Finding an agent to execute...');
    const agentsResult = await client.callTool({
      name: 'list_agents',
      arguments: { skip: 0, limit: 1 },
    });

    const agentsData = JSON.parse(agentsResult.content[0].text);
    if (agentsData.items.length === 0) {
      console.log('❌ No agents found. Cannot test streaming.');
      return;
    }

    const testAgent = agentsData.items[0];
    console.log(`✅ Found agent: ${testAgent.name} (${testAgent.id})\n`);

    // Test 2: Execute agent
    console.log('🚀 Test 2: Executing agent...');
    const executeResult = await client.callTool({
      name: 'execute_agent',
      arguments: {
        agent_id: testAgent.id,
        prompt: 'What is 2+2?',
      },
    });

    const execution = JSON.parse(executeResult.content[0].text);
    const executionId = execution.id;
    console.log(`✅ Execution started: ${executionId}\n`);

    // Test 3: Poll for events (quick check)
    console.log('📊 Test 3: Polling for initial events...');
    const pollResult = await client.callTool({
      name: 'get_execution_events',
      arguments: {
        execution_id: executionId,
        limit: 10,
      },
    });

    const pollData = JSON.parse(pollResult.content[0].text);
    console.log(`✅ Fetched ${pollData.events.length} initial events`);
    if (pollData.events.length > 0) {
      console.log(`   Latest event: ${pollData.events[pollData.events.length - 1].type}`);
      console.log(`   Last event ID: ${pollData.last_event_id}`);
      console.log(`   Execution complete: ${pollData.execution_complete}`);
    }
    console.log();

    // Test 4: Stream to completion (with short timeout for demo)
    console.log('🌊 Test 4: Streaming execution to completion...');
    console.log('   (timeout: 60 seconds)');
    const streamResult = await client.callTool({
      name: 'stream_execution_to_completion',
      arguments: {
        execution_id: executionId,
        timeout_seconds: 60,
      },
    });

    const streamData = JSON.parse(streamResult.content[0].text);
    console.log(`✅ Stream completed!`);
    console.log(`   Status: ${streamData.status}`);
    console.log(`   Total events: ${streamData.total_events}`);
    console.log(`   Messages: ${streamData.summary.message_count}`);
    console.log(`   Tool executions: ${streamData.summary.tool_executions}`);
    console.log(`   Errors: ${streamData.summary.errors}`);

    if (streamData.final_response) {
      console.log(`   Final response: ${streamData.final_response.substring(0, 100)}...`);
    }
    console.log();

    // Show event timeline
    console.log('📅 Event Timeline:');
    const eventTypeCounts = {};
    streamData.events.forEach(event => {
      eventTypeCounts[event.type] = (eventTypeCounts[event.type] || 0) + 1;
    });
    Object.entries(eventTypeCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    console.log();

    console.log('✨ All streaming tests completed successfully!\n');

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
testStreaming().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
