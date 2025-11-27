/**
 * Profile definitions for different environments
 */

import type { ProfileConfig, ProfileName } from '../types/config.js';

export const profiles: Record<ProfileName, ProfileConfig> = {
  dev: {
    apiBaseUrl: 'http://localhost:8000',
    timeout: 30000,
    retryAttempts: 2,
    retryDelay: 1000,
    logLevel: 'debug',
    allowedTools: ['*'], // All tools allowed in dev
  },
  staging: {
    apiBaseUrl: 'https://staging-control-plane.kubiya.ai',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1500,
    logLevel: 'info',
    allowedTools: ['*'], // All tools allowed in staging
  },
  prod: {
    apiBaseUrl: 'https://control-plane.kubiya.ai',
    timeout: 60000,
    retryAttempts: 3,
    retryDelay: 2000,
    logLevel: 'warn',
    allowedTools: ['*'], // All tools allowed in prod (can be restricted in config file)
  },
};
