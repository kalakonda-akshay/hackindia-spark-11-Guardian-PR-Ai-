import { SecurityFinding } from "../../models/security.types.js";
import { CodeContext } from "../../models/context.types.js";
import { geminiService } from "../../services/gemini.service.js";

/**
 * Connects to Gemini AI to perform deep semantic review of code and context,
 * detecting vulnerabilities missed by the static engine and explaining them.
 */
export class AIReviewer {
  /**
   * Reviews a single file's patch alongside its structural context.
   */
  public async reviewFile(
    filename: string, 
    patch: string, 
    context: CodeContext
  ): Promise<SecurityFinding[]> {
    const prompt = `
You are a world-class Application Security Engineer.
Review the following code changes for security vulnerabilities.
    
File: ${filename}
Code Context (Architecture, Neighbours):
${JSON.stringify(context, null, 2)}

Detect vulnerabilities such as: Broken Authentication, Authorization bypass, IDOR, SSRF, CSRF, XSS, Path Traversal, SQLi, Prototype Pollution, Logic Flaws.

Return the findings strictly as a JSON array matching this interface:
[{
  "ruleId": "AI-SEC-001",
  "title": "Short title",
  "description": "Detailed description of the vulnerability",
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO",
  "confidence": "CERTAIN" | "FIRM" | "TENTATIVE",
  "cwe": "CWE-xxx",
  "evidence": "The snippet of code causing the issue",
  "explanation": "Why this is vulnerable",
  "exploitability": "How an attacker could exploit this",
  "impact": "What is the business/technical impact",
  "suggestedFix": "How to fix it",
  "secureReplacementCode": "The secure code block"
}]

If no vulnerabilities are found, return an empty array [].
Do not wrap the response in markdown blocks like \`\`\`json. Return raw JSON.
`;

    try {
      const responseText = await geminiService.analyzeCodeDiff(patch, prompt);
      if (!responseText || responseText === "{}") return [];
      
      const findings = JSON.parse(responseText) as SecurityFinding[];
      
      // Ensure file attribution
      return findings.map(f => ({
        ...f,
        file: filename,
      }));
    } catch (error) {
      console.error(`[AIReviewer] Failed to scan file ${filename}:`, error);
      return []; // Fail open so review doesn't completely halt, or could throw to retry
    }
  }
}

export const aiReviewer = new AIReviewer();
