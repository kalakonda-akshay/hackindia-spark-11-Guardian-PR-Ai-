import { githubClient } from "./client.js";
import { PullRequest, Repository, ChangedFile } from "../models/github.types.js";

/**
 * Service to encapsulate GitHub API interactions using Octokit.
 */
export class RepositoryService {
  /**
   * Fetches metadata for a specific repository.
   */
  async getRepository(owner: string, repo: string): Promise<Repository> {
    const { data } = await githubClient.rest.repos.get({
      owner,
      repo,
    });
    
    return {
      id: data.id,
      name: data.name,
      full_name: data.full_name,
      owner: {
        login: data.owner.login,
        id: data.owner.id,
      },
      html_url: data.html_url,
    };
  }

  /**
   * Fetches pull request details.
   */
  async getPullRequest(owner: string, repo: string, pullNumber: number): Promise<PullRequest> {
    const { data } = await githubClient.rest.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    });

    return {
      id: data.id,
      number: data.number,
      title: data.title,
      body: data.body,
      state: data.state as PullRequest['state'],
      html_url: data.html_url,
      diff_url: data.diff_url,
      base: {
        ref: data.base.ref,
        sha: data.base.sha,
      },
      head: {
        ref: data.head.ref,
        sha: data.head.sha,
      },
      user: {
        login: data.user.login,
        id: data.user.id,
      }
    };
  }

  /**
   * Fetches files changed in a pull request.
   */
  async getChangedFiles(owner: string, repo: string, pullNumber: number): Promise<ChangedFile[]> {
    // Pagination might be needed for large PRs
    const { data } = await githubClient.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
      per_page: 100,
    });

    return data.map((file) => ({
      filename: file.filename,
      status: file.status as ChangedFile['status'],
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      patch: file.patch,
      previous_filename: file.previous_filename,
    }));
  }

  /**
   * Fetches commits associated with a pull request.
   */
  async getCommits(owner: string, repo: string, pullNumber: number) {
    const { data } = await githubClient.rest.pulls.listCommits({
      owner,
      repo,
      pull_number: pullNumber,
      per_page: 100,
    });
    
    return data.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author?.name || 'unknown',
      url: commit.html_url
    }));
  }

  /**
   * Fetches existing review comments on a pull request.
   */
  async getReviewComments(owner: string, repo: string, pullNumber: number) {
    const { data } = await githubClient.rest.pulls.listReviewComments({
      owner,
      repo,
      pull_number: pullNumber,
      per_page: 100,
    });

    return data.map(comment => ({
      id: comment.id,
      body: comment.body,
      path: comment.path,
      line: comment.line,
      user: comment.user.login,
      created_at: comment.created_at,
    }));
  }
}

export const repositoryService = new RepositoryService();
