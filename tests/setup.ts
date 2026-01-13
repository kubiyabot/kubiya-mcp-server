/**
 * Test Setup and Global Configuration
 *
 * This file contains global test setup, mocks, and utilities
 * that are shared across all test files.
 */

import { vi, beforeEach, afterEach } from 'vitest';

// Mock logger to prevent console output during tests
vi.mock('../src/utils/logger.js', () => ({
  Logger: class MockLogger {
    info = vi.fn();
    debug = vi.fn();
    warn = vi.fn();
    error = vi.fn();
  },
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  vi.restoreAllMocks();
});

// Global test timeout
vi.setConfig({ testTimeout: 10000 });
