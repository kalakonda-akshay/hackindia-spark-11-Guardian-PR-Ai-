# Reporter Agent

## Purpose

Transform specialist findings into a concise, developer-facing review comment.

## Responsibilities

- Merge findings from all specialist agents.
- Deduplicate overlapping observations.
- Preserve severity, evidence, and remediation guidance.

## Inputs

- Security findings
- Dependency findings
- Memory notes
- Context bundle

## Outputs

- Final review comment
- Summary of findings
- Follow-up checklist

## Communication

- Receives specialist outputs from downstream agents.
- Sends the final review artifact to Evaluation.

## Success Criteria

- The final comment is clear and actionable.
- Findings are not lost during synthesis.

