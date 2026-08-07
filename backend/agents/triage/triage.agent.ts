import { messageBus } from "../../services/message-bus.js";
import { repositoryService } from "../../github/repository.service.js";
import { AgentRequest, AgentResponse } from "../../models/orchestrator.types.js";
import { TriageResult, PRClassification, PRComplexity } from "../../models/triage.types.js";
import { ChangedFile } from "../../models/github.types.js";

/**
 * Triage Agent
 * Responsible for the initial assessment and routing hints.
 */
export class TriageAgent {
  private readonly SENSITIVE_PATTERNS = [
    /\.env/,
    /\.github\/workflows\/.*/,
    /Dockerfile/,
    /docker-compose.*/,
    /package\.json/,
    /package-lock\.json/,
    /pnpm-lock\.yaml/,
    /requirements\.txt/,
    /pom\.xml/,
    /build\.gradle/,
    /terraform\/.*/,
    /kubernetes\/.*/,
    /auth\/.*/,
    /security\/.*/,
    /config\/.*/,
  ];

  private readonly LANGUAGE_MAP: Record<string, string> = {
    ".ts": "TypeScript",
    ".js": "JavaScript",
    ".py": "Python",
    ".java": "Java",
    ".go": "Go",
    ".rs": "Rust",
    ".cs": "C#",
    ".yml": "YAML",
    ".yaml": "YAML",
    ".json": "JSON",
  };

  constructor() {
    this.startListening();
  }

  private startListening() {
    messageBus.subscribeToRequest("triage", async (req: AgentRequest) => {
      try {
        console.info(`[TriageAgent] Starting triage for session ${req.sessionId}`);
        const result = await this.run(req);
        
        const response: AgentResponse<TriageResult> = {
          sessionId: req.sessionId,
          agentId: "triage",
          status: "SUCCESS",
          data: result,
        };
        messageBus.publishResponse("triage", response);
      } catch (error: any) {
        console.error(`[TriageAgent] Failed triage for session ${req.sessionId}:`, error);
        messageBus.publishResponse("triage", {
          sessionId: req.sessionId,
          agentId: "triage",
          status: "FAILED",
          error: error.message,
        });
      }
    });
  }

  public async run(req: AgentRequest): Promise<TriageResult> {
    // In production, the orchestrator passes the ReviewContext in the payload.
    // However, since Triage is the first step, it might need to fetch the changed files itself,
    // or rely on orchestrator to have fetched them. Let's assume we fetch them here to be self-contained.
    
    // For unit tests, we'll allow passing changedFiles directly in the payload
    let changedFiles: ChangedFile[] = req.payload?.changedFiles;

    if (!changedFiles && req.payload?.reviewRequest) {
      const { repository, pullRequest } = req.payload.reviewRequest;
      changedFiles = await repositoryService.getChangedFiles(
        repository.owner.login, 
        repository.name, 
        pullRequest.number
      );
    }

    if (!changedFiles) {
       changedFiles = []; // Fallback for pure tests
    }

    const sensitiveFiles = this.detectSensitiveFiles(changedFiles);
    const languages = this.detectLanguages(changedFiles);
    const { additions, deletions, totalFiles } = this.calculateStats(changedFiles);
    
    const classification = this.classify(changedFiles, languages, sensitiveFiles);
    const complexity = this.calculateComplexity(totalFiles, additions, deletions, sensitiveFiles.length);
    const riskScore = this.calculateRisk(complexity, sensitiveFiles.length, classification);

    const priorityFiles = [...sensitiveFiles];
    // Add files with many changes to priority
    changedFiles.forEach(f => {
      if (f.changes > 500 && !priorityFiles.includes(f.filename)) {
        priorityFiles.push(f.filename);
      }
    });

    console.info(`[TriageAgent] Completed analysis: Risk ${riskScore}, Complexity ${complexity}`);

    return {
      summary: `Analyzed ${totalFiles} files with ${additions} additions and ${deletions} deletions.`,
      riskScore,
      complexity,
      classification,
      languages,
      frameworks: [], // Naive implementation for now, would need deeper file scanning
      priorityFiles,
      sensitiveFiles,
      recommendedReviewStrategy: this.determineStrategy(riskScore, complexity),
    };
  }

  private detectSensitiveFiles(files: ChangedFile[]): string[] {
    return files
      .map(f => f.filename)
      .filter(filename => this.SENSITIVE_PATTERNS.some(regex => regex.test(filename)));
  }

  private detectLanguages(files: ChangedFile[]): string[] {
    const langs = new Set<string>();
    files.forEach(f => {
      const ext = f.filename.slice((Math.max(0, f.filename.lastIndexOf(".")) || Infinity));
      if (this.LANGUAGE_MAP[ext]) {
        langs.add(this.LANGUAGE_MAP[ext]);
      }
    });
    return Array.from(langs);
  }

  private calculateStats(files: ChangedFile[]) {
    return files.reduce((acc, f) => {
      acc.additions += f.additions;
      acc.deletions += f.deletions;
      acc.totalFiles += 1;
      return acc;
    }, { additions: 0, deletions: 0, totalFiles: 0 });
  }

  private classify(files: ChangedFile[], languages: string[], sensitiveFiles: string[]): PRClassification[] {
    const classes = new Set<PRClassification>();
    
    // Dependency changes
    if (sensitiveFiles.some(f => f.includes('package.json') || f.includes('lock') || f.includes('requirements.txt'))) {
      classes.add("Dependency Update");
    }

    // Config changes
    if (sensitiveFiles.some(f => f.includes('config/') || f.includes('.env') || f.includes('docker') || f.includes('workflows'))) {
      classes.add("Configuration Change");
    }
    
    // Security changes
    if (sensitiveFiles.some(f => f.includes('auth/') || f.includes('security/'))) {
      classes.add("Security Related");
    }

    const hasSource = files.some(f => f.filename.match(/\.(ts|js|py|java|go|rs|cs)$/));
    const hasTests = files.some(f => f.filename.includes('test') || f.filename.includes('spec'));
    const hasDocs = files.some(f => f.filename.match(/\.(md|mdx|txt)$/));

    if (hasTests && !hasSource) {
      classes.add("Test Only");
    } else if (hasDocs && !hasSource) {
      classes.add("Documentation");
    } else if (hasSource) {
      classes.add("Feature"); // Default fallback, deeper LLM analysis would differentiate Bug Fix / Refactor
    }

    if (classes.size === 0) classes.add("Feature");
    if (classes.size > 2) classes.add("Mixed");

    return Array.from(classes);
  }

  private calculateComplexity(filesCount: number, additions: number, deletions: number, sensitiveCount: number): PRComplexity {
    const totalChanges = additions + deletions;
    if (filesCount > 50 || totalChanges > 1000 || sensitiveCount > 5) return "CRITICAL";
    if (filesCount > 20 || totalChanges > 300 || sensitiveCount > 2) return "HIGH";
    if (filesCount > 5 || totalChanges > 50) return "MEDIUM";
    return "LOW";
  }

  private calculateRisk(complexity: PRComplexity, sensitiveCount: number, classification: PRClassification[]): number {
    let score = 0;
    
    if (complexity === "CRITICAL") score += 40;
    else if (complexity === "HIGH") score += 25;
    else if (complexity === "MEDIUM") score += 10;

    score += sensitiveCount * 10;

    if (classification.includes("Security Related")) score += 30;
    if (classification.includes("Dependency Update")) score += 15;
    if (classification.includes("Configuration Change")) score += 20;

    return Math.min(score, 100);
  }

  private determineStrategy(riskScore: number, complexity: PRComplexity): string {
    if (riskScore > 80 || complexity === "CRITICAL") {
      return "Deep scan required. Block merge until security and memory agents clear.";
    }
    if (riskScore > 50) {
      return "Standard scan. Pay close attention to priority files.";
    }
    return "Fast path. Focus on code quality and standard linting.";
  }
}

export const triageAgent = new TriageAgent();
