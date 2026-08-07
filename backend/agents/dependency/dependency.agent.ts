import { messageBus } from "../../services/message-bus.js";
import { AgentRequest, AgentResponse } from "../../models/orchestrator.types.js";
import { DependencyResult, Package, Vulnerability } from "../../models/dependency.types.js";
import { diffParser } from "../../services/diff.parser.js";
import { ChangedFile } from "../../models/github.types.js";

/**
 * Dependency Intelligence Agent
 * Detects vulnerable and outdated dependencies from lockfiles and manifests.
 */
export class DependencyAgent {
  // Simulated Vulnerability Database (In production, uses OSV API, Snyk, or GitHub Advisories)
  private readonly MOCK_VULN_DB: Record<string, Vulnerability> = {
    "lodash": { packageName: "lodash", cve: "CVE-2021-23337", severity: "HIGH", description: "Command Injection in lodash.template", recommendation: "Upgrade to 4.17.21 or higher" },
    "log4j": { packageName: "log4j", cve: "CVE-2021-44228", severity: "CRITICAL", description: "Log4Shell RCE", recommendation: "Upgrade to 2.17.1 immediately" },
    "requests": { packageName: "requests", cve: "CVE-2023-32289", severity: "MEDIUM", description: "Information Disclosure", recommendation: "Upgrade to 2.31.0" },
  };

  private readonly MANIFEST_FILES = [
    "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    "requirements.txt", "Pipfile", "Pipfile.lock",
    "pom.xml", "build.gradle",
    "go.mod", "go.sum",
    "Cargo.toml", "Cargo.lock"
  ];

  constructor() {
    this.startListening();
  }

  private startListening() {
    messageBus.subscribeToRequest("dependency", async (req: AgentRequest) => {
      try {
        console.info(`[DependencyAgent] Starting scan for session ${req.sessionId}`);
        const result = await this.run(req);
        
        const response: AgentResponse<DependencyResult> = {
          sessionId: req.sessionId,
          agentId: "dependency",
          status: "SUCCESS",
          data: result,
        };
        messageBus.publishResponse("dependency", response);
      } catch (error: any) {
        console.error(`[DependencyAgent] Failed scan for session ${req.sessionId}:`, error);
        messageBus.publishResponse("dependency", {
          sessionId: req.sessionId,
          agentId: "dependency",
          status: "FAILED",
          error: error.message,
        });
      }
    });
  }

  public async run(req: AgentRequest): Promise<DependencyResult> {
    const changedFiles: ChangedFile[] = req.payload?.changedFiles || [];
    const parsedFiles = diffParser.parseFiles(changedFiles);

    const analyzedFiles: string[] = [];
    const packagesFound: Package[] = [];
    const vulnerabilities: Vulnerability[] = [];
    const outdatedPackages: Package[] = [];

    for (const file of parsedFiles) {
      if (!this.MANIFEST_FILES.some(mf => file.filename.endsWith(mf))) continue;
      
      analyzedFiles.push(file.filename);

      // Parse additions looking for dependencies (Naive regex logic for mock)
      for (const hunk of file.hunks) {
        for (const line of hunk.lines) {
          if (line.type === "add") {
            const detectedPackage = this.extractPackage(file.filename, line.content);
            if (detectedPackage) {
              packagesFound.push(detectedPackage);

              // Check mock DB
              if (this.MOCK_VULN_DB[detectedPackage.name]) {
                vulnerabilities.push(this.MOCK_VULN_DB[detectedPackage.name]);
              }
            }
          }
        }
      }
    }

    let riskScore = 0;
    vulnerabilities.forEach(v => {
      if (v.severity === "CRITICAL") riskScore += 50;
      else if (v.severity === "HIGH") riskScore += 30;
      else if (v.severity === "MEDIUM") riskScore += 10;
      else riskScore += 5;
    });

    riskScore = Math.min(riskScore, 100);

    let summary = "Dependencies are clean.";
    if (vulnerabilities.length > 0) {
       summary = `Detected ${vulnerabilities.length} vulnerable dependencies.`;
    }

    return {
      analyzedFiles,
      packagesFound: packagesFound.length,
      vulnerabilities,
      outdatedPackages,
      summary,
      riskScore
    };
  }

  private extractPackage(filename: string, content: string): Package | null {
    if (filename.includes("package.json")) {
      const match = content.match(/"([a-zA-Z0-9\-_@/]+)"\s*:\s*"[\^~]?([0-9\.]+)"/);
      if (match) return { name: match[1], currentVersion: match[2], manager: "npm" };
    } else if (filename.includes("requirements.txt")) {
      const match = content.match(/^([a-zA-Z0-9\-_]+)[=<>]+([0-9\.]+)/);
      if (match) return { name: match[1], currentVersion: match[2], manager: "pip" };
    }
    return null;
  }
}

export const dependencyAgent = new DependencyAgent();
