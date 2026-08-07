# Triage Agent Spec

## Role

Classify the PR and determine the review strategy.

## Inputs

- PR diff summary
- Changed file list
- Commit metadata
- Repository conventions if available

## Outputs

- Risk classification
- Change-type classification
- Priority signals
- Routing recommendations

## Responsibilities

- Separate low-risk cosmetic changes from behavior-changing changes.
- Flag high-risk patterns such as auth, secrets, injection surfaces, and build scripts.
- Provide context requests to the Orchestrator when the diff is too large or incomplete.

## Communication Flow

- Receives PR packet from Orchestrator.
- Sends classification summary back to Orchestrator.
- Emits routing hints to Context, Security, and Dependency Intelligence agents.

## Failure Handling

- If diff data is incomplete, report the missing scope.
- If classification is uncertain, mark it as uncertain rather than guessing.

## Success Criteria

- Accurate risk classification.
- Clear specialist routing.
- Minimal false negatives on high-risk changes.

## Evaluation Metrics

- Routing precision
- Risk detection recall
- Triage latency
- Uncertainty honesty

