/**
 * Structured logging utility
 *
 * CRITICAL: All logs go to stderr to avoid corrupting stdio JSON-RPC protocol
 */

import type { LogLevel } from '../types/config.js';

export class Logger {
  private static currentLogLevel: LogLevel = 'info';

  constructor(private component: string) {}

  static setLogLevel(level: LogLevel) {
    Logger.currentLogLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentIndex = levels.indexOf(Logger.currentLogLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }

  private format(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta !== undefined ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.component}] ${message}${metaStr}`;
  }

  debug(message: string, meta?: any) {
    if (this.shouldLog('debug')) {
      console.error(this.format('debug', message, meta));
    }
  }

  info(message: string, meta?: any) {
    if (this.shouldLog('info')) {
      console.error(this.format('info', message, meta));
    }
  }

  warn(message: string, meta?: any) {
    if (this.shouldLog('warn')) {
      console.error(this.format('warn', message, meta));
    }
  }

  error(message: string, error?: Error | any, meta?: any) {
    if (this.shouldLog('error')) {
      const errorInfo = error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error;
      console.error(this.format('error', message, { ...meta, error: errorInfo }));
    }
  }
}

// Create a global logger for general use
export const logger = new Logger('MCP-Server');
