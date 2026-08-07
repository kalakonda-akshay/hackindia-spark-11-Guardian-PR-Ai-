# Backend Architecture Pack

This directory contains the build-phase architecture for the GitHub PR Security & Code Review Agent.

## Source of truth

- `agentspec.yaml` is final and must not be regenerated.
- The existing agent architecture is approved and must remain intact.

## What this build phase adds

- Backend folder structure for a Node.js + TypeScript + Express implementation
- Agent documentation for all eight Mutagent agents
- Interface definitions for inputs, outputs, events, errors, and dependencies
- API contract design
- Implementation roadmap

## What this build phase does not add

- No production code
- No backend route handlers
- No GitHub integration logic
- No database schema migrations
- No frontend changes

## Mutagent lifecycle support

This architecture is aligned to the Mutagent lifecycle:

- `*spec`
- `*build`
- `*evaluate`
- `*diagnose`
- `*optimize`

## Target stack

- Node.js
- TypeScript
- Express
- Mutagent
- Octokit
- Google Gemini
- PostgreSQL or SQLite

## Planned backend folders

- `agents/`
- `api/`
- `github/`
- `services/`
- `database/`
- `models/`
- `prompts/`
- `utils/`
- `config/`
- `tests/`
- `traces/`

## Design boundaries

- The backend is modular and evaluation-friendly.
- Agent responsibilities remain separated.
- Contracts are explicit before implementation begins.
