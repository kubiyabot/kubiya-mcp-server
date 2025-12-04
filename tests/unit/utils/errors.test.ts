/**
 * Error Classes Unit Tests
 *
 * Comprehensive tests for all custom error classes including:
 * - Error instantiation and properties
 * - Error inheritance hierarchy
 * - Retryable error detection
 * - Error message formatting
 * - Error hints generation
 */

import { describe, it, expect } from 'vitest';
import {
  MCPError,
  APIError,
  ValidationError,
  ConfigurationError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  BadRequestError,
  ForbiddenError,
  ConflictError,
  TimeoutError,
  isRetryable,
  formatErrorMessage,
  getErrorHints,
} from '../../../src/utils/errors.js';

describe('Error Classes', () => {
  // ==========================================================================
  // MCPError (Base Class)
  // ==========================================================================
  describe('MCPError', () => {
    it('should create error with required properties', () => {
      const error = new MCPError('Test error', 'TEST_CODE');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(MCPError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.isRetryable).toBe(false);
      expect(error.statusCode).toBeUndefined();
      expect(error.name).toBe('MCPError');
    });

    it('should create retryable error', () => {
      const error = new MCPError('Retryable error', 'RETRY_CODE', true);

      expect(error.isRetryable).toBe(true);
    });

    it('should create error with status code', () => {
      const error = new MCPError('Error with status', 'STATUS_CODE', false, 500);

      expect(error.statusCode).toBe(500);
    });

    it('should maintain prototype chain for instanceof checks', () => {
      const error = new MCPError('Test', 'TEST');

      expect(error instanceof Error).toBe(true);
      expect(error instanceof MCPError).toBe(true);
    });
  });

  // ==========================================================================
  // APIError
  // ==========================================================================
  describe('APIError', () => {
    it('should create error with status code', () => {
      const error = new APIError('API failed', 500);

      expect(error).toBeInstanceOf(MCPError);
      expect(error).toBeInstanceOf(APIError);
      expect(error.message).toBe('API failed');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('API_ERROR_500');
      expect(error.name).toBe('APIError');
    });

    it('should be retryable for 5xx errors', () => {
      expect(new APIError('Server error', 500).isRetryable).toBe(true);
      expect(new APIError('Bad gateway', 502).isRetryable).toBe(true);
      expect(new APIError('Service unavailable', 503).isRetryable).toBe(true);
      expect(new APIError('Gateway timeout', 504).isRetryable).toBe(true);
    });

    it('should be retryable for rate limiting (429)', () => {
      const error = new APIError('Rate limited', 429);

      expect(error.isRetryable).toBe(true);
    });

    it('should NOT be retryable for 4xx errors (except 429)', () => {
      expect(new APIError('Bad request', 400).isRetryable).toBe(false);
      expect(new APIError('Unauthorized', 401).isRetryable).toBe(false);
      expect(new APIError('Forbidden', 403).isRetryable).toBe(false);
      expect(new APIError('Not found', 404).isRetryable).toBe(false);
    });

    it('should include response data if provided', () => {
      const responseData = { detail: 'Detailed error' };
      const error = new APIError('API failed', 400, responseData);

      expect(error.response).toEqual(responseData);
    });
  });

  // ==========================================================================
  // ValidationError
  // ==========================================================================
  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(MCPError);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.isRetryable).toBe(false);
      expect(error.name).toBe('ValidationError');
    });

    it('should include validation details', () => {
      const details = { field: 'name', reason: 'required' };
      const error = new ValidationError('Validation failed', details);

      expect(error.details).toEqual(details);
    });

    it('should work without details', () => {
      const error = new ValidationError('Simple validation error');

      expect(error.details).toBeUndefined();
    });
  });

  // ==========================================================================
  // ConfigurationError
  // ==========================================================================
  describe('ConfigurationError', () => {
    it('should create configuration error', () => {
      const error = new ConfigurationError('Missing API key');

      expect(error).toBeInstanceOf(MCPError);
      expect(error.code).toBe('CONFIGURATION_ERROR');
      expect(error.isRetryable).toBe(false);
      expect(error.name).toBe('ConfigurationError');
    });
  });

  // ==========================================================================
  // AuthenticationError
  // ==========================================================================
  describe('AuthenticationError', () => {
    it('should create authentication error with default message', () => {
      const error = new AuthenticationError();

      expect(error.message).toBe('Authentication failed');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.statusCode).toBe(401);
      expect(error.isRetryable).toBe(false);
      expect(error.name).toBe('AuthenticationError');
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('Invalid token');

      expect(error.message).toBe('Invalid token');
    });
  });

  // ==========================================================================
  // NotFoundError
  // ==========================================================================
  describe('NotFoundError', () => {
    it('should create not found error with resource info', () => {
      const error = new NotFoundError('Agent', 'agent-123');

      expect(error.message).toBe('Agent with ID agent-123 not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.isRetryable).toBe(false);
      expect(error.name).toBe('NotFoundError');
    });

    it('should handle different resource types', () => {
      expect(new NotFoundError('Team', 'team-1').message).toBe('Team with ID team-1 not found');
      expect(new NotFoundError('Environment', 'env-1').message).toBe('Environment with ID env-1 not found');
      expect(new NotFoundError('Project', 'proj-1').message).toBe('Project with ID proj-1 not found');
    });
  });

  // ==========================================================================
  // RateLimitError
  // ==========================================================================
  describe('RateLimitError', () => {
    it('should create rate limit error with default message', () => {
      const error = new RateLimitError();

      expect(error.message).toBe('Rate limit exceeded');
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.statusCode).toBe(429);
      expect(error.isRetryable).toBe(true);
      expect(error.name).toBe('RateLimitError');
    });

    it('should include retry after time', () => {
      const error = new RateLimitError('Too many requests', 60);

      expect(error.retryAfter).toBe(60);
    });

    it('should accept custom message', () => {
      const error = new RateLimitError('Custom rate limit message');

      expect(error.message).toBe('Custom rate limit message');
    });
  });

  // ==========================================================================
  // BadRequestError
  // ==========================================================================
  describe('BadRequestError', () => {
    it('should create bad request error', () => {
      const error = new BadRequestError('Invalid parameters');

      expect(error.code).toBe('BAD_REQUEST');
      expect(error.statusCode).toBe(400);
      expect(error.isRetryable).toBe(false);
      expect(error.name).toBe('BadRequestError');
    });

    it('should include error details', () => {
      const details = { missing: ['name', 'email'] };
      const error = new BadRequestError('Missing fields', details);

      expect(error.details).toEqual(details);
    });
  });

  // ==========================================================================
  // ForbiddenError
  // ==========================================================================
  describe('ForbiddenError', () => {
    it('should create forbidden error with default message', () => {
      const error = new ForbiddenError();

      expect(error.message).toBe('Access forbidden');
      expect(error.code).toBe('FORBIDDEN');
      expect(error.statusCode).toBe(403);
      expect(error.isRetryable).toBe(false);
      expect(error.name).toBe('ForbiddenError');
    });

    it('should accept custom message', () => {
      const error = new ForbiddenError('No access to this resource');

      expect(error.message).toBe('No access to this resource');
    });
  });

  // ==========================================================================
  // ConflictError
  // ==========================================================================
  describe('ConflictError', () => {
    it('should create conflict error', () => {
      const error = new ConflictError('Resource already exists');

      expect(error.code).toBe('CONFLICT');
      expect(error.statusCode).toBe(409);
      expect(error.isRetryable).toBe(false);
      expect(error.name).toBe('ConflictError');
    });

    it('should include conflict details', () => {
      const details = { existingId: 'existing-123' };
      const error = new ConflictError('Duplicate entry', details);

      expect(error.details).toEqual(details);
    });
  });

  // ==========================================================================
  // TimeoutError
  // ==========================================================================
  describe('TimeoutError', () => {
    it('should create timeout error with default message', () => {
      const error = new TimeoutError();

      expect(error.message).toBe('Request timeout');
      expect(error.code).toBe('TIMEOUT');
      expect(error.isRetryable).toBe(true);
      expect(error.name).toBe('TimeoutError');
    });

    it('should include timeout duration', () => {
      const error = new TimeoutError('Connection timed out', 30000);

      expect(error.timeoutMs).toBe(30000);
    });
  });
});

// ==========================================================================
// isRetryable Function
// ==========================================================================
describe('isRetryable', () => {
  it('should return true for MCPError with isRetryable flag', () => {
    expect(isRetryable(new MCPError('Test', 'TEST', true))).toBe(true);
  });

  it('should return false for MCPError without isRetryable flag', () => {
    expect(isRetryable(new MCPError('Test', 'TEST', false))).toBe(false);
  });

  it('should return true for retryable errors', () => {
    expect(isRetryable(new RateLimitError())).toBe(true);
    expect(isRetryable(new TimeoutError())).toBe(true);
    expect(isRetryable(new APIError('Server error', 500))).toBe(true);
  });

  it('should return false for non-retryable errors', () => {
    expect(isRetryable(new AuthenticationError())).toBe(false);
    expect(isRetryable(new NotFoundError('Test', 'id'))).toBe(false);
    expect(isRetryable(new BadRequestError('Invalid'))).toBe(false);
    expect(isRetryable(new ForbiddenError())).toBe(false);
  });

  it('should return true for network-related Error messages', () => {
    expect(isRetryable(new Error('network error'))).toBe(true);
    expect(isRetryable(new Error('timeout occurred'))).toBe(true);
    expect(isRetryable(new Error('ECONNREFUSED'))).toBe(true);
    expect(isRetryable(new Error('ENOTFOUND'))).toBe(true);
  });

  it('should return false for non-network Error messages', () => {
    expect(isRetryable(new Error('Invalid input'))).toBe(false);
    expect(isRetryable(new Error('File not found'))).toBe(false);
  });

  it('should return false for non-Error values', () => {
    expect(isRetryable('string error')).toBe(false);
    expect(isRetryable(123)).toBe(false);
    expect(isRetryable(null)).toBe(false);
    expect(isRetryable(undefined)).toBe(false);
    expect(isRetryable({})).toBe(false);
  });
});

// ==========================================================================
// formatErrorMessage Function
// ==========================================================================
describe('formatErrorMessage', () => {
  it('should format AuthenticationError', () => {
    const message = formatErrorMessage(new AuthenticationError());

    expect(message).toContain('Authentication failed');
    expect(message).toContain('API key');
  });

  it('should format NotFoundError', () => {
    const message = formatErrorMessage(new NotFoundError('Agent', 'agent-123'));

    expect(message).toBe('Agent with ID agent-123 not found');
  });

  it('should format RateLimitError with retry info', () => {
    const error = new RateLimitError('Rate limited', 60);
    const message = formatErrorMessage(error);

    expect(message).toContain('Rate limited');
    expect(message).toContain('60s');
  });

  it('should format RateLimitError without retry info', () => {
    const message = formatErrorMessage(new RateLimitError());

    expect(message).toBe('Rate limit exceeded');
  });

  it('should format BadRequestError with details', () => {
    const details = { field: 'name' };
    const error = new BadRequestError('Invalid field', details);
    const message = formatErrorMessage(error);

    expect(message).toContain('Invalid field');
    expect(message).toContain('name');
  });

  it('should format ForbiddenError', () => {
    const message = formatErrorMessage(new ForbiddenError('No access'));

    expect(message).toContain('No access');
    expect(message).toContain("don't have permission");
  });

  it('should format ConflictError with details', () => {
    const error = new ConflictError('Already exists', { id: '123' });
    const message = formatErrorMessage(error);

    expect(message).toContain('Already exists');
    expect(message).toContain('123');
  });

  it('should format TimeoutError with duration', () => {
    const error = new TimeoutError('Timed out', 30000);
    const message = formatErrorMessage(error);

    expect(message).toContain('Timed out');
    expect(message).toContain('30000ms');
  });

  it('should format APIError with status code', () => {
    const message = formatErrorMessage(new APIError('Server error', 500));

    expect(message).toContain('API Error');
    expect(message).toContain('500');
    expect(message).toContain('Server error');
  });

  it('should format ValidationError with details', () => {
    const error = new ValidationError('Invalid', { field: 'email' });
    const message = formatErrorMessage(error);

    expect(message).toContain('Validation Error');
    expect(message).toContain('Invalid');
    expect(message).toContain('email');
  });

  it('should format ConfigurationError', () => {
    const message = formatErrorMessage(new ConfigurationError('Missing config'));

    expect(message).toContain('Configuration Error');
    expect(message).toContain('Missing config');
  });

  it('should format generic MCPError', () => {
    const message = formatErrorMessage(new MCPError('Generic error', 'GENERIC'));

    expect(message).toContain('MCPError');
    expect(message).toContain('Generic error');
  });

  it('should format standard Error', () => {
    const message = formatErrorMessage(new Error('Standard error'));

    expect(message).toBe('Standard error');
  });

  it('should format non-Error values', () => {
    expect(formatErrorMessage('string error')).toBe('string error');
    expect(formatErrorMessage(123)).toBe('123');
    expect(formatErrorMessage(null)).toBe('null');
    expect(formatErrorMessage(undefined)).toBe('undefined');
  });
});

// ==========================================================================
// getErrorHints Function
// ==========================================================================
describe('getErrorHints', () => {
  it('should provide hints for AuthenticationError', () => {
    const hints = getErrorHints(new AuthenticationError());

    expect(hints.length).toBeGreaterThan(0);
    expect(hints.some(h => h.includes('CONTROL_PLANE_API_KEY'))).toBe(true);
    expect(hints.some(h => h.includes('expired'))).toBe(true);
    expect(hints.some(h => h.includes('permissions'))).toBe(true);
  });

  it('should provide hints for NotFoundError', () => {
    const hints = getErrorHints(new NotFoundError('Agent', 'id'));

    expect(hints.length).toBeGreaterThan(0);
    expect(hints.some(h => h.includes('ID'))).toBe(true);
    expect(hints.some(h => h.includes('exists'))).toBe(true);
  });

  it('should provide hints for RateLimitError', () => {
    const hints = getErrorHints(new RateLimitError());

    expect(hints.length).toBeGreaterThan(0);
    expect(hints.some(h => h.includes('Wait'))).toBe(true);
    expect(hints.some(h => h.includes('backoff'))).toBe(true);
  });

  it('should provide hints for BadRequestError', () => {
    const hints = getErrorHints(new BadRequestError('Invalid'));

    expect(hints.length).toBeGreaterThan(0);
    expect(hints.some(h => h.includes('parameters'))).toBe(true);
    expect(hints.some(h => h.includes('required'))).toBe(true);
  });

  it('should provide hints for ForbiddenError', () => {
    const hints = getErrorHints(new ForbiddenError());

    expect(hints.length).toBeGreaterThan(0);
    expect(hints.some(h => h.includes('permissions'))).toBe(true);
    expect(hints.some(h => h.includes('access'))).toBe(true);
  });

  it('should provide hints for TimeoutError', () => {
    const hints = getErrorHints(new TimeoutError());

    expect(hints.length).toBeGreaterThan(0);
    expect(hints.some(h => h.includes('timeout'))).toBe(true);
    expect(hints.some(h => h.includes('network'))).toBe(true);
  });

  it('should return empty array for errors without specific hints', () => {
    const hints = getErrorHints(new Error('Generic error'));

    expect(hints).toEqual([]);
  });

  it('should return empty array for non-Error values', () => {
    expect(getErrorHints('string')).toEqual([]);
    expect(getErrorHints(null)).toEqual([]);
    expect(getErrorHints(undefined)).toEqual([]);
  });
});
