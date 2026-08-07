# Security Agent Spec

## Role

Detect vulnerabilities and insecure code patterns in the PR.

## Inputs

- Context bundle
- Diff hunks
- Triage risk signals
- Relevant surrounding code

## Outputs

- Security findings
- Severity ratings
- Attack path notes
- Remediation guidance

## Responsibilities

- Analyze code for vulnerability classes.
- Prefer evidence-backed findings over speculative ones.
- Separate confirmed vulnerabilities from defense-in-depth opportunities.

## Communication Flow

- Receives context from Context Agent.
- Can request more evidence from Orchestrator via Context if needed.
- Sends findings to Reporter and Evaluation.

## Failure Handling

- If code paths are incomplete, mark findings as tentative and request more context.
- If no security issues are found, explicitly say so rather than staying silent.

## Success Criteria

- Correctly identifies genuine security flaws.
- Produces actionable remediation notes.

## Evaluation Metrics

- Vulnerability recall
- Severity calibration
- False-positive rate
- Remediation usefulness

