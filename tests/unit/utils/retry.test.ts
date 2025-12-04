/**
 * Retry Logic Unit Tests
 *
 * Comprehensive tests for the retry utility including:
 * - Exponential backoff calculation
 * - Retry behavior for retryable errors
 * - Non-retry for non-retryable errors
 * - Max attempts handling
 * - Timeout scenarios
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry } from '../../../src/utils/retry.js';
import {
  RateLimitError,
  TimeoutError,
  AuthenticationError,
  NotFoundError,
  BadRequestError,
  APIError,
} from '../../../src/utils/errors.js';
import type { RetryOptions } from '../../../src/types/config.js';

describe('withRetry', () => {
  let mockFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockFn = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ==========================================================================
  // Successful Execution
  // ==========================================================================
  describe('successful execution', () => {
    it('should return result on first successful call', async () => {
      const options: RetryOptions = { maxAttempts: 3, initialDelay: 100 };
      mockFn.mockResolvedValue('success');

      const result = await withRetry(mockFn, options);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should not delay for successful first call', async () => {
      const options: RetryOptions = { maxAttempts: 3, initialDelay: 1000 };
      mockFn.mockResolvedValue('fast');

      const promise = withRetry(mockFn, options);
      const result = await promise;

      expect(result).toBe('fast');
    });
  });

  // ==========================================================================
  // Retry Behavior for Retryable Errors
  // ==========================================================================
  describe('retry on retryable errors', () => {
    it('should retry on RateLimitError and succeed', async () => {
      const options: RetryOptions = { maxAttempts: 3, initialDelay: 100 };
      mockFn
        .mockRejectedValueOnce(new RateLimitError())
        .mockResolvedValueOnce('success');

      const promise = withRetry(mockFn, options);
      await vi.advanceTimersByTimeAsync(100);
      const result = await promise;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should retry on TimeoutError and succeed', async () => {
      const options: RetryOptions = { maxAttempts: 3, initialDelay: 100 };
      mockFn
        .mockRejectedValueOnce(new TimeoutError())
        .mockResolvedValueOnce('success');

      const promise = withRetry(mockFn, options);
      await vi.advanceTimersByTimeAsync(100);
      const result = await promise;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should retry on APIError with 5xx status', async () => {
      const options: RetryOptions = { maxAttempts: 3, initialDelay: 100 };
      mockFn
        .mockRejectedValueOnce(new APIError('Server error', 500))
        .mockResolvedValueOnce('recovered');

      const promise = withRetry(mockFn, options);
      await vi.advanceTimersByTimeAsync(100);
      const result = await promise;

      expect(result).toBe('recovered');
    });

    it('should retry on network errors', async () => {
      const options: RetryOptions = { maxAttempts: 3, initialDelay: 100 };
      mockFn
        .mockRejectedValueOnce(new Error('ECONNREFUSED'))
        .mockResolvedValueOnce('connected');

      const promise = withRetry(mockFn, options);
      await vi.advanceTimersByTimeAsync(100);
      const result = await promise;

      expect(result).toBe('connected');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should retry multiple times before success', async () => {
      const options: RetryOptions = { maxAttempts: 5, initialDelay: 100 };
      mockFn
        .mockRejectedValueOnce(new RateLimitError())
        .mockRejectedValueOnce(new TimeoutError())
        .mockRejectedValueOnce(new APIError('503', 503))
        .mockResolvedValueOnce('finally');

      const promise = withRetry(mockFn, options);
      await vi.advanceTimersByTimeAsync(100); // First retry delay
      await vi.advanceTimersByTimeAsync(200); // Second retry delay (exponential)
      await vi.advanceTimersByTimeAsync(400); // Third retry delay
      const result = await promise;

      expect(result).toBe('finally');
      expect(mockFn).toHaveBeenCalledTimes(4);
    });
  });

  // ==========================================================================
  // No Retry for Non-Retryable Errors
  // ==========================================================================
  describe('no retry on non-retryable errors', () => {
    it('should NOT retry on AuthenticationError', async () => {
      const options: RetryOptions = { maxAttempts: 3, initialDelay: 100 };
      mockFn.mockRejectedValue(new AuthenticationError());

      await expect(withRetry(mockFn, options)).rejects.toThrow(AuthenticationError);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should NOT retry on NotFoundError', async () => {
      const options: RetryOptions = { maxAttempts: 3, initialDelay: 100 };
      mockFn.mockRejectedValue(new NotFoundError('Agent', 'id'));

      await expect(withRetry(mockFn, options)).rejects.toThrow(NotFoundError);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should NOT retry on BadRequestError', async () => {
      const options: RetryOptions = { maxAttempts: 3, initialDelay: 100 };
      mockFn.mockRejectedValue(new BadRequestError('Invalid'));

      await expect(withRetry(mockFn, options)).rejects.toThrow(BadRequestError);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should NOT retry on 4xx APIError (except 429)', async () => {
      const options: RetryOptions = { maxAttempts: 3, initialDelay: 100 };
      mockFn.mockRejectedValue(new APIError('Not found', 404));

      await expect(withRetry(mockFn, options)).rejects.toThrow(APIError);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should NOT retry on generic Error without network keywords', async () => {
      const options: RetryOptions = { maxAttempts: 3, initialDelay: 100 };
      mockFn.mockRejectedValue(new Error('Invalid input'));

      await expect(withRetry(mockFn, options)).rejects.toThrow('Invalid input');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // Max Attempts Exhaustion
  // ==========================================================================
  describe('max attempts exhaustion', () => {
    it('should throw after max attempts exceeded', async () => {
      const options: RetryOptions = { maxAttempts: 2, initialDelay: 100 };
      mockFn.mockRejectedValue(new RateLimitError('Rate limited'));

      // Create promise but don't let it float - capture rejection immediately
      let caughtError: Error | undefined;
      const promise = withRetry(mockFn, options).catch(e => {
        caughtError = e;
      });

      // Advance through all retries
      await vi.advanceTimersByTimeAsync(100); // First retry delay
      await vi.advanceTimersByTimeAsync(200); // Second retry delay
      await vi.advanceTimersByTimeAsync(400); // Allow final attempt to complete

      await promise;
      expect(caughtError).toBeInstanceOf(RateLimitError);
      expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should throw last error after max attempts', async () => {
      const options: RetryOptions = { maxAttempts: 1, initialDelay: 100 };
      mockFn
        .mockRejectedValueOnce(new TimeoutError('First timeout'))
        .mockRejectedValueOnce(new TimeoutError('Second timeout'));

      // Create promise but don't let it float - capture rejection immediately
      let caughtError: Error | undefined;
      const promise = withRetry(mockFn, options).catch(e => {
        caughtError = e;
      });

      await vi.advanceTimersByTimeAsync(100); // First retry delay
      await vi.advanceTimersByTimeAsync(200); // Allow second attempt to complete

      await promise;
      expect(caughtError).toBeInstanceOf(TimeoutError);
      expect((caughtError as TimeoutError).message).toBe('Second timeout');
    });

    it('should work with maxAttempts of 0', async () => {
      const options: RetryOptions = { maxAttempts: 0, initialDelay: 100 };
      mockFn.mockRejectedValue(new RateLimitError());

      await expect(withRetry(mockFn, options)).rejects.toThrow(RateLimitError);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // Exponential Backoff
  // ==========================================================================
  describe('exponential backoff', () => {
    it('should increase delay exponentially', async () => {
      const options: RetryOptions = {
        maxAttempts: 4,
        initialDelay: 100,
        backoffMultiplier: 2,
      };
      mockFn.mockRejectedValue(new RateLimitError());

      const promise = withRetry(mockFn, options).catch(() => {});

      // Initial call happens immediately
      expect(mockFn).toHaveBeenCalledTimes(1);

      // After 100ms - first retry
      await vi.advanceTimersByTimeAsync(100);
      expect(mockFn).toHaveBeenCalledTimes(2);

      // After 200ms (100 * 2^1) - second retry
      await vi.advanceTimersByTimeAsync(200);
      expect(mockFn).toHaveBeenCalledTimes(3);

      // After 400ms (100 * 2^2) - third retry
      await vi.advanceTimersByTimeAsync(400);
      expect(mockFn).toHaveBeenCalledTimes(4);

      // After 800ms (100 * 2^3) - fourth retry
      await vi.advanceTimersByTimeAsync(800);
      expect(mockFn).toHaveBeenCalledTimes(5);

      await promise;
    });

    it('should respect maxDelay cap', async () => {
      const options: RetryOptions = {
        maxAttempts: 3,
        initialDelay: 100,
        maxDelay: 150,
        backoffMultiplier: 3,
      };
      mockFn.mockRejectedValue(new RateLimitError());

      const promise = withRetry(mockFn, options).catch(() => {});

      expect(mockFn).toHaveBeenCalledTimes(1);

      // First retry: 100ms
      await vi.advanceTimersByTimeAsync(100);
      expect(mockFn).toHaveBeenCalledTimes(2);

      // Second retry: would be 300ms but capped at 150ms
      await vi.advanceTimersByTimeAsync(150);
      expect(mockFn).toHaveBeenCalledTimes(3);

      // Third retry: still capped at 150ms
      await vi.advanceTimersByTimeAsync(150);
      expect(mockFn).toHaveBeenCalledTimes(4);

      await promise;
    });

    it('should use default backoffMultiplier of 2', async () => {
      const options: RetryOptions = {
        maxAttempts: 2,
        initialDelay: 100,
        // No backoffMultiplier specified - should default to 2
      };
      mockFn.mockRejectedValue(new TimeoutError());

      const promise = withRetry(mockFn, options).catch(() => {});

      await vi.advanceTimersByTimeAsync(100); // First retry (100ms)
      expect(mockFn).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(200); // Second retry (200ms = 100 * 2)
      expect(mockFn).toHaveBeenCalledTimes(3);

      await promise;
    });
  });

  // ==========================================================================
  // Context Logging
  // ==========================================================================
  describe('context parameter', () => {
    it('should accept optional context parameter', async () => {
      const options: RetryOptions = { maxAttempts: 1, initialDelay: 100 };
      mockFn.mockResolvedValue('success');

      const result = await withRetry(mockFn, options, 'Test Operation');

      expect(result).toBe('success');
    });

    it('should work without context', async () => {
      const options: RetryOptions = { maxAttempts: 1, initialDelay: 100 };
      mockFn.mockResolvedValue('success');

      const result = await withRetry(mockFn, options);

      expect(result).toBe('success');
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================
  describe('edge cases', () => {
    it('should handle function that returns undefined', async () => {
      const options: RetryOptions = { maxAttempts: 3, initialDelay: 100 };
      mockFn.mockResolvedValue(undefined);

      const result = await withRetry(mockFn, options);

      expect(result).toBeUndefined();
    });

    it('should handle function that returns null', async () => {
      const options: RetryOptions = { maxAttempts: 3, initialDelay: 100 };
      mockFn.mockResolvedValue(null);

      const result = await withRetry(mockFn, options);

      expect(result).toBeNull();
    });

    it('should handle function that returns false', async () => {
      const options: RetryOptions = { maxAttempts: 3, initialDelay: 100 };
      mockFn.mockResolvedValue(false);

      const result = await withRetry(mockFn, options);

      expect(result).toBe(false);
    });

    it('should handle function that returns 0', async () => {
      const options: RetryOptions = { maxAttempts: 3, initialDelay: 100 };
      mockFn.mockResolvedValue(0);

      const result = await withRetry(mockFn, options);

      expect(result).toBe(0);
    });

    it('should handle very small initial delay', async () => {
      const options: RetryOptions = { maxAttempts: 2, initialDelay: 1 };
      mockFn
        .mockRejectedValueOnce(new RateLimitError())
        .mockResolvedValueOnce('ok');

      const promise = withRetry(mockFn, options);
      await vi.advanceTimersByTimeAsync(1);
      const result = await promise;

      expect(result).toBe('ok');
    });

    it('should preserve error type on throw', async () => {
      const options: RetryOptions = { maxAttempts: 0, initialDelay: 100 };
      const originalError = new RateLimitError('Custom rate limit', 120);
      mockFn.mockRejectedValue(originalError);

      try {
        await withRetry(mockFn, options);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBe(originalError);
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).retryAfter).toBe(120);
      }
    });
  });

  // ==========================================================================
  // Async Function Behavior
  // ==========================================================================
  describe('async function behavior', () => {
    it('should handle slow async function', async () => {
      const options: RetryOptions = { maxAttempts: 1, initialDelay: 100 };
      mockFn.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return 'slow result';
      });

      const promise = withRetry(mockFn, options);
      await vi.advanceTimersByTimeAsync(500);
      const result = await promise;

      expect(result).toBe('slow result');
    });

    it('should handle function that throws synchronously', async () => {
      const options: RetryOptions = { maxAttempts: 1, initialDelay: 100 };
      mockFn.mockImplementation(() => {
        throw new Error('Sync error');
      });

      await expect(withRetry(mockFn, options)).rejects.toThrow('Sync error');
    });
  });
});
