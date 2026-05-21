# Raast-Flow — Antigravity task list

**Canonical guide:** [AGENTS.md](../../AGENTS.md) · **Phases:** [Implementation-Plan.md](../../Implementation-Plan.md)

Update this file as work completes. Mark `[x]` only when verified in code.

---

---

## Completed

- [x] Phase 1: Next.js scaffold, Tailwind, deps, `MOCK_MODE`
- [x] Phase 2: Firestore/mock-db, invoices API, seed data
- [x] Phase 3 (inline): Orchestrator in `lib/antigravity-client.ts`, YAML in `antigravity/`
- [x] Phase 4: `POST /api/process`, workflow status/result/history
- [x] Phase 5 (core): Home, manual, whatsapp, process, result, history screens
- [x] Phase 6: Simulator updates invoice + before/after + WhatsApp preview
- [x] Phase 3.5 (core agent refactor & Gemini integration)
- [x] Zod validation on API routes
- [x] **`scripts/test-workflow.js`** — script to run automated pipeline tests
- [x] **`scripts/export-agent-logs.js`** — script to export run traces for judges
- [x] **Phase 7: PWA Polish** — Service worker configuration, standalone style tweaks, offline banner
- [x] **Phase 8: Full journey regression** — verify 5 demo scenarios and manual skip parser
- [x] **Phase 9: Vercel deploy readiness** — Vercel-compatible background orchestrator, Next.js root tracing fix, pre-exported judge logs

---

## Backlog

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
