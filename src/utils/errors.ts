/**
 * Custom error classes for the MCP server
 */

export class MCPError extends Error {
  constructor(
    message: string,
    public code: string,
    public isRetryable: boolean = false,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'MCPError';
    Object.setPrototypeOf(this, MCPError.prototype);
  }
}

export class APIError extends MCPError {
  constructor(
    message: string,
    statusCode: number,
    public response?: any
  ) {
    super(
      message,
      `API_ERROR_${statusCode}`,
      // Retry on server errors (5xx) or rate limiting (429)
      statusCode >= 500 || statusCode === 429,
      statusCode
    );
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

export class ValidationError extends MCPError {
  constructor(message: string, public details?: any) {
    super(message, 'VALIDATION_ERROR', false);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class ConfigurationError extends MCPError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR', false);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

export class AuthenticationError extends MCPError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', false, 401);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class NotFoundError extends MCPError {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`, 'NOT_FOUND', false, 404);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class RateLimitError extends MCPError {
  constructor(message: string = 'Rate limit exceeded', public retryAfter?: number) {
    super(message, 'RATE_LIMIT_ERROR', true, 429);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class BadRequestError extends MCPError {
  constructor(message: string, public details?: any) {
    super(message, 'BAD_REQUEST', false, 400);
    this.name = 'BadRequestError';
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class ForbiddenError extends MCPError {
  constructor(message: string = 'Access forbidden') {
    super(message, 'FORBIDDEN', false, 403);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class ConflictError extends MCPError {
  constructor(message: string, public details?: any) {
    super(message, 'CONFLICT', false, 409);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class TimeoutError extends MCPError {
  constructor(message: string = 'Request timeout', public timeoutMs?: number) {
    super(message, 'TIMEOUT', true);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Check if an error is retryable
 */
export function isRetryable(error: unknown): boolean {
  if (error instanceof MCPError) {
    return error.isRetryable;
  }
  // Network errors are generally retryable
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('enotfound')
    );
  }
  return false;
}

/**
 * Format error for user-friendly display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AuthenticationError) {
    return `Authentication failed. Please check your API key and ensure it's valid.`;
  }

  if (error instanceof NotFoundError) {
    return error.message;
  }

  if (error instanceof RateLimitError) {
    const retryMsg = error.retryAfter ? ` Retry after ${error.retryAfter}s.` : '';
    return `${error.message}${retryMsg}`;
  }

  if (error instanceof BadRequestError) {
    const detailsMsg = error.details ? `\nDetails: ${JSON.stringify(error.details, null, 2)}` : '';
    return `${error.message}${detailsMsg}`;
  }

  if (error instanceof ForbiddenError) {
    return `${error.message}. You don't have permission to access this resource.`;
  }

  if (error instanceof ConflictError) {
    const detailsMsg = error.details ? `\nDetails: ${JSON.stringify(error.details, null, 2)}` : '';
    return `${error.message}${detailsMsg}`;
  }

  if (error instanceof TimeoutError) {
    const timeoutMsg = error.timeoutMs ? ` (${error.timeoutMs}ms)` : '';
    return `${error.message}${timeoutMsg}. The request took too long to complete.`;
  }

  if (error instanceof APIError) {
    return `API Error (${error.statusCode}): ${error.message}`;
  }

  if (error instanceof ValidationError) {
    const detailsMsg = error.details ? `\n${JSON.stringify(error.details, null, 2)}` : '';
    return `Validation Error: ${error.message}${detailsMsg}`;
  }

  if (error instanceof ConfigurationError) {
    return `Configuration Error: ${error.message}`;
  }

  if (error instanceof MCPError) {
    return `${error.name}: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

/**
 * Get user-friendly error hints
 */
export function getErrorHints(error: unknown): string[] {
  const hints: string[] = [];

  if (error instanceof AuthenticationError) {
    hints.push('Check that CONTROL_PLANE_API_KEY environment variable is set');
    hints.push('Verify the API key is not expired');
    hints.push('Ensure the API key has the correct permissions');
  }

  if (error instanceof NotFoundError) {
    hints.push('Verify the resource ID is correct');
    hints.push('Check that the resource exists in your organization');
  }

  if (error instanceof RateLimitError) {
    hints.push('Wait before retrying the request');
    hints.push('Consider implementing exponential backoff');
  }

  if (error instanceof BadRequestError) {
    hints.push('Check the request parameters match the API schema');
    hints.push('Verify all required fields are provided');
  }

  if (error instanceof ForbiddenError) {
    hints.push('Check your API key has the necessary permissions');
    hints.push('Verify you have access to this organization/resource');
  }

  if (error instanceof TimeoutError) {
    hints.push('Try increasing the timeout value');
    hints.push('Check your network connection');
    hints.push('Verify the API endpoint is responding');
  }

  return hints;
}
