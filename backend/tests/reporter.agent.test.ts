import { describe, it, expect } from "vitest";
import { reporterAgent } from "../agents/reporter/reporter.agent.js";
import { AgentRequest } from "../models/orchestrator.types.js";

const createMockReq = (payload: any): AgentRequest => ({
  sessionId: "test-session",
  agentId: "reporter",
  payload,
});

describe("ReporterAgent", () => {
  it("should generate a clean report when no issues exist", async () => {
    const result = await reporterAgent.run(createMockReq({}));

    expect(result.executiveSummary).toContain("PASSED");
    expect(result.markdownBody).toContain("No security vulnerabilities found");
    expect(result.jsonSummary.blocked).toBe(false);
  });

  it("should generate a blocked report when critical issues exist", async () => {
    const payload = {
      security: {
        findings: [
          { title: "SQL Injection", severity: "CRITICAL", file: "db.js", description: "Bad stuff" }
        ],
        criticalCount: 1,
        riskScore: 100
      }
    };
    
    const result = await reporterAgent.run(createMockReq(payload));

    expect(result.executiveSummary).toContain("MERGE BLOCKED");
    expect(result.markdownBody).toContain("🚨 SQL Injection");
    expect(result.jsonSummary.blocked).toBe(true);
  });
});
