# Implementation Plan — Step-by-Step Build Sequence

## Raast-Flow (Google Antigravity Hackathon)

**Challenge:** [docs/HACKATHON.md](docs/HACKATHON.md) — Challenge 1. **Build guide for AI:** [AGENTS.md](AGENTS.md). **API:** [docs/API.md](docs/API.md). **Live tasks:** [antigravity/logs/task.md](antigravity/logs/task.md).

> **Checkbox rule:** Mark `[x]` only when the task is implemented and verified in code.

### Current status (May 2026)

| Area | Status |
|------|--------|
| Phases 1–4 (scaffold, DB, orchestrator, API) | **Done** — inline pipeline in `lib/antigravity-client.ts` |
| Phase 5 (mobile screens) | **Mostly done** — image upload to backend still stubbed |
| Phase 3.5 (agent refactor) | **Next** — see below |
| Real Gemini parser | **Pending** |
| `lib/agents/` + `workflow-types.ts` | **Pending** |

**Architecture target:** One orchestrator, small agents, shared `WorkflowContext` — full spec in [AGENTS.md](AGENTS.md).

---

## Phase 0: Documentation & mock data (complete)

**Goal:** Spec pack ready for Antigravity IDE and implementation.

### Tasks

- [x] PRD, TRD, App-Flow, Design, Backend-Schema, Implementation-Plan
- [x] README.md, AGENTS.md, docs/HACKATHON.md, docs/API.md
- [x] mock-data/invoices.json (INV-1001 … INV-1004 demo scenarios)
- [x] Hackathon PDF in repo (`Google Antigravity Hackathon - Challenges.pdf`)

---

## Phase 1: Project Setup & Environment (Day 1, Hours 0–2) ✅

**Goal:** Scaffold the Next.js PWA, configure Tailwind, install dependencies, and set up environment variables.

### Tasks

- [x] Create new Next.js project with TypeScript & Tailwind CSS
  ```bash
  npx create-next-app@latest raast-flow --typescript --tailwind --eslint
  cd raast-flow
  ```
- [x] Install required dependencies
  ```bash
  npm install firebase @google-cloud/vertexai lucide-react swr zod next-pwa
  npm install -D @types/node
  ```
- [x] Configure `next.config.js` for PWA (next-pwa)
- [x] Set up folder structure as defined in TRD (`app/`, `components/`, `lib/`, `antigravity/`, etc.)
- [x] Create `.env.local` with placeholder variables (copy from TRD)
- [x] Initialize Firebase Admin SDK (service account JSON) and Firestore
- [x] Create a simple `package.json` script for dev and build
- [x] Test that `npm run dev` starts the app on `localhost:3000`

### Done Criteria
- [x] Next.js app runs without errors
- [x] Tailwind CSS loads with default styles
- [x] All dependencies installed
- [x] Folder structure matches TRD v1.2 (agents folder pending)
- [x] `.env.local` created (mock values)

---

## Phase 2: Database & Mock Data (Day 1, Hours 2–4) ✅

**Goal:** Set up Firestore collections, seed mock invoices, and implement server‑side API routes to query/update data.

### Tasks

- [x] Create Firebase project and enable Firestore (Native mode) — or `MOCK_MODE`
- [x] Generate a service account key; store in environment variables
- [x] Seed mock invoices from `mock-data/invoices.json` (mock-db + optional script)
- [x] Implement API route `GET /api/invoices?id=...` that returns invoice data (using Admin SDK)
- [x] Implement API route `PUT /api/invoices/update` for simulation (updates status and warehouseBlocked)
- [ ] Add Zod validation for request bodies
- [x] Test both endpoints using Postman or browser

### Done Criteria
- [x] Firestore contains seed invoices from `mock-data/invoices.json`
- [x] `GET /api/invoices?id=INV-1001` returns correct JSON
- [x] `PUT /api/invoices/update` successfully changes `status` and `warehouseBlocked`
- [x] Error handling for missing invoice returns 404

---

## Phase 3: Antigravity Agent Definitions (Day 1–2, Hours 4–10) ✅ (inline)

**Goal:** Define the 5 runtime agents and main workflow; develop using the **Antigravity IDE** (Planning mode) and wire orchestration in code.

> **Note:** Pipeline currently lives inside `lib/antigravity-client.ts`. Phase 3.5 extracts to `lib/agents/`.

### Antigravity setup (IDE — Layer A)

- [ ] Install [Google Antigravity](https://antigravity.google/download); sign in with Gmail
- [ ] Open this repo as workspace; use **Planning** mode for Phases 1–6
- [ ] Save submission artifacts to `antigravity/logs/` (workplan, task list, walkthrough)
- [ ] Optional: `.agents/rules/` — e.g. “follow docs/API.md field names”, “no if/else bypass in /api/process”

Codelab: [Getting Started with Google Antigravity](https://codelabs.developers.google.com/getting-started-google-antigravity)

### Runtime agents (Layer B) — tasks

- [x] Set up Antigravity client in `lib/antigravity-client.ts` (start workflow, run steps, write traces)
- [x] Create YAML definitions for each agent in `antigravity/agents/`:
  - `agent1_parser.yaml` (Gemini Vision + text extraction)
  - `agent2_lookup.yaml` (calls `/api/invoices?id=...` via HTTP tool)
  - `agent3_matcher.yaml` (compares amounts, returns match type + reasoning)
  - `agent4_decision.yaml` (generates release order ID or dispute ticket ID)
  - `agent5_simulator.yaml` (updates warehouse and sends mock WhatsApp)
- [x] Define workflow `main_workflow.yaml` that chains the 5 agents (branch: skip parser when `inputType: manual`)
- [ ] Write `scripts/test-workflow.js` — sample exact match input
- [ ] Debug tool calls: Gemini vision payload, HTTP tool to `GET /api/invoices?id=`

### Done Criteria
- [x] Each agent step produces structured output + `reasoning` string
- [x] Main workflow runs end‑to‑end for exact match (INV-1001 / 25000)
- [x] Traces written to `workflow_executions/{id}/traces`
- [ ] Export script populates `antigravity/logs/` for judges

---

## Phase 3.5: Agent refactor & real parser (current focus)

**Goal:** Match [AGENTS.md](AGENTS.md) — one orchestrator, isolated agents, shared `WorkflowContext`.

### Tasks

- [ ] Add `lib/workflow-types.ts` (`WorkflowContext`, `Agent`, `AgentResult`)
- [ ] Create `lib/agents/parser.ts` — real Gemini Vision; remove hardcoded extraction in orchestrator
- [ ] Create `lib/agents/lookup.ts`, `matcher.ts`, `decision.ts`, `simulator.ts` — move logic from `runPipeline`
- [ ] Slim `lib/antigravity-client.ts` to: init doc → loop agents → traces → status updates
- [ ] Wire image upload: `POST /api/process` reads multipart `file` → `imageBase64`; camera page sends real bytes
- [ ] Per-agent failure: failed trace + `status: 'failed'` on workflow
- [ ] Keep [docs/API.md](docs/API.md) field names in traces and API responses

### Done Criteria

- [ ] No agent business logic remains in `runPipeline` (only orchestration)
- [ ] Parser uses Gemini when `MOCK_MODE` is false
- [ ] Image path works without client-side mock OCR string
- [ ] All four demo scenarios still pass

---

## Phase 4: Backend API – Workflow Endpoints (Day 2, Hours 10–14) ✅

**Goal:** Build Next.js API routes that start the Antigravity workflow and allow polling for status/results.

### Tasks

- [x] Implement `POST /api/process`:
  - Accept `multipart/form-data` (image) or `application/json` (text)
  - Convert image to base64 or pass text directly
  - Start Antigravity workflow via `antigravity-client.startWorkflow()`
  - Store initial execution record in Firestore (`workflow_executions` collection)
  - Return `{ workflowId }` per [docs/API.md](docs/API.md)
- [x] Implement `GET /api/workflow/[id]/status`:
  - Retrieve workflow execution state from Antigravity
  - Return current agent progress, completed steps, and any intermediate outputs
  - Also read from Firestore if Antigravity does not persist
- [x] Implement `GET /api/workflow/[id]/result`:
  - Once workflow completed, return final result including before/after state, actionId, simulation logs, WhatsApp preview
- [x] Implement `GET /api/history`:
  - Return last 10 workflow executions from Firestore (ordered by `createdAt` desc)
- [ ] Add error handling: timeout, missing input, Antigravity failure

### Done Criteria
- [x] `POST /api/process` returns a valid `workflowId`
- [x] Polling `/status` shows agent progression (parser → lookup → …)
- [x] `/result` returns complete outcome after workflow finishes
- [x] History endpoint returns list of past runs
- [x] All endpoints match [docs/API.md](docs/API.md); malformed requests return 400/500
- [ ] Multipart image fully parsed server-side (see Phase 3.5)

---

## Phase 5: Mobile App – Core Screens (Day 2–3, Hours 14–22) — mostly done

**Goal:** Build the PWA screens for home, camera upload, manual entry, WhatsApp input, and processing view.

### Tasks

- [x] **Home screen (`/`)** – Layout with four input cards (Camera, Gallery, Manual, WhatsApp). Use `lucide-react` icons. Add “Recent Activity” list (fetched from `/api/history`).
- [ ] **Camera / Gallery** – `/camera` + file picker on Home; real image to `POST /api/process` (today: mock JSON text) → `/process?workflowId=...`
- [x] **Manual entry (`/manual`)** – Form with fields: Amount (number), Invoice ID (text), Date (date picker), Notes (optional). Submit to `/api/process` with `inputType: manual`.
- [x] **WhatsApp style (`/whatsapp`)** – Large textarea with placeholder “INV-1001 ka 25000 diye”. Submit as plain text to `/api/process`.
- [x] **Processing screen (`/process`)** – Poll `/api/workflow/[id]/status` every 1 second. Show vertical list of agents with status icons, expandable reasoning (collapsed by default). Cancel button returns to home.
- [x] **Result screen (`/result`)** – Fetch result from `/api/workflow/[id]/result`. Display:
  - Banner (green for approved, red for dispute)
  - Before/After toggle (two pill buttons) showing invoice status and warehouse state
  - Action ID (release order or dispute ticket)
  - WhatsApp preview bubble
  - “New Payment” and “Share Receipt” buttons
- [x] **History screen (`/history`)** – Simple list of past reconciliations with status badge and timestamp; tap to view result (re‑uses `/result` with workflow ID)

### Done Criteria
- [x] All screens responsive at 375px width under `app/(mobile)/`
- [ ] Photo and gallery flows: process → result with **real** backend image (not mock OCR string)
- [x] Manual and WhatsApp inputs work
- [x] Agent trace updates on `/process` via polling
- [x] Before/After toggle on `/result`
- [x] History lists past runs from `/api/history`

---

## Phase 6: Action Simulation & State Change (Day 3, Hours 22–26) ✅

**Goal:** Ensure the simulation (Agent 5) correctly updates the mock warehouse and invoice status, and that the UI reflects the before/after change.

### Tasks

- [x] Verify that Agent 5 (simulator) updates invoice `warehouseBlocked` and `status` in Firestore/mock-db
- [x] Store the `beforeState` and `afterState` inside the workflow execution document
- [x] Result screen reads before/after from workflow result
- [x] Mock WhatsApp message preview based on action type
- [x] Test four scenarios: exact match, underpayment, overpayment (credit note), missing invoice

### Done Criteria
- [x] Exact match: `warehouseBlocked: false`, `status: reconciled`
- [x] Underpayment: warehouse blocked, `status: disputed`
- [x] Overpayment: `credit_note` action ID and appropriate banner
- [x] Missing invoice: dispute, warehouse unchanged
- [x] Before/after slider and WhatsApp preview correct per scenario

---

## Phase 7: UI Polish & Edge Cases (Day 4, Hours 26–32)

**Goal:** Implement loading/empty/error states, animations, and final polish.

### Tasks

- [ ] Add loading spinners on all buttons when processing starts
- [ ] Implement empty state for Home “Recent Activity” when no history exists
- [ ] Implement network error handling (toast message, retry button on `/process`)
- [ ] Add cancel button on `/process` that aborts the workflow (if Antigravity supports cancellation; otherwise just stop polling and go home)
- [ ] Implement focus states for accessibility (keyboard navigation on desktop)
- [ ] Add micro‑interactions: button scale on tap, agent step completion animation (checkmark)
- [ ] Ensure all text is readable on small screens (minimum 14px body)
- [ ] Add meta viewport tag and ensure PWA manifest is correctly configured (`public/manifest.json`)
- [ ] Test on actual Android/iOS device (via Vercel preview or local network)

### Done Criteria
- [ ] No console errors when navigating quickly between screens
- [ ] Edge cases show user‑friendly messages (camera denied, empty text, etc.)
- [ ] PWA installable (“Add to Home Screen”)
- [ ] Animations snappy; `role="status"` on agent trace updates

---

## Phase 8: Testing & Bug Fixes (Day 4, Hours 32–36)

**Goal:** Run through all user journeys, fix bugs, and ensure the submission requirements are met.

### Tasks

- [ ] **Test Journey 1** – Exact match approval: upload screenshot → process → result shows green banner, warehouse released.
- [ ] **Test Journey 2** – Underpayment dispute: WhatsApp text with lower amount → dispute ticket created.
- [ ] **Test Journey 3** – Overpayment: INV-1003 / 30000 → credit note.
- [ ] **Test Journey 4** – Missing invoice: INV-9999 → dispute.
- [ ] **Test Journey 5 (manual)** – skip parser; fields passed to lookup.
- [ ] **Test Camera** – take a photo of a printed receipt (simulate poor lighting) → fallback works (low confidence but still extracts).
- [ ] **Test History** – navigate to history, tap item → result screen shows correct data.
- [ ] **Test Agent trace** – expand reasoning on `/process`, verify text is meaningful.
- [ ] **Test PWA install** – on Android Chrome, “Add to Home Screen”, then launch standalone.
- [ ] **Test offline** – show offline message when no connection (basic check).
- [ ] **Test error scenarios** – invalid image, missing amount, network failure during polling.

### Done Criteria
- [ ] All four demo journeys work end‑to‑end
- [ ] No crashes or unhandled promise rejections
- [ ] `scripts/export-agent-logs.js` produces judge-ready logs
- [ ] Demo video recordable without visible bugs

---

## Phase 9: Deployment & Documentation (Day 5, Hours 36–40)

**Goal:** Deploy to Vercel, finalise README, produce demo video, and submit.

### Tasks

- [ ] Push code to GitHub repository
- [ ] Connect repository to Vercel (import project)
- [ ] Add environment variables in Vercel dashboard (same as `.env.local`)
- [ ] Deploy production build; test live URL on mobile
- [ ] Update [README.md](README.md) with live prototype URL and Antigravity usage (post-deploy)
- [ ] Confirm [docs/HACKATHON.md](docs/HACKATHON.md) checklist complete
- [ ] Record demo video (3–5 minutes) using OBS or phone screen recording:
  - Show mobile app install
  - Input a payment screenshot
  - Show agent trace live
  - Show result and before/after
  - Show dispute scenario
  - Show Antigravity logs (switch to console)
- [ ] Export agent traces from Antigravity as JSON/PDF; save in `/antigravity/logs/`
- [ ] Submit to hackathon form with:
  - Live prototype URL
  - Demo video link (YouTube unlisted)
  - GitHub repository link
  - Agent trace file

### Done Criteria
- [ ] Production app accessible (e.g. `https://raast-flow.vercel.app`)
- [ ] README + HACKATHON deliverables complete
- [ ] Demo video 3–5 min: input → insight → action → simulation → result
- [ ] Antigravity IDE artifacts + runtime traces in submission
- [ ] Submitted before deadline

---

## Phase 10: Buffer & Contingency (May 20, if needed)

**Goal:** Address any last‑minute issues or judging feedback.

### Tasks

- [ ] Re‑test after deployment (environment variables may differ)
- [ ] Fix any broken API calls (CORS, Firestore rules)
- [ ] Ensure PWA manifest and service worker are correctly served
- [ ] Re‑record demo video if major bug discovered

### Done Criteria
- [ ] Final submission is stable and demonstrable

---

## Summary Timeline

| Phase | Hours | Cumulative | Day |
|-------|-------|------------|-----|
| 1: Setup | 2 | 2 | Day 1 |
| 2: Database | 2 | 4 | Day 1 |
| 3: Antigravity Agents | 6 | 10 | Day 1–2 |
| 4: Backend API | 4 | 14 | Day 2 |
| 5: Mobile App Screens | 8 | 22 | Day 2–3 |
| 6: Simulation | 4 | 26 | Day 3 |
| 7: UI Polish | 6 | 32 | Day 4 |
| 8: Testing | 4 | 36 | Day 4 |
| 9: Deployment & Docs | 4 | 40 | Day 5 |
| 10: Buffer | 4 | 44 | May 20 (if needed) |

---

## Done Criteria (Final Product)

- [ ] Mobile PWA installs and runs offline (static assets only)
- [ ] Unstructured input (image/text) → structured output → action simulation → state change works for all 3 scenarios
- [ ] Antigravity orchestrates 5 agents; logs are exportable
- [ ] Before/after state is clearly visualised
- [ ] Demo video shows end‑to‑end flow in ≤5 minutes
- [ ] All documentation submitted as per guidelines

---

**Approval:**  
Implementation Lead: [Your Name]  
Date: May 15, 2026  
**Version:** 1.2 — aligned with [AGENTS.md](AGENTS.md) workflow architecture  
Status: Phases 1–4 and 6 largely complete; **Phase 3.5** (agent refactor + real parser + image upload) is the active workstream