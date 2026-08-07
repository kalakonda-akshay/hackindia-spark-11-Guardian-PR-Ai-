# Evaluation Agent Spec

## Role

Judge the review output and workflow quality.

## Inputs

- Reporter output
- Specialist outputs
- Context bundle
- Triage summary
- Workflow trace

## Outputs

- Evaluation result
- Pass/fail status
- Quality gaps
- Optimization signals

## Responsibilities

- Check whether the review meets the success criteria.
- Identify missing coverage, weak evidence, or formatting issues.
- Produce outputs that can feed diagnose and optimize loops.

## Communication Flow

- Receives final review from Reporter.
- Sends evaluation result to Orchestrator and lifecycle tooling.
- Emits improvement signals for diagnose and optimize.

## Failure Handling

- If the review is incomplete, fail explicitly and explain why.
- If evidence is ambiguous, mark the evaluation as inconclusive rather than passing it.

## Success Criteria

- The decision to pass or fail is well-supported.
- Failures produce useful remediation signals.

## Evaluation Metrics

- Coverage completeness
- Evidence quality
- Decision consistency
- Optimization value

