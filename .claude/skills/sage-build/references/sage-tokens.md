---
description: Enforces absolute token sovereignty across the entire codebase. Governs write permissions for lib/tokens.ts, mandates aliasing inside the components object, and prohibits hallucinated hex or pixel values.
globs: "**/*"
alwaysApply: true
---

# Token Sovereignty

You are working inside the Enterprise Design Platform. The token architecture in `lib/tokens.ts` is the single source of truth for every visual value in the codebase. Violating any of the four pillars below is a **critical system failure** — not a style preference.

---

## Default body text

Any text whose role is **content the user reads** defaults to `typography.scale['body/md/regular']` (16px, weight 400). This is intent-driven, not component-driven. For example: table row cells, list item titles, dashboard metric values, search result descriptions, card body text, form field values, modal messages, side panel content, recipe descriptions — and the same applies to any other component that surfaces content (detail panels, accordion bodies, banner messages, options, KPI labels, and so on). Compact-density variants of the same components legitimately drop to `body/sm/regular` (14px) — that's the floor, not 12px.

The 12px tokens (`body/caption/*`, `body/label/*`, `body/xs/*`) are reserved for **meta-information** *about* content — captions, timestamps, form labels, status microcopy, table column headers, secondary descriptors, dense helper text. Each token's intended use is documented inline in `lib/tokens.ts`.

**The test:** ask "is this text the content the user is here to read, or is it labelling, timestamping, or describing that content?" Content → 16px (or 14px compact). Meta → 12px. Using a 12px token for content text is a typography failure.

---

## Token Hierarchy

```
primitives        — raw hex/px values. The ONLY place raw values are permitted.
translucent       — primitives at 40% opacity
scale             — base measurement units (0–2000)
spacing           — references scale
sizing            — references scale
radius            — references scale
borderWidth       — references scale
typography        — fontFamily, fontSize, fontWeight, type scale
elevation         — box-shadow strings
opacity           — 0.48 / 1.0
semantic          — { foreground, background, border, accent, ai } each with .light/.dark
                    → MUST reference primitives.* only
components        — per-component colour/size/density tokens
                    → colours: MUST reference semantic.* only
                    → dimensions: MUST reference scale, spacing, sizing, radius, borderWidth, opacity, typography, or elevation only
componentState    — interactive state tokens
                    → colours: MUST reference semantic.* only
                    → dimensions: MUST reference scale, spacing, sizing, radius, borderWidth, opacity, typography, or elevation only
```

---

## PILLAR I — The Immutable State Protocol (The Lock)

Three tiers of write protection, ordered from strictest to narrowest:

### Tier A — Permanently Human-Only (AI never writes)

`primitives` and `scale` are owned exclusively by human engineers. The AI MUST NEVER add, remove, or modify any entry in these two objects under any circumstances — not during component work, not during System Level changes, not ever. These are the bedrock of the design system and must only be changed through deliberate human decisions.

### Tier B — System-Level Gate (write only on explicit request)

`semantic`, `spacing`, `sizing`, `radius`, `borderWidth`, `opacity`, `typography`, and `elevation` may only be modified when **both** conditions are true:

1. `lib/tokens.ts` is explicitly the subject of the user's request
2. The user has used language that signals a "System Level" change (e.g. "update the semantic token for…", "change the border radius scale…")

If either condition is absent, these objects are **read-only**.

### Tier C — Component Work (narrow write permission)

When working inside `components/ui/**`, the AI may **only** add new entries to the `components` or `componentState` objects in `lib/tokens.ts`. All other objects in the file remain closed. Any new component token added must conform to the aliasing and dimensional rules in Pillars II and III — no exceptions.

When working inside `app/prototypes/**`, the AI must consume existing tokens only — no new entries may be added to `lib/tokens.ts` under any circumstances. If a token for the required intent does not exist, the AI must STOP and flag the gap:

> "A new token is needed for [intent] but prototypes cannot add tokens to `lib/tokens.ts`. Raise this token request with the Design System Support Group for review before it can be used here."

---

## PILLAR II — The Law of Aliasing (The Chain)

Every value inside `components` and `componentState` must be a direct alias to a `semantic.*` token — and **only** a semantic token. Referencing `primitives.*` directly from a component token is FORBIDDEN. The semantic layer is the mandatory bridge; components must never skip it.

Raw hex codes, raw pixel strings, raw rgba expressions, and raw numbers are strictly FORBIDDEN inside those objects.

```ts
// BAD — floating token (hardcoded raw value). CRITICAL FAILURE.
export const components = {
  button: {
    colour: {
      light: {
        primaryBg:   '#067A46',              // ← FORBIDDEN raw hex
        primaryText: primitives.grey[100],   // ← FORBIDDEN direct primitive reference
      }
    }
  }
}

// GOOD — aliased to the semantic layer only. ✅
export const components = {
  button: {
    colour: {
      light: {
        primaryBg:   semantic.background.positive.defaultStrong.light,
        primaryText: semantic.foreground.positive.onColour.light,
      }
    }
  }
}
```

The chain must be fully traceable and unbroken at every tier:
`components.X` → `semantic.Y.{light|dark}` → `primitives.Z[N]`

### Missing semantic token protocol

If a component requires a colour value and no suitable `semantic.*` token exists for that intent, the AI must **STOP** and flag the gap:

> "No semantic token covers [intent] for this component. A new semantic alias is needed in `lib/tokens.ts` before this component token can be wired. Raise this with the Design System team — do not reach directly into `primitives.*` as a shortcut."

This keeps the semantic layer complete and prevents components from creating invisible dependencies on raw values.

---

## PILLAR III — The Dimensional Discipline (Use, Don't Redefine)

When a component token needs a dimensional value — padding, gap, height, border radius, border width, opacity — it must reference an existing token from the appropriate scale export:

| Dimension | Export | Example |
|---|---|---|
| Spacing | `spacing[0]` → `spacing[1200]` | `spacing[400]` |
| Sizing | `sizing.componentHeight.{xs\|sm\|md\|lg\|xl}` | `sizing.componentHeight.md` |
| Sizing | `sizing.icon.{xs\|sm\|md\|lg\|xl}` | `sizing.icon.sm` |
| Radius | `radius.{none\|xs\|sm\|md\|lg\|xl\|round}` | `radius.md` |
| Border width | `borderWidth.{thin\|default\|thick\|focus}` | `borderWidth.default` |
| Opacity | `opacity.{half\|full}` | `opacity.half` |

Defining new numeric values, new pixel strings, or any dimensional value not already present in these exports is **FORBIDDEN**. If no existing token fits the required dimension, the AI must **STOP** and flag the gap rather than invent a one-off value.

---

## PILLAR IV — The Nearest Neighbor Protocol (No Hallucinations)

Inventing new hex codes, new rgba strings, new pixel values, or any value not already present in `primitives`, `translucent`, or the dimensional exports listed above constitutes a **hallucination** — a critical system failure.

When a designer requests a visual change that has no exact token match, the AI must execute this exact sequence:

1. **SCAN** the existing `semantic.*` tokens for a matching intent. If a semantic token covers the visual intent, propose it.
2. **If no semantic match**, scan the dimensional exports for the nearest step.
3. **PROPOSE** the nearest available token. Name it, show its resolved value, and state the delta.
4. **If no suitable match exists anywhere**: **STOP**. Flag the gap explicitly:
   _"No token covers [X]. This gap must be raised with the Design System team — a new semantic alias or primitive step is required before this value can be used."_

**Example of the required nearest-neighbor response:**

> The requested shade does not match any semantic token. The nearest primitive steps are
> `semantic.background.positive.defaultStrong.light` (`#067A46`, `primitives.green[600]`) and
> `semantic.background.positive.defaultStrongDeep.light` (`#056835`, `primitives.green[700]`).
> Select one of these, or ask the Design System team to create a new semantic alias for this intent.

---

## Token Hierarchy Quick Reference

| Tier | Export | AI write permission | Permitted contents |
|---|---|---|---|
| 1 | `primitives` | **Never — human only** | Raw hex strings only |
| 1 | `scale` | **Never — human only** | Raw px strings only |
| 2 | `semantic` | System Level gate only | `primitives.*` references only |
| 2 | `spacing` `sizing` `radius` `borderWidth` `opacity` `typography` `elevation` | System Level gate only | `scale.*` references only |
| 3 | `components` `componentState` | Component work (add only) | `semantic.*` for colours; existing dimensional exports for dimensions — never raw values, never `primitives.*` |

---

**Icons:** The Sage icon library at `@/components/ui/icons` is the only permitted icon source. `lucide-react` and other non-Sage sources are forbidden — see `sage-rules.mdc` Section 1 (Forbidden). Emoji policy is documented separately under the same Section 1.

**Emojis:** Forbidden as UI icons, decoration, and in displayed values. Allowed in user-generated content and in source documentation/comments. See `sage-rules.mdc` Section 1 → "Emoji policy" for the full distinction.
