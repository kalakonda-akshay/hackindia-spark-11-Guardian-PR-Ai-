import { useQuery } from "@tanstack/react-query";
import { getAgentStatus, getAgentTimeline } from "../services/agent";

export function useAgentStatus() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: getAgentStatus,
  });
}

export function useAgentTimeline() {
  return useQuery({
    queryKey: ["agents", "timeline"],
    queryFn: getAgentTimeline,
  });
}
