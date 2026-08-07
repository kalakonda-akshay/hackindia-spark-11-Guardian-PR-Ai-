import { messageBus } from "../../services/message-bus.js";
import { AgentRequest, AgentResponse } from "../../models/orchestrator.types.js";
import { SecurityFinding, SecurityResult, Severity } from "../../models/security.types.js";
import { ContextResult, CodeContext } from "../../models/context.types.js";
import { TriageResult } from "../../models/triage.types.js";
import { diffParser } from "../../services/diff.parser.js";
import { ruleEngine } from "./rule.engine.js";
import { aiReviewer } from "./ai.reviewer.js";

/**
 * Security Agent
 * Consumes Context and Triage to perform static and AI-driven security analysis.
 */
export class SecurityAgent {
  // Simple in-memory cache to prevent re-analyzing the same patch repeatedly
  private scanCache: Map<string, SecurityFinding[]> = new Map();

  constructor() {
    this.startListening();
  }

  private startListening() {
    messageBus.subscribeToRequest("security", async (req: AgentRequest) => {
      try {
        console.info(`[SecurityAgent] Starting security scan for session ${req.sessionId}`);
        const startTime = Date.now();
        const result = await this.run(req);
        
        console.info(`[SecurityAgent] Scan complete in ${Date.now() - startTime}ms. Findings: ${result.findings.length}`);

        const response: AgentResponse<SecurityResult> = {
          sessionId: req.sessionId,
          agentId: "security",
          status: "SUCCESS",
          data: result,
        };
        messageBus.publishResponse("security", response);
      } catch (error: any) {
        console.error(`[SecurityAgent] Failed scan for session ${req.sessionId}:`, error);
        messageBus.publishResponse("security", {
          sessionId: req.sessionId,
          agentId: "security",
          status: "FAILED",
          error: error.message,
          retryable: true,
        });
      }
    });
  }

  public async run(req: AgentRequest): Promise<SecurityResult> {
    const triage: TriageResult = req.payload?.triage;
    const context: ContextResult = req.payload?.context;
    
    // Fallbacks for testing
    const changedFiles = req.payload?.changedFiles || [];
    const codeContexts = context?.codeContext || [];
    
    const parsedFiles = diffParser.parseFiles(changedFiles);

    const allFindings: SecurityFinding[] = [];
    let passedChecks = 0;
    let failedChecks = 0;

    for (const file of parsedFiles) {
      if (file.status === "removed" || file.status === "unchanged") continue;
      
      const fileContext = codeContexts.find(c => c.filename === file.filename) || {} as CodeContext;

      // 1. Static Rule Engine (Fast, catches hardcoded secrets immediately)
      const staticFindings = ruleEngine.scanHunks(file.filename, file.hunks);
      allFindings.push(...staticFindings);
      
      // 2. AI Review (Deep semantic scan)
      // Only invoke AI on files that have actual code additions and aren't purely config/locks
      const hasMeaningfulCode = file.hunks.some(h => h.lines.some(l => l.type === 'add'));
      const isLockfile = file.filename.includes('lock') || file.filename.includes('package.json');
      
      if (hasMeaningfulCode && !isLockfile) {
        // Construct a cache key based on file content + context
        // In a real app, hash the actual patch string
        const patchString = file.hunks.map(h => h.header + h.lines.map(l => l.content).join('')).join('');
        const cacheKey = `${file.filename}:${patchString.length}`;

        if (this.scanCache.has(cacheKey)) {
          console.info(`[SecurityAgent] AI Cache hit for ${file.filename}`);
          allFindings.push(...this.scanCache.get(cacheKey)!);
        } else {
          console.info(`[SecurityAgent] Requesting AI review for ${file.filename}`);
          // Note: In production, we'd fire these off via Promise.all() for parallel execution
          // But for deterministic rate-limit handling, sequential is safer.
          const aiFindings = await aiReviewer.reviewFile(file.filename, patchString, fileContext);
          this.scanCache.set(cacheKey, aiFindings);
          allFindings.push(...aiFindings);
        }
      }
      
      passedChecks++; // Track files processed successfully
    }

    failedChecks = allFindings.length; // Simplified for metrics
    
    return this.compileResult(allFindings, passedChecks, failedChecks);
  }

  private compileResult(findings: SecurityFinding[], passed: number, failed: number): SecurityResult {
    const counts = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      INFO: 0
    };

    findings.forEach(f => {
      counts[f.severity]++;
    });

    let riskScore = (counts.CRITICAL * 100) + (counts.HIGH * 50) + (counts.MEDIUM * 20) + (counts.LOW * 5);
    riskScore = Math.min(riskScore, 100); // Normalize to 100

    let summary = "No significant security issues detected.";
    if (counts.CRITICAL > 0) summary = "CRITICAL security vulnerabilities detected. Do not merge.";
    else if (counts.HIGH > 0) summary = "High severity security issues detected. Fix before merging.";
    else if (counts.MEDIUM > 0) summary = "Medium severity issues found. Review recommended.";

    return {
      findings,
      riskScore,
      securitySummary: summary,
      criticalCount: counts.CRITICAL,
      highCount: counts.HIGH,
      mediumCount: counts.MEDIUM,
      lowCount: counts.LOW,
      passedChecks: passed,
      failedChecks: failed,
    };
  }
}

export const securityAgent = new SecurityAgent();
