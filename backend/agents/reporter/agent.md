# Reporter Agent Spec

## Role

Synthesize all findings into a developer-ready PR comment.

## Inputs

- Security findings
- Dependency findings
- Memory notes
- Triage classification
- Context bundle

## Outputs

- Final review comment
- Summary of risks
- Recommended fixes
- Follow-up checklist

## Responsibilities

- Combine findings into a coherent report.
- Preserve attribution and severity.
- Avoid duplication and keep the output readable.

## Communication Flow

- Receives specialized findings from all analysis agents.
- Sends final output to Evaluation and then to GitHub Comment delivery.

## Failure Handling

- If source findings conflict, expose the conflict and do not hide it.
- If the final comment would be empty, explain why and report the absence of issues.

## Success Criteria

- Final report is actionable and accurate.
- Report structure matches the severity and scope of the PR.

## Evaluation Metrics

- Readability
- Actionability
- Finding preservation
- Conflict transparency

