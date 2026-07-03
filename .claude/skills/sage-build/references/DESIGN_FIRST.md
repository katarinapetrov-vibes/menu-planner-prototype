This is a new prototype session. Discard any context, decisions,
or patterns from previous conversations. The instructions below
are the only design direction that applies.

---

Before writing any code, follow these steps in order and stop after each one.

---

STEP 1 — Read the file

Read page.tsx carefully. Find the UX Platform Run Sheet comment at the top.
Extract: prototype title, user group, domain, and description.

Then immediately populate the navGroups array using the SideNavGroup structure
from the SideNavigation component API. Base the navigation items on the prototype
title and domain from the Run Sheet. Do this before anything else — a working
green sidebar is required on every prototype.

---

STEP 2 — Ask if anything is unclear

If any of these are missing or vague from the Run Sheet, ask me before continuing:

1. Who is the primary user of this view? (e.g. chef, menu planner, procurement manager)
2. What is the one thing they need to do here?
3. What data are they looking at — dense (many rows/columns) or simple (few items)?
4. Is there a reference screen or existing prototype to draw from?

If all four are clear from the Run Sheet — skip the questions and go straight to Step 3.

---

STEP 3 — Output a design plan and stop

DESIGN PLAN
───────────────────────────────────────────
View:             [from the Run Sheet — what this view is for]
User:             [who is using this view and what they need to do]
Template:         [4.1 Table / 4.2 Dashboard / 4.3 Form / 4.4 List — and why]
Primary action:   [the one filled green button — exactly what it does]

Visual weight order (loudest → quietest):
  1. [element] — [why it's loudest]
  2. [element]
  3. [element]
  4. [element — quietest]

Typography hierarchy:
  Page title:       [which component and token — e.g. PageHeader → headline/h6]
  Section labels:   [which component and level — e.g. SectionHeader level="secondary"]
  Table content:    [BodyText density — e.g. body/sm/regular at compact density]
  Meta / supporting:[MetaText emphasis — e.g. MetaText emphasis="tertiary"]

Sticky elements:   [anything that must stay visible as the user scrolls — name it and
                   say where it lives: PageToolbar / Header slot / none]

Colour plan:      brand green max 5 placements — list every one
Density:          compact / default / relaxed — and why

Non-standard:     [anything the template doesn't cover, or "none"]
───────────────────────────────────────────

Before presenting the plan, check it against these questions:
- Does any load-bearing element (week label, active filter, context anchor) live in
  PageHeader or PageContent? If yes — it will scroll away. Move it to PageToolbar
  or the Header slot instead.
- Does the typography hierarchy use at most 3 text sizes? If more — reduce.
- Is there exactly one filled button? If more — demote the others.

Stop here. Do not write any code. Wait for my confirmation.

---

STEP 4 — Build (only after confirmation)

Preserve the existing PageShell, SideNavigation, and Header exactly as written.
Build only inside PageContent.
Follow the confirmed design plan exactly — if something in the plan turns out
to be wrong during implementation, stop and flag it rather than silently deviating.

Before writing any layout code, read the SideNavigation component API at
@/components/ui/side-navigation to find the correct prop that enables the
green brand surface — it is a theme or variant prop on the component itself.
The green brand sidebar is required on every prototype. If it is not rendering
with the green surface, the prop is missing or wrong — fix it before
building any content.

Header title is the tool or section name — never the page title.
The page title belongs only in PageHeader inside PageContent.
Never put the same title in both Header and PageHeader — that is always wrong.

You are a senior designer giving direction to someone implementing a layout.
These principles apply to every prototype, every tool, every designer.
They are not rules about specific values — they are about visual judgment.

---

CHOOSE THE RIGHT CONTAINER — before building anything.

Every interaction has a weight. Match the container to the weight, not to what
is easiest to build.

A Dialog is for focused, short decisions — a single choice, a confirmation, a
quick input. It overlays the page, blocks interaction with the background, and
demands the user's full attention. Use it when the task is 1–2 steps and the
user should complete it immediately before continuing.

A SideSheet is for contextual detail or a short creation flow that benefits from
keeping the page visible alongside it. The user can see what they came from while
filling in the panel. Use it when the task is 3–5 steps, the user may need to
reference the underlying page, or the input is moderate but not full-screen heavy.

A full-page Wizard is for complex, multi-step flows where each step requires
significant input, review, or decision-making. The user is fully committed to
the task and does not need to see the page behind it. Use it when the flow has
4 or more meaningful steps. A Wizard is never a default — it is a deliberate
choice for genuinely heavy flows.

Before building, ask: how many steps? how much input? does the user need context
from the page they came from? The answers map directly to the container:
  - 1–2 steps, no context needed → Dialog
  - 3–5 steps, context helpful → SideSheet
  - 4+ steps, full commitment → Wizard page

Never build a Wizard for something a Dialog or SideSheet could handle. The extra
chrome — stepper, full-page title, back navigation, sticky bottom bar — adds
visual weight that makes a simple decision feel harder than it is.

---

TITLE RESTRAINT — one title per surface, always.

A modal has one title. A page has one title. A card has no title unless it
genuinely needs one. Never stack multiple levels of heading — a page title,
a section header, a step label, and a question heading on the same screen is
four titles too many.

Before placing any heading, ask: is this the one thing that names this surface?
If there is already a title on this surface, the new heading is not a title —
it is either body copy, a label, or something that should be removed.

The question the user needs to answer ("Where is this recipe coming from?") is
often a better title than a functional label ("Add recipe — Step 1 of 3").
Choose the one that speaks to the user's decision, not the system's structure.

---

HIERARCHY — decide it before you build it.

Every element on screen has a job: primary (the user acts on this), supporting
(context that helps them act), or metadata (when, who, where — answers questions
they didn't ask first). Name every element's job before placing it. If you cannot
name it, remove it. Decoration that serves no hierarchy job is noise.

The loudest thing on the page should be the thing the user needs most right now.
Everything else steps back proportionally. You should be able to squint at the
screen and immediately know what matters.

Strong hierarchy requires strong contrast — not just in size, but in weight, colour,
and spacing combined. A 20px regular title and a 14px regular label have weak
contrast. A 20px semi title with generous space below it and a 12px tertiary label
tightly paired with its value — that is a hierarchy the eye can navigate without
effort. Design the contrast deliberately, not gradually.

---

WHITESPACE — it is not empty, it is structure.

More whitespace between unrelated groups. Less whitespace between related items.
The distance between a title and its subtitle should be smaller than the distance
between two separate sections. When a layout feels cluttered, the answer is almost
never smaller text — it is more space between groups or fewer elements overall.

Whitespace above a section header signals a new topic. Whitespace inside a card
gives the content room to be read. Whitespace between rows in a list makes each
row a distinct item, not a continuous stream. Every gap is a signal — use it
intentionally.

Lists and catalogue views need generous row height. Each row should feel like it
has room to breathe. Dense table views use compact row height — but never achieve
density by shrinking the text. Density comes from tighter padding, not smaller type.

The most common whitespace mistake: equal spacing everywhere. Equal spacing creates
no hierarchy. Vary the spacing to reflect the hierarchy — large gaps between sections,
medium gaps between groups, small gaps between related items. The rhythm of spacing
should mirror the rhythm of meaning.

---

COMPONENTS — they earn their place.

Before reaching for a component, ask: is this well-considered text with the right
colour token, or does it genuinely need a component? Most things are text.
A reference code, a supporting label, a metadata value — these are BodyText or
MetaText, not chips or badges.

Components earn their place when they need to: signal status semantically,
be interactive, or enforce a structural rule. When in doubt, use text.

---

LABELS AND TAGS — restraint is the discipline.

A row item should have at most two visual tags. If there are more, decide which
carry real meaning and render the rest as plain tertiary text inline.

Tags that distinguish type (variant vs base, core vs surcharge) deserve a chip
with a subtle filled or outlined treatment — they are categorical, not decorative.
Version numbers, internal codes, and reference IDs are metadata — render them as
small tertiary text after the primary label, never as a chip.

---

STATUS — signal, not decoration.

A coloured dot with a text label reads faster than a filled pill in a dense list.
Use StatusIndicator (dot + label) for inline status in list and table rows.
Reserve filled status chips for views where status is the primary thing being scanned
— a kanban board, a review queue, a status dashboard.

Status colours must be semantic: positive for approved/complete, warning for pending/
in review, negative for rejected/needs fix, neutral for draft. Never assign status
colours arbitrarily or decoratively.

---

TOOLBAR AND ACTIONS — hierarchy matters here too.

The primary action is filled green, rightmost, always singular. There is never more
than one filled button in a toolbar or action bar.

Secondary actions (export, import, batch operations) are outlined, grouped logically
near the primary. Utility controls (search, filter, view toggle) sit on the left or
centre — they are tools, not actions.

"Add filter" or similar additive controls use a dashed or subtle border — this
signals invitation without competing with primary actions.

View toggles (list / kanban / grid) are a button group — equal weight, no fill,
the active state indicated by a subtle background or border only.

---

IMAGES AND VISUAL REPRESENTATIONS.

When a list or catalogue shows items with images, the image column anchors the row
visually. Use a soft, warm neutral placeholder with a subtle icon — never a coloured
letter avatar, never a blank white box. The placeholder should feel like an empty
frame waiting to be filled, not a missing component.

When items are represented by a person (assignee, creator), use a small circular
avatar with initials — but keep it secondary to the item title. The avatar supports
the information; it does not lead it.

---

EMPTY AND TERTIARY CONTENT.

Dashes (—) for empty values, never blank cells or zero placeholders.
Tertiary colour for supporting text. If the user does not need to act on something
right now, it should barely register visually. A view where everything competes for
attention is exhausting — give the eye somewhere to rest.

---

TYPOGRAPHY CONTRAST — create drama, not uniformity.

Flat typography is the most common failure in enterprise UI. When every text element
is the same size and weight, nothing reads first and nothing reads last — the user
has to work to find what matters.

Every view needs at least one moment of strong contrast: a large number, a prominent
score, a bold status. Everything around it steps back deliberately. The contrast
between the loudest and quietest text on a screen should feel like a considered jump,
not a gradual slide.

In a results list, the row hierarchy must follow this order — the item name always
reads before the signal value:

  Item name        → body/sm/semi — what the user is choosing. Never smaller than 14px.
  Signal value     → large, coloured (score %, cost delta) — the primary signal
  Supporting data  → body/sm/regular — price, rank, source
  Metadata         → body/caption/regular, tertiary — category, allergen, timestamp

Creating contrast by shrinking the item name is always wrong. The name is content —
it earns body size. Contrast comes from making the signal value larger and coloured,
not from making the name smaller. If the percentage reads before the ingredient name,
the hierarchy is inverted — fix it.

Use monospaced figures for all numeric data — costs, scores, percentages, quantities,
dates. Proportional fonts make numbers shift width depending on the digit, which
breaks column alignment and makes comparison impossible. Apply font-variant-numeric:
tabular-nums to any column of numbers. This is not a stylistic choice — it is a
functional requirement for any data table or metric display.

Typography is intentional at every level:
- Heading font (Agrandir in Sage) for page titles only — one per view
- Body font (Satoshi in Sage) for all content, labels, and UI text
- Monospaced or tabular-nums for all numeric columns and metric values
- Never mix font families beyond these two roles
- Letter spacing: wide tracking only for uppercase section labels — nowhere else
- Line height: 1.4 for all UI text — never auto, never 1.0

---

COLOUR AS SIGNAL — the user reads colour before they read text.

In any view with a quality, status, or performance signal, colour carries the meaning
before the number does. A green score, an amber warning, a red flag — the user knows
the answer before reading the value. Design for that scan.

Every signal colour must mean one thing and only one thing across the view. Green
means good. Amber means caution. Red means problem. Never use these colours
decoratively — if a user sees green, they should be able to trust it means something
positive. If it sometimes means something neutral, the signal breaks.

Delta values (cost change, performance change) always show direction with colour:
green for improvement, red for regression. Pair colour with a directional symbol
(↓ ↑ ▲ ▼) so the signal works for colour-blind users too.

---

DENSITY MATCHES THE INTERACTION MODEL.

Dense table rows are for scanning many items to find one. Generous card rows are
for choosing between a small number of considered options. Match the density to
what the user is actually doing — not to a default.

If the user is comparing 3–7 options to make a single decision, each option needs
room to breathe. Give it generous padding, clear visual separation, and enough
space for the key data to read without crowding. This is not a table — it is a
choice surface.

If the user is scanning 20–100 rows to find something specific, compact density
is correct. Tight rows, minimal padding, column-aligned data. The user is not
deciding — they are locating.

Never use compact density for a decision view. Never use generous density for a
scan view. The density is a UX statement about what the user is doing.

---

SELECTED AND INTERACTIVE STATES — always visible, always intentional.

When a user selects an item, the selection must be immediately visible. A selected
row or card gets a green border, a subtle filled background, or both. The user
should never wonder which item they have selected.

Hover states are subtle — a light background shift only. They signal interactivity
without competing with the selected state. Never make a hover state look like a
selected state.

Interactive elements (rows that expand, cards that select, items that reveal detail)
must look interactive before the user clicks. A row that does something on click
needs a visual affordance — a subtle hover background, a chevron, a "view" action —
so the user knows it responds. A row with no affordance looks static even if it
is not.

---

WHEN IN DOUBT — do less.

A minimal layout can be iterated into a rich one.
An over-decorated layout is hard to pull back.
Before adding anything, ask: if this were not here, would the layout be worse?
If the answer is no — leave it out.
