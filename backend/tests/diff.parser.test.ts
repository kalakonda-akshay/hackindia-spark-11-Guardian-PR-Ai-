import { describe, it, expect } from "vitest";
import { diffParser } from "../services/diff.parser.js";
import { ChangedFile } from "../models/github.types.js";

describe("DiffParser", () => {
  it("should parse a valid unified diff patch correctly", () => {
    const mockPatch = `@@ -1,3 +1,4 @@
-const old = true;
+const old = false;
+const newVar = 1;
 context line`;

    const files: ChangedFile[] = [
      {
        filename: "test.js",
        status: "modified",
        additions: 2,
        deletions: 1,
        changes: 3,
        patch: mockPatch,
      },
    ];

    const result = diffParser.parseFiles(files);

    expect(result).toHaveLength(1);
    expect(result[0].filename).toBe("test.js");
    expect(result[0].status).toBe("modified");
    expect(result[0].hunks).toHaveLength(1);

    const hunk = result[0].hunks[0];
    expect(hunk.header).toBe("@@ -1,3 +1,4 @@");
    expect(hunk.lines).toHaveLength(4);

    expect(hunk.lines[0].type).toBe("remove");
    expect(hunk.lines[0].oldLineNumber).toBe(1);
    expect(hunk.lines[0].newLineNumber).toBeUndefined();

    expect(hunk.lines[1].type).toBe("add");
    expect(hunk.lines[1].oldLineNumber).toBeUndefined();
    expect(hunk.lines[1].newLineNumber).toBe(1);
    
    expect(hunk.lines[2].type).toBe("add");
    expect(hunk.lines[2].newLineNumber).toBe(2);

    expect(hunk.lines[3].type).toBe("context");
    expect(hunk.lines[3].oldLineNumber).toBe(2);
    expect(hunk.lines[3].newLineNumber).toBe(3);
  });

  it("should handle files with no patch (e.g., binary files or huge diffs)", () => {
    const files: ChangedFile[] = [
      {
        filename: "image.png",
        status: "added",
        additions: 0,
        deletions: 0,
        changes: 0,
        patch: undefined,
      },
    ];

    const result = diffParser.parseFiles(files);
    
    expect(result).toHaveLength(1);
    expect(result[0].hunks).toHaveLength(0);
  });
});
