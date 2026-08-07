import { messageBus } from "../../services/message-bus.js";
import { AgentRequest, AgentResponse } from "../../models/orchestrator.types.js";
import { MemoryResult, HistoricalFinding, TeamStandard } from "../../models/memory.types.js";
import { SecurityResult } from "../../models/security.types.js";

/**
 * Review Memory Agent
 * Uses historical data (simulated vector DB) to catch false positives and enforce team standards.
 */
export class MemoryAgent {
  // Simulated Vector/Document DB
  private readonly PAST_FINDINGS: HistoricalFinding[] = [
    {
      ruleId: "CRYPTO-002",
      title: "Weak Randomness",
      description: "Math.random() is used.",
      severity: "LOW",
      confidence: "CERTAIN",
      evidence: "Math.random()",
      file: "src/utils.js",
      resolvedAt: "2025-10-01T00:00:00Z",
      resolution: "FALSE_POSITIVE",
      pullRequestUrl: "https://github.com/mock/repo/pull/12"
    }
  ];

  private readonly TEAM_STANDARDS: TeamStandard[] = [
    {
      ruleId: "SEC-004",
      description: "JWTs must always be signed with RS256, never HS256.",
      enforcementLevel: "STRICT"
    },
    {
      ruleId: "INJ-001",
      description: "eval() is strictly banned across the entire monorepo.",
      enforcementLevel: "STRICT"
    }
  ];

  constructor() {
    this.startListening();
  }

  private startListening() {
    messageBus.subscribeToRequest("memory", async (req: AgentRequest) => {
      try {
        console.info(`[MemoryAgent] Analyzing memory for session ${req.sessionId}`);
        const result = await this.run(req);
        
        const response: AgentResponse<MemoryResult> = {
          sessionId: req.sessionId,
          agentId: "memory",
          status: "SUCCESS",
          data: result,
        };
        messageBus.publishResponse("memory", response);
      } catch (error: any) {
        console.error(`[MemoryAgent] Failed scan for session ${req.sessionId}:`, error);
        messageBus.publishResponse("memory", {
          sessionId: req.sessionId,
          agentId: "memory",
          status: "FAILED",
          error: error.message,
        });
      }
    });
  }

  public async run(req: AgentRequest): Promise<MemoryResult> {
    const securityResult: SecurityResult = req.payload?.security || { findings: [] };

    const similarPastFindings: HistoricalFinding[] = [];
    const applicableStandards: TeamStandard[] = [];
    const falsePositiveHints: string[] = [];
    let duplicateCount = 0;

    for (const finding of securityResult.findings) {
      // 1. Check for historical similarity (exact rule match for mock)
      const historicalMatch = this.PAST_FINDINGS.find(
        p => p.ruleId === finding.ruleId && p.file === finding.file
      );

      if (historicalMatch) {
        similarPastFindings.push(historicalMatch);
        if (historicalMatch.resolution === "FALSE_POSITIVE") {
          falsePositiveHints.push(`Finding ${finding.ruleId} in ${finding.file} was previously dismissed as a false positive in PR #12.`);
          // Downrank confidence of the current finding (would modify payload in a real mutation step)
          duplicateCount++;
        }
      }

      // 2. Check team standards
      const standard = this.TEAM_STANDARDS.find(s => s.ruleId === finding.ruleId);
      if (standard && !applicableStandards.includes(standard)) {
        applicableStandards.push(standard);
      }
    }

    return {
      similarPastFindings,
      applicableStandards,
      duplicateCount,
      falsePositiveHints
    };
  }
}

export const memoryAgent = new MemoryAgent();
