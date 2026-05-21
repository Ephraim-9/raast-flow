# API contracts (canonical)

All paths are relative to the Next.js app origin. The mobile client calls these routes only — **no direct Firestore access from the browser**.

Types below are the source of truth; implement with Zod in `app/api/**/route.ts`. Workflow orchestration lives in `lib/antigravity-client.ts` + `lib/agents/*` — see [AGENTS.md](../AGENTS.md).

---

## `POST /api/process`

Start a payment reconciliation workflow.

### Request

**Content-Type:** `multipart/form-data` OR `application/json`

#### JSON body

```json
{
  "inputType": "text" | "manual" | "image" | "whatsapp",
  "text": "INV-1001 ka 25000 diye",
  "manual": {
    "amount": 25000,
    "invoiceId": "INV-1001",
    "date": "2026-05-15",
    "notes": "optional"
  },
  "imageBase64": "data:image/png;base64,...",
  "skipParser": false
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `inputType` | Yes | `image`, `text`, `whatsapp`, or `manual` |
| `text` | If `inputType` is `text` or `whatsapp` | WhatsApp-style message |
| `manual` | If `inputType` is `manual` | Sets `skipParser: true` internally |
| `imageBase64` | If `inputType` is `image` | Not stored after processing |
| `skipParser` | No | Default `true` when `manual` is sent |

#### Multipart

| Field | Type |
|-------|------|
| `file` | Image file |
| `inputType` | `image` |

### Response `201`

```json
{
  "workflowId": "wf_20260515_001",
  "status": "running"
}
```

`status` is always `running` on create; poll `/status` for completion.

**Implementation note:** Multipart `file` must be converted server-side to `imageBase64` on the workflow input before the parser agent runs. Client must not rely on mock OCR strings in JSON for production image flow.

### Errors

| Status | When |
|--------|------|
| `400` | Validation failed, empty input |
| `500` | Workflow start failed |

---

## `GET /api/workflow/{workflowId}/status`

Poll agent progress (every ~1s from `/process`).

### Response `200`

```json
{
  "workflowId": "wf_20260515_001",
  "status": "running" | "completed" | "failed",
  "currentStep": 3,
  "agents": [
    {
      "agentName": "parser",
      "order": 1,
      "status": "completed",
      "reasoning": "Extracted amount 25000, reference INV-1001, confidence 0.98",
      "output": {
        "extractedAmount": 25000,
        "extractedReference": "INV-1001",
        "extractedConfidence": 0.98
      }
    },
    {
      "agentName": "lookup",
      "order": 2,
      "status": "running",
      "reasoning": null,
      "output": null
    }
  ]
}
```

### Errors

| Status | When |
|--------|------|
| `404` | Unknown `workflowId` |

---

## `GET /api/workflow/{workflowId}/result`

Final outcome after `status` is `completed`.

### Response `200`

```json
{
  "workflowId": "wf_20260515_001",
  "matchType": "exact",
  "recommendedAction": "approve",
  "finalAction": "approve",
  "actionId": "RO-20260515-001",
  "extractedAmount": 25000,
  "extractedReference": "INV-1001",
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
    "Generated release order RO-20260515-001"
  ],
  "whatsappPreview": "✅ Release order RO-20260515-001 generated for INV-1001. Goods released.",
  "banner": "approved"
}
```

`banner`: `approved` | `dispute` | `credit_note`

### Errors

| Status | When |
|--------|------|
| `404` | Unknown or incomplete workflow |
| `409` | Still `running` |

---

## `GET /api/invoices?id={invoiceId}`

Lookup invoice (Agent 2 / Lookup tool).

### Response `200`

```json
{
  "id": "INV-1001",
  "customerName": "ABC Logistics",
  "customerWhatsapp": "+923001234567",
  "amount": 25000,
  "dueDate": "2026-05-01T00:00:00.000Z",
  "status": "pending",
  "warehouseBlocked": true,
  "lateFeeWaived": false
}
```

### Errors

| Status | When |
|--------|------|
| `404` | Invoice not found |

---

## `PUT /api/invoices/update`

Simulation write (Agent 5). Server-only.

### Request

```json
{
  "id": "INV-1001",
  "status": "reconciled",
  "warehouseBlocked": false
}
```

### Response `200`

```json
{
  "id": "INV-1001",
  "status": "reconciled",
  "warehouseBlocked": false
}
```

---

## `GET /api/history`

Recent workflow executions for Home / History screens.

### Query

| Param | Default |
|-------|---------|
| `limit` | `10` |

### Response `200`

```json
{
  "items": [
    {
      "workflowId": "wf_20260515_001",
      "extractedReference": "INV-1001",
      "finalAction": "approve",
      "matchType": "exact",
      "createdAt": "2026-05-15T10:32:00.000Z"
    }
  ]
}
```

---

## Naming conventions

| Concept | JSON field |
|---------|------------|
| Workflow ID | `workflowId` (camelCase in API; Firestore doc id may match) |
| Invoice lookup | Query param `id`, not `ref` |
