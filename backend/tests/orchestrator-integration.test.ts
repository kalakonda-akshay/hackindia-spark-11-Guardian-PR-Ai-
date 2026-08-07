import { describe, it, expect, vi, beforeEach } from "vitest";
import { orchestratorService } from "../agents/orchestrator/orchestrator.service.js";
import { messageBus } from "../services/message-bus.js";
import { ReviewRequest } from "../models/github.types.js";

// Import all agents to instantiate them and bind them to the message bus
import "../agents/triage/triage.agent.js";
import "../agents/context/context.agent.js";
import "../agents/security/security.agent.js";
import "../agents/dependency/dependency.agent.js";
import "../agents/review-memory/memory.agent.js";
import "../agents/reporter/reporter.agent.js";
import "../agents/evaluation/evaluation.agent.js";

const mockReviewRequest = {
  action: "opened",
  number: 1,
  repository: {
    name: "test-repo",
    owner: { login: "test-owner", id: 1 },
    full_name: "test-owner/test-repo"
  },
  pullRequest: {
    number: 1,
    title: "Test PR",
    state: "open",
    head: { ref: "feature-branch", sha: "head_sha" },
    base: { ref: "main", sha: "base_sha" }
  }
} as unknown as ReviewRequest;

describe("Orchestrator End-to-End Workflow", () => {
  it("should successfully run a PR through the entire lifecycle", async () => {
    // 1. Trigger Orchestrator
    const sessionId = await orchestratorService.handleReviewRequest(mockReviewRequest);
    expect(sessionId).toBeDefined();

    // 2. We must wait for the workflow to complete since it fires and forgets
    // In a real integration test we'd poll or wait on an event. Here we simulate a sleep.
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Assert Session State
    const session = await orchestratorService.getSession(sessionId);
    expect(session).toBeDefined();
    expect(session.status).toBe("COMPLETED");

    // 4. Assert Context Bundle was populated by ALL agents
    expect(session.contextBundle.triage).toBeDefined();
    expect(session.contextBundle.context).toBeDefined();
    expect(session.contextBundle.security).toBeDefined();
    expect(session.contextBundle.dependency).toBeDefined();
    expect(session.contextBundle.memory).toBeDefined();
    expect(session.contextBundle.reporter).toBeDefined();
    expect(session.contextBundle.evaluation).toBeDefined();

    // Verify Evaluation Verdict
    expect(session.contextBundle.evaluation.verdict).toBe("PASS");
  });
});
