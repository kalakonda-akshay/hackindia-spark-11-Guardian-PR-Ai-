export interface PullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed' | 'all';
  html_url: string;
  diff_url: string;
  base: {
    ref: string;
    sha: string;
  };
  head: {
    ref: string;
    sha: string;
  };
  user: {
    login: string;
    id: number;
  };
  diff?: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
  };
  html_url: string;
}

export interface ChangedFile {
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string; // The diff hunk
  previous_filename?: string;
}

export interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffHunk {
  header: string;
  lines: DiffLine[];
}

export interface ParsedDiff {
  filename: string;
  status: ChangedFile['status'];
  hunks: DiffHunk[];
}

export interface ReviewRequest {
  repository: Repository;
  pullRequest: PullRequest;
  action: 'opened' | 'reopened' | 'synchronize' | 'review_requested';
}

export interface PullRequestReview {
  id: number;
  body: string | null;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED';
  user: {
    login: string;
    id: number;
  };
}
