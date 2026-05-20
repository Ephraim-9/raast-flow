# Backend Schema — Data Model & Auth Architecture

## Raast-Flow

**API request/response shapes:** [docs/API.md](docs/API.md) (canonical). **Seed data:** [mock-data/invoices.json](mock-data/invoices.json). **In-memory pipeline model:** `WorkflowContext` in [AGENTS.md](AGENTS.md) (not a separate Firestore document; fields are flattened onto `workflow_executions`).

---

## Overview

We use **Firebase Firestore** (NoSQL) for the following reasons:
- Real‑time updates (not strictly needed but nice)
- Easy integration with Next.js API routes
- Generous free tier, zero config for mock data
- No schema migrations – flexible for hackathon iteration

**No authentication** for the hackathon version. The app runs in a single demo mode. All data is either:
- Mock invoice master data (static, loaded at startup)
- Workflow execution logs (ephemeral, stored per session)

For production (post‑hackathon) we would add user‑specific collections, but **out of scope**.

---

## Firestore Collections

### 1. `invoices` (master data, read‑only in demo)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (document ID) | Invoice ID, e.g. `INV-1001` |
| `customerName` | string | Customer / company name |
| `customerWhatsapp` | string (optional) | Mock phone number for simulation |
| `amount` | number | Invoice amount in PKR |
| `dueDate` | timestamp | Due date (YYYY-MM-DD) |
| `status` | string | One of: `pending`, `reconciled`, `disputed` |
| `warehouseBlocked` | boolean | `true` = goods held, `false` = released |
| `lateFeeWaived` | boolean | `true` if no late fee applied |
| `createdAt` | timestamp | Creation timestamp |

**Sample document:**
```json
{
  "id": "INV-1001",
  "customerName": "ABC Logistics",
  "customerWhatsapp": "+923001234567",
  "amount": 25000,
  "dueDate": "2026-05-01T00:00:00Z",
  "status": "pending",
  "warehouseBlocked": true,
  "lateFeeWaived": false,
  "createdAt": "2026-04-15T10:00:00Z"
}
```

**Indexes:**  
- `status` (for filtering pending invoices in admin view – not used in v1 but planned)
- `id` (default document ID index)

**Write permissions:**  
- Initially seeded via Firebase Console or a setup script.
- API routes can update `status` and `warehouseBlocked` during simulation (allowed without auth).

---

### 2. `workflow_executions` (audit log, write‑only)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (auto‑generated) | Unique workflow execution ID |
| `inputType` | string | `image`, `text`, `manual` |
| `inputPreview` | string | First 100 chars of input (for debugging) |
| `extractedAmount` | number | Parsed amount |
| `extractedReference` | string | Parsed invoice reference |
| `extractedConfidence` | number | Confidence score (0-1) |
| `invoiceFound` | boolean | Whether invoice existed |
| `matchType` | string | `exact`, `overpayment`, `underpayment`, `no_invoice` |
| `recommendedAction` | string | `approve`, `credit_note`, `dispute` |
| `finalAction` | string | Action executed (same as recommended) |
| `actionId` | string | Release order ID or dispute ticket ID |
| `beforeState` | object | Snapshot of invoice state before simulation |
| `afterState` | object | Snapshot after simulation |
| `simulationLogs` | array | Array of strings (each step description) |
| `whatsappPreview` | string | The mock WhatsApp message sent |
| `userAgent` | string (optional) | Browser info |
| `createdAt` | timestamp | When workflow completed |

**Sample document:**
```json
{
  "id": "wf_20260515_001",
  "inputType": "image",
  "inputPreview": "data:image/png;base64,...",
  "extractedAmount": 25000,
  "extractedReference": "INV-1001",
  "extractedConfidence": 0.98,
  "invoiceFound": true,
  "matchType": "exact",
  "recommendedAction": "approve",
  "finalAction": "approve",
  "actionId": "RO-20260515-001",
  "beforeState": {
    "invoiceStatus": "pending",
    "warehouseBlocked": true
  },
  "afterState": {
    "invoiceStatus": "reconciled",
    "warehouseBlocked": false
  },
  "simulationLogs": [
    "Updated warehouse status to RELEASED",
    "Sent WhatsApp notification to warehouse team",
    "Generated release order RO-20260515-001"
  ],
  "whatsappPreview": "✅ Release order RO-20260515-001 generated for INV-1001. Goods released.",
  "createdAt": "2026-05-15T10:32:00Z"
}
```

**Indexes:**  
- `createdAt` (descending) for recent activity list
- `finalAction` (optional, for filtering approvals vs disputes)

**Write permissions:**  
- API routes create and write documents.  
- No public read (except via admin or the History screen which reads only the current session’s executions – we limit by storing in localStorage as well; but for simplicity, we allow reads of all executions because no PII).

---

### 3. `agent_traces` (detailed reasoning – optional, can be embedded in workflow_executions)

To keep the schema flat, we embed agent trace logs directly inside `workflow_executions` as a sub‑collection or as a nested array. For simplicity, we use a **sub‑collection** `traces` under each workflow execution document.

**Sub‑collection:** `workflow_executions/{executionId}/traces`

**Document per agent step:**

| Field | Type | Description |
|-------|------|-------------|
| `agentName` | string | `parser`, `lookup`, `matcher`, `decision`, `simulator` |
| `order` | number | 1 through 5 |
| `status` | string | `running`, `completed`, `failed` |
| `startTime` | timestamp | When agent started |
| `endTime` | timestamp | When agent finished |
| `input` | object | Agent input (sanitised) |
| `output` | object | Agent output (sanitised) |
| `reasoning` | string | Human‑readable reasoning text |
| `toolCalls` | array | List of tool names and parameters |
| `error` | string (optional) | If failed |

**Sample trace document (Agent 3 - Matcher):**
```json
{
  "agentName": "matcher",
  "order": 3,
  "status": "completed",
  "startTime": "2026-05-15T10:31:55Z",
  "endTime": "2026-05-15T10:31:56Z",
  "input": {
    "paymentAmount": 25000,
    "invoiceAmount": 25000
  },
  "output": {
    "matchType": "exact",
    "action": "approve",
    "difference": 0
  },
  "reasoning": "Payment of Rs.25,000 matches invoice INV-1001 exactly. No discrepancy.",
  "toolCalls": [],
  "error": null
}
```

**Indexes:**  
- Composite index: `order` + `status` (for live polling) – but we can query by parent document and sort client‑side.

**Write permissions:**  
- API routes write traces as workflow progresses.

---

### 4. `mock_warehouse_state` (optional, not needed – warehouse status is stored on invoice)

We update the `warehouseBlocked` field on the invoice document directly during simulation. No separate table.

---

## Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| `workflow_executions` → `invoices` (via extractedReference) | Logical (NoSQL denormalised) | Each execution references an invoice ID, but not a formal foreign key. |
| `traces` → `workflow_executions` | Parent‑child (sub‑collection) | Traces belong to a single execution. |

No other relationships.

---

## Auth Model (Hackathon Version)

**No authentication.**  
- All Firestore security rules allow read/write to any authenticated user? Actually we have **no authentication**, so Firestore would block all requests by default. Instead, we:

1. Use **Firebase Admin SDK** on the backend (API routes) to bypass security rules. All database operations happen server‑side.
2. The client (mobile PWA) **never directly touches Firestore**. All reads/writes go through Next.js API routes.
3. This means no security rules needed – API routes act as the only interface.

**Advantages:** Simpler, no auth setup, no risk of exposing data.  
**Disadvantages:** Adds a hop (API → Firestore) but fine for hackathon scale.

---

## User Roles

None. Single “demo” role. API routes have full access (behind the server).

Post‑hackathon we would add:
- `admin` – can view all workflows, manage invoices
- `warehouse_manager` – can view and approve/release
- `finance` – can view disputes

---

## Sensitive Fields & Encryption

- **No real PII or financial data** – all data is mock.
- `customerWhatsapp` is a mock number, not real.
- No encryption needed for hackathon.
- API routes log minimal data; no persistent storage of raw user‑uploaded images (we discard after processing).

---

## File / Media Storage

- User‑uploaded images are **not stored permanently**.  
- When user uploads an image, we:
  1. Read the file as base64 in the API route.
  2. Pass base64 directly to Gemini Vision for OCR.
  3. Discard after processing.
  4. We never write the image to any bucket or database.

**No Firebase Storage used.**

---

## Webhooks / Event Triggers

None for hackathon.  
Workflow is synchronous request‑response (with polling for UI updates). No background jobs.

---

## API Endpoints (Summary)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/process` | Accept image/text, start Antigravity workflow, return `workflow_id` |
| `GET` | `/api/workflow/[id]/status` | Poll for agent completion status, return current outputs |
| `GET` | `/api/workflow/[id]/result` | Retrieve final workflow result + simulation data |
| `GET` | `/api/invoices?id=...` | Lookup invoice by ID (Agent 2 — query param **`id`**, not `ref`) |
| `PUT` | `/api/invoices/update` | Update invoice status/warehouse (simulation) |
| `GET` | `/api/history` | Retrieve recent workflow executions (for History screen) |

All endpoints are server‑side, called by the client. No direct Firestore client access.

---

## Environment Variables (Backend)

Already defined in TRD. Additional for Firestore Admin:

```
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
```

---

## Security & Data Considerations

| Concern | Mitigation |
|---------|------------|
| Injection attacks | All inputs validated with Zod; Firestore queries use parameterised SDK |
| Over‑fetching | API returns only necessary fields for each screen |
| Image handling | Images are base64 in memory, discarded after use |
| No rate limiting | Not needed for demo; but we could add simple in‑memory counter |
| Logging | No raw user input stored in traces except previews (truncated) |

---

## Future Scaling (Post‑Hackathon)

| Addition | Description |
|----------|-------------|
| User collection | `users` with Firebase Auth UID, roles |
| Row‑level security | Firestore rules: `request.auth != null` and role‑based |
| Real WhatsApp API | Store webhook logs in `notifications` collection |
| Invoice history | Track changes with `invoice_audit_log` collection |
| Batch processing | New `batch_jobs` collection |

---

## Approval

| Role | Name | Date |
|------|------|------|
| Backend Lead | [Your Name] | May 15, 2026 |

**Version:** 1.1  
**Status:** Ready for API implementation (aligned with docs/API.md)