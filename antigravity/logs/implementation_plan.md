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

## Completed Refactoring (Phase 3.5)

Phase 3.5 has been successfully implemented and verified:
- **Decoupled Architecture**: All 5 agents are decoupled into separate classes under `lib/agents/` and extend the `Agent` interface defined in `lib/workflow-types.ts`.
- **Slim Orchestrator**: The pipeline in `lib/antigravity-client.ts` strictly coordinates loop runs, manages failure states, and persists traces in Firestore.
- **Real Gemini Integration**: The parser agent uses Vertex AI to extract data from unstructured inputs (image/text) with an elegant fallback in `MOCK_MODE`.
- **FormData & Binary Uploads**: Client-side camera scans transmit native multipart binary file arrays directly to the server.
- **Robust Schema Validation**: Integrated Zod validation into `POST /api/process` to validate all formats of `'manual'`, `'image'`, and `'whatsapp'`/`'text'` inputs.
- **Sync Declarative Specs**: Full YAML models for Agent 1-5 created in `antigravity/agents/` to serve as hackathon-ready judge logs.

---

## Active & Next Steps

1. **Test Scripts (`scripts/test-workflow.js`)**: Automate end-to-end integration and regression tests for judge review.
2. **Export Logs (`scripts/export-agent-logs.js`)**: Extract traces from Firestore as JSON artifacts under `antigravity/logs/` for direct submission.
3. **Phase 7: PWA Polish**: Complete standalone mobile standalone installation setup, add toast notifications for failed uploads, and enhance styling micro-interactions.
4. **Phase 9: Production Deployment**: Push to production via Vercel, populate environmental secrets, and confirm live end-to-end runs.

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
