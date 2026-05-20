# Raast-Flow — Antigravity implementation plan

**Last updated:** May 2026 · **Source of truth for architecture:** [AGENTS.md](../../AGENTS.md)

---

## What we are building

One **workflow engine** (not scattered AI calls):

```
User input → POST /api/process → workflowId
           → Orchestrator (lib/antigravity-client.ts)
           → Agent chain (lib/agents/*)
           → Traces + Firestore
           → Poll GET /api/workflow/{id}/status
           → GET /api/workflow/{id}/result → /result UI
```

---

## Two Antigravity layers

| Layer | Location | Purpose |
|-------|----------|---------|
| **IDE** | Antigravity app + this repo | Planning, coding, export workplan/tasks to `antigravity/logs/` |
| **Runtime** | `lib/antigravity-client.ts` + `lib/agents/` | What actually runs on Vercel |

YAML (`antigravity/workflows/main_workflow.yaml`, `antigravity/agents/*.yaml`) documents the pipeline for **hackathon judges**. TypeScript agents are the **runtime**.

---

## Target code layout

```
lib/
  antigravity-client.ts    # Manager only: startWorkflow, runPipeline loop
  workflow-types.ts        # WorkflowContext, Agent, AgentResult
  agents/
    parser.ts              # Gemini OCR — PRIORITY
    lookup.ts
    matcher.ts
    decision.ts
    simulator.ts
```

**Rules:** No agent logic in `app/(mobile)/*` or naked match/decision in `app/api/process/route.ts`.

---

## Agent pipeline

| # | Agent | Input slice | Output slice |
|---|-------|-------------|--------------|
| 1 | parser | `input` | `extracted` |
| 2 | lookup | `extracted.invoiceId` | `lookup` |
| 3 | matcher | `extracted` + `lookup` | `match` |
| 4 | decision | `match` | `decision` |
| 5 | simulator | `decision` + `lookup` | `result` (+ invoice DB write) |

Each step: `writeTrace(running)` → `agent.run(ctx)` → `writeTrace(completed|failed)` → merge context → `updateWorkflowStatus`.

---

## Current gap (why Phase 3.5 exists)

The repo **works end-to-end** but:

- All five agents are **inline** inside `runPipeline()` in `antigravity-client.ts`
- Parser uses **hardcoded** amounts/references when not manual
- Camera sends **mock JSON text**, not image bytes to the API
- `lib/agents/` and `workflow-types.ts` **do not exist yet**

---

## Implementation order (execute sequentially)

1. Wire real image upload to `POST /api/process`
2. Add `lib/workflow-types.ts`
3. Implement `lib/agents/parser.ts` with Gemini (respect `MOCK_MODE`)
4. Extract lookup, matcher, decision, simulator into `lib/agents/`
5. Refactor orchestrator to delegate only
6. Failed-trace handling
7. Regression: four demo scenarios + manual path
8. Export logs + demo video (Phase 9)

---

## Verification

- `MOCK_MODE=true` — full demo without GCP
- `MOCK_MODE=false` — parser calls Vertex AI
- `/process` shows live traces with reasoning
- `/result` shows banner, actionId, before/after, WhatsApp preview
- API responses match [docs/API.md](../../docs/API.md)

---

## User review notes

- **PWA:** `next-pwa` or `@serwist/next` if App Router caching issues appear (Phase 7).
- **Notification agent:** Optional; WhatsApp preview can stay in simulator for hackathon.
- **Do not** remove `antigravity/` YAML — required for Challenge 1 submission artifacts.
