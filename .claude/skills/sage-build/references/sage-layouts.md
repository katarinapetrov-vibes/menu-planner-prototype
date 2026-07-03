---
description: Composition layer for prototypes. Covers layout primitives, the grid/spacing/colour system, the five composition mantras, enterprise-weighted UX laws, and Nielsen heuristics. Complements sage-tokens.mdc (token governance, global) and sage-rules.mdc (component imports + page templates, prototype-scoped).
globs: app/prototypes/**/*.tsx
alwaysApply: true
---

# Sage Layouts

You are working inside `app/prototypes`. This file governs the **composition layer** that sits above Sage DS components: which structural primitives exist, how to ration colour and space, and which evidence-based design principles apply to dense enterprise interfaces (tables, charts, dashboards).

It complements:
- `sage-tokens.mdc` — token governance (global). Token sovereignty is the highest priority — this file operates within it, not instead of it.
- `sage-rules.mdc` — what to use (component imports, page templates, Stop-Flag-Ask).

---

## 1. Layout primitives

Before reaching for a Sage DS component for structure, check `lib/layout.tsx`. These layout primitives enforce composition rules at the type level. They are the first tool for any layout decision.

Every primitive lists its synonyms in the "Use when" cell after "**Also called:**". The AI should treat any of those names as an unambiguous reference to that primitive when reading designer prompts.

| Primitive | Use when |
|---|---|
| `<PageShell>` | Any full-page prototype layout. Provides explicit slots for sidebar (required), header (required), footer (defaults to Sage `<Footer />`), and children (scrollable content). **Also called:** page wrapper, app frame, layout shell, main layout, page chrome. |
| `<PageContent>` | The main scrollable content area inside `<PageShell>`. Sets canonical page padding and gap. **Also called:** main content, page body, scrollable area. |
| `<PageToolbar>` | Sticky toolbar between header and content. Houses search, filters, and inline CTAs. **Also called:** toolbar, filter bar, search bar. |
| `<PageHeader>` | Title + action zone composite at the top of `PageContent`. Slots: `title` (required), `subtitle`, `primary`, `secondary`, `ghost`. Replaces the inline `Cluster + PageTitle + ActionBar` pattern. **Also called:** page title bar, page heading with actions, section header with CTAs. |
| `<PageTitle>` | Quiet page-level label, used inside panels / side sheets where actions aren't needed. For the canonical page top-of-content title + actions block, prefer `<PageHeader>`. **Also called:** page heading, section label. |
| `<KpiRow dividers?>` | Equal-width horizontal layout for metric items. CSS Grid auto-fits each cell to at least 168px and wraps to a second row when narrow. Children can be `<KPIData>` (simple bare metrics) or `<Card>` (complex with charts). `dividers` defaults to ON when all children are `<KPIData>`, OFF otherwise. **Also called:** kpi strip, split row, metric row, stat row, kpi cards, summary cards, metric grid. |
| `<CardGrid>` | Equal-width grid for catalogues of similar items (tile lists, product cards, recipe thumbnails). CSS Grid `auto-fit, minmax(<min>, 1fr)` — no `columns` prop. `min` (any `scale.*` step) tunes how wide a card needs to be before it gets its own column; default `scale[1900]` (272px). `gap` defaults to `spacing[400]`. Collapses to one column below 600px container width. **Also called:** tile grid, card list, gallery, product grid, catalogue grid, thumbnail grid. |
| `<SplitPane ratio="...">` | Two children side-by-side with a configurable ratio. Canonical layout for list+detail, form+preview, content+sidebar. `ratio` accepts `"1:1"` (default), `"1:2"`, `"2:1"`, `"1:3"`, `"3:1"`. `gap` defaults to `spacing[600]`. Static — no drag handle. Collapses to a vertical stack below 600px container width (top child first). **Also called:** two-pane layout, split view, sidebar layout, side-by-side, master-detail, two-column layout. |
| `<EmptyState>` | "Nothing to show" message for empty tables, lists, dashboards, side panels, or full pages. Container-aware via CSS Container Queries — auto-switches between compact and full-emphasis treatments based on available width (600px breakpoint). No `size` prop; the primitive reads its container. Slots: `illustration`, `title` (required), `description` (ReactNode — inline `<a>` tags auto-styled with the positive foreground token), `primary`, `secondary`. **Also called:** zero state, no-data state, empty placeholder, empty view, no-results state, blank slate. |
| `<Section>` | Titled chunk of a page — header (title + optional description + optional action) above a body with built-in vertical rhythm. Sits one level below `<PageHeader>` and one level above `<SectionHeader>` in the hierarchy. Slots: `title` (required), `description` (ReactNode), `action` (right-aligned, typically a single Button or link), `children` (body). Renders as a raised surface by default (`surface="section"` → radius.lg, 24px padding). Override with `surface="card"` (radius.md) or `surface="none"` (flat — use when the Section already sits inside another contained surface). Body gap defaults to `spacing[400]`; override with `gap={N}`. Accepts `id` for in-page anchors. **Also called:** section block, titled section, page section, content section, titled card, panel. |
| `<Surface tier="...">` | Any contained surface. Canonical tiers: `base`, `raised`, `sunken`, `overlay`. Raised variants: `section`, `card`. State variants on raised: `hovered`, `selected`, `disabled`. Deprecated aliases (kept for migration): `page` (use `base`), `inset` (use `sunken`). **Also called:** container, panel, surface tier, card wrapper, frame. |
| `<Stack gap={...}>` | Vertical spacing between any elements — token-driven gap, never arbitrary. **Also called:** vertical stack, column, vstack, vertical group. |
| `<Cluster gap={...}>` | Horizontal grouping of any inline elements with token-driven gap. **Also called:** horizontal group, row, inline cluster, hstack, hbox. |
| `<SectionHeader level="...">` | Label above a group of content — `primary` (uppercase, wide tracking; max 2 per view) or `secondary` (sub-section labels). **Also called:** section title, category header, group header, subheading. |
| `<ActionBar>` | Any row of actions — enforces one primary button maximum via three named slots (`primary`, `secondary`, `ghost`). **Also called:** button row, action row, cta bar, form footer. |
| `<DataTable density="...">` | Lightweight tabular layouts (use Sage `<Table>` for feature-rich data views with search/filter/expansion). **Also called:** table, simple table, data grid, list table. |
| `<FieldGroup title columns>` | Form fields grouped with a section label and grid layout. **Also called:** form group, fieldset, input group, form section. |
| `<FieldReadOnly label value>` | Read-only label/value pairs in panels and side sheets. **Also called:** read-only field, info field, display field, key-value pair. |
| `<BodyText>` | Body-level content text. The default primitive for any text whose role is "content the user reads" — paragraph copy, table row cells, list item titles, dashboard metric values, card body text, search results, form field values, and so on. Resolves to `body/md/regular` (16px) at default density, `body/sm/regular` (14px) when `density="compact"`. `emphasis` accepts `default` / `secondary` / `positive` / `negative` for colour variants. `weight="semi"` opts into the matching `/semi` token at the same size. Pass `as="span"` for inline use; default is `<p>`. The 12px tokens are intentionally unreachable — for meta-text (captions, timestamps, status microcopy) use `<MetaText>`. **Also called:** paragraph, body, body copy, body text, content text. |
| `<MetaText emphasis="...">` | Secondary, tertiary, positive, or negative meta information at caption size. **Also called:** caption, meta, supporting text, helper text. |
| `<Divider orientation?>` | Thin separator line. Defaults horizontal (`<hr>`); pass `orientation="vertical"` for an inline vertical separator (used by `KpiRow` between bare KPIs). **Also called:** separator, horizontal rule, vertical rule, hr. |
| `<AttributeTag>` | Category/attribute labels — no colour variants. **Also called:** tag, label, category chip. *Deprecated — use Sage `<Chip appearance="outline" chipColour="neutral">` for new code.* |
| `<StatusPill variant="...">` | Status displays — never use ad-hoc coloured badges. **Also called:** status badge, status indicator. *Deprecated — use Sage `<Chip appearance="light">` with the appropriate `chipColour` for new code.* |

If a layout pattern is not covered by the above, follow the Unknown Component Protocol in `sage-rules.mdc` — STOP, FLAG, ASK — and propose it as a new layout primitive, not as a one-off inline style.

### Surface Hierarchy — Never Skip Tiers

Surfaces have exactly 4 tiers. Never place a lower tier directly on a higher one without the intermediate tier:

```
base → raised (section / card) → sunken · overlay (floats above)
```

- A `card` never sits directly on a `base` background — it needs a `section` between them.
- A `sunken` surface always sits inside a `card` or `section` — never directly on `base`.
- `overlay` (modals, dropdowns, popovers) sits above everything.

**Vocabulary note.** `base`, `raised`, `sunken`, `overlay` are the canonical tier names. `section` and `card` are raised variants (same background, different radius). `hovered`, `selected`, `disabled` are state variants on raised surfaces — see `sage-tokens.mdc` Surface tokens (`background.raised.*`). The old names `page` (now `base`) and `inset` (now `sunken`) are kept as deprecated `Surface tier=` aliases for migration; prefer the canonical names in new code.

**Depth comes from two sources, applied per scope:**

- **Within the page** (page → section → card → inset): use background contrast between tiers.
- **Above the page** (overlay tier only): use shadow (`elevation.level4`).

Never use shadow for in-page hierarchy — it creates visual noise without adding information. The two depth systems are mutually exclusive: in-page surfaces never get shadow; floating surfaces always get shadow and never rely on background contrast (since they may sit on any background).

### Button Hierarchy — One Primary Per Surface

`<ActionBar>` enforces this structurally:

- One `primary` (filled) button per card, panel, or toolbar. Maximum one.
- `secondary` = outlined. For the second-most important action.
- `ghost` = no border, no background. For tertiary or destructive actions.
- **Never place two filled buttons side by side.** If you find yourself doing this, you have not made a design decision — make it before writing the code.

### Typography — Three Sizes Maximum

**Default body text resolves to `body/md/regular` (16px) for any text whose role is content the user reads** — table cells, list item titles, card bodies, dropdown options, and so on. The pairings table below covers labels, captions, headings, and meta-text only. For content text, do not pick from this table — default to `body/md/regular` (or `body/sm/regular` in compact-density variants). See `sage-tokens.mdc` → "Default body text" for the role-based test.

Any single view must use at most 3 text sizes and at most 2 font weights. Use the locked type pairings — never choose font size, weight, and colour independently:

| Component | Resolves to | Use for |
|---|---|---|
| `<PageHeader>` (title) | headline/h6 | Canonical page top-of-content title (20px Agrandir, weight 500) |
| `<PageTitle>` | body/md/semi | Quiet page-level label inside panels / side sheets |
| `<SectionHeader level="primary">` | body/caption/semi + uppercase | Major section dividers, max 2 per view |
| `<SectionHeader level="secondary">` | body/sm/semi | Sub-section labels, no uppercase |
| `<MetaText emphasis="secondary">` | body/caption/regular | Supporting info, labels |
| `<MetaText emphasis="tertiary">` | body/caption/regular + tertiary colour | Timestamps, IDs, placeholders |
| `<MetaText emphasis="positive">` | body/caption/regular + positive colour | Values in range, completion |
| `<MetaText emphasis="negative">` | body/caption/regular + negative colour | Values out of range, errors |
| `<FieldReadOnly>` | caption/semi label + sm/regular value | Read-only data fields |

Do not assemble font size + font weight + colour independently outside of these pairings.

---

## 2. The system — grid, spacing, and colour

This file's primitives, laws, and heuristics rest on a small shared system: how the codebase organises space and colour. The rules below define that system. Where the laws say *what* to enforce, this section says *what you're enforcing within*.

### 2.1 The soft grid

This codebase does not use a rigid 12-column grid. Instead:

- Page-level layout flexes to content needs within a fixed page shell.
- Section-level rhythm uses consistent spacing tokens, not column widths, to establish hierarchy.
- Component widths are set by the components themselves (e.g. `SideSheet` is 526px via `sizing.panel.width`), not by external column constraints.

When you compose a layout, you choose the *spacing rhythm* (which `spacing.*` tokens to use between elements), not the *column count*. The grid is implicit in the spacing scale.

### 2.2 Spacing — 8pt default, 4pt for finer steps

Two tiers:

- **8pt scale (default for layout work).** `spacing[200]` (8), `spacing[400]` (16), `spacing[600]` (24), `spacing[800]` (32), `spacing[1000]` (40), `spacing[1200]` (56). Use these for any spacing decision unless the context demands finer.
- **4pt scale (allowed for finer adjustments).** `spacing[100]` (4), `spacing[300]` (12), `spacing[500]` (20), `spacing[700]` (28). Reach for these only when 8pt is visibly too coarse — most often inside compact-density components.

The smaller step `spacing[50]` (2px) is reserved for **compact-density component internals only** (dense cell padding, tight icon gaps). It must not appear in prototype layout code.

`spacing[0]` is a deliberate flush layout — use when explicit zero is required.

If a context demands a value that's not on either scale, the answer is to pick the nearest token, not to introduce a new value.

### 2.3 Colour — surface, structure, signal

The colour system reorganises the classic 60-30-10 design rule into three functional categories. Quotas are budgets, not ceilings — see Section 2.6 on breaking them.

| Layer | What it is | Budget | Examples |
|---|---|---|---|
| **Surface (≈60%)** | Backgrounds and base text — the canvas everything sits on | Unlimited | `background.page`, `background.container`, `foreground.default.primary`, `foreground.default.secondary` |
| **Structure (≈30%)** | Anything that creates hierarchy without drawing attention | Unlimited | `border.default`, `border.strong`, `surfaceOffset`, `foreground.default.tertiary` |
| **Signal (≈10%)** | Anything that says "look here" or carries status meaning | Rationed — count before rendering | The semantic intent groups: `positive`, `negative`, `success`, `error`, `warning`, `information`, `neutral`, `ai` |

Within Signal, the **system accent** — `semantic.*.positive.*` (currently green) — gets the strictest budget: **max 5 placements per view by default**, used for active nav, primary CTA, positive status pills, positive data values, and links. Other signal colours are also rationed but their cap is driven by how many true error/warning/info states actually exist on the page.

The test for every colour placement: *does it signal something the user needs to register?* If yes, it earns its place. If no, drop it back to Surface or Structure.

### 2.4 Semantic intent — the dual vocabulary

Sage uses two parallel vocabularies for the same intents, depending on component family. This is intentional, not a bug — action components express intent one way, feedback components express it another.

| Intent | Action components (`Button`, `Chip`) | Feedback components (`Alert`, `Banner`, `Snackbar`, `StatusIndicator`) |
|---|---|---|
| Default / "the good thing" | `positive` | `success` |
| Destructive / "the bad thing" | `negative` | `error` |
| Caution | (use `neutral` or omit) | `warning` |
| Informational | `neutral` | `info` (or `information`) |
| Grey / non-coloured intent | `neutral` | (use info or neutral surface) |
| AI feature | `ai` | `ai` |

Rules:

- **`positive` and `success` are the defaults** — the "good thing" colours. `positive` for action components (Button, Chip), `success` for feedback components (Alert, Banner). Same underlying semantic meaning (the green); the prop name differs by component family.
- **`negative` ≡ destructive behaviour.** Delete, remove, irreversible. Always.
- **`error` ≡ feedback that something went wrong.** Same underlying meaning as `negative`, different word because it's a feedback component.
- **`neutral` is a real intent** — use it for grey/non-coloured Buttons, Chips, and similar action components where positive/negative would be wrong.

When picking a colour prop, check the component's actual prop type. `positive` is not valid on `Alert`, `success` is not valid on `Button`. TypeScript will catch it, but be deliberate.

### 2.5 Complimentary palette — themable, no global semantics

These colour groups exist in `semantic.*` but have **no fixed system meaning**. They're available for per-tool theming, not for signalling status across the platform.

- `brown` — themable
- `mint` (`teal`) — themable
- `pink` — themable
- `reward` (`yellow`) — themable

Any prototype that uses one of these must define its meaning locally — in a comment, a README, or the prototype-scoped rule file. The same colour can mean different things in different tools. Do not assign them platform-wide intent.

**Exception: `purple` (`semantic.*.ai.*`) is not part of the complimentary palette.** It is reserved for AI features. Never use it as a decorative accent.

### 2.6 Breaking the budgets — context matters

The 5-placement accent budget and the surface-structure-signal split are **defaults**, not hard ceilings. Real flows will sometimes need to break them. Two principles for breaking them well:

1. **Break for content, not for decoration.** An exceptions dashboard that legitimately has 12 warning states is allowed to render 12 warning pills — those are *content*, not decoration. A landing page with 6 accent placements because "it looks better" is not.
2. **Break deliberately, with a reason in code.** If you break a budget, leave a comment naming the law and the reason:

   ```tsx
   // budget-exception: 8 warning states because this is the exceptions queue (Tesler's Law)
   ```

   This makes the break visible to reviewers and to future authors. A break without a reason is a defect.

When in doubt, reach for one of the five mantras as the tiebreaker: *do less when uncertain* (Section 3). A view that fits the budget is rarely worse than a view that breaks it. A view that breaks the budget without naming why is always worse.

---

## 3. The five mantras — quick reference

Most of the rules in this file condense to five mantras. Use them for fast recall during design; reach for the rules in Sections 4 and 5 when you need to enforce or justify a decision.

1. **Hierarchy before decoration** → Nielsen 8 (Aesthetic and Minimalist Design)
2. **Colour is rationed** → 60-30-10 rule · Tufte on chartjunk · Dieter Rams Principle 10
3. **Space is content** → Gestalt Law of Proximity
4. **One primary action per view** → Hick's Law applied to CTAs
5. **Do less when uncertain** → John Maeda's *Laws of Simplicity* Law 1 (Reduce) · Nielsen 8

The mantras are the house mnemonic. The detail below is what enforces them.

---

## 4. UX Laws (enterprise-weighted)

Weighted for tables, charts, dashboards. Tier 1 are high-impact for dense enterprise interfaces; Tier 2 are present but lower priority.

### Tier 1 — Critical

**1. Miller's Law** *(working memory 7±2)*
Max 9 visible items per row of KPI cards, top-level nav, or filter group. Beyond 9: chunk, group, paginate, or use progressive disclosure.

**2. Hick's Law** *(decision time scales with options)*
Top-level menus and filter dropdowns max 7 items. Beyond that: nested groups, type-ahead search, or two-step selection. **One primary action per surface** — primary CTAs get filled buttons; never two filled buttons side by side.

**3. Fitts's Law** *(target size + distance)*
Primary CTAs ≥ `sizing.componentHeight.md` (40px). Destructive actions separated from primary by ≥ `spacing[400]`. Never icon-only for destructive actions.

**4. Jakob's Law** *(industry conventions)*
Tables: sort on column header click, pagination at the bottom, filter top-right, search top-left. Don't invent new patterns for solved problems.

**5. Tesler's Law** *(conservation of complexity)*
Surface computed values — deltas, totals, status rollups. Don't make the user compute. Pre-aggregate dashboard data. Smart defaults beat asking.

**6. Doherty Threshold** *(≤400ms response)*
Skeleton/loading state required within 400ms of any data fetch. Use `Skeleton` matching the shape it replaces — not a generic spinner.

**7. Proximity** *(Gestalt — close = related)*
Within a group: `spacing[400]`. Across groups: `spacing[800]` or a `Divider`. Every gap must come from a `spacing.*` token — never an arbitrary value. Where a structural wrapper exists (`Stack`, `Cluster`, or equivalent), use it — it enforces the spacing-token rule at the type level.

**8. Common Region** *(Gestalt — shared container = shared meaning)*
One Sage `Card` per logical concept. Don't fragment one concept across two cards. Don't merge two concepts into one. Where a layout-layer wrapper provides a tier system (e.g., `Surface tier`), one tier per concept follows the same rule.

**9. Similarity** *(Gestalt — same visual = same meaning)*
Same intent must always look the same. Pick one Sage component per intent and use it consistently — `Chip` for category labels, `StatusIndicator` for status, `Card` for grouped content. Never mix a hand-rolled span in one place and a `Chip` in another for the same purpose. If your codebase has a layout-layer wrapper around one of these (e.g., `StatusPill`, `AttributeTag`), use it consistently or not at all — never mix wrapped and unwrapped for the same intent.

**10. Colour Rationing** *(60-30-10 rule · Tufte · Dieter Rams Principle 10)*
Brand colour appears in at most 5 places per view: active nav item, primary CTA, positive status pills, positive data values, links. Nowhere else. Count before you render. Colour signals — it never decorates.

### Tier 2 — Important but secondary

**11. Serial Position Effect**
Critical nav items at the top and bottom of the rail. Critical table columns at far-left (identifier) and far-right (actions/status). Don't bury essentials in the middle.

**12. Aesthetic-Usability Effect**
Visual polish is a feature, not decoration. The composition rules in this file are load-bearing — treat them as functional requirements, not cosmetics.

---

## 5. Nielsen Heuristics (enterprise-weighted)

Seven of Nielsen's ten heuristics, weighted for power-user enterprise tools. The other three (Match Real-World, Help and Documentation, Help Users Recover from Errors) are folded into other sections or treated as lower priority for the dense-data interfaces this rule governs.

**1. Recognition over Recall**
Always show entity name beside any ID. Show selected filters as visible chips, not hidden state. Recent items in dropdowns.

**2. Consistency and Standards**
Same action looks the same everywhere. One "Save" pattern, one "Add new" pattern. No sometimes-modal, sometimes-page wizard for the same task.

**3. Visibility of System Status**
Saving / syncing / error states surfaced inline. Never silent failures. Long-running operations show explicit progress, not just a spinner.

**4. Error Prevention > Error Recovery**
Disable invalid actions before they're clicked. Validate inline as the user types. Destructive operations require explicit confirmation text ("Type DELETE to confirm").

**5. Flexibility and Efficiency of Use**
Keyboard shortcuts for common operations. Bulk actions for repetitive work. Saved filters, favourites, recent items.

**6. User Control and Freedom**
Undo for destructive actions. Cancel for any multi-step flow. Escape closes dialogs. Browser back works.

**7. Aesthetic and Minimalist Design**
Every element earns its place by serving a hierarchy job — primary action, supporting context, or metadata. If you cannot name an element's job, remove it. When in doubt: fewer surfaces, fewer colours, fewer type sizes. A minimal layout can be iterated into a rich one — an over-decorated layout is hard to pull back.

---

## 6. Self-Review Checklist

Before marking any prototype view complete, run this check. It synthesises the mantras, laws, and heuristics above into a fast pre-flight test.

1. **Squint test** — what draws the eye first? Is that the right thing?
2. **Colour count** — how many distinct colours are visible? Can you justify each one? Brand colour in max 5 places.
2.5. **Typography squint test** — squint at the view. If any text reading "content" (table cells, list titles, card bodies, etc.) is smaller than 14px, you have used a label/meta token instead of a body token. Fix before shipping.
3. **Primary action** — is there exactly one filled button? Is it obvious?
4. **Layout layer coverage** — is every structural element using a layout primitive or a Sage DS component? If not, why not?
5. **Working memory load** — does any row of cards / nav / filter group exceed 9 items? (Miller's)
6. **Convention check** — does any standard pattern (table sort, pagination, filters) reinvent something users already know? (Jakob's)
7. **Remove test** — what would you remove? Remove it.

If the view passes all seven, it is done. If it fails any, fix before moving on.

---

When working inside `app/prototypes`, the composition rules above apply alongside Sage Rules. Token sovereignty (`sage-tokens.mdc`) remains the highest priority — these rules operate within it, not instead of it.
