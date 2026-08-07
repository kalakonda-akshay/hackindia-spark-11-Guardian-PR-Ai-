import { messageBus } from "../../services/message-bus.js";
import { AgentRequest, AgentResponse } from "../../models/orchestrator.types.js";
import { ContextResult, RepositorySummary, CodeContext } from "../../models/context.types.js";
import { repositoryService } from "../../github/repository.service.js";
import { ChangedFile } from "../../models/github.types.js";
import { TriageResult } from "../../models/triage.types.js";

/**
 * Context Agent
 * Enriches the PR with repository intelligence for downstream specialists.
 */
export class ContextAgent {
  // Simple in-memory cache for repository metadata to optimize performance
  private repoCache: Map<string, any> = new Map();

  constructor() {
    this.startListening();
  }

  private startListening() {
    messageBus.subscribeToRequest("context", async (req: AgentRequest) => {
      try {
        console.info(`[ContextAgent] Starting context collection for session ${req.sessionId}`);
        const result = await this.run(req);
        
        const response: AgentResponse<ContextResult> = {
          sessionId: req.sessionId,
          agentId: "context",
          status: "SUCCESS",
          data: result,
        };
        messageBus.publishResponse("context", response);
      } catch (error: any) {
        console.error(`[ContextAgent] Failed context collection for session ${req.sessionId}:`, error);
        messageBus.publishResponse("context", {
          sessionId: req.sessionId,
          agentId: "context",
          status: "FAILED",
          error: error.message,
        });
      }
    });
  }

  public async run(req: AgentRequest): Promise<ContextResult> {
    const triage: TriageResult = req.payload?.triage;
    const reviewRequest = req.payload?.reviewRequest;
    
    // For unit tests, we might pass simulated files directly
    const changedFiles: ChangedFile[] = req.payload?.changedFiles || [];

    const owner = reviewRequest?.repository?.owner?.login || "mockOwner";
    const repo = reviewRequest?.repository?.name || "mockRepo";
    const repoKey = `${owner}/${repo}`;

    let repoFiles: string[] = [];
    if (!this.repoCache.has(repoKey) && reviewRequest) {
      // In production, fetch repository tree via Octokit
      // const tree = await repositoryService.getTree(owner, repo);
      // repoFiles = tree.map(t => t.path);
      // For now, simulate caching
      repoFiles = ["package.json", "src/index.ts", "src/auth/jwt.ts", "docker-compose.yml"];
      this.repoCache.set(repoKey, repoFiles);
      console.info(`[ContextAgent] Cache miss for ${repoKey}. Fetched repository tree.`);
    } else {
      repoFiles = this.repoCache.get(repoKey) || [];
      if (repoFiles.length > 0) {
         console.info(`[ContextAgent] Cache hit for ${repoKey}.`);
      }
    }

    // Combine changed files and repo tree for analysis
    const allKnownFiles = [...new Set([...changedFiles.map(f => f.filename), ...repoFiles])];

    const frameworks = this.detectFrameworks(allKnownFiles);
    const authentication = this.detectAuth(allKnownFiles);
    const architecture = this.detectArchitecture(allKnownFiles);
    const database = this.detectDatabase(allKnownFiles);

    const codeContext: CodeContext[] = changedFiles.map(file => this.buildCodeContext(file, allKnownFiles));

    return {
      repositorySummary: {
        languageStats: {}, // Would be fetched from GitHub language API
        packageManager: this.detectPackageManager(allKnownFiles),
        buildSystem: "Webpack", // Simulated
        testFramework: this.detectTestFramework(allKnownFiles),
        linter: "ESLint", // Simulated
        formatter: "Prettier" // Simulated
      },
      architecture,
      frameworks,
      authentication,
      authorization: ["Role-Based Access Control (Simulated)"],
      database,
      middleware: ["Express Middleware (Simulated)"],
      relatedFiles: [], // Would use vector search or import graph mapping
      relatedCommits: [], // Would fetch from GitHub
      relevantConfigs: allKnownFiles.filter(f => f.includes('config') || f.includes('.json') || f.includes('.yaml')),
      codeContext,
      securityContext: [
        authentication.length > 0 ? "Auth logic detected." : "No known auth detected.",
        database.length > 0 ? "Database access detected." : "No DB access detected."
      ]
    };
  }

  private detectFrameworks(files: string[]): string[] {
    const frameworks = new Set<string>();
    
    // Simplistic file-name based detection (in reality, read package.json / pom.xml)
    if (files.some(f => f.includes('next.config.js') || f.includes('pages/') || f.includes('app/'))) frameworks.add("Next.js");
    if (files.some(f => f.includes('package.json'))) {
       // We can't easily read file contents here without an API call, so we guess by structure
       // In a real agent, we'd fetch the package.json content.
       if (files.some(f => f.includes('express'))) frameworks.add("Express"); // Simulated
    }
    if (files.some(f => f.includes('pom.xml') || f.includes('build.gradle'))) {
       if (files.some(f => f.includes('src/main/java'))) frameworks.add("Spring Boot");
    }
    if (files.some(f => f.includes('requirements.txt') || f.includes('Pipfile') || f.includes('manage.py'))) {
       if (files.some(f => f.includes('manage.py'))) frameworks.add("Django");
       else frameworks.add("Flask"); // generic python fallback for test
    }
    if (files.some(f => f.includes('main.go'))) {
       frameworks.add("Go Fiber"); // naive fallback
    }

    return Array.from(frameworks);
  }

  private detectAuth(files: string[]): string[] {
    const auth = new Set<string>();
    if (files.some(f => f.includes('jwt') || f.includes('token'))) auth.add("JWT");
    if (files.some(f => f.includes('oauth'))) auth.add("OAuth");
    if (files.some(f => f.includes('session'))) auth.add("Session Authentication");
    if (files.some(f => f.includes('firebase'))) auth.add("Firebase Auth");
    if (files.some(f => f.includes('clerk'))) auth.add("Clerk");
    if (files.some(f => f.includes('next-auth'))) auth.add("NextAuth");
    return Array.from(auth);
  }

  private detectArchitecture(files: string[]): string[] {
    const arch = new Set<string>();
    if (files.some(f => f.includes('controllers/') && f.includes('models/') && f.includes('views/'))) arch.add("MVC");
    if (files.some(f => f.includes('services/') && f.includes('repositories/'))) arch.add("Layered");
    if (files.some(f => f.includes('docker-compose') && files.some(f2 => f2.includes('services/')))) arch.add("Microservices");
    if (arch.size === 0) arch.add("Monolith");
    return Array.from(arch);
  }

  private detectDatabase(files: string[]): string[] {
    const db = new Set<string>();
    if (files.some(f => f.includes('prisma'))) db.add("Prisma ORM");
    if (files.some(f => f.includes('typeorm'))) db.add("TypeORM");
    if (files.some(f => f.includes('mongoose'))) db.add("Mongoose/MongoDB");
    if (files.some(f => f.includes('hibernate'))) db.add("Hibernate");
    if (files.some(f => f.includes('models.py'))) db.add("Django ORM");
    return Array.from(db);
  }

  private detectPackageManager(files: string[]): string {
    if (files.some(f => f.includes('pnpm-lock.yaml'))) return "pnpm";
    if (files.some(f => f.includes('yarn.lock'))) return "yarn";
    if (files.some(f => f.includes('package-lock.json'))) return "npm";
    if (files.some(f => f.includes('pom.xml'))) return "maven";
    if (files.some(f => f.includes('build.gradle'))) return "gradle";
    if (files.some(f => f.includes('requirements.txt'))) return "pip";
    return "unknown";
  }

  private detectTestFramework(files: string[]): string {
    if (files.some(f => f.includes('jest.config'))) return "Jest";
    if (files.some(f => f.includes('vitest.config'))) return "Vitest";
    if (files.some(f => f.includes('pytest'))) return "PyTest";
    if (files.some(f => f.includes('pom.xml'))) return "JUnit";
    return "unknown";
  }

  private buildCodeContext(file: ChangedFile, allFiles: string[]): CodeContext {
    const parts = file.filename.split('/');
    const parentDir = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
    
    return {
      filename: file.filename,
      parentDir,
      neighboringFiles: allFiles.filter(f => f !== file.filename && f.startsWith(parentDir) && f.split('/').length === parts.length),
      importedModules: [], // Requires AST parsing
      exportedSymbols: [], // Requires AST parsing
      relatedInterfaces: [], 
      relatedClasses: [],
      relatedServices: [],
      relatedConfigs: allFiles.filter(f => f.includes('config'))
    };
  }
}

export const contextAgent = new ContextAgent();
