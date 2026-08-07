import { ChangedFile, ParsedDiff, DiffHunk, DiffLine } from "../models/github.types.js";

/**
 * Parses GitHub unified diffs into structured, analyzable formats.
 */
export class DiffParser {
  /**
   * Parses the patch strings from a list of changed files.
   */
  public parseFiles(files: ChangedFile[]): ParsedDiff[] {
    return files.map((file) => ({
      filename: file.filename,
      status: file.status,
      hunks: file.patch ? this.parsePatch(file.patch) : [],
    }));
  }

  /**
   * Parses a unified diff patch string into distinct hunks.
   */
  private parsePatch(patch: string): DiffHunk[] {
    const lines = patch.split('\n');
    const hunks: DiffHunk[] = [];
    
    let currentHunk: DiffHunk | null = null;
    let oldLineCounter = 0;
    let newLineCounter = 0;

    for (const line of lines) {
      if (line.startsWith('@@')) {
        // Parse the hunk header (e.g., @@ -1,4 +1,5 @@)
        const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (match) {
          oldLineCounter = parseInt(match[1], 10);
          newLineCounter = parseInt(match[2], 10);
        }

        if (currentHunk) {
          hunks.push(currentHunk);
        }
        
        currentHunk = {
          header: line,
          lines: [],
        };
        continue;
      }

      if (!currentHunk) continue;

      let type: DiffLine['type'] = 'context';
      let oldLineNumber: number | undefined = undefined;
      let newLineNumber: number | undefined = undefined;

      if (line.startsWith('+')) {
        type = 'add';
        newLineNumber = newLineCounter++;
      } else if (line.startsWith('-')) {
        type = 'remove';
        oldLineNumber = oldLineCounter++;
      } else {
        // Context or empty line
        oldLineNumber = oldLineCounter++;
        newLineNumber = newLineCounter++;
      }

      currentHunk.lines.push({
        type,
        content: line,
        oldLineNumber,
        newLineNumber,
      });
    }

    if (currentHunk) {
      hunks.push(currentHunk);
    }

    return hunks;
  }
}

export const diffParser = new DiffParser();
