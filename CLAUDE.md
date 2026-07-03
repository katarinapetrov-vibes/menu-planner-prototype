# Sage Starter Kit — AI Rules

You are working inside a Sage Starter Kit project. Sage is the Enterprise Design System used across HelloFresh.

---

## STEP 0 — Read DESIGN_FIRST.md before every design plan. Every single one.

**This is not a one-time instruction. Every time you are about to output a design plan — whether it is the first build in this conversation or the tenth — you must read `DESIGN_FIRST.md` again before writing it.**

Do not rely on having read it earlier in the conversation. Do not rely on memory. Read the file. Then write the plan.

This rule does not change. Do not ask the user whether to save this as a memory — the rule is here, in this file, and applies permanently to every build in this project.

After reading `DESIGN_FIRST.md`, confirm with one line:
> "DESIGN_FIRST.md read."

Then continue to the questionnaire.

---

## Rule files

| File | Governs |
|------|---------|
| `DESIGN_FIRST.md` | **Design direction — layout, hierarchy, containers, typography, colour. Read before every session.** |
| `.cursor/rules/sage-tokens.mdc` | Token governance — no hardcoded hex or px values |
| `.cursor/rules/sage-rules.mdc` | Component inventory, page templates, Stop-Flag-Ask |
| `.cursor/rules/sage-layouts.mdc` | Layout primitives, UX laws, Nielsen heuristics |

These are non-negotiable constraints, not suggestions. Both layers apply simultaneously.

---

## Typography rules — these apply to every single component you write

These come directly from DESIGN_FIRST.md. They are repeated here because they are the most commonly violated rules:

- **Agrandir (headline font) is for page titles only — one per view, via `PageHeader`.** Never use it for card titles, option labels, step labels, section headers, or any other text.
- **Satoshi (body font) is for everything else** — all content, labels, UI text, card titles, descriptions.
- **Maximum 3 text sizes per view.** If you have more, reduce.
- **Monospaced / `tabular-nums` for all numeric columns** — costs, scores, dates, quantities.
- **Line height 1.4 for all UI text.** Never `auto`, never `1.0`.

Before placing any text element, ask: is this the one page title? If yes → Agrandir via `PageHeader`. If no → Satoshi via `BodyText`, `MetaText`, or the appropriate DS component.

---

## SideNavigation rules — non-negotiable

**`<SideNavigation theme="dark" />` is required on every single view without exception.**

- `theme="dark"` = green brand surface (#067A46 background, white text, lime active state). This is the HelloFresh brand nav. It is always required.
- `theme="light"` = white background. This is NOT the correct theme for any HelloFresh tool. Never use it.
- The `theme` prop must be explicitly set to `"dark"` on every `<SideNavigation>`. Do not rely on a default.

Before writing any `<SideNavigation>`, check: does it have `theme="dark"`? If not, add it before writing anything else.

The example page at `app/tools/my-tool/page.tsx` demonstrates the correct usage — copy that pattern exactly.

---

## Container rules — these apply to every interactive flow you write

These come directly from DESIGN_FIRST.md. Repeated here because they are the second most commonly violated rules:

- **1–2 steps, no context needed → Dialog**
- **3–5 steps, user needs to see the page behind → SideSheet**
- **4+ steps, full commitment, heavy input → Wizard (page variant)**

Never build a Wizard for something a Dialog or SideSheet could handle. Before writing any container code, count the steps and answer: does the user need to see the page behind this?

---

## MANDATORY — Guided questionnaire

**Any time the user describes something to build — a tool, a dashboard, a form, a view — you MUST run the questionnaire below before doing anything else. This applies to the very first message and to any new view request during the session.**

Do not write code, do not output a design plan, do not ask clarifying questions outside of this format. Run the questionnaire exactly as written and wait for all answers before proceeding.

```
Before I start building, I have a few quick questions:

1. What is the tool name? (e.g. "Supplier Scorecard", "Menu Planner")
2. What is this specific view for? (e.g. "List of all suppliers", "Form to add a new supplier")
3. Who is the primary user? (e.g. "Buyer", "Menu Planner", "Supply Planner")
4. What is the ONE thing they need to do on this page? (the primary action)
5. What data or content is on this page? List the key fields or columns.
6. Should I use an existing prototype as a starting point?
   (Options: CPS, MPS, Supply Planning, Recipe Creator — or "none, start fresh")
7. Any constraints or special requirements?
```

Wait for all 7 answers. Then follow DESIGN_FIRST.md Steps 2–3 to output the DESIGN PLAN and stop.

---

## MANDATORY — Design plan protocol

**This step follows the questionnaire. Do not write any code until the plan is confirmed.**

The design plan format is defined in `DESIGN_FIRST.md` Step 3. Output it exactly as written there — do not abbreviate or summarise the plan. Include all fields:

```
DESIGN PLAN
───────────────────────────────────────────
View:             [what this view is for]
User:             [who is using it and what they need to do]
Template:         [4.1 Table / 4.2 Dashboard / 4.3 Form / 4.4 List — and why]
Primary action:   [the one filled green button — exactly what it does]

Visual weight order (loudest → quietest):
  1. [element] — [why it's loudest]
  2. [element]
  3. [element]
  4. [element — quietest]

Typography hierarchy:
  Page title:       [component and token]
  Section labels:   [component and level]
  Table content:    [BodyText density]
  Meta / supporting:[MetaText emphasis]

Sticky elements:   [anything in PageToolbar / Header slot / none]
Colour plan:       brand green max 5 placements — list every one
Density:           compact / default / relaxed — and why
Non-standard:      [anything the template doesn't cover, or "none"]
───────────────────────────────────────────
```

Before presenting the plan, check:
- Does any load-bearing element (week label, active filter, context anchor) live in PageHeader or PageContent? If yes — it will scroll away. Move it to PageToolbar or the Header slot.
- Does the typography hierarchy use at most 3 text sizes? If more — reduce.
- Is there exactly one filled button? If more — demote the others.

Stop after the plan. Do not write any code. Wait for confirmation.

---

## MANDATORY — Build phase (only after plan is confirmed)

Follow `DESIGN_FIRST.md` Step 4 exactly:

- Preserve the existing PageShell, SideNavigation, and Header. Build only inside PageContent.
- Follow the confirmed design plan exactly. If something in the plan turns out to be wrong during implementation, stop and flag it — never silently deviate.
- Before writing any layout code, verify the SideNavigation green brand surface prop is set correctly. The green sidebar is required on every view.
- Header title = tool name. Page title = PageHeader inside PageContent. Never put the same title in both.

---

## Project structure

```
DESIGN_FIRST.md       ← Design direction layer (read first)
CLAUDE.md             ← This file — AI entry point
components/ui/        ← Sage DS components (never modify)
components/ui/icons/  ← ~248 curated Sage icons (never modify)
lib/tokens.ts         ← Sage token system (never modify — human-only)
lib/layout.tsx        ← Layout primitives (never modify)
lib/utils.ts          ← Shared helpers
app/tools/            ← Your tools go here
data/                 ← Seed data (countries, brands — extend as needed)
.cursor/rules/        ← Token + component governance rules
```

## Where to build

All new views go in `app/tools/<your-tool-name>/page.tsx`. Copy the pattern from `app/tools/my-tool/page.tsx` as a starting point.

## Seed data

`data/countries.ts` and `data/brands.ts` contain real HelloFresh market data. Import `countryOptions` and `brandOptions` for use in Header dropdowns and form fields.

## Icons

Icons are available from `@/components/ui/icons`. The starter includes ~248 curated icons. If you need an icon that isn't available, use `IconRoot` to wrap a custom SVG, tagged `// @temporary`.

---

## Sync note

This starter kit is synced from the Enterprise UX Platform. When the EUX team publishes a DS release, a new ZIP will be available at the EUX platform download page. To update:

1. Download the new ZIP
2. Replace `components/ui/`, `lib/tokens.ts`, `lib/layout.tsx`, and `.cursor/rules/`
3. Run `npm install` if `package.json` changed
4. Check the release notes for any breaking API changes
