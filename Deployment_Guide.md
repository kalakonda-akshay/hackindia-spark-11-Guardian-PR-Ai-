# Deployment & Demo Guide

## Prerequisites
1. Node.js (v18+)
2. API Keys:
   - `GEMINI_API_KEY`: Required for the AI Security Reviewer.
   - `GITHUB_TOKEN`: Required for reading repositories and posting PR comments.

## Starting the System

### 1. Start the Backend API
Navigate to the `backend` directory and start the Express server and Mutagent orchestrator.

```bash
cd backend
npm install
npm run build
npm start
```

### 2. Connect a GitHub Webhook
To receive real PR events:
1. Expose your local port `3001` to the internet (e.g., using `ngrok http 3001`).
2. Go to your GitHub Repository -> Settings -> Webhooks.
3. Add a webhook pointing to `https://<ngrok-url>/api/webhook`.
4. Select content type `application/json` and subscribe to **Pull Requests** events.

### 3. Running the Dashboard (Frontend)
If you have the React frontend in the root `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```
The dashboard will run on `http://localhost:3000` and pull live metrics from `http://localhost:3001/api/sessions`.

## Demo Script / Judge Presentation Notes

**1. Show the Architecture**
Open `Architecture_Diagram.md`. Explain that this is not a single generic LLM call. It is a highly decoupled multi-agent swarm where specialists perform explicit tasks (Triage, Context mapping, Security, Dependency scanning) and pass typed data over a central message bus.

**2. Highlight the "AI Token Saving" Strategy**
Point out the `rule.engine.ts` in the Security Agent. Explain how Mutagent uses lightning-fast static regex to catch obvious secrets and bad code (`eval()`) *before* invoking expensive Gemini models.

**3. Show the Context Injection**
Show how the Context Agent detects if the app is a Next.js or Spring Boot app, and passes that to Gemini. This proves the AI isn't hallucinating; it knows the architecture.

**4. Demonstrate the Output**
Trigger a mock test or a real PR. Show the resulting Reporter Markdown output, proving it aggregates all 5 agent results into a clean, actionable UI for developers.
