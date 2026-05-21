# Demo video — minimal (≈2:30)

Record with **`MOCK_MODE=true`** (you already have this in `.env.local`). No code changes required.

**Judging arc:** unstructured input → agent trace → decision → simulated warehouse change → result.

---

## Before you hit Record

| Step | Command / action |
|------|------------------|
| 1 | `npm run dev` → open http://localhost:3000 |
| 2 | **Restart dev server** once (resets mock invoices to seed data) |
| 3 | Put `demo/receipt-inv1001.svg` on your phone (AirDrop/email) **or** screenshot it from desktop |
| 4 | Screen recorder ready (phone or Chrome DevTools → iPhone 12 Pro, 375×812) |
| 5 | Optional dry run: `node scripts/test-workflow.js` (server must be running) |

**You do not need:** QR codes (Scan = camera/image only), GCP keys, or a deployed URL for local recording.

---

## Copy-paste values (only 2 flows in the video)

| Scene | Screen | Reference | Amount |
|-------|--------|-----------|--------|
| 1 Hero | Home → **Scan** → pick receipt image | *(from image; mock = INV-1001)* | 25000 |
| 2 Dispute | Home → **WhatsApp** | `INV-1002` | `20000` |

Invoice due amounts in DB: INV-1001/1002/1003 are all **25,000** PKR.

---

## Minimal script (~2:30)

### 0:00–0:20 — Hook

> “Raast-Flow turns payment proof into an autonomous warehouse decision — extract, match, approve or dispute, and simulate the release. Built for Google Antigravity Challenge 1.”

*Show: Home screen.*

---

### 0:20–1:20 — Scene 1: Exact match (image)

1. Tap **Scan** → select `demo/receipt-inv1001.svg` (or photo of printed copy).
2. Stay on **`/process`** until all 5 steps are green; read one reasoning line aloud.
3. On **`/result`**, point at: **Release Approved**, warehouse **BLOCK → REL**, WhatsApp preview.

> “Parser extracts INV-1001 and twenty-five thousand. Exact match → approve → warehouse released.”

Tap back to Home.

---

### 1:20–2:00 — Scene 2: Underpayment (WhatsApp form)

1. Tap **WhatsApp** (green icon).
2. Reference: `INV-1002` · Amount: `20000` → submit.
3. **`/process`** → **`/result`**.

> “Invoice is twenty-five thousand but only twenty thousand paid — underpayment, dispute, warehouse stays blocked.”

*Show: **Dispute Created**, BLOCK stays BLOCK.*

---

### 2:00–2:20 — Scene 3: Proof of system (pick one)

**A (in-app):** Tap **History** → open latest row → flash result.

**B (IDE, 10s):** Show `antigravity/workflows/main_workflow.yaml` + `lib/agents/` folder.

> “Five agents, YAML spec, full traces in the app and repo.”

---

### 2:20–2:30 — Close

> “Unstructured input to insight, action, and simulated outcome. Repo and agent logs in the submission.”

---

## Shot checklist (don’t skip)

- [ ] `/process` — 5 agents with reasoning visible (don’t skip ahead)
- [ ] `/result` — warehouse before/after on scene 1
- [ ] `/result` — dispute banner on scene 2
- [ ] History or YAML folder (scene 3)

---

## What you already have vs what’s missing

| Item | Status |
|------|--------|
| App + all screens | ✅ In repo |
| `MOCK_MODE=true` | ✅ `.env.local` |
| Mock invoices INV-1001…1004 | ✅ `mock-data/invoices.json` |
| Demo receipt image | ✅ `demo/receipt-inv1001.svg` (add to phone before record) |
| Test script | ✅ `scripts/test-workflow.js` |
| Export traces for submission | ✅ `scripts/export-agent-logs.js` (run after dry run) |
| Screen recorder | ❓ You provide |
| YouTube upload (unlisted) | ❓ After edit |
| Live Vercel URL | ❓ Optional for video; required for form submission |

**Code changes for recording:** none.

---

## After recording (submission, not the video)

```bash
node scripts/test-workflow.js
node scripts/export-agent-logs.js
```

Upload video (3–5 min max; this cut is ~2:30), GitHub link, trace export, live URL when deployed.
