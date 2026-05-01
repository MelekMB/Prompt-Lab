# Threat Model

## Project Overview

PromptLoop is a TypeScript monorepo with a React/Vite frontend (`artifacts/promptloop`) and an Express 5 API server (`artifacts/api-server`) backed by PostgreSQL via Drizzle (`lib/db`). In production the Express server serves both the REST API under `/api/*` and the built frontend on the same port. The core product lets users submit rough prompts, run iterative prompt refinement against OpenAI and Gemini, and optionally save optimization sessions and leaderboard entries.

Production-scoped assumptions for this scan:
- `NODE_ENV=production` in deployed environments.
- Replit-managed TLS protects traffic in transit.
- `artifacts/mockup-sandbox` is dev-only and should be ignored unless production reachability is demonstrated.

## Assets

- **Saved prompt sessions and optimization traces** — original prompts, final prompts, goals, audience, tone, constraints, and per-round critiques/prompts. These may contain proprietary business ideas, internal instructions, customer data, or other sensitive text pasted by users.
- **AI provider credentials and quota** — OpenAI and Gemini server-side credentials plus the paid model usage they authorize. Abuse can create direct financial cost and service instability.
- **Leaderboard integrity** — submitted leaderboard entries and their relationship to real sessions. Tampering can corrupt product trust even if it does not expose secrets.
- **Database contents** — PostgreSQL records for sessions, session rounds, and leaderboard entries. Exposure or unauthorized deletion affects confidentiality and availability.
- **Application logs** — request and error logs may contain route usage and failure context. They must not become an alternate channel for sensitive prompt disclosure.

## Trust Boundaries

- **Browser to API** — all form fields, route params, and fetch requests originate from an untrusted client. The server must validate and authorize every production API action.
- **API to PostgreSQL** — the API has broad database access. Any missing authorization at the route layer exposes stored session data directly.
- **API to external AI providers** — `/api/improve-prompt` triggers server-side calls to OpenAI and Gemini using privileged credentials and paid quota. Public abuse of this boundary can convert into cost and denial of service.
- **Public vs saved-session data** — the marketing/home flow can be public, but persisted sessions and destructive actions cross into data ownership expectations and require server-side access control.
- **Production vs dev-only surfaces** — `artifacts/promptloop` and `artifacts/api-server` are production; `artifacts/mockup-sandbox` is treated as dev-only unless proven otherwise.

## Scan Anchors

- **Production entry points:** `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/api-server/src/routes/**`, `artifacts/promptloop/src/App.tsx`
- **Highest-risk code areas:** `artifacts/api-server/src/routes/promptloop/index.ts`, `artifacts/api-server/src/lib/prompt-improvement.ts`, `lib/db/src/schema/**`
- **Surface split:** public UI in `artifacts/promptloop`; persisted-session and leaderboard APIs under `/api`; no admin surface found; no production auth middleware found
- **Usually ignore as dev-only:** `artifacts/mockup-sandbox/**` unless production routing to it is added later

## Threat Categories

### Spoofing

The current production API does not present a user identity boundary for saved-session actions. If the product intends sessions to belong to the creator, the server must bind session records and destructive operations to an authenticated principal rather than trusting anonymous requests or client navigation state.

Required guarantees:
- Saved-session read and delete operations MUST be tied to a server-validated user identity or be explicitly designed as globally public content with deliberate product approval.
- Any future privileged or owner-only action MUST enforce identity on the server, not just in the React client.

### Tampering

Anonymous clients can submit and delete data through public endpoints. Server-side validation exists for shape, but business integrity still depends on enforcing who is allowed to mutate which records and who may trigger high-cost operations.

Required guarantees:
- Destructive operations such as deleting sessions MUST enforce ownership or another explicit authorization rule.
- Public write endpoints MUST include abuse controls appropriate to business impact, such as rate limits, quotas, or moderation gates.
- Leaderboard writes MUST be constrained so one party cannot arbitrarily manipulate another party's stored results.

### Information Disclosure

Users are encouraged to paste raw prompts and additional context that may contain confidential information. Persisted sessions include full original prompts, final prompts, and round-by-round critique data. If these records are exposed without clear intent and controls, the application leaks sensitive user content.

Required guarantees:
- Persisted sessions and per-round traces MUST not be exposed to unrelated users unless the product explicitly treats them as public artifacts.
- API responses and logs MUST avoid disclosing unnecessary prompt content or secret material.
- Session identifiers and listing endpoints MUST not allow bulk enumeration of other users' private content.

### Denial of Service

`/api/improve-prompt` drives multiple server-side LLM calls per request against paid providers. Without authentication, quotas, or rate limiting, an attacker can automate requests to burn quota, increase cost, or degrade availability for legitimate users.

Required guarantees:
- Expensive AI-backed endpoints MUST have server-side abuse controls such as rate limits, quotas, or authenticated usage enforcement.
- Long-running upstream calls SHOULD have reasonable timeouts and cancellation behavior to avoid avoidable resource exhaustion.
- Public endpoints that create database records or external API load MUST be designed under an explicit abuse budget.

### Elevation of Privilege

The main privilege transition in this project is from anonymous web visitor to access over stored session data and paid AI resources. Missing authorization or unbounded public access effectively grants every visitor privileges over data and cost-bearing operations that should be constrained.

Required guarantees:
- Route handlers that access saved sessions MUST enforce ownership or intentionally-public semantics server-side.
- Database operations MUST stay parameterized and scoped to the authorized actor.
- Dev-only tooling such as the mockup sandbox MUST remain unreachable from the production Express surface unless separately threat-modeled.
