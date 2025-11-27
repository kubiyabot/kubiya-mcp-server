# Kubiya Control Plane MCP Server

[![npm version](https://badge.fury.io/js/%40kubiya%2Fcontrol-plane-mcp-server.svg)](https://www.npmjs.com/package/@kubiya/control-plane-mcp-server)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)

A production-ready [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that provides comprehensive access to the [Kubiya Agent Control Plane API](https://kubiya.ai).

## 🚀 Features

- ✅ **17 MCP Tools** - Complete API coverage for agents, teams, workflows, executions, and system operations
- ✅ **3 MCP Resources** - Dynamic context injection (agents, teams, worker queues)
- ✅ **Real-time Streaming** - SSE-based execution monitoring with auto-reconnection
- ✅ **Enhanced Error Handling** - 6 custom error classes with user-friendly hints
- ✅ **Multi-Profile Configuration** - Dev, staging, and prod environment support
- ✅ **Production Ready** - Retry logic, exponential backoff, proper timeouts
- ✅ **Type Safe** - Built with TypeScript and Zod validation
- ✅ **Easy Integration** - Works with Claude Desktop, MCP Inspector, and any MCP client

## 📦 Installation

### From npm (Recommended)

```bash
npm install -g @kubiya/control-plane-mcp-server
```

### From Source

```bash
git clone https://github.com/kubiyabot/kubiya-mcp-server.git
cd kubiya-mcp-server
npm install
npm run build
```

## 🎯 Quick Start

### 1. Get Your API Key

Get your Kubiya API key from the [Kubiya Dashboard](https://app.kubiya.ai):
1. Navigate to Settings → API Keys
2. Create a new API key
3. Copy the JWT token

### 2. Set Environment Variables

```bash
# Required
export CONTROL_PLANE_API_KEY="your-jwt-token-here"

# Optional
export MCP_PROFILE="prod"                     # dev, staging, or prod (default: dev)
export CONTROL_PLANE_API_URL=""               # Override profile's API URL
export LOG_LEVEL="info"                       # debug, info, warn, or error
export MCP_ALLOWED_TOOLS="*"                  # Tool whitelist (see Security)
```

### 3. Run the Server

```bash
# Using global install
kubiya-mcp

# Using npx (no install required)
npx @kubiya/control-plane-mcp-server

# Using source
npm start
```

### 4. Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector npx @kubiya/control-plane-mcp-server
```

## 🔧 Integration

### Claude Desktop

Add to your `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "kubiya-control-plane": {
      "command": "npx",
      "args": ["@kubiya/control-plane-mcp-server"],
      "env": {
        "CONTROL_PLANE_API_KEY": "your-jwt-token-here",
        "MCP_PROFILE": "prod"
      }
    }
  }
}
```

Restart Claude Desktop and verify the server appears in the 🔌 menu.

### Other MCP Clients

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'npx',
  args: ['@kubiya/control-plane-mcp-server'],
  env: {
    CONTROL_PLANE_API_KEY: process.env.CONTROL_PLANE_API_KEY,
    MCP_PROFILE: 'prod',
  },
});

const client = new Client({ name: 'my-client', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);

// List available tools
const tools = await client.listTools();

// Call a tool
const result = await client.callTool({
  name: 'list_agents',
  arguments: { skip: 0, limit: 10 },
});
```

## 📚 API Reference

### Tools (17 total)

#### Agents (4 tools)

- **`list_agents`** - List all agents with pagination
  ```json
  { "skip": 0, "limit": 10 }
  ```

- **`get_agent`** - Get agent details by ID
  ```json
  { "agent_id": "uuid" }
  ```

- **`create_agent`** - Create new agent with configuration
  ```json
  {
    "name": "My Agent",
    "description": "Agent description",
    "runner": { /* config */ }
  }
  ```

- **`execute_agent`** - Execute agent with prompt
  ```json
  {
    "agent_id": "uuid",
    "prompt": "What is the weather?",
    "worker_queue_id": "optional-queue-id"
  }
  ```

#### Teams (3 tools)

- **`list_teams`** - List all teams
- **`get_team`** - Get team details by ID
- **`execute_team`** - Execute team with prompt

#### Executions (5 tools)

- **`list_executions`** - List execution history with filtering
  ```json
  {
    "skip": 0,
    "limit": 10,
    "status": "completed",
    "entity_id": "optional-agent-or-team-id"
  }
  ```

- **`get_execution`** - Get execution details and results
- **`get_execution_messages`** - Get execution messages/logs
- **`stream_execution_to_completion`** - Stream events until completion
  ```json
  {
    "execution_id": "uuid",
    "timeout_seconds": 270,
    "event_filter": ["tool_started", "tool_completed", "done"]
  }
  ```

- **`get_execution_events`** - Poll for new events incrementally
  ```json
  {
    "execution_id": "uuid",
    "last_event_id": "optional-for-pagination",
    "limit": 50
  }
  ```

#### Workflows (3 tools)

- **`list_workflows`** - List workflows with filtering
- **`get_workflow`** - Get workflow details
- **`create_workflow`** - Create workflow definition

#### System (2 tools)

- **`health_check`** - Check API health status
- **`list_models`** - List available LLM models

### Resources (3 total)

Resources provide dynamic context data that helps LLMs make informed decisions:

#### `agents://list` - Available Agents
Lists all agents with configurations, skills, and capabilities.

**Response includes**: agent ID, name, description, image, runner config, secrets, environment variables, integrations

**Usage**: Reference agent IDs when calling `execute_agent`

#### `teams://list` - Available Teams
Lists all teams with members, skills, and configurations.

**Response includes**: team ID, name, description, members, skills, runner config, communication settings

**Usage**: Reference team IDs when calling `execute_team`

#### `worker-queues://list` - Available Worker Queues
Lists all worker queues with status and active workers.

**Response includes**: queue ID, name, environment, status, active workers, max workers, heartbeat interval

**Usage**: Reference queue IDs when executing agents/teams with `worker_queue_id` parameter

**Why Resources?**
- Provides context for tool parameters (which agent ID to use, which queue to assign)
- Automatically updated - always shows current state
- Helps LLMs make informed decisions when using tools
- Reduces errors from invalid IDs or missing context

## 🌊 Real-time Streaming

The MCP server provides two complementary tools for monitoring long-running executions:

### Pattern 1: Complete History (Batch Processing)

Use `stream_execution_to_completion` to collect all events until the execution finishes:

```typescript
// Execute agent
const execution = await client.callTool({
  name: 'execute_agent',
  arguments: {
    agent_id: 'agent-uuid',
    prompt: 'Analyze the logs'
  }
});

// Stream until completion
const stream = await client.callTool({
  name: 'stream_execution_to_completion',
  arguments: {
    execution_id: execution.id,
    timeout_seconds: 300
  }
});

const result = JSON.parse(stream.content[0].text);
console.log(`Status: ${result.status}`);
console.log(`Total events: ${result.total_events}`);
console.log(`Tool executions: ${result.summary.tool_executions}`);
console.log(`Final response: ${result.final_response}`);
```

### Pattern 2: Incremental Polling (Interactive UI)

Use `get_execution_events` to poll for updates periodically:

```typescript
// Execute agent
const execution = await client.callTool({
  name: 'execute_agent',
  arguments: {
    agent_id: 'agent-uuid',
    prompt: 'Analyze the logs'
  }
});

// Poll for updates
let lastEventId = null;
let isComplete = false;

while (!isComplete) {
  const events = await client.callTool({
    name: 'get_execution_events',
    arguments: {
      execution_id: execution.id,
      last_event_id: lastEventId,
      limit: 20
    }
  });

  const data = JSON.parse(events.content[0].text);

  // Update UI with new events
  data.events.forEach(event => {
    console.log(`[${event.type}] ${event.data}`);
  });

  lastEventId = data.last_event_id;
  isComplete = data.execution_complete;

  if (!isComplete) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Poll every 2s
  }
}
```

### Event Types

Both streaming tools emit these event types:

- `message` - Complete conversation messages
- `message_chunk` - Streaming response chunks (token-by-token)
- `member_message_chunk` - Team member streaming chunks
- `tool_started` - Tool execution began
- `tool_completed` - Tool finished with results
- `status` - Execution status changed (PENDING → RUNNING → COMPLETED)
- `error` - Error occurred during execution
- `done` - Execution completed successfully
- `gap_detected` - Warning that some events were missed (reconnection gap)
- `degraded` - Fallback mode activated (worker unavailable)
- `reconnect` - Server requests client to reconnect
- `timeout_warning` - Approaching 270-second API timeout limit

## ⚙️ Configuration

### Environment Profiles

The server supports three environment profiles:

#### Development (default)
```bash
export MCP_PROFILE="dev"
# API: http://localhost:8000
# Retry: 2 attempts
# Log Level: debug
```

#### Staging
```bash
export MCP_PROFILE="staging"
# API: https://staging-control-plane.kubiya.ai
# Retry: 3 attempts
# Log Level: info
```

#### Production
```bash
export MCP_PROFILE="prod"
# API: https://control-plane.kubiya.ai
# Retry: 3 attempts
# Log Level: warn
```

### Custom Configuration

Override profile settings with environment variables:

```bash
export CONTROL_PLANE_API_URL="https://custom.kubiya.ai"
export LOG_LEVEL="debug"
export MCP_ALLOWED_TOOLS="list_*,get_*,health_check"
```

Or create profile-specific config files:

**`config/custom.json`**:
```json
{
  "apiBaseUrl": "https://custom.kubiya.ai",
  "logLevel": "info",
  "retryAttempts": 5,
  "retryDelay": 2000,
  "timeout": 60000,
  "allowedTools": ["list_*", "get_*", "execute_*"]
}
```

```bash
export MCP_PROFILE="custom"
```

## 🔒 Security

### Tool Whitelisting

Control which tools are available using `MCP_ALLOWED_TOOLS`:

```bash
# Allow all tools (default)
export MCP_ALLOWED_TOOLS="*"

# Allow specific tools only
export MCP_ALLOWED_TOOLS="list_agents,get_agent,list_executions"

# Use wildcard patterns
export MCP_ALLOWED_TOOLS="list_*,get_*,health_check"  # All list/get tools + health check

# Read-only access (no create/execute/delete)
export MCP_ALLOWED_TOOLS="list_*,get_*"
```

**Whitelist Patterns:**
- `*` - All tools (default)
- `tool_name` - Exact match
- `list_*` - Wildcard matching (e.g., matches `list_agents`, `list_teams`, etc.)
- `*_agent` - Suffix matching

### API Key Security

- Never commit API keys to version control
- Use environment variables or secure secret management
- Rotate keys regularly
- Use separate keys for different environments

## 🐛 Troubleshooting

### Server won't start

**Error**: `Configuration validation failed: API key is required`

**Solution**: Ensure `CONTROL_PLANE_API_KEY` is set:
```bash
export CONTROL_PLANE_API_KEY="your-jwt-token"
```

---

**Error**: `Failed to connect to API`

**Solutions**:
1. Check your internet connection
2. Verify API URL is correct for your profile
3. Ensure firewall allows outbound HTTPS connections
4. Try with `LOG_LEVEL=debug` for detailed logs

---

### Authentication errors

**Error**: `Authentication failed` (401)

**Solutions**:
1. Verify your API key is valid and not expired
2. Check the API key has correct permissions
3. Ensure you're using the correct profile (dev/staging/prod)

---

### Rate limiting

**Error**: `Rate limit exceeded` (429)

**Solutions**:
1. Wait before retrying (check `retry_after` in error response)
2. Implement exponential backoff in your client
3. Reduce request frequency

---

### Streaming issues

**Problem**: Events are missing or incomplete

**Solutions**:
1. Watch for `gap_detected` events and handle reconnection
2. Use `get_execution_events` with `last_event_id` for reliable polling
3. Increase timeout if executions are long-running

---

### Claude Desktop integration

**Problem**: Server doesn't appear in Claude Desktop

**Solutions**:
1. Restart Claude Desktop completely
2. Check config file location is correct for your OS
3. Verify JSON syntax in `claude_desktop_config.json`
4. Check Claude Desktop logs: `~/Library/Logs/Claude/mcp*.log` (macOS)

---

### Debug Mode

Enable detailed logging:

```bash
export LOG_LEVEL="debug"
kubiya-mcp
```

## 🏗️ Architecture

### Tool Registry Pattern

Tools are auto-discovered and registered by category:

```typescript
// Individual tool definition
export const listAgentsTool: ToolDefinition = {
  name: 'list_agents',
  description: 'List all agents...',
  category: 'agents',
  inputSchema: ListAgentsSchema,
  handler: async (args, client) => { ... },
};

// Auto-registration
registry.registerAll(Object.values(agentTools));
```

### Layered API Client

Domain-specific services with shared base client:

```
ControlPlaneClient
├── agents: AgentService
├── teams: TeamService
├── workflows: WorkflowService
├── executions: ExecutionService
├── system: SystemService
└── workerQueues: WorkerQueuesService
    └── BaseClient (retry logic, error handling)
```

### Error Handling Hierarchy

```
MCPError (base)
├── APIError (generic API errors)
├── ValidationError (input validation)
├── ConfigurationError (setup issues)
├── AuthenticationError (401)
├── ForbiddenError (403)
├── NotFoundError (404)
├── ConflictError (409)
├── RateLimitError (429)
└── TimeoutError (408, 504)
```

Each error includes:
- User-friendly message
- Error code
- HTTP status code
- Retry-ability flag
- Actionable troubleshooting hints

## 📦 Publishing to npm

### Prerequisites

1. npm account with publish access to `@kubiya` scope
2. Logged in: `npm login`
3. Two-factor authentication configured

### Pre-publish Checklist

```bash
# 1. Update version in package.json
npm version patch  # or minor, major

# 2. Run tests
npm test

# 3. Type check
npm run type-check

# 4. Build
npm run build

# 5. Test the build locally
npm pack
npm install -g kubiya-control-plane-mcp-server-1.0.0.tgz
kubiya-mcp --help

# 6. Update CHANGELOG.md with version changes
```

### Publish

```bash
# Dry run (see what will be published)
npm publish --dry-run

# Publish to npm
npm publish

# Verify published package
npm view @kubiya/control-plane-mcp-server
```

### Post-publish

1. Create GitHub release with tag `v1.0.0`
2. Update documentation
3. Announce in relevant channels

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Setup

```bash
# Clone repository
git clone https://github.com/kubiyabot/kubiya-mcp-server.git
cd kubiya-mcp-server

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API key

# Start development server
npm run dev
```

### Code Style

- TypeScript with strict mode
- ESLint for linting: `npm run lint`
- Prettier for formatting: `npm run format`
- All exports must have type annotations

### Adding New Tools

1. Create tool file in `src/tools/<category>/`
2. Define tool with `ToolDefinition` interface
3. Add Zod schema for input validation
4. Implement handler function
5. Export from category index
6. Update README documentation
7. Add tests

Example:

```typescript
// src/tools/agents/my-new-tool.ts
import { z } from 'zod';
import type { ToolDefinition } from '../../types/tools.js';
import { formatToolResponse } from '../../utils/formatters.js';

export const MyNewToolSchema = z.object({
  agent_id: z.string().min(1, 'Agent ID is required'),
});

export const myNewTool: ToolDefinition = {
  name: 'my_new_tool',
  description: 'Does something useful',
  category: 'agents',
  inputSchema: MyNewToolSchema,
  handler: async (args, client) => {
    const { agent_id } = MyNewToolSchema.parse(args);
    const result = await client.agents.someMethod(agent_id);
    return formatToolResponse(result);
  },
};
```

### Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Pull Request Process

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-new-feature`
3. Make your changes
4. Add tests
5. Run linter and tests
6. Commit: `git commit -am 'Add new feature'`
7. Push: `git push origin feature/my-new-feature`
8. Create Pull Request

## 📄 License

AGPL-3.0 License - see [LICENSE](LICENSE) file for details

This project is licensed under the GNU Affero General Public License v3.0. This means:
- You can use, modify, and distribute this software freely
- If you modify and deploy this software on a server, you must make your source code available
- Any derivative works must also be licensed under AGPL-3.0

## 🔗 Links

- [Kubiya Website](https://kubiya.ai)
- [Kubiya Dashboard](https://app.kubiya.ai)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [GitHub Repository](https://github.com/kubiyabot/kubiya-mcp-server)
- [npm Package](https://www.npmjs.com/package/@kubiya/control-plane-mcp-server)
- [Issue Tracker](https://github.com/kubiyabot/kubiya-mcp-server/issues)

## 📞 Support

- **Email**: support@kubiya.ai
- **GitHub Issues**: [Create an issue](https://github.com/kubiyabot/agent-control-plane/issues)
- **Documentation**: [API Docs](https://docs.kubiya.ai)

---

Made with ❤️ by [Kubiya](https://kubiya.ai)
