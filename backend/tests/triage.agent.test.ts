import { describe, it, expect } from "vitest";
import { triageAgent } from "../agents/triage/triage.agent.js";
import { ChangedFile } from "../models/github.types.js";
import { AgentRequest } from "../models/orchestrator.types.js";

const createMockReq = (files: ChangedFile[]): AgentRequest => ({
  sessionId: "test-session",
  agentId: "triage",
  payload: {
    changedFiles: files,
  },
});

describe("TriageAgent", () => {
  it("should classify a Small PR correctly", async () => {
    const files: ChangedFile[] = [
      { filename: "src/utils.ts", status: "modified", additions: 10, deletions: 2, changes: 12 }
    ];
    
    const result = await triageAgent.run(createMockReq(files));
    
    expect(result.complexity).toBe("LOW");
    expect(result.riskScore).toBeLessThan(20);
    expect(result.classification).toContain("Feature");
    expect(result.languages).toContain("TypeScript");
    expect(result.sensitiveFiles.length).toBe(0);
  });

  it("should classify a Large PR correctly", async () => {
    const files: ChangedFile[] = Array.from({ length: 60 }).map((_, i) => ({
      filename: `src/file${i}.ts`,
      status: "modified",
      additions: 20,
      deletions: 5,
      changes: 25,
    }));
    
    const result = await triageAgent.run(createMockReq(files));
    
    expect(result.complexity).toBe("CRITICAL");
    expect(result.riskScore).toBeGreaterThan(30);
  });

  it("should classify a Dependency-only PR correctly", async () => {
    const files: ChangedFile[] = [
      { filename: "package.json", status: "modified", additions: 2, deletions: 2, changes: 4 },
      { filename: "package-lock.json", status: "modified", additions: 100, deletions: 100, changes: 200 }
    ];
    
    const result = await triageAgent.run(createMockReq(files));
    
    expect(result.classification).toContain("Dependency Update");
    expect(result.sensitiveFiles).toContain("package.json");
    expect(result.sensitiveFiles).toContain("package-lock.json");
    expect(result.riskScore).toBeGreaterThanOrEqual(15);
  });

  it("should classify a Security-sensitive PR correctly", async () => {
    const files: ChangedFile[] = [
      { filename: "src/auth/login.ts", status: "modified", additions: 50, deletions: 10, changes: 60 },
      { filename: ".env.example", status: "added", additions: 5, deletions: 0, changes: 5 }
    ];
    
    const result = await triageAgent.run(createMockReq(files));
    
    expect(result.classification).toContain("Security Related");
    expect(result.classification).toContain("Configuration Change");
    expect(result.sensitiveFiles.length).toBe(2);
    expect(result.riskScore).toBeGreaterThan(40);
  });

  it("should classify a Documentation-only PR correctly", async () => {
    const files: ChangedFile[] = [
      { filename: "README.md", status: "modified", additions: 10, deletions: 0, changes: 10 },
      { filename: "docs/setup.md", status: "added", additions: 50, deletions: 0, changes: 50 }
    ];
    
    const result = await triageAgent.run(createMockReq(files));
    
    expect(result.classification).toContain("Documentation");
    expect(result.classification).not.toContain("Feature");
    expect(result.complexity).toBe("MEDIUM"); // 60 additions across 2 files
    expect(result.sensitiveFiles.length).toBe(0);
  });
});
