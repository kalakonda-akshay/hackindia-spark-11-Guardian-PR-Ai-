# Agent Interface Definitions

This file defines the logical interfaces for each Mutagent agent. It is documentation only.

## Shared envelope types

### ReviewContext

Input fields:
- `repository`
- `pullRequestNumber`
- `pullRequestUrl?`
- `diffSummary?`
- `changedFiles`
- `metadata?`

### AgentEvent

Common fields:
- `type`
- `agentId`
- `reviewId`
- `timestamp`
- `payload`

### AgentError

Common fields:
- `code`
- `message`
- `recoverable`
- `sourceAgent`
- `details?`

## Orchestrator Agent

Input types:
- `ReviewContext`
- webhook metadata
- prior agent outputs

Output types:
- `WorkflowPlan`
- `AgentRouting`
- `ReviewStatus`

Events:
- `review.received`
- `agent.routed`
- `workflow.paused`
- `workflow.completed`

Errors:
- `missing.review.context`
- `routing.conflict`
- `agent.timeout`

Dependencies:
- Triage Agent
- Context Agent
- Security Agent
- Dependency Intelligence Agent
- Review Memory Agent
- Reporter Agent
- Evaluation Agent

## Triage Agent

Input types:
- `ReviewContext`
- `FileList`
- `DiffSummary`

Output types:
- `TriageResult`
- `RiskProfile`
- `RoutingHints`

Events:
- `triage.started`
- `triage.completed`
- `triage.requires.context`

Errors:
- `insufficient.diff`
- `unclear.scope`

Dependencies:
- Orchestrator Agent

## Context Agent

Input types:
- `TriageResult`
- `ReviewContext`
- `RepositorySnapshot`

Output types:
- `ContextBundle`
- `RelevantReferences`
- `MissingContextReport`

Events:
- `context.collection.started`
- `context.collection.completed`
- `context.missing`

Errors:
- `repository.structure.unknown`
- `context.window.too.small`

Dependencies:
- Orchestrator Agent
- Triage Agent

## Security Agent

Input types:
- `ContextBundle`
- `DiffHunks`
- `RiskProfile`

Output types:
- `SecurityFindings`
- `SeveritySummary`
- `ExploitabilityNotes`

Events:
- `security.scan.started`
- `security.finding.detected`
- `security.scan.completed`

Errors:
- `insufficient.evidence`
- `unsupported.vulnerability.claim`

Dependencies:
- Context Agent

## Dependency Intelligence Agent

Input types:
- `ManifestDiff`
- `LockfileDiff`
- `ContextBundle`

Output types:
- `DependencyRiskReport`
- `CompatibilityNotes`
- `SupplyChainSignals`

Events:
- `dependency.scan.started`
- `dependency.risk.detected`
- `dependency.scan.completed`

Errors:
- `package.metadata.missing`
- `dependency.scope.unclear`

Dependencies:
- Context Agent

## Review Memory Agent

Input types:
- `ContextBundle`
- `ReviewHistory`
- `RepositoryConventions`

Output types:
- `MemorySummary`
- `RecurringPatternReport`
- `HistoricalWarnings`

Events:
- `memory.lookup.started`
- `memory.hit`
- `memory.lookup.completed`

Errors:
- `memory.source.unavailable`
- `memory.signal.stale`

Dependencies:
- Context Agent
- History data source

## Reporter Agent

Input types:
- `SecurityFindings`
- `DependencyRiskReport`
- `MemorySummary`
- `ContextBundle`

Output types:
- `ReviewComment`
- `FindingDigest`
- `FollowUpChecklist`

Events:
- `report.compose.started`
- `report.compose.completed`
- `report.conflict.detected`

Errors:
- `conflicting.findings`
- `empty.report`

Dependencies:
- Security Agent
- Dependency Intelligence Agent
- Review Memory Agent

## Evaluation Agent

Input types:
- `ReviewComment`
- `SpecialistOutputs`
- `WorkflowTrace`

Output types:
- `EvaluationVerdict`
- `QualityGaps`
- `OptimizationSignals`

Events:
- `evaluation.started`
- `evaluation.passed`
- `evaluation.failed`
- `evaluation.inconclusive`

Errors:
- `missing.coverage`
- `incomplete.trace`
- `unsupported.pass`

Dependencies:
- Reporter Agent
- All specialist outputs

