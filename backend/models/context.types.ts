export interface RepositorySummary {
  languageStats: Record<string, number>;
  packageManager: string;
  buildSystem: string;
  testFramework: string;
  linter: string;
  formatter: string;
}

export interface CodeContext {
  filename: string;
  parentDir: string;
  neighboringFiles: string[];
  importedModules: string[];
  exportedSymbols: string[];
  relatedInterfaces: string[];
  relatedClasses: string[];
  relatedServices: string[];
  relatedConfigs: string[];
}

export interface ContextResult {
  repositorySummary: RepositorySummary;
  architecture: string[];
  frameworks: string[];
  authentication: string[];
  authorization: string[];
  database: string[];
  middleware: string[];
  relatedFiles: string[];
  relatedCommits: any[]; // Simplified for now
  relevantConfigs: string[];
  codeContext: CodeContext[];
  securityContext: string[]; // High level flags or notes for security agent
}
