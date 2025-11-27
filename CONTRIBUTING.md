# Contributing to Kubiya MCP Server

Thank you for your interest in contributing to the Kubiya MCP Server! We welcome contributions from the community.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue using our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md). Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Relevant logs and screenshots

### Suggesting Features

We love new ideas! Use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) to:
- Describe the feature and its benefits
- Explain the use case
- Share implementation ideas (if any)

### Pull Requests

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR-USERNAME/kubiya-mcp-server.git
   cd kubiya-mcp-server
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Make Your Changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

5. **Run Tests**
   ```bash
   npm test
   npm run type-check
   npm run lint
   ```

6. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Test additions or changes
   - `chore:` - Build process or auxiliary tool changes

7. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub.

## Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript with strict mode enabled
- **Linting**: Run `npm run lint` before committing
- **Formatting**: Run `npm run format` to auto-format code
- **Type Safety**: All exports must have explicit type annotations

### Testing

- Write tests for all new functionality
- Ensure existing tests pass: `npm test`
- Aim for high test coverage: `npm run test:coverage`
- Test edge cases and error scenarios

### Adding New Tools

When adding a new MCP tool:

1. Create a new file in `src/tools/<category>/`
2. Define the tool using `ToolDefinition` interface
3. Add Zod schema for input validation
4. Implement the handler function
5. Export from the category index file
6. Update README documentation
7. Add comprehensive tests

Example:
```typescript
// src/tools/agents/my-tool.ts
import { z } from 'zod';
import type { ToolDefinition } from '../../types/tools.js';

export const MyToolSchema = z.object({
  agent_id: z.string().min(1, 'Agent ID is required'),
});

export const myTool: ToolDefinition = {
  name: 'my_tool',
  description: 'Does something useful',
  category: 'agents',
  inputSchema: MyToolSchema,
  handler: async (args, client) => {
    const { agent_id } = MyToolSchema.parse(args);
    const result = await client.agents.someMethod(agent_id);
    return formatToolResponse(result);
  },
};
```

### Documentation

- Update README.md for user-facing changes
- Add inline code comments for complex logic
- Document all public APIs and types
- Include usage examples

## Project Structure

```
kubiya-mcp-server/
├── src/
│   ├── tools/           # MCP tool implementations
│   │   ├── agents/      # Agent-related tools
│   │   ├── teams/       # Team-related tools
│   │   ├── executions/  # Execution tools
│   │   ├── workflows/   # Workflow tools
│   │   └── system/      # System tools
│   ├── client/          # API client
│   ├── resources/       # MCP resources
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── index.ts         # Entry point
├── config/              # Environment configs
├── tests/               # Test files
└── build/               # Compiled output
```

## License

By contributing to this project, you agree that your contributions will be licensed under the AGPL-3.0 License. This means:

- Your code can be used, modified, and distributed freely
- If deployed on a server, the source code must be made available
- All derivative works must also use AGPL-3.0

## Getting Help

- **Documentation**: Check our [README](README.md)
- **Issues**: Search [existing issues](https://github.com/kubiyabot/kubiya-mcp-server/issues)
- **Discussions**: Join our [community discussions](https://github.com/kubiyabot/kubiya-mcp-server/discussions)
- **Email**: Contact support@kubiya.ai

## Review Process

1. All PRs require at least one review
2. CI checks must pass (tests, type-check, lint)
3. Documentation must be updated
4. Breaking changes require discussion

Thank you for contributing to Kubiya MCP Server!
