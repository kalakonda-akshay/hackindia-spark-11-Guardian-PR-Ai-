import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrchestratorService } from "../agents/orchestrator/orchestrator.service.js";
import { messageBus } from "../services/message-bus.js";
import { ReviewRequest } from "../models/github.types.js";

const mockReviewRequest: ReviewRequest = {
  repository: {
    id: 1,
    name: "test-repo",
    full_name: "owner/test-repo",
    owner: { login: "owner", id: 1 },
    html_url: "https://github.com/owner/test-repo",
  },
  pullRequest: {
    id: 1,
    number: 1,
    title: "Test PR",
    body: "Body",
    state: "open",
    html_url: "https://github.com/owner/test-repo/pull/1",
    diff_url: "https://github.com/owner/test-repo/pull/1.diff",
    base: { ref: "main", sha: "abc" },
    head: { ref: "feature", sha: "def" },
    user: { login: "dev", id: 2 },
  },
  action: "opened",
};

describe("OrchestratorService", () => {
  let orchestrator: OrchestratorService;

  beforeEach(() => {
    orchestrator = new OrchestratorService();
    // Clear all message bus listeners between tests
    messageBus.removeAllListeners();
  });

  it("should successfully orchestrate all agents in order", async () => {
    // Automatically reply success to any agent request
    const agents = ["triage", "context", "security", "dependency", "memory", "reporter", "evaluation"];
    
    agents.forEach(agentId => {
      messageBus.subscribeToRequest(agentId, (req) => {
        // Simulate async processing
        setTimeout(() => {
          messageBus.publishResponse(agentId, {
            sessionId: req.sessionId,
            agentId,
            status: "SUCCESS",
            data: { result: `${agentId}-ok` }
          });
        }, 10);
      });
    });

    const sessionId = await orchestrator.handleReviewRequest(mockReviewRequest);
    
    // Wait for the fire-and-forget workflow to complete
    await new Promise(resolve => setTimeout(resolve, 200));

    const session = await orchestrator.getSession(sessionId);
    expect(session.status).toBe("COMPLETED");
    expect(session.contextBundle.triage.result).toBe("triage-ok");
    expect(session.contextBundle.evaluation.result).toBe("evaluation-ok");
  });

  it("should retry on agent failure and eventually succeed", async () => {
    const sessionId = await orchestrator.handleReviewRequest(mockReviewRequest);
    let attempts = 0;

    messageBus.subscribeToRequest("triage", (req) => {
      attempts++;
      if (attempts === 1) {
        // Fail the first attempt
        messageBus.publishResponse("triage", {
          sessionId: req.sessionId,
          agentId: "triage",
          status: "FAILED",
          error: "Transient network error",
        });
      } else {
        // Succeed on retry
        messageBus.publishResponse("triage", {
          sessionId: req.sessionId,
          agentId: "triage",
          status: "SUCCESS",
          data: { result: "triage-recovered" },
        });
      }
    });

    // Mock the rest to fail instantly so the test ends after context runs
    messageBus.subscribeToRequest("context", (req) => {
      messageBus.publishResponse("context", {
        sessionId: req.sessionId,
        agentId: "context",
        status: "FAILED",
      });
    });

    await new Promise(resolve => setTimeout(resolve, 1500)); // wait for retry backoff

    const session = await orchestrator.getSession(sessionId);
    expect(attempts).toBe(2);
    // It should have passed triage but failed at context
    expect(session.status).toBe("FAILED");
    expect(session.contextBundle.triage.result).toBe("triage-recovered");
  });

  it("should fail the workflow if an agent times out", async () => {
    // Override timeout for fast testing by mocking awaitResponse? 
    // Actually, we can just spy on awaitResponse or mock the timer, 
    // but a real timeout test takes 30s which is too long for unit tests.
    // Instead, we will simulate a timeout rejection directly on the message bus.
    vi.spyOn(messageBus, "awaitResponse").mockRejectedValue(new Error("Timeout"));

    const sessionId = await orchestrator.handleReviewRequest(mockReviewRequest);
    
    await new Promise(resolve => setTimeout(resolve, 100)); // let it fail quickly

    const session = await orchestrator.getSession(sessionId);
    expect(session.status).toBe("FAILED");
    const lastEvent = session.timeline[session.timeline.length - 1];
    expect(lastEvent.details?.message).toContain("Workflow failed");
  });
});
