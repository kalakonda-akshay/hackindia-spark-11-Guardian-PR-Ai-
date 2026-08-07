export type VulnerabilitySeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface Package {
  name: string;
  currentVersion: string;
  latestVersion?: string;
  manager: "npm" | "yarn" | "pnpm" | "pip" | "maven" | "gradle" | "cargo" | "go";
}

export interface Vulnerability {
  packageName: string;
  cve?: string;
  severity: VulnerabilitySeverity;
  description: string;
  recommendation: string;
}

export interface DependencyResult {
  analyzedFiles: string[];
  packagesFound: number;
  vulnerabilities: Vulnerability[];
  outdatedPackages: Package[];
  summary: string;
  riskScore: number; // 0-100
}
