/**
 * Response formatting utilities for MCP tools
 */

import type { ToolResult } from '../types/tools.js';
import { formatErrorMessage, getErrorHints } from './errors.js';

/**
 * Format a successful tool response with JSON data
 */
export function formatToolResponse(data: any): ToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Format an error response for MCP with enhanced messaging
 */
export function formatErrorResponse(error: unknown): ToolResult {
  const message = formatErrorMessage(error);
  const hints = getErrorHints(error);

  // Extract additional details if available
  const details = error && typeof error === 'object' && 'details' in error
    ? (error as any).details
    : undefined;

  const errorCode = error && typeof error === 'object' && 'code' in error
    ? (error as any).code
    : undefined;

  const errorData: any = {
    error: message,
  };

  if (errorCode) {
    errorData.error_code = errorCode;
  }

  if (details) {
    errorData.details = details;
  }

  if (hints.length > 0) {
    errorData.hints = hints;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(errorData, null, 2),
      },
    ],
    isError: true,
  };
}

/**
 * Format a list response with count information
 */
export function formatListResponse<T>(items: T[], total?: number): ToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          count: items.length,
          ...(total !== undefined && { total }),
          items,
        }, null, 2),
      },
    ],
  };
}
