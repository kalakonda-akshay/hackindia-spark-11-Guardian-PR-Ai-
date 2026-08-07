# Event Taxonomy

This file defines the shared event stream for the backend.

## Lifecycle events

- `review.received`
- `workflow.started`
- `workflow.completed`
- `workflow.failed`

## Agent events

- `triage.started`
- `triage.completed`
- `context.collection.started`
- `context.collection.completed`
- `security.scan.started`
- `security.scan.completed`
- `dependency.scan.started`
- `dependency.scan.completed`
- `memory.lookup.started`
- `memory.lookup.completed`
- `report.compose.started`
- `report.compose.completed`
- `evaluation.started`
- `evaluation.passed`
- `evaluation.failed`

## Coordination events

- `agent.routed`
- `workflow.paused`
- `workflow.resumed`
- `workflow.escalated`

## Delivery events

- `github.comment.created`
- `dashboard.updated`

