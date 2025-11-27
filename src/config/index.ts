/**
 * Configuration management with multi-profile support
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ServerConfig, ProfileName } from '../types/config.js';
import { profiles } from './profiles.js';
import { ServerConfigSchema } from './schema.js';
import { ConfigurationError } from '../utils/errors.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('Config');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load configuration from environment variables and profile
 */
export function loadConfig(): ServerConfig {
  // Determine profile
  const profileName = (process.env.MCP_PROFILE || 'dev') as ProfileName;

  if (!profiles[profileName]) {
    throw new ConfigurationError(
      `Invalid profile "${profileName}". Valid profiles: dev, staging, prod`
    );
  }

  // Start with profile defaults
  const profileConfig = profiles[profileName];

  // Try to load profile-specific config file (optional override)
  let fileConfig: Partial<ServerConfig> = {};
  try {
    const configPath = join(__dirname, '../../config', `${profileName}.json`);
    const configContent = readFileSync(configPath, 'utf-8');
    fileConfig = JSON.parse(configContent);
    logger.debug(`Loaded configuration from ${configPath}`);
  } catch (error) {
    // Config file is optional, continue with defaults
    logger.debug(`No config file found for profile ${profileName}, using defaults`);
  }

  // Parse allowed tools from environment variable (comma-separated)
  let allowedToolsFromEnv: string[] | undefined;
  if (process.env.MCP_ALLOWED_TOOLS) {
    allowedToolsFromEnv = process.env.MCP_ALLOWED_TOOLS
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
  }

  // Environment variables take highest precedence
  const config: ServerConfig = {
    ...profileConfig,
    ...fileConfig,
    // Environment variable overrides
    apiBaseUrl: process.env.CONTROL_PLANE_API_URL || fileConfig.apiBaseUrl || profileConfig.apiBaseUrl,
    apiKey: process.env.CONTROL_PLANE_API_KEY || '',
    logLevel: (process.env.LOG_LEVEL as any) || fileConfig.logLevel || profileConfig.logLevel,
    allowedTools: allowedToolsFromEnv || fileConfig.allowedTools || profileConfig.allowedTools || ['*'],
    profile: profileName,
  };

  // Validate configuration
  try {
    const validated = ServerConfigSchema.parse(config);
    logger.info(`Configuration loaded successfully`, {
      profile: profileName,
      apiBaseUrl: validated.apiBaseUrl,
      logLevel: validated.logLevel,
    });
    return validated;
  } catch (error) {
    throw new ConfigurationError(
      `Configuration validation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get example environment variables for documentation
 */
export function getEnvExample(): string {
  return `
# Required
CONTROL_PLANE_API_KEY=your-api-key-here    # JWT token (contains org ID)

# Optional
MCP_PROFILE=dev                            # dev, staging, or prod (default: dev)
CONTROL_PLANE_API_URL=                     # Override profile's API URL
LOG_LEVEL=info                             # debug, info, warn, or error
MCP_ALLOWED_TOOLS=*                        # Comma-separated tool patterns (* = all, or list_agents,get_agent,...)
`.trim();
}
