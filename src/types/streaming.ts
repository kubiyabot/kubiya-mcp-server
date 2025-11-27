/**
 * TypeScript types for execution streaming
 */

export interface ExecutionEvent {
  id: string;
  type: ExecutionEventType;
  data: any;
  timestamp: string;
}

export type ExecutionEventType =
  | 'message'
  | 'message_chunk'
  | 'member_message_chunk'
  | 'tool_started'
  | 'tool_completed'
  | 'status'
  | 'error'
  | 'done'
  | 'gap_detected'
  | 'degraded'
  | 'reconnect'
  | 'timeout_warning';

export interface StreamResult {
  execution_id: string;
  status: 'completed' | 'failed' | 'timeout';
  total_events: number;
  events: ExecutionEvent[];
  summary: {
    message_count: number;
    tool_executions: number;
    errors: number;
  };
  final_response?: string;
  usage?: any;
}

export interface StreamOptions {
  timeout_seconds?: number;
  event_filter?: ExecutionEventType[];
}

export interface EventsResult {
  events: ExecutionEvent[];
  last_event_id?: string;
  has_more: boolean;
  execution_complete: boolean;
}
