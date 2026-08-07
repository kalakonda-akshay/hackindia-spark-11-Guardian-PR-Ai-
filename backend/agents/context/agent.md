# Context Agent Spec

## Role

Assemble the context package for the review pipeline.

## Inputs

- Triage summary
- Changed files
- Diff hunks
- Repository structure

## Outputs

- Context bundle
- Relevant file references
- Conventions summary
- Missing-context list

## Responsibilities

- Expand from changed files to nearby code and related definitions.
- Preserve direct links between claims and file evidence.
- Avoid unnecessary broad scans when a narrow context window is sufficient.

## Communication Flow

- Receives routing hints from Triage.
- Returns a context bundle to Security, Dependency Intelligence, Review Memory, and Reporter.
- Escalates unresolved context gaps to Orchestrator.

## Failure Handling

- If context cannot be localized, explain why and provide the minimal safe fallback.
- If the repository layout is unclear, stop and request structure data.

## Success Criteria

- Relevant code is surfaced with evidence.
- No important dependency or surrounding-file context is omitted.

## Evaluation Metrics

- Context precision
- Coverage of impacted code
- Evidence traceability
- False-context rate

