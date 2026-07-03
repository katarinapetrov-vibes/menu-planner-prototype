---
description: What to use inside prototypes — approved component inventory, page shell, page templates, component selection heuristics, spacing rhythm, and the Stop-Flag-Ask protocol. Complements sage-tokens.mdc (token governance, global) and sage-layouts.mdc (composition, layout primitives, UX laws).
globs: app/prototypes/**/*.tsx
alwaysApply: true
---

# Sage Rules

You are working inside `app/prototypes`. This file governs **what to use**: which components, which tokens, which page structures, and what to do when something you need doesn't exist.

It complements:
- `sage-tokens.mdc` — token governance (global). All colour and dimension values MUST come from there. This file does not restate token rules; it consumes them.
- `sage-layouts.mdc` — how to compose: layout primitives, UX laws, Nielsen heuristics, the five mantras.

These three rules are non-negotiable constraints, not suggestions.

---

## 1. Forbidden

- **Raw HTML elements with custom styling.** `<button>`, `<input>`, `<select>`, `<div>` with inline styles or arbitrary Tailwind classes are BANNED.
- **Hardcoded colour values.** No `#rrggbb`, `rgb(...)`, or `rgba(...)` strings anywhere in this directory — all colours MUST come from `@/lib/tokens`.
- **Hardcoded spacing or sizing.** No `16px`, `p-4`, `mt-2`, `gap-3`, or any arbitrary dimension — all spacing MUST come from `@/lib/tokens`.
- **Duplicating DS components.** Never create a new local component that replicates something already in `components/ui/` or `lib/layout.tsx`.
- **Non-Sage icon sources.** `lucide-react` imports, inline SVG paths copied from external icon sets, and any other non-Sage icon source are BANNED. All icons MUST come from `@/components/ui/icons`. (Emoji as UI icons are covered by the dedicated Emoji policy below.)

```tsx
// FORBIDDEN
import { ArrowLeft, Check, X } from 'lucide-react'

// REQUIRED
import { CheckOutline, CloseOutline } from '@/components/ui/icons'
```

- **Emoji policy.** Distinct from but related to icons:
  - **Emojis as UI icons** (✅, ❌, ✓, ✗, ★, 💡, 🔍, ⚠️, ℹ️, 👍, 👎, etc. used as a substitute for an icon in a button, chip, status indicator, list item, alert, banner, badge, or any other UI chrome) → FORBIDDEN. Use a Sage icon from `@/components/ui/icons`.
  - **Emojis as decoration** (sprinkled in headings, labels, navigation items, prose, empty states, or section titles for "personality" or visual interest) → FORBIDDEN. Sage is an enterprise platform; decorative emoji undermines the aesthetic.
  - **Glyphs in displayed values** like "★ 4.2" for ratings, "👍 12" for upvotes → FORBIDDEN. Use the matching Sage icon component paired with the numeric value (e.g. `<StarOutline />` next to "4.2").
  - **User-generated content** (a chat-message prototype rendering emoji a user actually typed; an emoji reaction picker; rendering emoji that appears in real customer data) → ALLOWED. The emoji is the data, not the UI.
  - **Documentation, comments, and commit messages** (markers in `.mdc` rule files, JSDoc comments, code comments, README examples, commit-message body text) → ALLOWED. Not rendered to end-users.

  The test: is the emoji rendered to a user as part of the UI the designer or engineer composed? If yes → forbidden, replace with a Sage icon. If the emoji is user-typed data or appears in source documentation → fine.

```tsx
// FORBIDDEN
<button className="bg-green-600 px-4 py-2 rounded-lg text-white">Save</button>

// FORBIDDEN
<div style={{ color: '#067A46', marginTop: '16px' }}>Label</div>

// FORBIDDEN
function MyButton({ children }) {
  return <button className="...">{children}</button>
}
```

---

## 2. Required — what to use

### Icons

All icons MUST be imported from `@/components/ui/icons`. The Sage icon library exports 100+ branded outline and filled icons via named exports (`AppleOutline`, `CheckOutline`, `ChevronArrowDownOutline`, `CloseOutline`, `DeleteOutline`, `XOutline`, etc.) plus a generic `IconRoot` for compositional use.

```tsx
// REQUIRED
import { CheckOutline, CloseOutline } from '@/components/ui/icons'
```

If the icon you need is not in the Sage set, follow the Unknown Component Protocol (Section 7) — STOP, FLAG, ASK. Do not reach for `lucide-react` or substitute an emoji as an interim solution.

### Components

All UI must be imported from `@/components/ui/` or `@/lib/layout`. The full approved inventory:

- **Actions / Layout**: `Button`, `ButtonGroup`, `BottomBar`, `Filter`, `Footer`, `Header`, `Menu`, `MenuItem`, `Pagination`, `TransferList`, `Wizard`
- **Display**: `Avatar`, `BulkSelection`, `Chip`, `Card`, `Divider`, `Flag`, `KPIData`, `LikeCommentCounter`, `NotificationBadge`, `Rating`, `StatusIndicator`
- **Feedback**: `Alert`, `Banner`, `Snackbar`, `ProgressBar`, `Skeleton`, `Tooltip`, `Popover`
- **Data**: `Table`, `BarChart`, `LineChart`, `BubbleChart`, `HorizontalBarChart`, `ScatterChart`, `RadarChart`, `DonutChart`, `PieChart`, `PolarAreaChart`, `VerticalBarChart`
- **Forms**: `Checkbox`, `DropdownField`, `DropzoneAndUpload`, `InputField`, `RadioButton`, `Select`, `Slider`, `TextArea`, `Toggle`
- **Layout primitives** (composition layer): `Surface`, `Stack`, `Cluster`, `PageShell`, `PageContent`, `PageToolbar`, `PageTitle`, `SectionHeader`, `ActionBar`, `Divider`, `DataTable`, `FieldGroup`, `FieldReadOnly`, `BodyText`, `MetaText`, `AttributeTag`, `StatusPill`. Import from `@/lib/layout`. Full composition rules and the "use the layout layer first" protocol live in `sage-layouts.mdc`.
- **Layout (other)**: `Lists`, `Scrollbar`
- **Navigation**: `Accordion`, `SideNavigation`, `Stepper`, `Tabs`
- **Panels**: `CommentPanel`, `Dialog`, `LogItem`, `LogsPanel`, `Scrim`, `SideSheet`

```tsx
// REQUIRED
import { Button } from '@/components/ui/button'
<Button variant="filled" color="positive">Save</Button>

// REQUIRED — layout primitive
import { Stack, ActionBar } from '@/lib/layout'
```

### Tokens

All colours and spacing values MUST be sourced from `@/lib/tokens`, governed by `sage-tokens.mdc`. This file does not restate token rules — read `sage-tokens.mdc` for the four pillars and write permissions.

```tsx
import { semantic, spacing } from '@/lib/tokens'

<div style={{
  color: semantic.foreground.positive.default.light,
  marginTop: spacing[400],
}}>
  Label
</div>
```

### Tailwind exceptions

Tailwind utility classes are only permitted if they map to the platform's established token scale:

- Backgrounds: `bg-slate-950`, `bg-slate-900`, `bg-slate-800/40`
- Text: `text-slate-200`, `text-slate-400`, `text-slate-500`
- Accents: `text-emerald-500`, `text-purple-500`, `text-blue-500`
- Borders: `border-white/5`, `border-white/10`

Arbitrary values like `bg-[#123456]` or `text-[14px]` are FORBIDDEN.

---

## 3. The standard page shell

Every prototype page follows this canonical shell, composed from layout-layer primitives:

```tsx
import { PageShell, PageContent, PageHeader, Stack } from '@/lib/layout'
import { SideNavigation } from '@/components/ui/side-navigation'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'

export default function MyPrototypePage() {
  return (
    <PageShell
      sidebar={<SideNavigation groups={navGroups} /* ... */ />}
      header={<Header title="Tool name" /* must include country dropdown — see rules below */ />}
      // footer omitted — Sage <Footer /> renders by default. Pass footer={null} to opt out.
    >
      <PageContent>
        {/* One PageHeader per view — title, optional subtitle, optional actions */}
        <PageHeader
          title="Section Title"
          subtitle="Optional supporting line"
          secondary={<Button variant="outline">Cancel</Button>}
          primary={<Button variant="filled" color="positive">Save</Button>}
        />

        {/* Content blocks below — use Stack gap={800} for top-level rhythm */}
        <Stack gap={800}>
          {/* ... */}
        </Stack>
      </PageContent>
    </PageShell>
  )
}
```

### Shell rules

- **`sidebar`** is **required.** Pass `<SideNavigation />`. The Sage `SideNavigation` defaults to a collapsed icon rail; when expanded it overlays the page rather than reflowing content.
- **`header`** is **required.** Pass `<Header />` with the tool name as `title`. **The Header must include a country dropdown on its right side** (e.g. "Green Chef UK") — this is a convention every Sage-using prototype follows so users always know which brand/region they're operating in. The title text is per-tool (OWL, Leads, CERT, etc.) and is never hardcoded.
- **`footer`** is **optional.** If omitted, the Sage `<Footer />` renders automatically with the standard copyright. Pass `footer={null}` to opt out on full-bleed pages (e.g. modals taking over the viewport).
- `PageContent` provides the canonical content padding (`spacing[600]` horizontal, `spacing[800]` vertical) and gap (`spacing[600]` between top-level blocks). Do not override.
- **Action zone** (page-level Save / Cancel / etc.): top-right of the content area, owned by `<PageHeader>`. Do NOT put actions inside the `Header` component or in a sticky bottom bar.
- **`PageHeader`** is the canonical block for "title + action zone." Pass the page title as `title`, optional supporting line as `subtitle`, and the page-level CTAs as `primary` (filled), `secondary` (outline), `ghost` (text). It composes `PageTitle`-style typography internally — never recompose this inline.

---

## 4. Page templates

These four templates cover the volume of prototype work. When a designer prompts for a kind of page, default to the template below unless the prompt explicitly overrides.

### 4.1 Table View

For prototypes whose primary content is a list of records with multiple metadata columns and bulk actions.

```
[Page shell]
  [PageContent]
    [Title row + action zone]
    [Table]
      - title prop set
      - searchable: true
      - filterButton: true (filter on the RIGHT side of the title bar)
      - selectable: true if bulk actions are needed
      - actions: passed in (BottomBar appears on selection)
      - sortable columns where relevant
    [Pagination]
      - showRowsPerPage: true
      - showRangeText: true
      - prev/next + range text (DS-standard — no numbered page buttons)
```

**Density default.** Many columns (~6+) or many rows visible → `size="compact"`. Fewer columns (≤5) and scannable rows → `size="comfortable"` (component default).

**Bulk actions** appear via `BottomBar` only when rows are selected. Do not build a persistent action toolbar.

**Filter location** is the right side of the table's title bar (the `filterButton` prop on `Table` is positioned there by default).

### 4.2 Dashboard

For prototypes whose primary content is at-a-glance metrics + supporting data.

```
[Page shell]
  [PageContent]
    [PageHeader — title + optional actions]
    [KpiRow]
      - 3 to 4 metric items inside, horizontal row, equal width
      - Children: <KPIData> for simple bare metrics OR <Card> for complex
        (charts, deltas, trends)
      - Auto-wraps to a second row when narrow — no manual breakpoints
      - dividers prop default: ON if all children are <KPIData>, OFF otherwise
    [Charts and tables below]
      - Mix of chart components and supporting Table
      - Default chart height: 300px (component default)
      - Table preferred when data has meaningful detail
      - Chart preferred when the story is about trend or comparison
```

**KPI layout default.** Wrap metric items in `<KpiRow>`. Use `<KPIData>` for simple label + value, `<Card>` for complex metrics with charts or deltas. 3–4 items canonical (Miller's Law — max 9 per row).

**Chart-vs-table choice.** When the data has meaningful detail per row, prefer `Table`. When the story is about trend or category comparison, prefer the appropriate chart (`LineChart` for trends, `BarChart` for category comparisons, `DonutChart` for compositions, `ScatterChart` for correlation).

**Default chart height.** 300px for individual charts in a multi-chart dashboard. 400px reserved for hero/featured chart positions or radar/horizontal-bar charts (which have 400 as their own component default).

### 4.3 Form

For prototypes whose primary content is data entry.

```
[Page shell]
  [PageContent]
    [Title row + action zone (Save / Cancel / Submit at top-right)]
    [Form Card]
      - Card variant="outlined" or "filled"
      - Card padding: spacing[600] (24px)
      - Single-column field layout
      - Field gap: spacing[400] (16px)
      - Each input: layout="horizontal" (label inline left)
```

**Field layout default.** Single column. Two-column allowed when fields are short and naturally paired (e.g., First name + Last name, City + Postcode).

**Label position.** `layout="horizontal"` on `InputField` and `DropdownField` — labels sit inline to the left of the field. (Deliberate override of the component default `stacked`.)

**Action zone.** The form's primary actions (Save, Cancel, Submit) live in the **top-right of the content area**, NOT in a sticky bottom bar, NOT inside the form card.

**Multi-step forms** use `Wizard` (`variant="modal"`, `"page"`, or `"page-sidebar"` depending on flow weight). Do not build a stepped form by hand from `Stepper` alone.

**Forms vary** — these defaults apply when the prompt is ambiguous. Designers may deviate when a specific flow demands it (e.g. a long survey may use `layout="stacked"` for vertical rhythm). When deviating, do so deliberately — never by accident.

### 4.4 List View

For prototypes whose primary content is a list of records with a paired detail expansion.

```
[Page shell]
  [PageContent]
    [Title row + action zone]
    [Table — configured for list-with-expansion]
      - searchable: true
      - filterButton: true (right side, same as Table View)
      - expandedContent: render function for inline detail
      - expandedKeys + onExpandChange for state
      - Density default: comfortable (rows need scannable height for expansion)
    [Pagination below]
```

**Detail interaction.** **Inline expansion** via `Table.expandedContent`. Do NOT use `SideSheet`, `Dialog`, or new-page navigation for the detail view in list-view templates. Inline keeps the user in scanning context.

**Filter location.** Right side of the table title bar (same as Table View).

---

## 5. Component selection heuristics

When the prompt is ambiguous about which component to use, default as follows:

| Need | Default | When to deviate |
|---|---|---|
| Tabular data with sortable columns + bulk actions | `Table` | Use `Lists` only when items are visually heavier (avatars, multi-line metadata) and tabular structure is awkward |
| Filter UI | `Filter` (multi-section dropdown) | `DropdownField` for a single-attribute filter inline within a form |
| Single transient confirmation message | `Snackbar` | `Banner` for persistent app-wide notification, `Alert` for in-context contextual message |
| Inline status indicator | `StatusIndicator` (dot + label) | `Chip` when the status is also actionable/removable |
| Single-select categorical input | `RadioButton` group (≤5 options) | `Select` (Radix wrapper) or `DropdownField` for >5 options |
| Multi-select categorical input | `Checkbox` group (≤5 options) | `DropdownField` with `multi=true` for >5 options |
| Side panel for detail/inspection | `SideSheet` (NOT for list-view detail — see Section 4.4) | `Dialog` for blocking confirmation; `CommentPanel` only for comment threads |
| Multi-step flow | `Wizard` (`variant="page"` for full-page, `"modal"` for modal flows) | `Stepper` alone (without `Wizard` chrome) for read-only progress display |
| Page section heading | `<SectionHeader>` from `lib/layout` (or `headline/h4`/`h5` from `typography.scale`) | Never a raw `<h1>` / `<h2>` with custom styling |
| Primary action button | `Button` `variant="fill"` `color="positive"` `size="md"` (component defaults) | `color="negative"` for destructive; `variant="outline"` for secondary |
| Loading placeholder | `Skeleton` matching the shape it's standing in for | `ProgressBar` (linear or circular) when work is in progress, not just loading |

### Colour-naming inconsistency to be aware of

The DS uses two parallel colour-intent vocabularies:

- **Action components** (`Button`, `Chip`): `positive` / `negative` / `neutral` / `ai`
- **Feedback components** (`Alert`, `Banner`, `Snackbar`, `Popover`, `NotificationBadge`, `StatusIndicator`): `success` / `warning` / `error` / `info` / `ai`

These are intentional but inconsistent. When picking a colour prop, check the component's actual prop type — do not assume `success` is valid on `Button` or `positive` is valid on `Alert`. TypeScript will catch errors, but be deliberate. See Section 9.

---

## 6. Spacing rhythm cheat sheet

When in doubt, this is the lookup table:

| Context | Token | Value |
|---|---|---|
| Icon-to-label gap inside a button or chip | `spacing[200]` | 8px |
| Gap between adjacent inline form fields | `spacing[300]` | 12px |
| Card or modal internal padding | `spacing[400]` | 16px |
| Gap between fields in a vertical form | `spacing[400]` | 16px |
| Gap between adjacent action buttons | `spacing[200]` | 8px |
| Gap between KPI cards in a dashboard row | `spacing[400]` | 16px |
| Page horizontal gutters (content area to viewport edge) | `spacing[600]` | 24px |
| Card or section padding (comfortable density) | `spacing[600]` | 24px |
| Gap between top-level page sections (KPI row → table) | `spacing[800]` | 32px |
| Page vertical padding (content area top/bottom) | `spacing[800]` | 32px |
| Major section break (between unrelated content blocks) | `spacing[1200]` | 56px |

If a context isn't covered, find the nearest analogue and use the same token. Do NOT introduce new spacing values. (See `sage-tokens.mdc` Pillar III — Dimensional Discipline.)

`spacing[50]` (2px) is reserved for compact-density component internals only and must not appear in prototype layout code.

---

## 7. Unknown Component Protocol — STOP, FLAG, ASK

If you cannot find a matching component in `components/ui/` or a matching layout primitive in `lib/layout.tsx`, you MUST follow this exact sequence:

1. **STOP** — do not write any component code.
2. **FLAG** — tell the designer: "No matching DS component or layout primitive was found for [X]."
3. **ASK** — present these two options explicitly and wait for a response:
   - **Option A**: Build a temporary one-off component now, flagged for DS review later.
   - **Option B**: Skip this component and raise it with the Design System team first.
4. **DO NOT PROCEED** until the designer makes an explicit choice.

This protocol covers both DS components AND layout primitives. If a needed layout pattern doesn't exist, raise it the same way — propose it as a new layout primitive in `sage-layouts.mdc`, not as a one-off inline composition.

### If Option A is chosen — the @temporary tag

Build the one-off and mark every usage with the structured tag:

```tsx
// @temporary component:<Name> reason:<why no DS match> owner:<designer>
```

All three fields are **required**. The tag must appear on:
- The component function/const definition
- Every import site of that component

**Example:**
```tsx
// @temporary component:RecipeCard reason:no DS card variant for image+badge layout owner:kat
export function RecipeCard({ title, image }: RecipeCardProps) { ... }
```

This tag exists so the DS team can find and replace all temporary components after review.

### Token sovereignty for temporary components

A `// @temporary` component must still source all colours from `semantic.*` tokens and all spacing/sizing from `spacing`, `sizing`, or `radius` — **no hardcoded hex or pixel values**. The `@temporary` tag means the component *shape* is pending DS review; it does not grant a token exemption. See `sage-tokens.mdc` for the full aliasing rules.

### Discovering temporary components

To audit all one-offs currently in use:

```bash
grep -rn "@temporary" app/prototypes/
```

The escalation message to the designer must always include: _"Raise this with the Design System team before shipping."_

### Existing component, insufficient props — the Prop Gap Protocol

This case is distinct from a missing component and requires its own rule:

**If a DS component exists in `components/ui/` but its current props don't fully cover the required use case**, follow this sequence:

1. **USE IT FIRST** — attempt to implement with the nearest available props. Stretch the component as far as it reasonably goes within its documented API.
2. **Read the component's full prop interface before concluding it can't be used.** Components like `DisplayChip`, `Button`, and `InputField` have `trailingIcon`, `leadingIcon`, `showTrailingIcon`, `showLeadingIcon`, `onClick`, and `ref` props. The gap is often not real — it just hasn't been read.
3. **If genuinely insufficient** — tag a `// @temporary` wrapper and flag the specific prop gap:

```tsx
// @temporary component:<Name> reason:Header lacks <specific prop/variant> — using wrapper until DS adds it owner:<designer>
```

4. **NEVER silently replace a DS component with a hand-rolled recreation.** A custom `HeaderBar` that replicates `<Header />` is a violation of the same rule that forbids replicating buttons or inputs. The component's identity matters, not just its visual output.
5. **NEVER use a DS component's token values or CSS as a style reference for a hand-rolled copy.** If you find yourself writing `background: '#e4e4e4'` because that's what `DisplayChip neutral light` resolves to — stop. That is the signal you should be rendering `<DisplayChip>` directly, not copying its output. Using a component's resolved values as a style template is the same violation as replacing the component.
6. **Following a bad precedent from another prototype is not a justification.** If an existing prototype uses a hand-rolled replacement, that prototype is also in violation — do not propagate the pattern.

**The test:** If `grep -rn "components/ui/header"` returns zero results in a prototype that renders a header, that prototype is using an unauthorised replacement and must be flagged.

**The style-copy test:** If you are writing inline styles whose values are derived by inspecting a DS component's source or Tailwind classes (e.g. `height: 16` because the chip is `h-4`, `borderRadius: '9999px'` because the chip is `rounded-[40px]`), you are copying the component's output, not using the component. Stop, delete the hand-rolled element, and render the DS component instead.

---

## 8. Editing existing prototypes

Many existing prototype files pre-date current Sage standards and contain anti-patterns (raw Tailwind layout, lucide-react imports, emoji glyphs as UI icons, hand-rolled HTML elements with custom styling). The Sage rules apply equally to edits in those files. Local precedent inside a file is NOT sanctioned and does NOT override the rules.

When you encounter a non-Sage pattern while editing:

1. **Do NOT follow non-Sage precedent.** If a file has 150 Tailwind `text-*` classes, that is a known anti-pattern, not a style to match. Write new code per current Sage rules regardless of what surrounds it.
2. **Do NOT extend anti-patterns.** Adding a new Tailwind class because the surrounding lines use Tailwind, adding a new lucide import because lucide is already imported in the file, adding emoji because emojis exist in the file — all violations.
3. **Surface anti-patterns when encountered.** When making a change near existing Tailwind / lucide / emoji / raw-HTML code, list the specific anti-patterns you saw in your response. Offer to refactor them in the same edit OR flag them for a follow-up task. Do not silently propagate them.
4. **Refactor scope is at the user's discretion.** Default: refactor only what the task requires touching. If the task is "add a button to this card," do not refactor 500 unrelated lines of Tailwind in the same file. If the user explicitly asks for a refactor, do it. If you're unsure how much to refactor, ask.

### The test

When working in an existing file, ask: "Am I extending what's already here, or replacing it?" If extending: rules govern the new code, do not match local style. If replacing: rules govern the whole replacement. If pattern-matching surrounding code feels like the right thing to do, that's the signal you're about to propagate an anti-pattern — stop, identify what you're matching, and consult the rules instead.

---

## 9. Open DS Asks

These gaps block prototype work from being fully consistent and should be raised with the Design System team. Each ask references the section that revealed it.

1. **Colour-intent vocabulary is split.** Section 5 — action components use `positive`/`negative`/`neutral`; feedback components use `success`/`warning`/`error`/`info`. Either unify the naming or document the split explicitly in the DS so designers and AI know the rule.

2. **`TimelineSelector` is referenced in the Sage layout-layer plan but not yet in `lib/layout.tsx`.** Build when a prototype actually needs a week/period selector.

3. **`Header.dropdown` is single-select only; no second dropdown slot exists.** Section 7 (Prop Gap Protocol) — FDA requires a multi-select Brand picker and a single-select DC picker side-by-side in the header rail. Either add a `multiDropdown` slot (for multi-select use cases) or support `multi: true` on the existing `dropdown` config, and add a second dropdown slot for tools that need two parallel pickers.

When raising these asks, reference this rule's section number so the DS team has the full context for what the rule expected.
