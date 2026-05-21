# Raast-Flow

**Autonomous payment reconciliation PWA** — unstructured receipt/WhatsApp input → agent pipeline → approve, dispute, or credit note → simulated warehouse + notification.

Built for **Google Antigravity Hackathon — Challenge 1** (Content-to-Action). See [docs/HACKATHON.md](docs/HACKATHON.md).

## Quick start

```bash
npm install
cp .env.example .env.local   # if present; else see TRD.md env vars
# Set MOCK_MODE=true for local demo without GCP/Firebase
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## For Antigravity / AI builders

**Start here:** [AGENTS.md](AGENTS.md) — architecture, agent contract, implementation order, and current status.

| Doc | Purpose |
|-----|---------|
| [AGENTS.md](AGENTS.md) | Canonical build guide for the IDE |
| [Implementation-Plan.md](Implementation-Plan.md) | Phased checklist |
| [TRD.md](TRD.md) | Technical requirements |
| [App-Flow.md](App-Flow.md) | Routes and user journeys |
| [docs/API.md](docs/API.md) | HTTP contracts |
| [antigravity/logs/task.md](antigravity/logs/task.md) | Live task tracker |

## Architecture (one line)

`Frontend` → `POST /api/process` → `lib/antigravity-client.ts` (orchestrator) → `lib/agents/*` (chain) → Firestore traces → poll `/api/workflow/{id}/status` → `/result`.

YAML under `antigravity/` documents the same pipeline for hackathon submission; **runtime** is TypeScript in `lib/`.

## Demo data

Seed invoices: [mock-data/invoices.json](mock-data/invoices.json) — INV-1001 (exact match), INV-1002 (underpay), INV-1003 (overpay), etc.

**Hackathon demo video (≈2:30):** [docs/DEMO-VIDEO.md](docs/DEMO-VIDEO.md) · receipt asset: [demo/receipt-inv1001.svg](demo/receipt-inv1001.svg)

## Deploy

Vercel + Firebase Firestore. Set env vars from [TRD.md](TRD.md). Use `MOCK_MODE=true` on preview if credentials are missing.
