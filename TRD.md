# Technical Requirements Document (TRD)

## Raast-Flow

**Hackathon:** Challenge 1 — see [docs/HACKATHON.md](docs/HACKATHON.md). **API contracts:** [docs/API.md](docs/API.md). **AI build guide:** [AGENTS.md](AGENTS.md).

---

## Google Antigravity (two layers)

| Layer | Role | Where |
|-------|------|--------|
| **IDE** | Build and iterate on the repo; export workplan/task artifacts for judges | [antigravity.google](https://antigravity.google) — [Getting Started codelab](https://codelabs.developers.google.com/getting-started-google-antigravity) |
| **Runtime** | Orchestrate the 5-step payment pipeline (Parser → Simulator) | `lib/antigravity-client.ts`, `antigravity/workflows/`, Firestore traces |

Hackathon rule: Antigravity must be **central** to orchestration and reasoning. Additional LLMs (Gemini on Vertex) are allowed for OCR/reasoning inside agent steps. Do not implement the full match/decision path as naked `if/else` in `/api/process` bypassing the workflow.

**Submission traces:** Antigravity IDE artifacts (workplan, tasks plan) in `antigravity/logs/` **plus** runtime traces in Firestore and the `/process` UI.

---

## Frontend

| Aspect | Choice | Justification |
|--------|--------|----------------|
| **Framework** | Next.js 14 (App Router) with TypeScript | Built‑in API routes, PWA support, great mobile responsiveness |
| **UI Library** | Tailwind CSS + shadcn/ui components | Rapid prototyping, consistent design system |
| **State Management** | React Context + SWR for data fetching | Lightweight, avoids over‑engineering |
| **PWA** | next-pwa + manifest.json | Mandatory mobile app requirement for Challenge 1 |
| **Mobile‑first** | Responsive design, viewport meta, touch targets ≥44px | Optimized for phone demo |

---

## Backend

| Aspect | Choice | Justification |
|--------|--------|----------------|
| **Runtime** | Next.js API routes (Node.js 18+) | Single codebase, no extra server needed |
| **Background jobs** | Not required – all processing synchronous | Hackathon scope fits request‑response |
| **Agent Orchestration** | Google Antigravity (IDE + runtime workflow) | Core requirement — **25%** of Challenge 1 judging ([docs/HACKATHON.md](docs/HACKATHON.md)) |
| **LLM & Vision** | Google Gemini 2.0 Flash via Vertex AI | Native integration with Antigravity, fast OCR |

---

## Database

| Aspect | Choice | Justification |
|--------|--------|----------------|
| **Primary DB** | Firebase Firestore (NoSQL) | Real‑time updates, simple mock schema, generous free tier |
| **Local fallback** | In‑memory JSON mock during initial development | Avoid API limits while testing agents |
| **Data structure** | Collections: `invoices`, `workflow_states`, `agent_logs` | Matches agent outputs and simulation needs |

---

## Authentication

| Aspect | Choice | Justification |
|--------|--------|----------------|
| **Auth method** | **None for hackathon** – single demo mode | Challenge does not require user login; simplifies demo |
| **Future (v2)** | Firebase Auth (Google + email) | Easy to add post‑hackathon |

---

## Hosting & Deployment

| Aspect | Choice | Justification |
|--------|--------|----------------|
| **Frontend + API** | Vercel (Hobby tier) | Optimized for Next.js, free, fast global CDN |
| **Database** | Firebase Firestore (already cloud) | No self‑hosting needed |
| **Antigravity** | Local IDE + deployed API orchestration | Develop in Antigravity; runtime workflow on Vercel/Node |
| **Demo access** | Public URL (e.g., `raast-flow.vercel.app`) | Judges can test on their own phones |

---

## Third‑Party APIs & Services

| Service | Purpose | Free Tier Limits | Used in Demo |
|---------|---------|------------------|---------------|
| **Google Vertex AI (Gemini 2.0 Flash)** | OCR + text extraction + reasoning | 60 requests/min, 1,500 requests/month (hackathon credits apply) | ✅ Yes |
| **Google Antigravity (IDX)** | Agent orchestration, workflow state, logging | Unlimited during hackathon | ✅ Yes |
| **Firebase Firestore** | Mock invoice DB, workflow state storage | 1 GiB storage, 50K reads/day | ✅ Yes |
| **Vercel** | Hosting | 100 GB bandwidth, 100 deployments/day | ✅ Yes |
| **Mock WhatsApp API** | Simulated notification (local function) | No external cost | ✅ Yes |

> **Important:** All APIs used are either free or covered by hackathon credits. No real payment or messaging APIs are called.

---

## Key Libraries & Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| `next` | 14.x | Framework |
| `typescript` | 5.x | Type safety |
| `tailwindcss` | 3.x | Styling |
| `lucide-react` | 0.3.x | Icons |
| `firebase` | 10.x | Firestore client |
| `@google-cloud/vertexai` | 1.x | Gemini access from API routes |
| `next-pwa` | 5.x | PWA generation |
| `swr` | 2.x | Data fetching |
| `zod` | 3.x | Runtime validation for API inputs |

---

## Folder Structure & Naming Conventions

```
raast-flow/
├── app/
│   ├── (mobile)/                 # Canonical UI routes — see App-Flow.md
│   │   ├── page.tsx              # / — Home
│   │   ├── camera/page.tsx       # /camera
│   │   ├── manual/page.tsx       # /manual
│   │   ├── whatsapp/page.tsx     # /whatsapp
│   │   ├── process/page.tsx      # /process?workflowId=
│   │   ├── result/page.tsx       # /result?workflowId=
│   │   ├── history/page.tsx      # /history
│   │   ├── settings/page.tsx     # /settings
│   │   └── layout.tsx            # Mobile shell + bottom tabs
│   ├── api/
│   │   ├── process/route.ts
│   │   ├── workflow/[id]/status/route.ts
│   │   ├── workflow/[id]/result/route.ts
│   │   ├── invoices/route.ts     # GET ?id= ; PUT via update/
│   │   ├── invoices/update/route.ts
│   │   └── history/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── camera-upload.tsx
│   ├── agent-trace.tsx
│   ├── before-after-slider.tsx
│   └── whatsapp-preview.tsx
├── lib/
│   ├── antigravity-client.ts
│   ├── firebase-admin.ts
│   └── mock-db.ts                # MOCK_MODE fallback
├── mock-data/
│   └── invoices.json             # Seed source — see README demo table
├── docs/
│   ├── API.md
│   └── HACKATHON.md
├── antigravity/
│   ├── agents/                   # YAML or SDK agent defs (stubs OK initially)
│   ├── workflows/main_workflow.yaml
│   └── logs/                     # IDE + runtime exports for judges
├── scripts/
│   ├── seed-firestore.js
│   ├── test-workflow.js
│   └── export-agent-logs.js
├── public/manifest.json
├── AGENTS.md
├── README.md
└── package.json
```

**Note:** Gallery upload uses a file picker on Home — there is no `/gallery` route.

**Naming conventions:**
- File names: `kebab-case.tsx` for components, `camelCase.ts` for utilities
- Types/interfaces: PascalCase, suffix `Props` for component props
- Environment variables: `NEXT_PUBLIC_*` for client‑safe, otherwise server‑only

---

## Environment Variables

Create `.env.local` with the following (values provided by hackathon / Google Cloud):

```env
# Google Cloud (Vertex AI + Antigravity)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_CLOUD_API_KEY=your-api-key          # or use service account JSON

# Firebase Admin SDK (server-side)
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com

# Firestore (client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Optional: Mock mode (bypass real APIs for testing)
MOCK_MODE=false
```

> **Security:** No real production secrets are used. For hackathon, these are demo credentials.

---

## Hard Technical Constraints & Preferences

| Constraint | Requirement |
|------------|-------------|
| **Mobile app mandatory** | PWA must be installable on Android/iOS; tested on at least one real device |
| **Antigravity core** | All agent logic must run inside Antigravity – no bypassing with hardcoded if‑else |
| **No real financial data** | All invoice/payment data is mock; no actual Raast API credentials |
| **Demo video length** | 3–5 minutes – must capture full workflow without cuts |
| **Agent trace export** | Antigravity IDE artifacts + JSON traces in `antigravity/logs/` and Firestore |
| **Offline first (nice to have)** | PWA should cache static assets; workflow execution requires internet (calls Gemini) |
| **Performance** | Workflow from upload to result under 15 seconds (Gemini latency) |
| **Browser support** | Chrome on Android, Safari on iOS (latest two versions) |

---

## Architecture Diagram (for reference)

```
[Mobile PWA] 
    │ 
    ├─► Next.js API route (/api/process)
    │       │
    │       └─► Antigravity Client ─► Start workflow
    │                │
    │                ▼
    │       [Antigravity Orchestrator]
    │        Agent1(Parser) → Gemini Vision
    │        Agent2(Lookup) → Firestore (invoices)
    │        Agent3(Matcher) → reasoning
    │        Agent4(Decision) → action generation
    │        Agent5(Simulator) → mock warehouse + WhatsApp
    │                │
    │                ▼
    └─► Poll /api/workflow/[id]/status ──► Display trace + result
```

---

## TRD Approval

| Role | Name | Date |
|------|------|------|
| Tech Lead | [Your Name] | May 15, 2026 |

**Version:** 1.1  
**Status:** Ready for implementation (routes and API aligned with App-Flow and docs/API.md)