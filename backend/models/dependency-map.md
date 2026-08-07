# Dependency Map

This file documents the logical dependencies between backend modules and agents.

## Agent to agent

- Orchestrator depends on all specialist agents.
- Triage depends on Orchestrator.
- Context depends on Triage and Orchestrator.
- Security depends on Context.
- Dependency Intelligence depends on Context.
- Review Memory depends on Context and history data.
- Reporter depends on Security, Dependency Intelligence, and Review Memory.
- Evaluation depends on Reporter and all specialist outputs.

## Backend module to agent

- `api/` routes requests into Orchestrator.
- `github/` handles webhook normalization and GitHub payload translation.
- `services/` coordinates workflow execution and shared runtime behavior.
- `database/` stores review history and findings.
- `models/` stores contract and taxonomy documentation.
- `config/` stores environment and runtime settings.
- `utils/` stores shared helpers.

