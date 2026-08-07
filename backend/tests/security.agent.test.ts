import { describe, it, expect, vi, beforeEach } from "vitest";
import { securityAgent } from "../agents/security/security.agent.js";
import { ChangedFile } from "../models/github.types.js";
import { AgentRequest } from "../models/orchestrator.types.js";
import { aiReviewer } from "../agents/security/ai.reviewer.js";

// Mock the AI Reviewer to return predictable results for testing
vi.mock("../agents/security/ai.reviewer.js", () => ({
  aiReviewer: {
    reviewFile: vi.fn().mockResolvedValue([]),
  }
}));

const createMockReq = (files: ChangedFile[]): AgentRequest => ({
  sessionId: "test-session",
  agentId: "security",
  payload: {
    changedFiles: files,
  },
});

describe("SecurityAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should detect hardcoded GitHub tokens via static rules", async () => {
    const files: ChangedFile[] = [
      {
        filename: "src/config.js",
        status: "modified",
        additions: 1, deletions: 0, changes: 1,
        patch: `@@ -1 +1 @@\n+const token = "ghp_1234567890abcdefghijklmnopqrstuvwxyz";`
      }
    ];

    const result = await securityAgent.run(createMockReq(files));

    expect(result.criticalCount).toBe(1);
    expect(result.findings[0].title).toBe("GitHub Token");
    expect(result.riskScore).toBeGreaterThanOrEqual(100);
  });

  it("should detect dangerous eval() via static rules", async () => {
    const files: ChangedFile[] = [
      {
        filename: "src/utils.js",
        status: "added",
        additions: 1, deletions: 0, changes: 1,
        patch: `@@ -0,0 +1 @@\n+const result = eval(userInput);`
      }
    ];

    const result = await securityAgent.run(createMockReq(files));

    expect(result.criticalCount).toBe(1);
    expect(result.findings[0].title).toBe("Dangerous eval()");
  });

  it("should detect potential SQL Injection", async () => {
    const files: ChangedFile[] = [
      {
        filename: "src/db.js",
        status: "modified",
        additions: 1, deletions: 0, changes: 1,
        patch: "@@ -1 +1 @@\n+const query = `SELECT * FROM users WHERE id = ${req.body.id}`;"
      }
    ];

    const result = await securityAgent.run(createMockReq(files));
    
    expect(result.criticalCount).toBe(1);
    expect(result.findings[0].title).toBe("Potential SQL Injection");
  });
  
  it("should return clean results for safe code", async () => {
    const files: ChangedFile[] = [
      {
        filename: "src/safe.js",
        status: "modified",
        additions: 1, deletions: 0, changes: 1,
        patch: `@@ -1 +1 @@\n+console.log("Hello World");`
      }
    ];

    const result = await securityAgent.run(createMockReq(files));
    
    expect(result.criticalCount).toBe(0);
    expect(result.highCount).toBe(0);
    expect(result.findings.length).toBe(0);
  });

  it("should call the AI reviewer for files with meaningful additions", async () => {
    // Override the mock to return an AI finding for this test
    const mockAiFinding = [{
      ruleId: "AI-SEC-001",
      title: "Path Traversal",
      description: "Unsanitized input used in file path",
      severity: "HIGH",
      confidence: "FIRM",
      evidence: "fs.readFile(req.query.file)",
      file: "src/api.js"
    }];
    
    vi.mocked(aiReviewer.reviewFile).mockResolvedValueOnce(mockAiFinding as any);

    const files: ChangedFile[] = [
      {
        filename: "src/api.js",
        status: "modified",
        additions: 1, deletions: 0, changes: 1,
        patch: `@@ -1 +1 @@\n+fs.readFile(req.query.file);`
      }
    ];

    const result = await securityAgent.run(createMockReq(files));

    // Verify AI reviewer was called
    expect(aiReviewer.reviewFile).toHaveBeenCalledTimes(1);
    expect(result.highCount).toBe(1);
    expect(result.findings[0].title).toBe("Path Traversal");
  });
});
