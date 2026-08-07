# GitHub PR Security & Code Review Agent
🛡️ GitHub PR Security & Code Review Agent

Show Image Show Image Show Image Show Image Show Image Show Image

A multi-agent AI platform that automatically reviews GitHub Pull Requests for security vulnerabilities, code quality, and supply-chain risk — and turns the results into executive-ready reports in real time.

📖 What Is This?

Instead of relying on a single AI prompt to review a Pull Request, this platform runs a swarm of specialized AI agents, coordinated by a central orchestrator, that each focus on one part of the review — intent, architecture, security, dependencies, history, and reporting. The agents run through Mutagent's Helix orchestrator, are powered by Google Gemini for reasoning, and persist every review in MongoDB Atlas so results can be tracked and compared over time.

The result: submit a PR, and within seconds you get a live-streamed, multi-angle security and quality analysis — not a single generic AI comment.

🤖 How It Works: The Agent Pipeline

A central Orchestrator Agent coordinates six specialist agents in sequence, aggregating their output into one final report.

Order	Agent	Role	What It Does
1	🎯 Orchestrator	The Brain	Coordinates all agents, tracks the execution pipeline and timeline, aggregates results
2	🚦 Triage	The Gatekeeper	Reads PR metadata, classifies it as Feature / Bug Fix / Security Patch, estimates severity, prioritizes what runs next
3	🏗️ Context	Repository Architect	Detects language, framework (Next.js, React, Spring Boot, Express, Node.js, etc.), and overall project architecture — so downstream agents reason with real context instead of guessing
4	🛡️ Security	Offensive Security Expert	Hybrid regex + Gemini semantic analysis for secrets, SQL injection, XSS, broken auth, insecure APIs, and command injection
5	📦 Dependency	Supply Chain Auditor	Scans package.json and lock files for vulnerable packages, typo-squatted dependencies, and known CVEs
6	🧠 Review Memory	Organizational Memory	Cross-references historical PRs to catch recurring mistakes and reduce false positives over time
7	📊 Reporter	Executive Communicator	Aggregates every agent's findings into a readable report with a 0–100 Overall Risk Score and prioritized remediation steps
8	✅ Evaluation	AI Quality Judge	Grades the Security Agent's own accuracy — flags false positives and missed vulnerabilities to improve future runs

Why this matters: giving each agent a narrow, well-defined job — instead of one large prompt — produces more accurate, explainable, and less hallucination-prone results.

🏗️ Core Infrastructure
🗄️ Persistent Storage — MongoDB Atlas

All PR reviews, agent findings, risk scores, timeline events, and evaluation results are stored in MongoDB Atlas (via Mongoose), replacing earlier in-memory storage. This means historical reviews can be queried and compared over time.

🧠 Real AI Analysis — Google Gemini

All analysis is powered by real Gemini calls (no mock responses): semantic code review, PR diff analysis, vulnerability reasoning, attack simulation, executive summary generation, and remediation suggestions — all generated dynamically from the actual PR content.

⚡ Real-Time Updates — Socket.IO

Socket.IO streams live updates from backend to frontend as each agent finishes its work — live scan progress, agent status, streaming findings, and dashboard sync, with no page refresh required.

☁️ Deployment
Git repository initialized with a secure .gitignore and API key protection
Backend deployment strategy: Render
Frontend deployment strategy: Vercel
🌟 Key Achievements
✅ Persistent MongoDB Atlas storage
✅ Real Google Gemini integration (no mocks)
✅ Multi-agent orchestration via Mutagent
✅ Real-time WebSocket communication
✅ Executive-level AI reporting
✅ Historical review memory
✅ Dependency / supply-chain security analysis
✅ Intelligent 0–100 risk scoring
✅ Continuous evaluation architecture
🚀 Project Status
Component	Status
Backend API	✅ Complete
MongoDB Integration	✅ Complete
Gemini Integration	✅ Complete
WebSocket Streaming	✅ Complete
Multi-Agent System	✅ Complete
Security Engine	✅ Complete
Dependency Analysis	✅ Complete
Executive Reporting	✅ Complete
Evaluation Engine	✅ Complete
Deployment Pipeline	🚧 In Progress
🎯 Roadmap
 GitHub App integration
 Automatic PR commenting
 Review Memory optimization
 Advanced attack simulation
 Explainable AI reports
 Continuous learning pipeline
 CI/CD integration
🛠️ Tech Stack
Orchestration: Mutagent (Helix)
AI / LLM: Google Gemini
Database: MongoDB Atlas + Mongoose
Real-time: Socket.IO
Hosting: Render (backend), Vercel (frontend)
📌 About

Built for HackIndia Spark 11 @ CBIT Hyderabad — a multi-agent GitHub PR Security & Code Review platform.

Premium enterprise frontend for Hack India Spark-11: a dark-mode-first cybersecurity console for AI-assisted GitHub pull request review, vulnerability triage, reporting, and agent observability.

## Tech Stack

- React 18, TypeScript, Vite
- Tailwind CSS with shadcn-style UI primitives
- React Router for route-level code splitting
- TanStack Query for async data access
- Recharts for charts and visual analytics
- Framer Motion for subtle gauge animation
- React Hook Form and Zod for report filters
- next-themes and Sonner for theme and notifications

## Project Structure

```text
src/
  components/          Shared layout and UI primitives
  constants/           Navigation constants
  features/
    dashboard/         Dashboard data and feature components
    reports/           Reports data and feature components
  hooks/               TanStack Query hooks
  layouts/             App shell layout
  pages/               Route components
  services/            Backend-ready async API layer
  types/               Shared TypeScript domain types
  utils/               Utility helpers
```

## Routes

- `/` Dashboard command center
- `/reports` Enterprise security reports
- `/settings` Backend connection placeholder
- `/404` Not found

## Run Locally

```bash
npm install
npm run dev
```

Build verification:

```bash
npm run build
```

This workspace was verified with the bundled `pnpm` runtime because the machine's global `npm` shim points to a missing npm CLI. The project itself uses a standard `package.json`, so `npm install` and `npm run dev` will work once npm is available on the host.

## Backend Integration

All UI data flows through `src/services/*`:

- `services/dashboard.ts`
- `services/report.ts`
- `services/repository.ts`
- `services/agent.ts`

The shared transport helper is `src/services/api-client.ts`. By default, it serves realistic async mock data. To connect a backend, set:

```bash
VITE_API_BASE_URL=https://your-api.example.com
VITE_USE_MOCKS=false
```

Then implement these endpoints on the backend:

- `GET /dashboard`
- `GET /reports`
- `POST /reports/:reportId/export`
- `GET /repositories`
- `GET /agents`
- `GET /agents/timeline`

Backend responses should match the TypeScript contracts in `src/types/security.ts`.

## Notes

The UI includes loading skeletons, retryable error cards, responsive sidebar/topbar navigation, dashboard analytics, PR detail drawer, report filters, expandable report detail, and frontend export actions ready for backend handoff.
