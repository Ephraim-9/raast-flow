# Raast-Flow — Antigravity task list

**Canonical guide:** [AGENTS.md](../../AGENTS.md) · **Phases:** [Implementation-Plan.md](../../Implementation-Plan.md)

Update this file as work completes. Mark `[x]` only when verified in code.

---

## Completed

- [x] Phase 1: Next.js scaffold, Tailwind, deps, `MOCK_MODE`
- [x] Phase 2: Firestore/mock-db, invoices API, seed data
- [x] Phase 3 (inline): Orchestrator in `lib/antigravity-client.ts`, YAML in `antigravity/`
- [x] Phase 4: `POST /api/process`, workflow status/result/history
- [x] Phase 5 (core): Home, manual, whatsapp, process, result, history screens
- [x] Phase 6: Simulator updates invoice + before/after + WhatsApp preview

---

## Active — Phase 3.5 (do in this order)

1. [ ] **Image upload** — `app/api/process/route.ts` reads multipart `file` → `imageBase64` on input; `app/(mobile)/camera/page.tsx` sends FormData or base64 (remove client mock OCR string)
2. [ ] **`lib/workflow-types.ts`** — `WorkflowContext`, `Agent`, `AgentResult`
3. [ ] **`lib/agents/parser.ts`** — Gemini Vision/text; no hardcoded INV-1001 / 25000 in orchestrator
4. [ ] **`lib/agents/lookup.ts`** — Firestore invoice fetch
5. [ ] **`lib/agents/matcher.ts`** — match type + reasoning
6. [ ] **`lib/agents/decision.ts`** — action + actionId
7. [ ] **`lib/agents/simulator.ts`** — DB update, logs, whatsappPreview
8. [ ] **Slim orchestrator** — `antigravity-client.ts` only loops agents + traces + persistence
9. [ ] **Failed agent traces** — `status: 'failed'` on trace and workflow doc
10. [ ] **Sync YAML** — `antigravity/workflows/main_workflow.yaml` matches agent I/O

---

## Backlog

- [ ] Zod validation on API routes
- [ ] `scripts/test-workflow.js` + `scripts/export-agent-logs.js`
- [ ] Phase 7: UI polish, PWA install, error toasts
- [ ] Phase 8: Full journey regression (4 demo scenarios + manual skip parser)
- [ ] Phase 9: Vercel deploy, demo video, judge log export in `antigravity/logs/`
- [ ] Optional: `lib/agents/notification.ts` (split from simulator)
- [ ] Optional: Fraud / Policy agents (after core chain stable)

---

## Regression checklist

| Scenario | Input | Expected |
|----------|-------|----------|
| Exact match | INV-1001 / 25000 | approve, warehouse released |
| Underpayment | INV-1002 / 20000 | dispute |
| Overpayment | INV-1003 / 30000 | credit_note |
| Missing invoice | INV-9999 | dispute, no_invoice |
| Manual | `inputType: manual` | parser skipped |
