# Raast-Flow Implementation Plan

This plan outlines the complete build sequence for the Raast-Flow project (Google Antigravity Hackathon Challenge 1). It is based directly on the provided `Implementation-Plan.md` and related documentation.

## User Review Required

- **PWA Tooling**: The TRD specifies `next-pwa`. I will proceed with `next-pwa`, but please note that if there are any Next.js 14 App Router caching issues with it, I may suggest pivoting to `@serwist/next` during Phase 7.
- **Antigravity SDK**: As per `AGENTS.md`, I will build a custom lightweight orchestrator in `lib/antigravity-client.ts` that uses `@google-cloud/vertexai` and handles the workflow simulation state exactly as required by the judges.

## Proposed Changes

### Phase 1: Project Setup & Environment
- Scaffold Next.js 14 App Router project with TypeScript and Tailwind CSS.
- Install dependencies: `firebase`, `@google-cloud/vertexai`, `lucide-react`, `swr`, `zod`, `next-pwa`.
- Setup folder structure (`app/`, `components/`, `lib/`, `antigravity/`).
- Initialize environment variables and `.env.local` scaffolding.

### Phase 2: Database & Mock Data
- Initialize Firebase Admin SDK locally.
- Implement server-side API routes for Firestore operations:
  - `GET /api/invoices?id={invoiceId}`
  - `PUT /api/invoices/update`
- Seed Firestore with data from `mock-data/invoices.json`.

### Phase 3: Antigravity Agent Definitions
- Implement custom Antigravity orchestrator in `lib/antigravity-client.ts`.
- Define the 5 agents (parser, lookup, matcher, decision, simulator) as YAMLs in `antigravity/agents/`.
- Create `antigravity/workflows/main_workflow.yaml`.

### Phase 4: Backend API – Workflow Endpoints
- Implement `POST /api/process` to start the Antigravity workflow.
- Implement `GET /api/workflow/[id]/status` for live tracing.
- Implement `GET /api/workflow/[id]/result` for final outcome.
- Implement `GET /api/history` for recent activity.

### Phase 5: Mobile App – Core Screens
- Build `app/(mobile)/page.tsx` (Home with 4 input cards).
- Build `/camera`, `/manual`, `/whatsapp` input screens.
- Build `/process` screen showing live agent trace updates.
- Build `/result` screen showing before/after slider and mock WhatsApp preview.
- Build `/history` screen for past runs.

### Phase 6: Action Simulation & State Change
- Implement the Simulator agent logic to correctly update `warehouseBlocked` and `status` based on the Matcher/Decision output.
- Log the `beforeState` and `afterState` to Firestore.

### Phase 7: UI Polish & Edge Cases
- Refine Shadcn UI components.
- Apply Design System (colors, rounded corners, typography).
- Handle error boundaries, empty states, and PWA manifest generation.

### Phase 8 & 9: Testing & Documentation
- Test exact match, overpayment, and underpayment scenarios.
- Export Antigravity artifacts (logs, workplan, task list) to `antigravity/logs/` as requested for the submission.
- Ensure the project is deployment-ready for Vercel.

## Verification Plan

### Automated Tests
- Endpoints (`/api/invoices`, `/api/process`, `/api/workflow/[id]/status`) will be verified manually via HTTP requests or local test scripts before moving to UI integration.

### Manual Verification
- Verify each PWA route in the browser.
- Run complete end-to-end user journeys (Exact Match, Underpayment, Missing Invoice).
- Verify Firebase state transitions.
