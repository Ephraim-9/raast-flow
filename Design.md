# UI/UX Design Brief — Raast‑Flow

**Routes & flows:** [App-Flow.md](App-Flow.md). **Result banners:** green = approved, red = dispute, amber = credit note (overpayment).

---

## Aesthetic Direction

**Clean, trustworthy, action‑oriented.**  
Feels like a financial tool you’d hand to a warehouse manager – no clutter, high contrast, clear hierarchy. Slight tech‑edge (for hackathon judges) but not overly playful.  
Think: **Stripe Dashboard + WhatsApp simplicity + a touch of Google Material Design**.

---

## Color Palette

| Role | Hex | Usage |
|------|-----|-------|
| **Primary** | `#2563EB` (Blue 600) | Buttons, active states, release order badges, links |
| **Primary Dark** | `#1D4ED8` (Blue 700) | Hover / pressed states |
| **Secondary** | `#10B981` (Green 500) | Approval results, success messages, “released” status |
| **Danger** | `#EF4444` (Red 500) | Disputes, errors, “blocked” status |
| **Warning** | `#F59E0B` (Amber 500) | Low confidence, partial match alerts |
| **Background (main)** | `#F9FAFB` (Gray 50) | Default screen background |
| **Surface (cards)** | `#FFFFFF` | Cards, modals, input areas |
| **Text Primary** | `#111827` (Gray 900) | Headings, labels |
| **Text Secondary** | `#6B7280` (Gray 500) | Subtitles, timestamps, helper text |
| **Border** | `#E5E7EB` (Gray 200) | Dividers, input borders |
| **Agent trace background** | `#1E1E2E` (dark slate) | Differentiates the “technical” view |

**Contrast compliance:** All text/background pairs meet WCAG AA (minimum 4.5:1).

---

## Typography

| Role | Font | Weight | Size (rem) | Line Height |
|------|------|--------|------------|--------------|
| **App title / logo** | Inter | 700 | 1.5 | 1.3 |
| **Screen headings** | Inter | 600 | 1.25 | 1.4 |
| **Body / paragraphs** | Inter | 400 | 1.0 | 1.5 |
| **Labels / buttons** | Inter | 500 | 0.875 | 1.4 |
| **Agent output / code** | JetBrains Mono | 400 | 0.75 | 1.4 |
| **Badge text** | Inter | 500 | 0.75 | 1.2 |

**Font stack:** `Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`  
**Monospace:** `'JetBrains Mono', 'Fira Code', monospace`

---

## Component Style

| Element | Style |
|---------|-------|
| **Buttons** | Solid, rounded‑xl (`border-radius: 1rem`), medium padding (`12px 20px`), subtle shadow on hover |
| **Cards** | White background, rounded‑2xl (`1rem`), light border (`1px solid #E5E7EB`), no drop shadow (flat, clean) |
| **Input fields** | Rounded‑lg (`0.5rem`), border, focus ring (primary), no label inside (placeholder + external label) |
| **Bottom tab bar** | White, subtle top border, active tab icon + label in primary color, inactive gray |
| **Agent trace panel** | Dark slate background, monospace text, small padding, rounded‑xl |
| **Before/After slider** | Two side‑by‑side cards with toggle buttons (BEFORE / AFTER), animated transition |
| **Icons** | Lucide icons, consistent stroke width (1.5px), size `20px` for most, `24px` for tab bar |
| **Loading indicators** | Spinner (primary color) + text “Processing…” |

**Border radius scale:**  
- Small (inputs, chips): `0.375rem` (6px)  
- Medium (cards, modals): `0.75rem` (12px)  
- Large (buttons, banners): `1rem` (16px)  
- XLarge (FAB, avatars): `9999px`

---

## Shadows

**No heavy drop shadows.**  
Only use very subtle elevation for cards on hover (not on static cards).  
- Default card: `box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);`  
- Hover card: `box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);`  
- Modals: `0 20px 25px -5px rgb(0 0 0 / 0.1)`

---

## Dark / Light Mode

**Light mode only for hackathon demo** (faster implementation, matches finance/logistics internal tools).  
Post‑hackathon we can add dark mode, but not required for judging.

---

## Inspiration References

- **Stripe Dashboard** – Clean, high information density, trust signals.
- **WhatsApp** – Simple input methods, chat‑like text entry.
- **Linear** – Agent trace panel (dark slate background with monospace) feels technical but polished.
- **Google Pay / Raast** – Familiar green success states, blue primary.

---

## Key UI Patterns

| Pattern | Implementation |
|---------|----------------|
| **Bottom tab navigation** | 2 tabs: Home (input + recents) and History. |
| **Floating action button** | None – primary actions are the four input cards on home. |
| **Agent timeline** | Vertical list of steps, each with status icon (pending/running/complete), expandable reasoning. |
| **Before/After toggle** | Two pill buttons: “BEFORE” and “AFTER” that swap displayed state card. |
| **Result banner** | Full‑width coloured banner (green for success, red for dispute) with icon and headline. |
| **Recent activity list** | Simple rows with invoice ID, status badge, timestamp. |
| **WhatsApp bubble** | Green‑tinted chat bubble for the simulated notification preview. |
| **Empty state** | Illustrated placeholder (simple SVG) + short instruction. |

---

## Mobile Responsiveness Requirements

- **Viewport:** `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes">`
- **Touch targets:** Minimum 44x44pt for all interactive elements.
- **Layout:** Single column, full‑width cards, side margins 16px.
- **Bottom tab bar:** Fixed to bottom, background blur (safe area inset for notched phones).
- **Agent trace:** Scrollable vertically, does not overflow horizontally.
- **Typographic scale:** Minimum body text 14px on mobile.

---

## Accessibility Considerations

| Aspect | Requirement |
|--------|-------------|
| **Color contrast** | All text meets WCAG AA (4.5:1). Test with Stark/Contrast. |
| **Focus indicators** | Visible outline (`ring-2 ring-primary`) on keyboard focus. |
| **Semantic HTML** | Use `button`, `input`, `label` correctly – no div‑as‑button without role. |
| **Screen reader labels** | `aria-label` on icon‑only buttons (e.g., “Take photo”). |
| **Motion** | No auto‑play videos; optional reduce‑motion media query for transitions. |
| **Status announcements** | Live region (`role="status"`) for agent trace updates. |

---

## Component Library & Implementation

We will use **shadcn/ui** (built on Radix + Tailwind) as the component foundation. This gives us accessible, unstyled components that we theme according to this brief.

**Custom components to build:**
- `AgentTraceStep` – For the live pipeline view.
- `BeforeAfterSlider` – Toggle + state cards.
- `WhatsAppPreview` – Chat bubble simulation.
- `StatusBadge` – Approved / Disputed / Pending.

---

## Example Screen Sketches (Verbal)

### Home Screen
- Top: App logo + tagline (small).
- Four large rounded cards in 2x2 grid:
  - 📷 Camera
  - 🖼️ Gallery
  - ✍️ Manual Entry
  - 💬 WhatsApp
- Below: “Recent Activity” section header + horizontal scroll or vertical list of last 3 reconciliations.
- Bottom tab bar (Home / History).

### Process Screen (Agent Trace)
- Back arrow top left.
- Title: “Processing payment…”
- Vertical list of 5 agents:
  - Icon + name + status (spinner or check)
  - Collapsible reasoning (starts collapsed, expand on tap)
- At bottom: Cancel button (subtle) – only visible if running.

### Result Screen (Approval)
- Large green banner with checkmark icon + “APPROVED”.
- Before/After toggle (two pills) showing:
  - Invoice status: PENDING → RECONCILED
  - Warehouse: BLOCKED → RELEASED
- Release Order ID in a highlighted card.
- WhatsApp preview bubble: “✅ Release order RO-001 generated for INV-1001.”
- Two buttons: Share Receipt (outline) and New Payment (solid).

### Result Screen (Credit note — overpayment)
- Amber banner + “CREDIT NOTE” / overpayment amount called out.
- Shows action ID (e.g. `CN-…`) and finance notification preview.

### Result Screen (Dispute)
- Red banner with warning icon + “DISPUTE CREATED”.
- Dispute reason and ticket ID.
- Warehouse remains BLOCKED (visual lock icon).
- Mock email notification line.
- Same two buttons.

---

## Animation & Micro‑interactions

| Interaction | Effect |
|-------------|--------|
| Button tap | Scale down 0.97, release scale back (instant feedback) |
| Agent step completion | Checkmark icon animates in (spring) |
| Before/After toggle | Cross‑fade between state cards (0.2s ease) |
| Loading spinner | Continuous rotate (infinite) |
| Page transition | Fade in (0.15s) – no complex slide |
| Toast messages | Slide down from top, auto‑dismiss after 3s |

No heavy animations – keep snappy on mobile.

---

## Design Deliverables for AI

The AI should generate:
- Tailwind CSS classes matching this palette and spacing.
- Consistent use of `rounded-xl`, `bg-white`, `shadow-sm`.
- Icons from lucide-react.
- Responsive padding/margins: `px-4 py-6` on screens, `p-4` on cards.

---

## Approval

| Role | Name | Date |
|------|------|------|
| Designer / Product Owner | [Your Name] | May 15, 2026 |

**Version:** 1.1  
**Status:** Ready for component generation