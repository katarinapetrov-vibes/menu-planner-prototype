# Sage Starter Kit

Build internal tools with HelloFresh's Sage Design System — without needing access to the full EUX platform.

## What's inside

| Folder | What it is |
|--------|-----------|
| `components/ui/` | All 81 Sage DS components (Button, Table, SideNavigation, etc.) |
| `components/ui/icons/` | ~248 curated Sage icons |
| `lib/tokens.ts` | The full Sage token system (colours, spacing, typography) |
| `lib/layout.tsx` | Layout primitives (PageShell, Stack, KpiRow, SplitPane, etc.) |
| `data/` | HelloFresh country + brand seed data |
| `app/tools/my-tool/` | Working example — a Table View with a Sage page shell |
| `.cursor/rules/` | AI governance rules for Claude Code / Cursor |

## Getting started

```bash
# 1. Unzip the starter kit (or clone if you have git access)
unzip sage-starter.zip
cd sage-starter

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
# → opens http://localhost:3000 → redirects to /tools/my-tool
```

You should see a working Sage tool page immediately.

## Building your tool

1. **Copy the example** — duplicate `app/tools/my-tool/` to `app/tools/<your-tool-name>/`
2. **Update the title** — change the `title` prop on `<Header>` and `<PageHeader>`
3. **Update the redirect** — change `app/page.tsx` to redirect to your new path
4. **Replace mock data** — swap `MOCK_ITEMS` with your real data
5. **Follow the design rules** — Claude Code (or Cursor) will enforce them automatically

## Using AI assistance (Claude Code / Cursor)

This starter ships with `.cursor/rules/` and `CLAUDE.md` pre-configured. When you open this project in Cursor or Claude Code, the AI will:

- Require a **DESIGN PLAN** before writing any UI code
- Enforce Sage token usage (no hardcoded hex or pixel values)
- Use only approved components from `components/ui/`
- Flag missing components instead of inventing alternatives

**Tip:** Ask the AI "build a form page for creating a new menu" and watch it produce the design plan first.

## Page templates

Four templates are pre-configured (see `.cursor/rules/sage-rules.mdc` §4):

| Template | Use for |
|----------|---------|
| **Table View** | List of records with search, filter, bulk actions |
| **Dashboard** | KPI metrics + charts |
| **Form** | Data entry |
| **List View** | Records with inline expandable detail |

## Icons

~248 curated icons are available at `@/components/ui/icons`. Browse them at the [EUX platform → Design System → Icons].

If you need an icon that isn't included, see `data/icon-requests.md` for the request process.

## Keeping up to date

When the Sage DS publishes a new release, download the updated ZIP from the EUX platform and replace `components/ui/`, `lib/tokens.ts`, `lib/layout.tsx`, and `.cursor/rules/`.

## Rules

All Sage DS rules apply in this project. The quick summary:

- All colours from `@/lib/tokens` semantic layer only — no hex codes
- All spacing from `spacing[N]` tokens — no `p-4` or `mt-2`
- All icons from `@/components/ui/icons` only — no lucide-react
- All components from `@/components/ui/` — no hand-rolled HTML
- No emojis as UI icons — use Sage icon components

Full rules: `.cursor/rules/sage-tokens.mdc`, `sage-rules.mdc`, `sage-layouts.mdc`
