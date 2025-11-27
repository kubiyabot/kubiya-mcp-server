/**
 * Stream execution to completion tool
 */

import { EventSource } from 'eventsource';
import type { ToolDefinition } from '../../types/tools.js';
import type { ExecutionEvent, StreamResult, ExecutionEventType } from '../../types/streaming.js';
import { StreamExecutionSchema } from '../../schemas/executions.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('StreamExecution');

export const streamExecutionTool: ToolDefinition = {
  name: 'stream_execution_to_completion',
  description: 'Stream execution events in real-time until completion. Returns complete event history with summary statistics. Best for batch processing and automation workflows.',
  category: 'executions',
  inputSchema: StreamExecutionSchema,
  handler: async (args, client) => {
    try {
      const { execution_id, timeout_seconds = 270, event_filter } = StreamExecutionSchema.parse(args);
      logger.info('Streaming execution', { execution_id, timeout_seconds });

      // Get base client to access config
      const baseClient = (client as any).executions.client;
      const config = (baseClient as any).config;
      const authType = (baseClient as any).authType || 'UserKey';

      // Build SSE URL
      const url = `${config.apiBaseUrl}/api/v1/executions/${execution_id}/stream`;
      logger.debug('Connecting to stream', { url });

      // Create EventSource with auth headers
      const eventSource = new EventSource(url, {
        headers: {
          'Authorization': `${authType} ${config.apiKey}`,
        },
      } as any);

      const events: ExecutionEvent[] = [];
      let executionComplete = false;

      const result = await new Promise<StreamResult>((resolve, reject) => {
        // Timeout protection
        const timeoutId = setTimeout(() => {
          logger.warn('Stream timeout reached', { execution_id, timeout_seconds });
          eventSource.close();
          resolve(formatStreamResult(execution_id, events, 'timeout'));
        }, timeout_seconds * 1000);

        // Handle all event types
        const eventTypes: ExecutionEventType[] = [
          'message',
          'message_chunk',
          'member_message_chunk',
          'tool_started',
          'tool_completed',
          'status',
          'error',
          'done',
          'gap_detected',
          'degraded',
          'reconnect',
          'timeout_warning',
        ];

        eventTypes.forEach((eventType) => {
          eventSource.addEventListener(eventType, (event: any) => {
            try {
              const data = JSON.parse(event.data);

              // Apply filter if specified
              if (!event_filter || event_filter.includes(eventType)) {
                events.push({
                  id: event.lastEventId || `${execution_id}_${events.length}`,
                  type: eventType,
                  data,
                  timestamp: new Date().toISOString(),
                });
              }

              // Log significant events
              if (eventType === 'tool_started') {
                logger.info('Tool execution started', { tool: data.tool_name });
              } else if (eventType === 'tool_completed') {
                logger.info('Tool execution completed', { tool: data.tool_name });
              }

              // Check for completion
              if (eventType === 'done') {
                executionComplete = true;
                clearTimeout(timeoutId);
                eventSource.close();
                logger.info('Execution completed', { execution_id, total_events: events.length });
                resolve(formatStreamResult(execution_id, events, 'completed', data));
              }

              if (eventType === 'error') {
                executionComplete = true;
                clearTimeout(timeoutId);
                eventSource.close();
                logger.error('Execution failed', { execution_id, error: data });
                resolve(formatStreamResult(execution_id, events, 'failed', data));
              }

              // Handle gap detection
              if (eventType === 'gap_detected') {
                logger.warn('Gap detected in event stream', {
                  last_known_id: data.last_known_id,
                  reason: data.reason,
                });
              }
            } catch (error) {
              logger.error('Failed to parse event', error);
            }
          });
        });

        // Handle connection errors
        eventSource.onerror = (error: any) => {
          clearTimeout(timeoutId);
          eventSource.close();

          // Check if we have any events before erroring
          if (events.length > 0 && executionComplete) {
            // Stream ended gracefully
            resolve(formatStreamResult(execution_id, events, 'completed'));
          } else {
            logger.error('Stream error', error);
            reject(new Error(`Stream connection error: ${error.message || 'Unknown error'}`));
          }
        };

        // Log connection opened
        eventSource.onopen = () => {
          logger.info('Stream connection opened', { execution_id });
        };
      });

      return formatToolResponse(result);
    } catch (error) {
      logger.error('Failed to stream execution', error);
      return formatErrorResponse(error);
    }
  },
};

function formatStreamResult(
  execution_id: string,
  events: ExecutionEvent[],
  status: 'completed' | 'failed' | 'timeout',
  finalData?: any
): StreamResult {
  return {
    execution_id,
    status,
    total_events: events.length,
    events: events,
    summary: {
      message_count: events.filter((e) => e.type === 'message').length,
      tool_executions: events.filter((e) => e.type === 'tool_completed').length,
      errors: events.filter((e) => e.type === 'error').length,
    },
    final_response: finalData?.response,
    usage: finalData?.usage,
  };
}
