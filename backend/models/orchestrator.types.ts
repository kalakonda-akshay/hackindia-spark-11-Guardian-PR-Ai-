import { ReviewRequest } from "./github.types.js";

export type ReviewStatus =
  | "CREATED"
  | "TRIAGE_RUNNING"
  | "CONTEXT_RUNNING"
  | "SECURITY_RUNNING"
  | "DEPENDENCY_RUNNING"
  | "MEMORY_RUNNING"
  | "REPORT_RUNNING"
  | "EVALUATION_RUNNING"
  | "COMPLETED"
  | "FAILED";

export interface TimelineEvent {
  timestamp: Date;
  event: string;
  agent?: string;
  details?: Record<string, any>;
}

export interface ReviewSession {
  id: string; // Unique Review ID
  status: ReviewStatus;
  reviewRequest: ReviewRequest;
  timeline: TimelineEvent[];
  contextBundle: Record<string, any>; // Accumulated context and findings
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentRequest<T = any> {
  sessionId: string;
  agentId: string;
  payload: T;
}

export interface AgentResponse<T = any> {
  sessionId: string;
  agentId: string;
  status: "SUCCESS" | "FAILED";
  data?: T;
  error?: string;
  retryable?: boolean;
}
