/**
 * API response type definitions matching Control Plane API
 */

// Agent types
export interface Agent {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  instructions?: string;
  image?: string;
  model?: string;
  runtime?: string;
  runner?: any;
  runner_name?: string;
  team_id?: string;
  status?: string;
  secrets?: string[];
  environment_variables?: Record<string, any>;
  integrations?: any[];
  created_at: string;
  updated_at: string;
  projects?: Array<{id: string; name: string}>;
  environments?: Array<{id: string; name: string}>;
  skills?: any[];
}

// Team types
export interface Team {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  members?: string[];
  skills?: any[];
  runner?: any;
  communication?: any;
  status?: string;
  created_at: string;
  updated_at: string;
}

// Workflow types
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: string;
  steps: any[];
  configuration: Record<string, any>;
  team_id?: string;
  created_at: string;
  updated_at: string;
}

// Execution types
export interface Execution {
  id: string;
  organization_id: string;
  execution_type: string;
  entity_id: string;
  entity_name?: string;
  prompt: string;
  status: string;
  response?: string;
  error_message?: string;
  usage: Record<string, any>;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  updated_at: string;
}

// Job types
export interface Job {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  entity_type: string;
  entity_id: string;
  schedule?: string;
  trigger_type: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

// Project types
export interface Project {
  id: string;
  organization_id: string;
  name: string;
  key: string;
  description?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

// Environment types
export interface Environment {
  id: string;
  organization_id: string;
  name: string;
  display_name?: string;
  description?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

// Skill types
export interface Skill {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  type: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Policy types
export interface Policy {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  policy_type: string;
  rules: any;
  created_at: string;
  updated_at: string;
}

// Worker Queue types
export interface WorkerQueue {
  id: string;
  organization_id: string;
  environment_id: string;
  name: string;
  display_name?: string;
  description?: string;
  status: string;
  max_workers?: number;
  heartbeat_interval: number;
  tags: string[];
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  active_workers?: number;
  task_queue_name?: string;
}

// System types
export interface HealthStatus {
  status: string;
  timestamp: string;
  [key: string]: any;
}

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  capabilities?: string[];
  [key: string]: any;
}
