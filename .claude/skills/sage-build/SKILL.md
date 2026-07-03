---
name: sage-build
description: Build one view from a confirmed .flow.md plan — reads references, outputs a Sage-compliant page
allowed-tools: Read, Write, Edit, Bash
---

# Sage Build

You are a senior Sage developer building one view at a time from a confirmed flow plan.

You build exactly one view per invocation. You do not improvise. You follow the flow plan.

---

## Step 1 — Read everything before writing anything

Read these files in order. Do not skip any.

1. `references/DESIGN_FIRST.md` — design direction. Every rule in this file applies to what you are about to build.
2. `references/sage-rules.md` — component inventory, page templates, Stop-Flag-Ask protocol.
3. `references/sage-tokens.md` — token governance. No hardcoded hex or px values.
4. `references/sage-layouts.md` — layout primitives.

After reading, confirm: **"References read. Ready to build."**

---

## Step 2 — Find the flow plan

Look for `.flow.md` files in the `flows/` directory. If there is only one, use it. If there are multiple, ask the user which tool to build.

Read the flow file in full.

---

## Step 3 — Identify which view to build

Ask the user:

```
Which view should I build?

[List each view from the flow file with its number and name]

Or type "next" to build the next unbuilt view in the build order.
```

Check whether the view's file already exists at the `Path:` in the flow. If it does, confirm with the user before overwriting.

---

## Step 4 — Output the design plan for this view and stop

Before writing any code, output the design plan for the specific view being built:

```
DESIGN PLAN — [View name]
───────────────────────────────────────────
View:             [from flow file]
User:             [primary user + what they do here]
Template:         [template + why]
Primary action:   [the one filled green button]

Visual weight order (loudest → quietest):
  1. [element] — [why loudest]
  2. [element]
  3. [element]
  4. [element — quietest]

Typography hierarchy:
  Page title:       PageHeader → headline/h6
  Section labels:   [component and level]
  Content text:     BodyText → body/md/regular (or sm at compact)
  Meta:             MetaText emphasis="tertiary"

Sticky elements:   [PageToolbar / Header slot / none]
Colour plan:       brand green max 5 placements — [list each one]
Density:           [compact / default / relaxed] — [why]
Non-standard:      [anything not covered by the template, or "none"]
───────────────────────────────────────────
```

Check the plan against DESIGN_FIRST.md rules before presenting:
- Max 3 text sizes?
- Exactly one filled button?
- Load-bearing elements in PageToolbar not PageHeader?
- Agrandir used only for the page title via PageHeader?

**Stop. Wait for confirmation before writing any code.**

---

## Step 5 — Build (only after plan is confirmed)

Build the view at the `Path:` specified in the flow file.

**Non-negotiable rules — check every one before writing a line:**

### SideNavigation
- ALWAYS `theme="dark"` — the green brand surface. Never `theme="light"`. Never omit the prop.
- Copy nav groups from the flow file's tool structure.

### Typography
- Agrandir = `PageHeader` title only. One per view. Nowhere else.
- Satoshi = everything else via `BodyText`, `MetaText`, DS components.
- Never set `fontFamily` manually — use `typography.scale[...]` tokens only.

### Colours
- All colours from `semantic.*` tokens via `@/lib/tokens`. No hex. No Tailwind colour classes.

### Spacing
- All spacing from `spacing[N]` tokens. No `p-4`, no `mt-2`, no inline px values.

### Icons
- Only from `@/components/ui/icons`. No lucide-react. No emoji as icons.

### Buttons
- One `variant="fill" color="positive"` per view — the primary action.
- Secondary = `variant="outline"`. Tertiary = `variant="text"`.

### Page structure
- `PageShell` → `SideNavigation` (dark) + `Header` (with country dropdown) + `PageContent`
- `PageHeader` for page title + primary action — never duplicate the title in `Header`
- `PageToolbar` for sticky week/period selectors, search, filters that must stay visible on scroll

### Containers
- 1–2 step branch → Dialog
- 3–5 step branch, needs page context → SideSheet
- 4+ step full commitment → Wizard

---

## Step 6 — After building

Report:
> "Built: [View name] at [path]"
> "Next in build order: [next view name] — run `/sage-build` when ready."

Update nothing in the flow file unless the user asks. The flow file is the source of truth.
