# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-26

### Added

#### Core Features
- **17 MCP Tools** across 5 categories (agents, teams, executions, workflows, system)
- **3 MCP Resources** for context injection (agents, teams, worker queues)
- **Real-time Streaming** via SSE with auto-reconnection for execution monitoring
- **Multi-profile Configuration** (dev, staging, prod environments)
- **Tool Whitelisting** for security and access control

#### Tools
- **Agents**: `list_agents`, `get_agent`, `create_agent`, `execute_agent`
- **Teams**: `list_teams`, `get_team`, `execute_team`
- **Executions**: `list_executions`, `get_execution`, `get_execution_messages`, `stream_execution_to_completion`, `get_execution_events`
- **Workflows**: `list_workflows`, `get_workflow`, `create_workflow`
- **System**: `health_check`, `list_models`

#### Resources
- `agents://list` - Available agents with configurations and capabilities
- `teams://list` - Available teams with members and skills
- `worker-queues://list` - Available worker queues with status and active workers

#### Error Handling
- **6 Custom Error Classes**: `RateLimitError`, `BadRequestError`, `ForbiddenError`, `ConflictError`, `TimeoutError`, `AuthenticationError`
- User-friendly error messages with actionable troubleshooting hints
- Request context included in all errors (method, URL, status code)
- Resource extraction from URLs for better 404 messages
- Retry-After header parsing for rate limit errors

#### Streaming
- `stream_execution_to_completion` - Collects all events until execution completes
- `get_execution_events` - Polls for new events incrementally
- Support for 11 event types (message, tool_started, tool_completed, status, error, done, etc.)
- Configurable timeouts and event filtering
- Automatic reconnection with gap detection

#### Developer Experience
- TypeScript with full type definitions
- Zod schema validation for all inputs
- Comprehensive logging with configurable levels
- Retry logic with exponential backoff
- Bearer and UserKey authentication support
- Tool registry pattern for easy extensibility

### Security
- Tool whitelisting with wildcard patterns
- Environment-based configuration profiles
- Secure API key handling
- No secrets in logs

### Documentation
- Comprehensive README with usage examples
- API documentation for all tools and resources
- Configuration guide with examples
- Streaming patterns and best practices
- Error handling guide with hints

## [Unreleased]

### Planned
- Additional tools for remaining API endpoints
- Unit test coverage (70%+)
- E2E MCP protocol tests
- Performance optimizations
- CI/CD pipeline
