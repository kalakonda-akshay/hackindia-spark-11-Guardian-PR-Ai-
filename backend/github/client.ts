import { Octokit } from "octokit";
import { env } from "../config/env.js";

/**
 * Initializes and exports a singleton GitHub client using Octokit.
 * Configured with authentication and basic error handling.
 */
export class GitHubClient {
  private static instance: Octokit;

  public static getInstance(): Octokit {
    if (!GitHubClient.instance) {
      GitHubClient.instance = new Octokit({
        auth: env.GITHUB_TOKEN,
        // Optional: add custom logging, request retries, or rate-limit plugins here
        log: {
          debug: (message: string) => { /* console.debug(message) */ },
          info: (message: string) => console.info(`[Octokit] ${message}`),
          warn: (message: string) => console.warn(`[Octokit] ${message}`),
          error: (message: string) => console.error(`[Octokit] ${message}`),
        },
      });
    }
    return GitHubClient.instance;
  }
}

export const githubClient = GitHubClient.getInstance();
