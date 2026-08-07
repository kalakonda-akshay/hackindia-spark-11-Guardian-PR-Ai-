import { describe, it, expect } from "vitest";
import { memoryAgent } from "../agents/review-memory/memory.agent.js";
import { AgentRequest } from "../models/orchestrator.types.js";
import { SecurityFinding } from "../models/security.types.js";

const createMockReq = (findings: SecurityFinding[]): AgentRequest => ({
  sessionId: "test-session",
  agentId: "memory",
  payload: {
    security: {
      findings,
      riskScore: 0,
      securitySummary: "",
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      passedChecks: 0,
      failedChecks: 0,
    },
  },
});

describe("MemoryAgent", () => {
  it("should flag previously dismissed false positives", async () => {
    const findings: SecurityFinding[] = [
      {
        ruleId: "CRYPTO-002",
        title: "Weak Randomness",
        description: "",
        severity: "LOW",
        confidence: "CERTAIN",
        evidence: "Math.random()",
        file: "src/utils.js",
      }
    ];

    const result = await memoryAgent.run(createMockReq(findings));

    expect(result.falsePositiveHints.length).toBe(1);
    expect(result.duplicateCount).toBe(1);
    expect(result.similarPastFindings[0].resolution).toBe("FALSE_POSITIVE");
  });

  it("should surface team standards for specific rules", async () => {
    const findings: SecurityFinding[] = [
      {
        ruleId: "INJ-001",
        title: "Dangerous eval()",
        description: "",
        severity: "CRITICAL",
        confidence: "CERTAIN",
        evidence: "eval(a)",
        file: "src/dangerous.js",
      }
    ];

    const result = await memoryAgent.run(createMockReq(findings));

    expect(result.applicableStandards.length).toBe(1);
    expect(result.applicableStandards[0].enforcementLevel).toBe("STRICT");
  });
});
