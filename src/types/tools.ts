/**
 * MCP tool type definitions
 */

import { z } from 'zod';
import type { ControlPlaneClient } from '../client/index.js';

export interface ToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  category: string;
  inputSchema: z.ZodType<any>;
  handler: (args: any, client: ControlPlaneClient) => Promise<ToolResult>;
}

export interface ToolCategory {
  name: string;
  description: string;
  tools: ToolDefinition[];
}
