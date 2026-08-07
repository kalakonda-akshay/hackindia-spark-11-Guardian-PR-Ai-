export interface ReporterResult {
  markdownBody: string;
  jsonSummary: any;
  overallRiskScore: number;
  executiveSummary: string;
  securitySummary: string;
  dependencySummary: string;
}
