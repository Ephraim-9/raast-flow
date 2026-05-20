# Raast-Flow — AI build guide (Antigravity)

**Read this first** when implementing or refactoring in the Antigravity IDE. Spec pack: [TRD.md](TRD.md), [Implementation-Plan.md](Implementation-Plan.md), [docs/API.md](docs/API.md), [App-Flow.md](App-Flow.md).



## Next.js (this repo)

This is NOT the Next.js you know. APIs and conventions may differ from your training data. Read `node_modules/next/dist/docs/` before changing routing or data APIs. Heed deprecation notices.



---

## Mental model


| Layer                                                      | Role                                                                 | Must NOT                                                           |
| ---------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Frontend** (`app/(mobile)/`)                             | UI only: upload, manual entry, poll status, show result              | Contain agent logic or Firestore writes                            |
| **API routes** (`app/api/`)                                | Request entry: validate input, start workflow, read status/result    | Implement match/decision as naked `if/else` bypassing the pipeline |
| **Orchestrator** (`lib/antigravity-client.ts`)             | Workflow manager: run agents in order, persist traces, update status | Be the AI — it coordinates, it does not “think”                    |
| **Agents** (`lib/agents/*.ts`)                             | One job each: read context → return result                           | Call other agents or own the full pipeline                         |
| **Database** (`lib/firebase-admin.ts`, `lib/mock-db.ts`)   | Memory: workflows, invoices, traces                                  | —                                                                  |
| **YAML** (`antigravity/workflows/`, `antigravity/agents/`) | Hackathon spec + judge artifacts                                     | Required runtime unless wired to external Antigravity SDK          |


The app is **one workflow engine** running a **chain of agents** with **shared state**, **logging**, and **clear outputs** — not many separate AI calls scattered in routes or pages.

---

## End-to-end flow

1. User uploads receipt or enters manual invoice data.
2. Frontend `POST /api/process`.
3. Backend creates `workflowId`, starts pipeline in background.
4. Each agent reads workflow context, runs one job, writes trace, updates persisted fields.
5. Frontend polls `GET /api/workflow/{id}/status` (or listens later).
6. On completion, `/result` shows decision, extracted data, traces, simulation.

---

## Target folder structure

```
app/
  (mobile)/          # UI only — see App-Flow.md
    page.tsx           # Home
    camera/page.tsx
    manual/page.tsx
    whatsapp/page.tsx
    process/page.tsx   # Poll status
    result/page.tsx
    history/page.tsx
  api/
    process/route.ts
    workflow/[id]/status/route.ts
    workflow/[id]/result/route.ts
    invoices/...
    history/route.ts

lib/
  antigravity-client.ts   # Orchestrator only
  workflow-types.ts       # WorkflowContext, Agent, AgentResult
  firebase-admin.ts
  mock-db.ts
  agents/
    parser.ts
    lookup.ts
    matcher.ts
    decision.ts
    simulator.ts
    notification.ts       # Optional v2 — can stay inside simulator for hackathon

antigravity/
  agents/*.yaml           # Declarative defs for submission
  workflows/main_workflow.yaml
  logs/                   # IDE workplan, tasks, walkthrough
```

---

## Shared types (implement in `lib/workflow-types.ts`)

### WorkflowContext

Single object passed through the pipeline. Agents merge their slice; orchestrator persists to Firestore.

```ts
export type WorkflowContext = {
  workflowId: string;
  inputType: 'manual' | 'image' | 'text';
  input: {
    invoiceId?: string;
    amount?: number;
    imageBase64?: string;
    mimeType?: string;
    text?: string;
    skipParser?: boolean;
  };
  extracted?: {
    invoiceId?: string;      // API/trace: also extractedReference
    amount?: number;         // API/trace: also extractedAmount
    confidence?: number;
    rawText?: string;
  };
  lookup?: {
    found: boolean;
    invoice?: InvoiceRecord | null;
    beforeState?: { invoiceStatus?: string; warehouseBlocked?: boolean } | null;
  };
  match?: {
    type: 'exact' | 'overpayment' | 'underpayment' | 'no_invoice';
    reasoning?: string;
  };
  decision?: {
    action: 'approve' | 'dispute' | 'credit_note' | 'manual_review';
    actionId?: string;
    reasoning?: string;
  };
  result?: {
    finalStatus: string;
    banner: 'approved' | 'dispute' | 'credit_note';
    afterState?: object;
    simulationLogs?: string[];
    whatsappPreview?: string;
  };
};
```

**Naming:** Keep [docs/API.md](docs/API.md) field names (`extractedReference`, `extractedAmount`) in API responses and trace `output`; map to/from `WorkflowContext` in the orchestrator.

### Agent contract

```ts
export type AgentResult = {
  status: 'completed' | 'failed';
  reasoning: string;
  output: Record<string, unknown>;
};

export interface Agent {
  readonly name: string;
  run(ctx: WorkflowContext): Promise<AgentResult>;
}
```

### Orchestrator (`runPipeline`)

1. Write initial `workflow_executions` doc (`status: 'running'`, `currentStep: 1`).
2. For each agent in order: `parser` → `lookup` → `matcher` → `decision` → `simulator`:
  - `writeTrace(..., status: 'running')`
  - `result = await agent.run(ctx)`
  - On `failed`: write failed trace, set workflow `status: 'failed'`, stop.
  - Merge `result.output` into `ctx`, `writeTrace(..., completed)`, `updateWorkflowStatus`.
3. Set `status: 'completed'` and final fields for `/result`.

**Do not** put agent bodies inside `runPipeline` long term — delegate to `lib/agents/`*.

---

## Agent chain (responsibilities)


| Order | Agent                       | Job                                                                                     | AI?                              |
| ----- | --------------------------- | --------------------------------------------------------------------------------------- | -------------------------------- |
| 1     | **parser**                  | Extract invoice id, amount, confidence from image/text; skip if `manual`                | Yes (Gemini Vision / text)       |
| 2     | **lookup**                  | Load invoice from `invoices` collection                                                 | No                               |
| 3     | **matcher**                 | Compare payment vs invoice → match type + reasoning                                     | Rules (+ optional LLM narrative) |
| 4     | **decision**                | Map match → `approve` / `dispute` / `credit_note` / `manual_review`, generate action ID | Rules                            |
| 5     | **simulator**               | Update invoice status, warehouse block, logs, WhatsApp preview                          | No                               |
| 6     | **notification** (optional) | Format outbound message only                                                            | No                               |


Hackathon rule: match/decision must run **inside** the workflow with traces — not only in `/api/process`.

---

## Trace shape (every agent)

```json
{
  "workflowId": "wf_20260521_123",
  "agentName": "parser",
  "order": 1,
  "status": "completed",
  "reasoning": "Extracted invoice INV-1001 and amount 6000",
  "output": { "extractedReference": "INV-1001", "extractedAmount": 6000, "extractedConfidence": 0.94 },
  "timestamp": "2026-05-21T12:00:00.000Z"
}
```

Stored at: `workflow_executions/{workflowId}/traces/step_{order}`.

---

## Implementation status (May 2026)

### Done

- Next.js app, `(mobile)` routes, API routes
- `POST /api/process`, status/result/history endpoints
- Orchestrator in `lib/antigravity-client.ts` with loop over agents and full trace persistence
- Firestore + `MOCK_MODE` mock DB
- Process page polling; result/history screens
- YAML workflow + Agent 1–5 declarative specifications under `antigravity/`
- **Phase 3.5 Completed**:
  - Image upload to backend via `multipart/form-data` and binary extraction
  - Real parser agent utilizing Gemini Vision / text APIs in `lib/agents/parser.ts`
  - Fully decoupled agent architecture (`lib/agents/*.ts`) with structured `WorkflowContext`
  - Slim orchestrator performing loop sequence and proper failed-step state transitions
  - Robust Zod validation schema on the `POST /api/process` endpoint
  - Comprehensive per-agent failure trace logging and workflow status updates

### Next (priority order)

1. **Backlog & Scripts** — Set up unit tests, `scripts/test-workflow.js`, and `scripts/export-agent-logs.js` for judges.
2. **PWA Polish** — Service worker static assets, offline checks, error toasts, and UI micro-interactions.
3. **Deployment** — Deploy to Vercel/Production with environment configuration.

### Do not break

- [docs/API.md](docs/API.md) response shapes for status/result/history
- Demo scenarios in [mock-data/invoices.json](mock-data/invoices.json) (INV-1001 … INV-1004)
- `MOCK_MODE=true` for judge demos without GCP

---

## Rules for Antigravity IDE

1. **No agent logic in UI** — pages only call `/api/*`.
2. **No business pipeline in `/api/process`** — only validate + `startWorkflow()`.
3. **One orchestrator** — all steps go through `AntigravityClient.runPipeline`.
4. **Small agents** — one file, one `run()`, unit-testable.
5. **Shared context** — no ad-hoc globals between agents.
6. **YAML stays in sync** — when changing agent order or I/O, update `antigravity/workflows/main_workflow.yaml`.
7. **Log work** — update [antigravity/logs/task.md](antigravity/logs/task.md) as tasks complete.

---

## Demo scenarios (regression)


| Input               | Expected                                |
| ------------------- | --------------------------------------- |
| INV-1001 / 25000    | `exact` → `approve`, warehouse released |
| INV-1002 / 20000    | `underpayment` → `dispute`              |
| INV-1003 / 30000    | `overpayment` → `credit_note`           |
| INV-9999            | `no_invoice` → `dispute`                |
| `inputType: manual` | Parser skipped, confidence 1.0          |


---

## References

- Hackathon mapping: [docs/HACKATHON.md](docs/HACKATHON.md)
- API contracts: [docs/API.md](docs/API.md)
- Step-by-step phases: [Implementation-Plan.md](Implementation-Plan.md)
- Live task checklist: [antigravity/logs/task.md](antigravity/logs/task.md)

