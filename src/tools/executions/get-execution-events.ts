/**
 * Get execution events tool (polling)
 */

import { EventSource } from 'eventsource';
import type { ToolDefinition } from '../../types/tools.js';
import type { ExecutionEvent, EventsResult, ExecutionEventType } from '../../types/streaming.js';
import { GetExecutionEventsSchema } from '../../schemas/executions.js';
import { formatToolResponse, formatErrorResponse } from '../../utils/formatters.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger('GetExecutionEvents');

export const getExecutionEventsTool: ToolDefinition = {
  name: 'get_execution_events',
  description: 'Poll for new execution events since last check. Returns incremental updates with last_event_id for pagination. Best for interactive UIs and progress tracking.',
  category: 'executions',
  inputSchema: GetExecutionEventsSchema,
  handler: async (args, client) => {
    try {
      const { execution_id, last_event_id, limit = 50 } = GetExecutionEventsSchema.parse(args);
      logger.info('Getting execution events', { execution_id, last_event_id, limit });

      // Get base client to access config
      const baseClient = (client as any).executions.client;
      const config = (baseClient as any).config;
      const authType = (baseClient as any).authType || 'UserKey';

      // Build SSE URL with last_event_id if provided
      const url = last_event_id
        ? `${config.apiBaseUrl}/api/v1/executions/${execution_id}/stream?last_event_id=${last_event_id}`
        : `${config.apiBaseUrl}/api/v1/executions/${execution_id}/stream`;

      logger.debug('Connecting to stream for polling', { url });

      // Create EventSource with auth headers
      const eventSource = new EventSource(url, {
        headers: {
          'Authorization': `${authType} ${config.apiKey}`,
        },
      } as any);

      const events: ExecutionEvent[] = [];
      let lastId = last_event_id;
      let executionComplete = false;

      const result = await new Promise<EventsResult>((resolve, reject) => {
        // Short timeout - just collect recent events (2 seconds)
        const timeoutId = setTimeout(() => {
          eventSource.close();
          resolve({
            events,
            last_event_id: lastId,
            has_more: !executionComplete && events.length >= limit,
            execution_complete: executionComplete,
          });
        }, 2000);

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

        const handleEvent = (eventType: ExecutionEventType) => (event: any) => {
          try {
            // Check limit
            if (events.length >= limit) {
              clearTimeout(timeoutId);
              eventSource.close();
              resolve({
                events,
                last_event_id: lastId,
                has_more: true,
                execution_complete: executionComplete,
              });
              return;
            }

            const data = JSON.parse(event.data);

            events.push({
              id: event.lastEventId || `${execution_id}_${events.length}`,
              type: eventType,
              data,
              timestamp: new Date().toISOString(),
            });

            lastId = event.lastEventId;

            // Check for completion
            if (eventType === 'done' || eventType === 'error') {
              executionComplete = true;
              clearTimeout(timeoutId);
              eventSource.close();
              resolve({
                events,
                last_event_id: lastId,
                has_more: false,
                execution_complete: true,
              });
            }
          } catch (error) {
            logger.error('Failed to parse event', error);
          }
        };

        eventTypes.forEach((eventType) => {
          eventSource.addEventListener(eventType, handleEvent(eventType));
        });

        // Handle connection errors
        eventSource.onerror = (error: any) => {
          clearTimeout(timeoutId);
          eventSource.close();

          // Return what we have so far
          if (events.length > 0) {
            resolve({
              events,
              last_event_id: lastId,
              has_more: false,
              execution_complete: executionComplete,
            });
          } else {
            logger.error('Stream error', error);
            reject(new Error(`Failed to fetch events: ${error.message || 'Connection error'}`));
          }
        };
      });

      logger.info('Fetched events', {
        execution_id,
        count: result.events.length,
        execution_complete: result.execution_complete,
      });

      return formatToolResponse(result);
    } catch (error) {
      logger.error('Failed to get execution events', error);
      return formatErrorResponse(error);
    }
  },
};
