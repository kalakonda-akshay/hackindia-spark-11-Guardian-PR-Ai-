# GitHub PR Security & Code Review Agent

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
