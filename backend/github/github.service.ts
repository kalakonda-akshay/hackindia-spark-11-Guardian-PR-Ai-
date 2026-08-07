import { Octokit } from "octokit";
import { ReviewRequest } from "../models/github.types.js";

/**
 * Service to interact with the real GitHub API using Octokit.
 * Fetches PR metadata and code diffs for analysis.
 */
export class GitHubService {
  private octokit: Octokit;

  constructor() {
    // Falls back to unauthenticated public access if no token is provided.
    // GitHub rate limits unauthenticated requests to 60/hr.
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN || undefined
    });
  }

  /**
   * Parses a GitHub URL to extract owner, repo, and PR number.
   * e.g., https://github.com/owner/repo/pull/123
   */
  public parseUrl(url: string): { owner: string; repo: string; prNumber: number } {
    // Try to match standard PR url: https://github.com/owner/repo/pull/123
    const prMatch = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
    if (prMatch) {
      return {
        owner: prMatch[1],
        repo: prMatch[2],
        prNumber: parseInt(prMatch[3], 10)
      };
    }
    
    // Fallback: Try to match just a repo url and hardcode a PR number (e.g. 1)
    const repoMatch = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (repoMatch) {
      return {
        owner: repoMatch[1],
        repo: repoMatch[2].replace(/\.git$/, ''),
        prNumber: 1 // Default to PR #1 for demo purposes if not specified
      };
    }

    throw new Error("Invalid GitHub URL. Expected format: https://github.com/owner/repo/pull/123 or https://github.com/owner/repo");
  }

  /**
   * Fetches real PR data from GitHub and maps it to our internal ReviewRequest type.
   */
  public async fetchPullRequestData(url: string): Promise<ReviewRequest> {
    const { owner, repo, prNumber } = this.parseUrl(url);

    try {
      // 1. Fetch PR Metadata
      const { data: prData } = await this.octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
      });

      // 2. Fetch the Diff (Patch) to analyze the actual code changes
      const { data: diffData } = await this.octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
        mediaType: {
          format: "diff", // Request the raw unified diff format
        },
      });

      return {
        action: "opened",
        number: prNumber,
        repository: {
          name: repo,
          owner: { login: owner },
          full_name: `${owner}/${repo}`
        },
        pullRequest: {
          number: prNumber,
          title: prData.title,
          state: prData.state,
          head: { sha: prData.head.sha },
          base: { sha: prData.base.sha },
          diff: diffData as unknown as string
        }
      } as unknown as ReviewRequest;
    } catch (error: any) {
      console.warn(`[GitHubService] Failed to fetch real PR data, falling back to mock data. Error: ${error.message}`);
      
      // Provide a rich mock diff so the Mutagent actually has something to analyze
      const mockDiff = `
diff --git a/src/auth.ts b/src/auth.ts
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -10,5 +10,6 @@
 export function login(user, password) {
-  // TODO: hash password
-  const query = "SELECT * FROM users WHERE username='" + user + "' AND password='" + password + "'";
-  db.execute(query);
+  const token = generateToken(user);
+  localStorage.setItem('auth_token', token);
+  return token;
 }
      `;

      return {
        action: "opened",
        number: prNumber,
        repository: {
          name: repo,
          owner: { login: owner },
          full_name: `${owner}/${repo}`
        },
        pullRequest: {
          number: prNumber,
          title: "Mocked Demo PR (Fallback)",
          state: "open",
          head: { sha: "abcdef" },
          base: { sha: "123456" },
          diff: mockDiff
        }
      } as unknown as ReviewRequest;
    }
  }
}

export const githubService = new GitHubService();
