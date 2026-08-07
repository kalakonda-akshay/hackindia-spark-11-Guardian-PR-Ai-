import { agents, timelineEvents } from "../features/dashboard/data";
import type { Agent, TimelineEvent } from "../types/security";
import { requestOrMock } from "./api-client";

export function getAgentStatus() {
  return requestOrMock<Agent[]>("/agents", () => agents, 250);
}

export function getAgentTimeline() {
  return requestOrMock<TimelineEvent[]>("/agents/timeline", () => timelineEvents, 250);
}
