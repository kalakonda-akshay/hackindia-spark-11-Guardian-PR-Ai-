import { describe, it, expect } from "vitest";
import { evaluationAgent } from "../agents/evaluation/evaluation.agent.js";
import { AgentRequest } from "../models/orchestrator.types.js";

const createMockReq = (payload: any): AgentRequest => ({
  sessionId: "test-session",
  agentId: "evaluation",
  payload,
});

describe("EvaluationAgent", () => {
  it("should return PASS when accuracy is high", async () => {
    const payload = {
      security: { passedChecks: 10, failedChecks: 0, findings: [] },
      memory: { duplicateCount: 0 }
    };
    
    const result = await evaluationAgent.run(createMockReq(payload), Date.now());

    expect(result.verdict).toBe("PASS");
    expect(result.accuracyScore).toBe(100);
    expect(result.falsePositiveRate).toBe(0);
  });

  it("should return FAIL when false positives are too high", async () => {
    const payload = {
      security: { passedChecks: 10, failedChecks: 10, findings: [] }, // 20 checks total
      memory: { duplicateCount: 5 } // 25% FPR
    };
    
    const result = await evaluationAgent.run(createMockReq(payload), Date.now());

    // 100 - 25 = 75 accuracy. < 80 means FAIL
    expect(result.verdict).toBe("FAIL");
    expect(result.accuracyScore).toBe(75);
    expect(result.falsePositiveRate).toBe(25);
  });
});
