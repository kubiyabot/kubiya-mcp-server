/**
 * Configuration type definitions
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type ProfileName = 'dev' | 'staging' | 'prod';

export interface ProfileConfig {
  apiBaseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  logLevel: LogLevel;
  allowedTools?: string[]; // Tool whitelist, ["*"] means all tools
}

export interface ServerConfig extends ProfileConfig {
  apiKey: string;
  profile: ProfileName;
  allowedTools: string[]; // Required in ServerConfig, defaults to ["*"]
}

export interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}
