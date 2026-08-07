# Dependency Intelligence Agent Spec

## Role

Assess dependency-related risk and package change implications.

## Inputs

- Manifest diffs
- Lockfile diffs
- Context bundle
- Triage signals

## Outputs

- Dependency risk summary
- Package upgrade notes
- Compatibility concerns
- Supply-chain warnings

## Responsibilities

- Review version changes and package additions.
- Flag unexpected dependency introductions.
- Highlight lockfile-only changes that may still be risky.

## Communication Flow

- Receives dependency-focused context from Context Agent.
- Sends findings to Reporter and Evaluation.

## Failure Handling

- If package metadata is unavailable, state the limitation.
- If dependency intent is unclear, ask for clarification rather than inferring.

## Success Criteria

- Relevant dependency risks are surfaced early.
- Noise from harmless version bumps is minimized.

## Evaluation Metrics

- Suspicious-package recall
- Compatibility accuracy
- Noise rate
- Follow-up completeness

