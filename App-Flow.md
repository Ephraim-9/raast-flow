# App Flow — Navigation & User Journey Map

## Raast-Flow

**Canonical routes:** All pages live under the Next.js route group `app/(mobile)/`. API contracts: [docs/API.md](docs/API.md).

---

## Pages List (Screens)

| Route | Screen Name | Description |
|-------|-------------|-------------|
| `/` | Home (Input Selection) | Landing screen with four input methods: Camera, Gallery, Manual Entry, WhatsApp‑style text. Shows recent activity list. |
| `/camera` | Camera Capture | Opens device camera to take a photo of a payment receipt/screenshot. |
| `/manual` | Manual Entry Form | Form fields for amount, invoice ID, date, optional notes. |
| `/whatsapp` | WhatsApp‑Style Input | Large text area with example placeholder: “INV‑1001 ka 25000 diye” (supports Roman Urdu/Urdu/English). |
| `/process` | Processing & Agent Trace | Query `?workflowId=...`. Poll `GET /api/workflow/{id}/status` every ~1s. Live 5‑agent pipeline. |
| `/result` | Result (Approval / Dispute / Credit note) | Query `?workflowId=...`. Fetches `GET /api/workflow/{id}/result`. Before/after, action ID, WhatsApp preview. |
| `/history` | Recent Activity (optional) | List of past reconciliations with status (Approved/Disputed). |
| `/settings` | Settings (minimal) | Toggle mock mode, clear history, view app version. |
| `*` | 404 Not Found | Redirects to Home. |

**Note:** No authentication screens (demo mode – single user). All screens are accessible without login.

---

## Navigation Type

**Bottom tab bar** on Home and History only (two tabs: Home, History).

**Linear reconciliation flow** (top app bar with back arrow on input/process/result screens):

`Home` → (`/camera` | gallery on Home | `/manual` | `/whatsapp`) → `/process?workflowId=` → `/result?workflowId=` → Home or History

- **Gallery:** File picker on Home — no `/gallery` route; goes straight to `/process` after `POST /api/process`.
- **Settings:** `/settings` via overflow/menu, not a tab.
- On `/result`, **New Payment** returns to Home.

Back during `/process` shows a cancel confirmation (stop polling; workflow may continue server-side unless cancellation is implemented).

---

## First Screen (Entry Point)

A brand new visitor sees the **Home** screen (`/`). It has:
- App title: “Raast‑Flow”
- Four large buttons (Camera, Gallery, Manual Entry, WhatsApp)
- Below: “Recent Activity” list showing last 3 reconciliations (if any; otherwise empty state with “No payments processed yet”).
- Bottom tab bar with Home (active) and History.

No onboarding or signup required.

---

## Auth Flow

**No authentication for hackathon version.**  
The app is fully functional in demo mode. All data is mock and stored per device/session. No user identity management.

For post‑hackathon (v2), we would add Firebase Auth with Google and email/password, but **out of scope** for submission.

---

## Core User Journey 1 – Exact Match Approval

**Goal:** User uploads a payment screenshot that exactly matches an invoice → system approves and releases warehouse.

**Step‑by‑step:**

1. **Home screen** (`/`) – User taps **“Upload”** (gallery) or **“Take Photo”**.
2. **System opens file picker / camera** – User selects a screenshot of Raast payment showing “Rs. 25,000 for INV‑1001”.
3. **Auto‑navigate to `/process`** – Screen shows live agent trace:
   - Agent 1 (Parser): “Extracted amount 25000, reference INV‑1001, confidence 0.98” → turns green.
   - Agent 2 (Lookup): “Invoice INV‑1001 found, amount 25000, due 2026‑05‑01” → completed.
   - Agent 3 (Matcher): “Exact match. Reasoning: payment equals invoice amount” → completed.
   - Agent 4 (Decision): “Action: approve. Generating release order RO‑20260515‑001” → completed.
   - Agent 5 (Simulator): “Updating warehouse state → RELEASED. Sending WhatsApp…” → completed.
4. **Auto‑redirect to `/result`** – Displays:
   - Green badge “✅ APPROVED”
   - Before/after slider: Warehouse BLOCKED → RELEASED, Invoice PENDING → RECONCILED
   - Release order ID: `RO‑20260515‑001`
   - Mock WhatsApp message preview
   - “New Payment” button (returns to Home) and “Share Receipt” (copies result).
5. **User taps “New Payment”** → returns to Home.

**Time estimation:** < 15 seconds from upload to result.

---

## Core User Journey 2 – Underpayment Dispute

**Goal:** User pastes a WhatsApp message like “INV‑1002 ka 20000 bhej diye” but invoice amount is 25000 → system creates a dispute ticket.

**Step‑by‑step:**

1. **Home screen** – User taps **“WhatsApp Style”**.
2. **Navigates to `/whatsapp`** – Shows a large text input with placeholder.
3. **User types:** `INV-1002 ka 20000 bhej diye` → taps “Process”.
4. **Navigates to `/process`** – Agent trace:
   - Agent 1 extracts amount 20000, reference INV‑1002.
   - Agent 2 finds invoice INV‑1002 with amount 25000.
   - Agent 3: “Underpayment. Difference Rs. 5000. Recommended action: dispute.”
   - Agent 4: “Creating dispute ticket D‑20260515‑001, reason: underpayment.”
   - Agent 5: “Warehouse remains BLOCKED. Notifying finance (mock email). WhatsApp to customer: ‘Short payment of Rs.5000 detected.’”
5. **Redirect to `/result`** – Shows:
   - Red badge “⚠️ DISPUTE CREATED”
   - Before/after: Warehouse stays BLOCKED, Invoice status changes PENDING → DISPUTED
   - Dispute ticket ID, reason, and mock email log.
   - “New Payment” button.
6. **User can tap “New Payment”** or go to History to see both cases.

---

## Core User Journey 3 – Overpayment (Credit note)

**Goal:** User submits payment **above** invoice amount → system recommends a credit note (warehouse may still release or stay blocked per product rule; default: approve with credit note flag).

**Step‑by‑step:**

1. **Home** → WhatsApp or manual: `INV-1003 ka 30000 bhej diye` (invoice amount is 25,000 PKR).
2. **`/process`** — Agent trace:
   - Parser: amount 30000, INV-1003.
   - Lookup: invoice 25,000.
   - Matcher: overpayment, difference Rs. 5,000.
   - Decision: `credit_note`, action ID e.g. `CN-20260515-001`.
   - Simulator: update per policy (e.g. reconcile + credit note message); warehouse per matcher/decision rules.
3. **`/result`** — Amber/warning or dedicated banner **CREDIT NOTE**, overpayment reason, mock notification to finance.

---

## Core User Journey 4 – Manual Entry (Fallback)

**Goal:** OCR fails on a blurry image; user manually enters payment details.

**Step‑by‑step:**

1. **Home** → **“Manual Entry”** → `/manual`
2. Form fields: Amount (PKR), Invoice ID, Date (pre‑filled today), Notes (optional).
3. User fills and submits.
4. `POST /api/process` with `inputType: "manual"` — workflow **skips Parser** (branch to Lookup with structured fields).
5. Rest of flow identical to Journey 1, 2, or 3 depending on match.
6. Result screen shows “Manual entry” source tag.

---

## Edge Cases & Empty States

| Scenario | Screen | Behaviour |
|----------|--------|------------|
| **No recent payments** | Home (recent activity section) | Shows “No payments processed yet. Upload your first receipt above.” with an illustration. |
| **No invoice found** | Process → Agent 2 fails | Agent 3 outputs “missing invoice” → Agent 4 creates dispute ticket with reason “invoice not found”. Result screen shows dispute. |
| **Camera denied permission** | Camera screen | Shows error toast: “Camera access denied. Please use Gallery or Manual Entry.” Provides button to go back. |
| **Image contains no readable text** | Process → Agent 1 confidence < 0.5 | Agent 1 returns low confidence. Workflow continues but adds warning. Result screen shows “Low confidence – manual verification recommended” but still attempts to extract. If completely fails, fallback to manual entry suggestion. |
| **Network error during processing** | Process (polling) | Shows error message: “Connection lost. Check internet and try again.” Button to retry with same input. |
| **Workflow times out (>30 sec)** | Process | Shows “Processing taking longer than expected. You can cancel and try again.” Cancel returns to Home. |
| **Empty WhatsApp input** | `/whatsapp` | “Process” button disabled until text entered. |
| **Manual entry missing required fields** | `/manual` | Highlights missing field, shows error: “Amount and Invoice ID are required.” |

---

## Modals & Overlays

| Trigger | Modal | Content | Action |
|---------|-------|---------|--------|
| Tap “Share Receipt” on `/result` | Bottom sheet | Options: Copy to clipboard, Share via WhatsApp (mock), Save as image. | Dismiss after action. |
| Tap info icon on agent trace | Dialog | Explanation of what each agent does. | “Got it” button. |
| Long press on history item | Context menu | Delete from history (local only). | Confirm dialog. |
| App first load (optional) | Tooltip overlay | Brief tutorial: “Tap camera to scan payment receipt.” Shown only once. | Dismiss by tapping anywhere. |

---

## Redirect Logic

| Action | From | To |
|--------|------|-----|
| User selects image from gallery | Home | `POST /api/process` → `/process?workflowId=...` |
| Workflow started (any input) | Input screen or Home | `/process?workflowId=...` |
| User takes photo with camera | Camera screen | `/process` (with photo) |
| User submits manual form | `/manual` | `/process` (with form data) |
| User submits WhatsApp text | `/whatsapp` | `/process` (with text) |
| Workflow completes | `/process` | `/result` (auto after last agent) |
| Tap “New Payment” on result | `/result` | `/` (Home) |
| Tap “Back” button on result | `/result` | `/` (Home) – because process is done |
| Tap “Cancel” during processing | `/process` | `/` (Home) with confirmation dialog |
| Tap History tab (bottom nav) | Any | `/history` |
| Tap Home tab | Any | `/` |
| Tap “Retry” on network error | `/process` | `/` (Home) – user must re‑upload |
| Invalid URL (404) | Any | `/` (Home) automatically |

---

## Flow Diagram (Textual)

```
[Launch App]
      │
      ▼
   / (Home) ─────────────────────────────┐
      │                                  │
      ├── Camera ──► /camera ──────────┐ │
      ├── Gallery ─────────────────────┼─► /process ──► /result ──┐
      ├── Manual Entry ─► /manual ─────┘              │           │
      └── WhatsApp ─► /whatsapp ─────────────────────┘           │
                                                                   │
      ▼                                                           │
   /history ◄─────────────────────────────────────────────────────┘
   (Bottom tab)                                                    │
                                                                   │
      └───────────────────────────────────────────────────────────┘
                              (New Payment button)
```

---

## State Persistence

- **Recent activity** – Stored in localStorage or IndexedDB (PWA). Survives page refresh.
- **Workflow state** – Not persisted across browser sessions; each payment is independent.
- **Mock database** – Firestore holds invoice master data; no user‑specific data.

---

## Edge Cases Summary Table

| Case | Handling |
|------|----------|
| Empty gallery selection | Stay on Home, show toast “No image selected” |
| Camera capture but no text | Proceed with low confidence, show warning on result |
| Invoice ID typo | No invoice found → dispute ticket created |
| Amount field negative in manual | Validation error, prevent submission |
| Duplicate submission (double‑tap) | Disable button while processing, show spinner |
| Browser back button during processing | Warn user: “Processing in progress. Going back will cancel.” |
| PWA offline (no internet) | Show offline message; cannot call Gemini/Antigravity. Suggest manual entry for later sync (out of scope). |

---

## Approval

| Role | Name | Date |
|------|------|------|
| Product Owner | [Your Name] | May 15, 2026 |

**Version:** 1.1  
**Status:** Ready for UI implementation (routes aligned with TRD)