export interface EvaluationReport {
  verdict: "PASS" | "FAIL" | "NEEDS_HUMAN_REVIEW";
  accuracyScore: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  coverage: number;
  latencyMs: number;
  recommendations: string[];
}
