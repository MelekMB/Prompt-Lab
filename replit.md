# Workspace

## Overview

pnpm workspace monorepo using TypeScript. **PromptLoop** — an AI SaaS app where users paste a rough prompt, configure options (goal, audience, tone, constraints, iterations 1–5), and watch ChatGPT + Gemini iteratively refine it.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle for API server)
- **Frontend**: React + Vite + Tailwind + shadcn/ui + framer-motion + wouter
- **AI**: OpenAI (`@workspace/integrations-openai-ai-server`) + Gemini (`@workspace/integrations-gemini-ai`)

## Architecture

- `artifacts/api-server` — Express server on port **8080** (the only monitored workflow port)
  - Serves REST API at `/api/*`
  - Serves the built React app as static files at `/*` (SPA fallback → `index.html`)
  - Static files come from `artifacts/promptloop/dist/public/` (built by `pnpm --filter @workspace/promptloop run build`)
- `artifacts/promptloop` — React+Vite frontend; **not run as a dev server workflow** because Replit's workflow monitor only detects ports 8080 and 8081 (registered in `.replit`). Instead, the frontend is built and served by the API server.

> **Development workflow**: After editing frontend files, run `pnpm --filter @workspace/promptloop run build` then restart the api-server workflow. Or use `pnpm --filter @workspace/promptloop run build:watch` in a separate session for auto-rebuild on changes.

## Key Routes

- `/api/sessions` — list all sessions
- `/api/sessions/stats` — aggregate stats
- `/api/sessions/:id` — get session with rounds
- `/api/sessions` (POST) — create session
- `/api/sessions/:id` (DELETE) — delete session
- `/api/improve-prompt` — run AI improvement loop (OpenAI + Gemini)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/promptloop run build` — build frontend static files
- `pnpm --filter @workspace/api-server run dev` — run API server (also serves built frontend)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
