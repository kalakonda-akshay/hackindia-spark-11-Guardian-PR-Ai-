# Mutagent GitHub PR Security & Code Review Agent Architecture

## High-Level Data Flow

```mermaid
graph TD
    %% External
    GH[GitHub Webhook] --> |push/pull_request| API[API Gateway / Ingress]

    %% Core System
    subgraph "Mutagent AI Backend"
        API --> ORCH[Orchestrator Agent]
        ORCH --> |Session State| BUS((Event Message Bus))
        
        %% Agents
        BUS --> |request:triage| TR[Triage Agent]
        TR --> |TriageResult| BUS
        
        BUS --> |request:context| CTX[Context Agent]
        CTX --> |ContextResult| BUS
        
        BUS --> |request:security| SEC[Security Agent]
        SEC -.-> |Prompt| LLM[Google Gemini 2.5 Pro]
        SEC --> |SecurityResult| BUS
        
        BUS --> |request:dependency| DEP[Dependency Agent]
        DEP --> |DependencyResult| BUS
        
        BUS --> |request:memory| MEM[Review Memory Agent]
        MEM -.-> |Vector Search| VDB[(Knowledge DB)]
        MEM --> |MemoryResult| BUS
        
        BUS --> |request:reporter| REP[Reporter Agent]
        REP --> |ReporterResult| BUS
        
        BUS --> |request:evaluation| EVAL[Evaluation Agent]
        EVAL --> |EvaluationReport| BUS
    end

    %% Outputs
    REP --> |Post Comment| GH_API[GitHub PR API]
    ORCH --> |Serve Metrics| DASH[React Frontend Dashboard]
```

## Agent Responsibilities

1. **Orchestrator**: Acts as the central state machine. Transitions sessions through statuses (`CREATED` -> `TRIAGE_RUNNING` -> ... -> `COMPLETED`).
2. **Triage**: Determines PR complexity, risk, and language makeup instantly.
3. **Context**: Explores neighboring files, detects frameworks, and builds the architectural map.
4. **Security**: Deep scans for vulnerabilities using static regex engines and semantic Gemini AI reviews.
5. **Dependency**: Catches vulnerable, outdated, or malicious packages from manifest files.
6. **Review Memory**: Recalls past organizational decisions (false positives, specific strict team standards).
7. **Reporter**: Generates a beautiful Markdown executive summary for the PR comment.
8. **Evaluation**: Mutagent-native agent that continuously monitors pipeline precision and recall.
