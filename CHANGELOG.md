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
- Unit test coverage (70%+)
- E2E MCP protocol tests
- Performance optimizations
- CI/CD pipeline

## [1.1.0] - 2025-12-04

### Added

#### Full CRUD Support for All Resources
- **37 new MCP tools** bringing total to 54 tools across 11 categories
- Complete Create, Read, Update, Delete operations for all resource types

#### New Tools by Category

**Agents** (2 new tools)
- `update_agent` - Update existing agent configuration
- `delete_agent` - Delete an agent by ID

**Teams** (3 new tools)
- `create_team` - Create a new team with configuration and member agents
- `update_team` - Update team configuration
- `delete_team` - Delete a team by ID

**Environments** (5 new tools)
- `list_environments` - List all environments in the organization
- `get_environment` - Get environment details by ID
- `create_environment` - Create a new environment
- `update_environment` - Update environment configuration
- `delete_environment` - Delete an environment by ID

**Projects** (5 new tools)
- `list_projects` - List all projects in the organization
- `get_project` - Get project details by ID
- `create_project` - Create a new project
- `update_project` - Update project configuration
- `delete_project` - Delete a project by ID

**Skills** (5 new tools)
- `list_skills` - List all skills (toolsets)
- `get_skill` - Get skill details by ID
- `create_skill` - Create a new skill
- `update_skill` - Update skill configuration
- `delete_skill` - Delete a skill by ID

**Worker Queues** (5 new tools)
- `list_worker_queues` - List all worker queues
- `get_worker_queue` - Get worker queue details by ID
- `create_worker_queue` - Create a new worker queue in an environment
- `update_worker_queue` - Update worker queue configuration
- `delete_worker_queue` - Delete a worker queue by ID

**Policies** (5 new tools)
- `list_policies` - List all OPA policies
- `get_policy` - Get policy details by ID
- `create_policy` - Create a new OPA policy
- `update_policy` - Update policy configuration
- `delete_policy` - Delete a policy by ID

**Jobs** (6 new tools)
- `list_jobs` - List all scheduled jobs
- `get_job` - Get job details by ID
- `create_job` - Create a new scheduled job (cron, webhook, or manual trigger)
- `update_job` - Update job configuration
- `delete_job` - Delete a job by ID
- `trigger_job` - Manually trigger a job execution

#### New Resources (5 new resources)
- `environments://list` - Available environments with configurations
- `projects://list` - Available projects with configurations
- `skills://list` - Available skills (toolsets) with configurations
- `policies://list` - Available OPA policies for access control
- `jobs://list` - Available scheduled jobs with configurations

#### New Services
- `EnvironmentService` - API client for environment operations
- `ProjectService` - API client for project operations
- `SkillService` - API client for skill/toolset operations
- `PolicyService` - API client for OPA policy operations
- `JobService` - API client for scheduled job operations (including trigger, enable, disable)

#### New Validation Schemas
- Environment schemas (list, get, create, update, delete)
- Project schemas (list, get, create, update, delete)
- Skill schemas (list, get, create, update, delete)
- Policy schemas (list, get, create, update, delete)
- Job schemas (list, get, create, update, delete, trigger)
- Worker Queue schemas (list, get, create, update, delete)

### Changed
- Updated `WorkerQueuesService` with create, update, delete, and listByEnvironment methods
- Updated `TeamService` with delete method
- Updated tool counts in documentation (17 → 54 tools, 3 → 8 resources)
