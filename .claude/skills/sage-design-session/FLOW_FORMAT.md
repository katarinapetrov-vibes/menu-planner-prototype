# Sage Flow File Format

A `.flow.md` file is the output of `/sage-design-session` and the input to `/sage-build`.
It describes a multi-view tool as a set of named views with relationships between them.
It is the design contract — no code is written until it exists and is confirmed.

---

## File naming

Save as: `flows/<tool-name>.flow.md`
Example: `flows/supplier-scorecard.flow.md`

---

## Format

```
# [Tool Name] — Flow

## Tool overview
Tool name:     [name]
Primary user:  [persona]
Domain:        [e.g. Procurement / Food / Fulfilment]
Job to be done:[the ONE outcome the user achieves by using this tool]

---

## Views

### View 1 — [View name]
Path:          app/tools/[tool-name]/page.tsx
Template:      [4.1 Table / 4.2 Dashboard / 4.3 Form / 4.4 List]
Purpose:       [What the user does here — one sentence]
Entry from:    [Landing / View name]
Exits to:      [View name / external]
Primary action:[The one filled green button and what it does]
Key data:      [3–6 bullet points of what's on this view]
Notes:         [Anything non-standard]

### View 2 — [View name]
Path:          app/tools/[tool-name]/[view-name]/page.tsx
Template:      [template]
Purpose:       [purpose]
Entry from:    [View 1 — via primary action]
Exits to:      [View 3 / back to View 1]
Primary action:[action]
Key data:
  - [field]
  - [field]
Notes:         [notes or "none"]

[Repeat for each view]

---

## User journey

[A short paragraph describing the flow in plain language —
how the user moves through the views to complete their job to be done.
Written from the user's perspective, not the system's.]

---

## Build order

1. [View name] — [reason this comes first]
2. [View name]
3. [View name]
[...]
```

---

## Rules

- Every view must have a `Path:` — this is where `/sage-build` will create the file
- `Entry from` and `Exits to` must name actual views in this flow, not vague directions
- `Primary action` must be singular — one filled button per view
- The user journey paragraph is required — it is the sanity check that the flow makes sense as a whole before any view is built
- Build order must be explicit — `/sage-build` builds one view at a time in this order
