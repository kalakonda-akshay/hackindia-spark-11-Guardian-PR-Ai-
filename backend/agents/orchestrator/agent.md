# Orchestrator Agent Spec

## Role

Central workflow coordinator for GitHub PR security and code review.

## Inputs

- Pull request metadata
- Repository context
- Event payload or review request
- Prior agent outputs

## Outputs

- Ordered work plan
- Specialist agent handoffs
- Workflow status
- Escalation flags

## Responsibilities

- Route the review through the agent pipeline.
- Maintain execution order.
- Resolve missing dependencies between agent outputs.
- Decide when to stop and request more context.

## Communication Flow

- Receives PR event from GitHub integration.
- Sends triage task to Triage Agent.
- Receives triage summary and forwards context request to Context Agent.
- Dispatches analysis requests to Security, Dependency Intelligence, and Review Memory Agents.
- Sends consolidated findings to Reporter Agent.
- Sends final artifact to Evaluation Agent.

## Failure Handling

- If required PR metadata is missing, stop and request clarification.
- If a specialist agent fails, record the failure and route a fallback report.
- If the workflow order becomes inconsistent, reset to the last verified checkpoint.

## Success Criteria

- All analysis stages complete with traceable handoffs.
- Conflicts between specialist outputs are reconciled or escalated.

## Evaluation Metrics

- Handoff correctness
- Workflow completeness
- Latency to first actionable triage
- Recovery rate from partial failures

