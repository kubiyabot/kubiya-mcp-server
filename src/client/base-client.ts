/**
 * Base HTTP client with retry logic and error handling
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import type { ServerConfig } from '../types/config.js';
import type { APIRequestConfig } from '../types/client.js';
import {
  APIError,
  AuthenticationError,
  ConfigurationError,
  NotFoundError,
  RateLimitError,
  BadRequestError,
  ForbiddenError,
  ConflictError,
  TimeoutError,
} from '../utils/errors.js';
import { withRetry } from '../utils/retry.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('APIClient');

export class BaseClient {
  private client: AxiosInstance;
  private config: ServerConfig;
  private authType: 'Bearer' | 'UserKey' = 'Bearer'; // Track which auth type works

  constructor(config: ServerConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.apiBaseUrl,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        // Authorization header will be set dynamically per request
      },
    });
  }

  /**
   * Validate API connectivity and authentication
   * Should be called during server startup
   *
   * Tries both Bearer and UserKey authentication methods, matching the
   * Control Plane API middleware behavior.
   */
  async validateConnection(): Promise<void> {
    logger.info('Validating API connection and authentication...');

    const testEndpoint = '/api/v1/agents';
    const testParams = { limit: 1 };

    // Try Bearer authentication first (standard)
    try {
      this.authType = 'Bearer';
      await this.get(testEndpoint, { params: testParams });
      logger.info('✅ API connection and authentication validated', { authType: 'Bearer' });
      return;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logger.debug('Bearer authentication failed, trying UserKey...');
      } else {
        // Non-auth error (network, etc.)
        logger.error('❌ API connection validation failed', error);
        throw new ConfigurationError(
          `Failed to connect to API at ${this.config.apiBaseUrl}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    // Try UserKey authentication as fallback
    try {
      this.authType = 'UserKey';
      await this.get(testEndpoint, { params: testParams });
      logger.info('✅ API connection and authentication validated', { authType: 'UserKey' });
      return;
    } catch (error) {
      logger.error('❌ API connection validation failed with both auth types', error);
      throw new ConfigurationError(
        `Failed to authenticate with API at ${this.config.apiBaseUrl}. ` +
        `Tried both Bearer and UserKey authentication. ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
        });
        return config;
      },
      (error) => {
        logger.error('Request setup failed', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`Response ${response.status} from ${response.config.url}`);
        return response;
      },
      (error) => {
        if (axios.isAxiosError(error)) {
          this.handleAxiosError(error);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Handle Axios errors and convert to custom error types
   */
  private handleAxiosError(error: AxiosError): never {
    const status = error.response?.status;
    const data = error.response?.data;
    const url = error.config?.url || 'unknown';
    const method = error.config?.method?.toUpperCase() || 'unknown';

    // Extract error message from response
    let message = error.message;
    let details: any = undefined;

    if (data && typeof data === 'object') {
      // Try different common error message fields
      if ('detail' in data) {
        const detail = data.detail;
        if (typeof detail === 'string') {
          message = detail;
        } else if (typeof detail === 'object') {
          message = JSON.stringify(detail);
          details = detail;
        }
      } else if ('message' in data) {
        message = String(data.message);
      } else if ('error' in data) {
        message = String(data.error);
      }

      // Capture full response as details for debugging
      if (!details && data) {
        details = data;
      }
    }

    // Add request context to error message
    const contextMsg = ` [${method} ${url}]`;

    logger.error(`API Error ${status || 'unknown'}:`, { message, url, method, status, details });

    // Handle specific HTTP status codes with custom error classes
    switch (status) {
      case 400:
        throw new BadRequestError(message + contextMsg, details);

      case 401:
        throw new AuthenticationError(message + contextMsg);

      case 403:
        throw new ForbiddenError(message + contextMsg);

      case 404:
        // Try to extract resource type from URL for better error message
        const resourceMatch = url.match(/\/api\/v\d+\/(\w+)\//);
        const resource = resourceMatch ? resourceMatch[1] : 'Resource';
        const idMatch = url.match(/\/([a-f0-9-]+)(?:\/|$)/);
        const id = idMatch ? idMatch[1] : 'unknown';
        throw new NotFoundError(resource, id);

      case 409:
        throw new ConflictError(message + contextMsg, details);

      case 429:
        // Extract retry-after header if available
        const retryAfter = error.response?.headers?.['retry-after'];
        const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : undefined;
        throw new RateLimitError(message + contextMsg, retryAfterSeconds);

      case 408:
      case 504:
        throw new TimeoutError(message + contextMsg);

      default:
        // For all other errors, use generic APIError
        throw new APIError(message + contextMsg, status || 500, details);
    }
  }

  /**
   * Make an HTTP request with retry logic
   */
  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any,
    config?: APIRequestConfig
  ): Promise<T> {
    const requestFn = async () => {
      const axiosConfig: AxiosRequestConfig = {
        method,
        url,
        ...(data && { data }),
        ...(config?.params && { params: config.params }),
        ...(config?.timeout && { timeout: config.timeout }),
        headers: {
          ...config?.headers,
          'Authorization': `${this.authType} ${this.config.apiKey}`,
        },
      };

      const response = await this.client.request<T>(axiosConfig);
      return response.data;
    };

    // Execute with retry logic
    return withRetry(
      requestFn,
      {
        maxAttempts: this.config.retryAttempts,
        initialDelay: this.config.retryDelay,
      },
      `${method} ${url}`
    );
  }

  /**
   * Convenience methods for common HTTP verbs
   */

  async get<T>(url: string, config?: APIRequestConfig): Promise<T> {
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T>(url: string, data?: any, config?: APIRequestConfig): Promise<T> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T>(url: string, data?: any, config?: APIRequestConfig): Promise<T> {
    return this.request<T>('PUT', url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: APIRequestConfig): Promise<T> {
    return this.request<T>('PATCH', url, data, config);
  }

  async delete<T>(url: string, config?: APIRequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config);
  }
}
