/**
 * Formatters Unit Tests
 *
 * Comprehensive tests for response formatting utilities including:
 * - formatToolResponse for successful responses
 * - formatErrorResponse for error handling
 * - formatListResponse for list operations
 * - Edge cases and error conditions
 */

import { describe, it, expect } from 'vitest';
import {
  formatToolResponse,
  formatErrorResponse,
  formatListResponse,
} from '../../../src/utils/formatters.js';
import {
  MCPError,
  AuthenticationError,
  NotFoundError,
  BadRequestError,
  RateLimitError,
  ValidationError,
} from '../../../src/utils/errors.js';

describe('formatToolResponse', () => {
  // ==========================================================================
  // Basic Response Formatting
  // ==========================================================================
  describe('basic formatting', () => {
    it('should format simple object', () => {
      const data = { id: '123', name: 'Test' };
      const result = formatToolResponse(data);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(JSON.parse(result.content[0].text)).toEqual(data);
    });

    it('should format array data', () => {
      const data = [{ id: '1' }, { id: '2' }];
      const result = formatToolResponse(data);

      expect(JSON.parse(result.content[0].text)).toEqual(data);
    });

    it('should format nested objects', () => {
      const data = {
        agent: {
          id: 'agent-1',
          config: {
            model: 'gpt-4',
            settings: { temperature: 0.7 },
          },
        },
      };
      const result = formatToolResponse(data);

      expect(JSON.parse(result.content[0].text)).toEqual(data);
    });

    it('should format primitive values', () => {
      expect(JSON.parse(formatToolResponse('string').content[0].text)).toBe('string');
      expect(JSON.parse(formatToolResponse(123).content[0].text)).toBe(123);
      expect(JSON.parse(formatToolResponse(true).content[0].text)).toBe(true);
      expect(JSON.parse(formatToolResponse(null).content[0].text)).toBe(null);
    });

    it('should use pretty-print formatting', () => {
      const data = { id: '1', name: 'Test' };
      const result = formatToolResponse(data);

      // Should have newlines from JSON.stringify(data, null, 2)
      expect(result.content[0].text).toContain('\n');
      expect(result.content[0].text).toContain('  ');
    });

    it('should NOT set isError flag for successful responses', () => {
      const result = formatToolResponse({ success: true });

      expect(result.isError).toBeUndefined();
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================
  describe('edge cases', () => {
    it('should handle empty object', () => {
      const result = formatToolResponse({});

      expect(JSON.parse(result.content[0].text)).toEqual({});
    });

    it('should handle empty array', () => {
      const result = formatToolResponse([]);

      expect(JSON.parse(result.content[0].text)).toEqual([]);
    });

    it('should handle undefined (JSON serializes as undefined string)', () => {
      const result = formatToolResponse(undefined);

      // JSON.stringify(undefined) returns undefined (not a string)
      // So formatToolResponse returns the literal string "undefined"
      expect(result.content[0].text).toBeUndefined();
    });

    it('should handle dates by converting to ISO string', () => {
      const date = new Date('2025-01-01T00:00:00Z');
      const result = formatToolResponse({ date });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.date).toBe('2025-01-01T00:00:00.000Z');
    });

    it('should handle special characters in strings', () => {
      const data = { text: 'Line1\nLine2\tTabbed' };
      const result = formatToolResponse(data);

      expect(JSON.parse(result.content[0].text)).toEqual(data);
    });

    it('should handle unicode characters', () => {
      const data = { emoji: '🚀', text: '日本語' };
      const result = formatToolResponse(data);

      expect(JSON.parse(result.content[0].text)).toEqual(data);
    });

    it('should handle circular references by throwing', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;

      expect(() => formatToolResponse(circular)).toThrow();
    });

    it('should handle very large objects', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        data: `data-${i}`,
      }));
      const result = formatToolResponse(largeArray);

      expect(JSON.parse(result.content[0].text)).toHaveLength(1000);
    });
  });
});

describe('formatErrorResponse', () => {
  // ==========================================================================
  // Error Response Structure
  // ==========================================================================
  describe('response structure', () => {
    it('should set isError flag to true', () => {
      const result = formatErrorResponse(new Error('Test'));

      expect(result.isError).toBe(true);
    });

    it('should have single text content', () => {
      const result = formatErrorResponse(new Error('Test'));

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
    });

    it('should return valid JSON', () => {
      const result = formatErrorResponse(new Error('Test'));

      expect(() => JSON.parse(result.content[0].text)).not.toThrow();
    });
  });

  // ==========================================================================
  // Standard Error Handling
  // ==========================================================================
  describe('standard Error', () => {
    it('should format standard Error', () => {
      const result = formatErrorResponse(new Error('Something went wrong'));
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.error).toBe('Something went wrong');
    });

    it('should not include error_code for standard Error', () => {
      const result = formatErrorResponse(new Error('Test'));
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.error_code).toBeUndefined();
    });
  });

  // ==========================================================================
  // MCPError Handling
  // ==========================================================================
  describe('MCPError variants', () => {
    it('should format MCPError with code', () => {
      const error = new MCPError('Custom error', 'CUSTOM_CODE');
      const result = formatErrorResponse(error);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.error_code).toBe('CUSTOM_CODE');
    });

    it('should format AuthenticationError with hints', () => {
      const result = formatErrorResponse(new AuthenticationError());
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.error_code).toBe('AUTHENTICATION_ERROR');
      expect(parsed.hints).toBeDefined();
      expect(parsed.hints.length).toBeGreaterThan(0);
    });

    it('should format NotFoundError', () => {
      const result = formatErrorResponse(new NotFoundError('Agent', 'agent-123'));
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.error).toContain('Agent');
      expect(parsed.error).toContain('agent-123');
      expect(parsed.error_code).toBe('NOT_FOUND');
    });

    it('should format BadRequestError with details', () => {
      const details = { field: 'name', message: 'required' };
      const error = new BadRequestError('Validation failed', details);
      const result = formatErrorResponse(error);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.error_code).toBe('BAD_REQUEST');
      expect(parsed.details).toEqual(details);
    });

    it('should format RateLimitError with hints', () => {
      const result = formatErrorResponse(new RateLimitError('Too many requests', 60));
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.error_code).toBe('RATE_LIMIT_ERROR');
      expect(parsed.error).toContain('60s');
      expect(parsed.hints).toBeDefined();
    });

    it('should format ValidationError with details', () => {
      const details = { issues: [{ path: 'name', message: 'invalid' }] };
      const error = new ValidationError('Invalid input', details);
      const result = formatErrorResponse(error);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.error_code).toBe('VALIDATION_ERROR');
      expect(parsed.details).toEqual(details);
    });
  });

  // ==========================================================================
  // Non-Error Values
  // ==========================================================================
  describe('non-Error values', () => {
    it('should format string error', () => {
      const result = formatErrorResponse('String error message');
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.error).toBe('String error message');
    });

    it('should format number error', () => {
      const result = formatErrorResponse(404);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.error).toBe('404');
    });

    it('should format null', () => {
      const result = formatErrorResponse(null);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.error).toBe('null');
    });

    it('should format undefined', () => {
      const result = formatErrorResponse(undefined);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.error).toBe('undefined');
    });

    it('should format object without error properties', () => {
      const result = formatErrorResponse({ foo: 'bar' });
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.error).toBeDefined();
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================
  describe('edge cases', () => {
    it('should handle error with no message', () => {
      const error = new Error();
      const result = formatErrorResponse(error);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.error).toBeDefined();
    });

    it('should handle error with empty message', () => {
      const result = formatErrorResponse(new Error(''));
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.error).toBe('');
    });

    it('should not include hints if none available', () => {
      const error = new Error('Generic error');
      const result = formatErrorResponse(error);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.hints).toBeUndefined();
    });

    it('should not include details if not present', () => {
      const error = new MCPError('Simple error', 'SIMPLE');
      const result = formatErrorResponse(error);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.details).toBeUndefined();
    });
  });
});

describe('formatListResponse', () => {
  // ==========================================================================
  // Basic List Formatting
  // ==========================================================================
  describe('basic formatting', () => {
    it('should format list with count', () => {
      const items = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const result = formatListResponse(items);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.count).toBe(3);
      expect(parsed.items).toEqual(items);
    });

    it('should include total when provided', () => {
      const items = [{ id: '1' }, { id: '2' }];
      const result = formatListResponse(items, 100);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.count).toBe(2);
      expect(parsed.total).toBe(100);
      expect(parsed.items).toEqual(items);
    });

    it('should NOT include total when not provided', () => {
      const result = formatListResponse([{ id: '1' }]);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.total).toBeUndefined();
    });

    it('should include total of 0', () => {
      const result = formatListResponse([], 0);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.total).toBe(0);
    });
  });

  // ==========================================================================
  // Empty and Edge Cases
  // ==========================================================================
  describe('edge cases', () => {
    it('should handle empty array', () => {
      const result = formatListResponse([]);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.count).toBe(0);
      expect(parsed.items).toEqual([]);
    });

    it('should handle empty array with total', () => {
      const result = formatListResponse([], 50);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.count).toBe(0);
      expect(parsed.total).toBe(50);
    });

    it('should handle single item', () => {
      const items = [{ id: 'single' }];
      const result = formatListResponse(items);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.count).toBe(1);
    });

    it('should handle complex objects', () => {
      const items = [
        {
          id: 'agent-1',
          name: 'Agent 1',
          config: { model: 'gpt-4', skills: ['s1', 's2'] },
        },
        {
          id: 'agent-2',
          name: 'Agent 2',
          config: { model: 'claude-3', skills: [] },
        },
      ];
      const result = formatListResponse(items, 100);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.count).toBe(2);
      expect(parsed.total).toBe(100);
      expect(parsed.items[0].config.skills).toEqual(['s1', 's2']);
    });

    it('should handle large lists', () => {
      const items = Array.from({ length: 1000 }, (_, i) => ({ id: `item-${i}` }));
      const result = formatListResponse(items, 10000);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.count).toBe(1000);
      expect(parsed.total).toBe(10000);
    });

    it('should NOT set isError flag', () => {
      const result = formatListResponse([]);

      expect(result.isError).toBeUndefined();
    });
  });

  // ==========================================================================
  // Type Handling
  // ==========================================================================
  describe('type handling', () => {
    it('should handle array of primitives', () => {
      const items = ['a', 'b', 'c'];
      const result = formatListResponse(items);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.items).toEqual(['a', 'b', 'c']);
    });

    it('should handle array of numbers', () => {
      const items = [1, 2, 3];
      const result = formatListResponse(items);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.items).toEqual([1, 2, 3]);
    });

    it('should handle mixed array', () => {
      const items = [{ id: 1 }, null, 'string'];
      const result = formatListResponse(items);
      const parsed = JSON.parse(result.content[0].text);

      expect(parsed.count).toBe(3);
    });
  });
});
