# Triage Agent

## Purpose

Classify the pull request quickly so the rest of the system can focus the review where it matters most.

## Responsibilities

- Determine review scope and risk level.
- Highlight sensitive areas and change types.
- Recommend routing emphasis for later agents.

## Inputs

- PR diff summary
- Changed files
- Commit metadata
- Repository context hints

## Outputs

- Risk classification
- Change type classification
- Routing hints
- Triage notes

## Communication

- Receives the PR packet from Orchestrator.
- Sends classification back to Orchestrator and Context.

## Success Criteria

- High-risk changes are identified.
- Routing is unambiguous.
- Scope is concise and conservative.

