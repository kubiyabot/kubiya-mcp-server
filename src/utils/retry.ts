/**
 * Retry logic with exponential backoff
 */

import type { RetryOptions } from '../types/config.js';
import { isRetryable } from './errors.js';
import { Logger } from './logger.js';

const retryLogger = new Logger('Retry');

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate backoff delay with exponential growth
 */
function calculateBackoff(
  attempt: number,
  options: RetryOptions
): number {
  const { initialDelay, maxDelay = 30000, backoffMultiplier = 2 } = options;
  const delay = initialDelay * Math.pow(backoffMultiplier, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
  context?: string
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if not retryable or if we've exhausted attempts
      if (!isRetryable(error) || attempt === options.maxAttempts) {
        throw error;
      }

      const delay = calculateBackoff(attempt, options);
      const contextStr = context ? ` (${context})` : '';

      retryLogger.warn(
        `Attempt ${attempt + 1}/${options.maxAttempts + 1} failed${contextStr}, retrying in ${delay}ms`,
        {
          error: error instanceof Error ? error.message : String(error),
          attempt: attempt + 1,
          maxAttempts: options.maxAttempts + 1,
          delay,
        }
      );

      await sleep(delay);
    }
  }

  // This should never be reached due to the throw above, but TypeScript needs it
  throw lastError;
}
