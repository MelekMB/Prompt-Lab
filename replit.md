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

The Replit workflow monitor only detects ports registered in `.replit` (8080 and 8081). Port 8081 is used by the canvas/mockup sandbox. So both the frontend and backend must share port 8080.

### Development (single workflow owns port 8080)

- `artifacts/promptloop: web` workflow — runs `bash dev.sh`, which:
  1. Builds the API server (`pnpm --filter @workspace/api-server run build`)
  2. Starts the API server on **port 8082** in the background
  3. Starts the Vite dev server on **port 8080** in the foreground (workflow monitor detects this)
  4. Vite proxies all `/api/*` requests to port 8082
- `artifacts/api-server: API Server` workflow — shows as FAILED (its dev command is a no-op `sleep infinity`); the actual Express server is started by the promptloop's `dev.sh`

### Production

- API server builds and runs on port 8080, serving both `/api/*` (REST) and `/*` (static React files from `artifacts/promptloop/dist/public/`)

> **Development tip**: After editing frontend files, save — Vite HMR picks it up automatically. After editing backend files, restart the `artifacts/promptloop: web` workflow (it rebuilds the API server on start).

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
