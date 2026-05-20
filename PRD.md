# Product Requirements Document (PRD)

## Raast-Flow

**Tagline**  
Turn any payment proof into an instant warehouse release order — powered by Google Antigravity.

**Hackathon:** Google Antigravity Hackathon — **Challenge 1** (Autonomous Content-to-Action Agent). See [docs/HACKATHON.md](docs/HACKATHON.md) for official requirements and judging weights.

**Related docs:** [README.md](README.md) · [AGENTS.md](AGENTS.md) (build guide) · [TRD.md](TRD.md) · [App-Flow.md](App-Flow.md) · [docs/API.md](docs/API.md)

---

## Problem

In Pakistan’s B2B logistics industry, thousands of invoices are paid daily via Raast, bank transfers, or WhatsApp‑shared receipts. However, finance teams still manually match each payment to its invoice before releasing goods from the warehouse. This manual process causes:

- **Hours of delay** – trucks wait idle, increasing demurrage costs.
- **Human errors** – mismatched amounts, lost references, missed payments.
- **Lack of auditability** – no clear record of why a release was approved or blocked.
- **Dispute chaos** – underpayments or overpayments go unnoticed until billing cycles end.

The problem is felt most acutely by **logistics operations managers**, **warehouse supervisors**, and **finance teams** who need a faster, transparent, and autonomous way to reconcile payments and trigger actions.

---

## Target User Persona

**Ayesha (30) – Warehouse Operations Manager at a mid‑sized logistics company in Karachi**  
She manages 15+ trucks daily. Every morning, her team receives 50‑100 payment screenshots via WhatsApp from customers. She must manually verify each against an ERP invoice list, then physically sign release orders. She is tech‑savvy but has no time for complex software. She needs a tool that works like WhatsApp – upload a screenshot, get an instant yes/no decision, and automatically notify her warehouse team.

---

## Core Features (Must Have)

1. **Multi‑format unstructured input** – Accept payment proof via camera photo, gallery upload, plain text, or WhatsApp‑style message (Roman Urdu/Urdu/English supported).

2. **Agent‑based content understanding** – Use Antigravity‑orchestrated agents to extract amount, invoice reference, and date from any input (text + image OCR via Gemini Vision).

3. **Invoice lookup & validation** – Query mock invoice data (Firestore via API) for amount, due date, status, and warehouse block flag.

4. **Intelligent matching & reasoning** – Compare extracted payment against invoice. Categorize as exact match, overpayment, underpayment, or missing invoice. Generate human‑readable reasoning.

5. **Autonomous action generation** – Decide next action:
   - **Exact match** → create a release order.
   - **Overpayment** → generate a credit note request.
   - **Underpayment** or **missing invoice** → create a dispute ticket.

6. **Realistic action simulation** – Update the system state:
   - Warehouse status: `BLOCKED` → `RELEASED` (for approval)
   - Invoice status: `PENDING` → `RECONCILED` / `DISPUTED`
   - Send a mock WhatsApp notification to the warehouse team with release order details.
   - Log every simulated step for audit.

7. **Outcome visualization** – Show a clear before/after comparison (slider or split screen) of warehouse state, invoice status, and action taken.

8. **Agent trace display** – Inside the mobile app, show live progress of the 5 agents (Parser → Lookup → Matcher → Decision → Simulator) with their reasoning outputs.

9. **Mobile PWA** – Installable as a mobile app on Android/iOS, works offline after initial load.

---

## Nice to Have (v2 / time permitting)

- **Batch processing** – Upload multiple payment screenshots at once.
- **Export report** – Download daily reconciliation report (PDF/CSV).
- **User authentication** – Login for different warehouse/finance roles.
- **Real WhatsApp integration** – Use Twilio or WhatsApp Business API (requires approval, not feasible for hackathon).
- **Live dashboard** – Web view showing all recent releases and disputes.
- **Voice input** – “INV‑1001 ka 25000 diye” via speech-to-text.

---

## Out of Scope (this version)

- **Live connection to real Raast API** – We use mock Raast data; no real money or banking integration.
- **Actual SMS/WhatsApp sending** – All notifications are simulated with mock messages shown in the UI.
- **Multi‑company / multi‑warehouse support** – Single warehouse demo only.
- **Full ERP integration** – No live SAP, Oracle, or Microsoft Dynamics connectors.
- **User management or login system** – No signup; single demo user mode.
- **Payment gateway or refund processing** – Pure reconciliation and release simulation only.

---

## User Stories

1. **As a** warehouse operations manager, **I want to** take a photo of a customer’s Raast payment receipt, **so that** the system automatically releases the goods without manual data entry.

2. **As a** finance clerk, **I want to** paste a WhatsApp message like “INV‑1002 ka 50000 bhej diye”, **so that** I don’t have to type the amount and invoice ID manually.

3. **As a** logistics supervisor, **I want to** see a before/after comparison of warehouse status, **so that** I can verify the release decision in seconds.

4. **As a** auditor, **I want to** view the agent reasoning trace (why the system approved or disputed a payment), **so that** I can audit decisions after the fact.

5. **As a** driver waiting at the gate, **I want to** receive a WhatsApp notification (simulated) when my release order is ready, **so that** I don’t have to keep asking the office.

6. **As a** finance manager, **I want to** see a dispute ticket automatically created when a payment is short, **so that** my team can follow up without missing discrepancies.

---

## Success Metrics (Hackathon & Real World)

### For the Hackathon Submission
- **100%** of demo scenarios (exact match, underpayment, overpayment, missing invoice) run successfully without human intervention.
- **Agent trace logs** from Antigravity (workplan, task plan, reasoning) **and** in-app pipeline traces show all 5 agents completing their steps.
- Submission aligns with [docs/HACKATHON.md](docs/HACKATHON.md) deliverables (mobile PWA, 3–5 min video, README, GitHub).
- **Demo video** clearly shows input → insight → action → simulation → result within 3 minutes.
- **Mobile app installs** on at least one judge’s device during judging (PWA criteria met).

### For Real‑World Success (Post‑Hackathon Vision)
- **Time per payment** reduced from 5–10 minutes to <60 seconds.
- **Dispute detection rate** >95% (underpayments caught automatically).
- **User satisfaction** (NPS) > 50 among warehouse managers.
- **Daily active use** – At least 10 reconciliations processed per user per day in pilot.

---

## Appendix: PRD Approval (for internal team use)

| Role | Name | Approval Status |
|------|------|----------------|
| Product Owner | [Your Name] | ✅ Signed |
| Tech Lead | [Your Name] | ✅ Signed |
| Designer | [Your Name] | ✅ Signed |

**Date:** May 15, 2026  
**Version:** 1.1 — aligned with hackathon PDF and doc review