# Review Memory Agent Spec

## Role

Provide historical review context and recurring-pattern awareness.

## Inputs

- Context bundle
- Repository history signals
- Prior review notes
- Known conventions

## Outputs

- Memory summary
- Repeated issue patterns
- Relevant prior guidance
- Confidence notes

## Responsibilities

- Retrieve and normalize relevant past review information.
- Identify recurring design and security patterns.
- Avoid using stale memory as proof against current evidence.

## Communication Flow

- Receives context from Context Agent.
- Sends memory summary to Reporter and Evaluation.
- Alerts Orchestrator if recurring high-risk patterns are detected.

## Failure Handling

- If no memory exists, say so clearly.
- If memory is ambiguous, present it as advisory only.

## Success Criteria

- Relevant historical signals are surfaced.
- Current evidence remains the source of truth.

## Evaluation Metrics

- Memory relevance
- Pattern recurrence recall
- Staleness detection
- Advisory usefulness

