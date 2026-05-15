# Google Antigravity Hackathon — Challenge 1 mapping

Raast-Flow is submitted under **Challenge 1: Autonomous Content-to-Action Agent (Insight → Action System)**.

Source: `Google Antigravity Hackathon - Challenges.pdf`

---

## Problem (official)

Build an agentic AI system that transforms **unstructured content into actionable outcomes**:

1. Ingest unstructured input  
2. Extract key insights  
3. Analyze implications  
4. Generate recommended actions  
5. **Simulate** execution of at least one action  
6. Show resulting system state or outcome  

> This is **NOT** a summarization tool.

---

## Mandatory: Google Antigravity

Teams **must** use Google Antigravity as the core platform to:

- Orchestrate agent workflows  
- Manage reasoning and planning  
- Integrate tools/APIs  
- Handle execution of actions  

Additional LLMs (e.g. Gemini on Vertex) are allowed; **Antigravity must be central** to system logic.

**Raast-Flow mapping:** `lib/antigravity-client.ts` + `antigravity/workflows/main_workflow.yaml` (or equivalent SDK workflow) drives the 5-step pipeline; development also uses the Antigravity IDE.

---

## System requirements → Raast-Flow

| Requirement | Implementation |
|-------------|----------------|
| Content understanding | Parser agent — image OCR / text (Roman Urdu, Urdu, English) |
| Insight extraction | Matcher — match type + non-trivial reasoning |
| Impact analysis | Matcher reasoning + Decision narrative |
| Action generation | Decision — approve / credit_note / dispute |
| Action simulation | Simulator — Firestore invoice update + mock WhatsApp |
| Outcome visualization | `/result` before/after + execution logs |
| Agentic workflow | 5 agents OR equivalent structured steps with traces |

---

## Deliverables

| Deliverable | Raast-Flow artifact |
|-------------|---------------------|
| Working prototype — **mobile app required** | Installable PWA |
| Web app | Optional (same Next.js app) |
| Demo video (3–5 min) | Must show: input → insight → action → simulation → result |
| Agent trace / logs from Antigravity | `antigravity/logs/` + in-app `/process` + Firestore `traces` |
| README | Root [README.md](../README.md) |

### Agent trace must include

- Workplan  
- Tasks plan  
- Reasoning steps  
- Decision flow  
- Action execution  

Capture **Antigravity IDE artifacts** while building, and **runtime traces** from the app/Firestore for the demo.

---

## Evaluation criteria (Challenge 1)

| Criterion | Weight | How we address it |
|-----------|--------|-------------------|
| Use of Google Antigravity | **25%** | Central orchestration; exported IDE + runtime logs |
| Agentic reasoning & workflow | 20% | 5-step pipeline with visible trace |
| Insight & decision quality | 20% | Structured match types and human-readable reasoning |
| Action simulation & outcome | 15% | Firestore state change + before/after UI |
| Technical implementation | 10% | Next.js API, Zod, Firestore Admin pattern |
| Innovation & UX | 10% | Logistics domain, PWA, WhatsApp-style input |

---

## Demo video script (suggested)

1. Install PWA on phone (optional clip).  
2. **Exact match** — upload or paste proof for INV-1001.  
3. Live agent trace on `/process`.  
4. `/result` — green approve, warehouse released, WhatsApp preview.  
5. **Underpayment** — `INV-1002 ka 20000 bhej diye` → dispute.  
6. **Overpayment** (optional) — INV-1003 → credit note.  
7. Brief show of Antigravity workplan/logs folder.

---

## Guidelines

- At least one action must be **simulated** with visible state change.  
- Use mock data only — no sensitive real data.  
- Real-world inspired scenario (logistics / payments) is encouraged.

---

## Other challenges (out of scope)

| Challenge | Topic |
|-----------|--------|
| 2 | AI Service Orchestrator — informal economy |
| 3 | Crisis Intelligence & Response Orchestrator |
| 4 | Agentic mobile game |

Do not mix requirements from other challenges into Raast-Flow unless explicitly pivoting.
