# Implementation Roadmap

This roadmap breaks the build into milestones. It is documentation only.

## Milestone 1 - Backend Setup

Goal:
- Establish the Node.js + TypeScript backend workspace structure.

Files:
- `backend/package.json`
- `backend/tsconfig.json`
- `backend/README.md`
- `backend/api/`
- `backend/github/`
- `backend/services/`
- `backend/database/`
- `backend/models/`
- `backend/utils/`
- `backend/config/`
- `backend/tests/`

Dependencies:
- Approved `agentspec.yaml`
- Approved agent architecture

Expected Output:
- A structured backend workspace ready for implementation.

## Milestone 2 - GitHub Integration

Goal:
- Define webhook ingestion and GitHub event normalization.

Files:
- `backend/github/README.md`
- `backend/api/README.md`
- `backend/models/event-types.md`

Dependencies:
- Milestone 1

Expected Output:
- Webhook contract and GitHub payload design.

## Milestone 3 - Diff Parser

Goal:
- Define how PR diffs are categorized and segmented for review.

Files:
- `backend/services/README.md`
- `backend/models/agent-contracts.md`

Dependencies:
- Milestone 2

Expected Output:
- Diff parsing interface and file classification contract.

## Milestone 4 - Orchestrator

Goal:
- Define orchestration flow and agent handoff boundaries.

Files:
- `backend/agents/orchestrator/README.md`
- `backend/models/agent-contracts.md`

Dependencies:
- Milestones 1-3

Expected Output:
- Orchestration contract for the review pipeline.

## Milestone 5 - Triage Agent

Goal:
- Define scope, risk, and routing classification behavior.

Files:
- `backend/agents/triage/README.md`
- `backend/models/agent-contracts.md`

Dependencies:
- Milestone 4

Expected Output:
- Triage contract and routing hints.

## Milestone 6 - Context Agent

Goal:
- Define evidence collection and context bundling.

Files:
- `backend/agents/context/README.md`
- `backend/models/agent-contracts.md`

Dependencies:
- Milestone 5

Expected Output:
- Context bundle contract.

## Milestone 7 - Security Agent

Goal:
- Define security analysis interfaces and findings format.

Files:
- `backend/agents/security/README.md`
- `backend/models/error-types.md`

Dependencies:
- Milestone 6

Expected Output:
- Security findings contract.

## Milestone 8 - Dependency Intelligence Agent

Goal:
- Define dependency risk and supply-chain review interfaces.

Files:
- `backend/agents/dependency/README.md`
- `backend/models/dependency-map.md`

Dependencies:
- Milestone 6

Expected Output:
- Dependency review contract.

## Milestone 9 - Review Memory Agent

Goal:
- Define history lookup and recurring-pattern signaling.

Files:
- `backend/agents/review-memory/README.md`
- `backend/models/agent-contracts.md`

Dependencies:
- Milestone 6

Expected Output:
- Memory retrieval contract.

## Milestone 10 - Reporter

Goal:
- Define synthesis and final review comment formatting.

Files:
- `backend/agents/reporter/README.md`
- `backend/api/README.md`

Dependencies:
- Milestones 7-9

Expected Output:
- Reporter contract and final comment model.

## Milestone 11 - Evaluation

Goal:
- Define evaluation, verdict, and quality gating behavior.

Files:
- `backend/agents/evaluation/README.md`
- `backend/models/error-types.md`

Dependencies:
- Milestone 10

Expected Output:
- Evaluation contract and pass/fail criteria.

## Milestone 12 - Dashboard Integration

Goal:
- Define what the dashboard should surface from the review lifecycle.

Files:
- `backend/api/README.md`
- `backend/models/event-types.md`

Dependencies:
- Milestone 11

Expected Output:
- Dashboard event and review visibility contract.

## Milestone 13 - Testing

Goal:
- Define the test strategy for agents, API contracts, and workflow boundaries.

Files:
- `backend/tests/README.md`

Dependencies:
- Milestones 1-12

Expected Output:
- Test plan covering unit, contract, and lifecycle validation.

## Milestone 14 - Optimization

Goal:
- Define the improvement loop for diagnosis and iteration.

Files:
- `backend/models/error-types.md`
- `backend/models/event-types.md`

Dependencies:
- Evaluation artifacts and operational traces

Expected Output:
- Optimization loop and diagnosis handoff plan.

