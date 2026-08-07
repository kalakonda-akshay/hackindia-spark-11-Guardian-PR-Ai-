import { describe, it, expect } from "vitest";
import { dependencyAgent } from "../agents/dependency/dependency.agent.js";
import { ChangedFile } from "../models/github.types.js";
import { AgentRequest } from "../models/orchestrator.types.js";

const createMockReq = (files: ChangedFile[]): AgentRequest => ({
  sessionId: "test-session",
  agentId: "dependency",
  payload: {
    changedFiles: files,
  },
});

describe("DependencyAgent", () => {
  it("should detect vulnerable packages from package.json", async () => {
    const files: ChangedFile[] = [
      {
        filename: "package.json",
        status: "modified",
        additions: 1, deletions: 0, changes: 1,
        patch: `@@ -10,3 +10,4 @@\n   "dependencies": {\n+    "lodash": "^4.17.20"\n   }`
      }
    ];

    const result = await dependencyAgent.run(createMockReq(files));

    expect(result.analyzedFiles).toContain("package.json");
    expect(result.vulnerabilities.length).toBe(1);
    expect(result.vulnerabilities[0].packageName).toBe("lodash");
    expect(result.vulnerabilities[0].severity).toBe("HIGH");
    expect(result.riskScore).toBeGreaterThanOrEqual(30);
  });

  it("should ignore non-manifest files", async () => {
    const files: ChangedFile[] = [
      {
        filename: "src/index.ts",
        status: "modified",
        additions: 1, deletions: 0, changes: 1,
        patch: `@@ -1 +1 @@\n+import * as lodash from 'lodash';`
      }
    ];

    const result = await dependencyAgent.run(createMockReq(files));

    expect(result.analyzedFiles.length).toBe(0);
    expect(result.vulnerabilities.length).toBe(0);
  });
});
