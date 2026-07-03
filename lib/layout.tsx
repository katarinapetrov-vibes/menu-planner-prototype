'use client'

/**
 * Layout Layer — composition rules that sit above Sage DS components.
 *
 * This file defines the spatial grammar and surface hierarchy for prototypes.
 * It does NOT replace Sage — it constrains how Sage components compose together.
 *
 * Rules:
 *   - All spacing values come from the spacing token scale only
 *   - All colours come from semantic tokens only, read through useTheme()
 *   - All type styles come from the typography scale only
 *   - No raw hex, no raw px, no arbitrary values
 */

import React from 'react'
import {
  semantic,
  spacing,
  scale,
  radius,
  borderWidth,
  typography,
  elevation,
  opacity,
} from '@/lib/tokens'
import { useTheme as useNextTheme } from 'next-themes'
import { Footer } from '@/components/ui/footer'
import { KPIData } from '@/components/ui/kpi-data'

// Bridge to the app-wide next-themes provider. Falls back to 'light' during SSR
// (when resolvedTheme is undefined) so the layout layer never renders with an
// invalid theme key.
function useTheme(): { theme: 'light' | 'dark' } {
  const { resolvedTheme } = useNextTheme()
  return { theme: resolvedTheme === 'dark' ? 'dark' : 'light' }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SpacingToken = keyof typeof spacing
type ReactChildren = { children: React.ReactNode }
type StyleProp = { style?: React.CSSProperties }
type ClassProp = { className?: string }

// ─── Surface Hierarchy ────────────────────────────────────────────────────────
// Also called: container, panel, surface tier, card wrapper, frame.
//
// Canonical layer tiers (base → raised → sunken) plus an overlay tier (floats
// above), plus state variants (hovered/selected/disabled) for interactive
// raised surfaces.
//
//   base → raised → sunken · overlay (floats above)
//
// Depth rules:
//   - Within the page (base → raised → sunken): depth comes from background
//     contrast between tiers.
//   - Above the page (overlay tier only): depth comes from shadow
//     (elevation.level4).
//   - Never combine the two systems.
//
// `section` and `card` are variants of `raised` — same background, different
// border radius. State tiers (hovered, selected, disabled) consume the
// raised state tokens; they're for the surface itself, not for its content.
//
// Deprecated aliases (kept for migration):
//   tier="page"  → use tier="raised" (was a raised surface, not a base canvas)
//   tier="inset" → use tier="sunken"

type SurfaceTier =
  // Canonical layer tiers
  | 'base'
  | 'raised'
  | 'sunken'
  | 'overlay'
  // Raised variants (semantic shorthand for radius)
  | 'section'
  | 'card'
  // State variants on raised
  | 'hovered'
  | 'selected'
  | 'disabled'
  // Deprecated aliases
  | 'page'   // @deprecated Use 'base' instead
  | 'inset'  // @deprecated Use 'sunken' instead

export function Surface({
  tier = 'card',
  padding,
  children,
  style,
  className,
}: ReactChildren & StyleProp & ClassProp & {
  tier?: SurfaceTier
  padding?: SpacingToken
}) {
  const { theme } = useTheme()
  const bordered = `${borderWidth.thin} solid ${semantic.border.default[theme]}`
  const surfaceStyles: Record<SurfaceTier, React.CSSProperties> = {
    // ── Canonical layer tiers ───────────────────────────────────────────────
    base: {
      background: semantic.background.base[theme],
      minHeight: '100vh',
    },
    raised: {
      background: semantic.background.raised.default[theme],
      borderRadius: radius.md,
      border: bordered,
    },
    sunken: {
      background: semantic.background.sunken.default[theme],
      borderRadius: radius.md,
      // background alone distinguishes from raised — no border needed
    },
    overlay: {
      background: semantic.background.raised.default[theme],
      borderRadius: radius.lg,
      boxShadow: elevation.level4,
    },
    // ── Raised variants (different radius, same colour) ─────────────────────
    section: {
      background: semantic.background.raised.default[theme],
      borderRadius: radius.lg,
      border: bordered,
    },
    card: {
      background: semantic.background.raised.default[theme],
      borderRadius: radius.md,
      border: bordered,
    },
    // ── State variants on raised ────────────────────────────────────────────
    hovered: {
      background: semantic.background.raised.hovered[theme],
      borderRadius: radius.md,
      border: bordered,
    },
    selected: {
      background: semantic.background.raised.selected[theme],
      borderRadius: radius.md,
      border: bordered,
    },
    disabled: {
      background: semantic.background.raised.disabled[theme],
      borderRadius: radius.md,
      border: bordered,
      opacity: opacity.half,
    },
    // ── Deprecated aliases — render identically to canonical counterparts ───
    page: {
      // @deprecated Use tier="base" instead
      background: semantic.background.base[theme],
      minHeight: '100vh',
    },
    inset: {
      // @deprecated Use tier="sunken" instead
      background: semantic.background.sunken.default[theme],
      borderRadius: radius.md,
    },
  }
  return (
    <div
      className={className}
      style={{
        ...surfaceStyles[tier],
        ...(padding !== undefined ? { padding: spacing[padding] } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── Stack ────────────────────────────────────────────────────────────────────
// Vertical rhythm. Only accepts spacing token values.
// Also called: vertical stack, column, vstack, vertical group.

export function Stack({
  gap = 400,
  children,
  style,
  className,
}: ReactChildren & StyleProp & ClassProp & {
  gap?: SpacingToken
}) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[gap],
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── Cluster ──────────────────────────────────────────────────────────────────
// Horizontal grouping with token gap. Wraps by default.
// Also called: horizontal group, row, inline cluster, hstack, hbox.

export function Cluster({
  gap = 200,
  align = 'center',
  justify = 'flex-start',
  wrap = true,
  children,
  style,
  className,
}: ReactChildren & StyleProp & ClassProp & {
  gap?: SpacingToken
  align?: React.CSSProperties['alignItems']
  justify?: React.CSSProperties['justifyContent']
  wrap?: boolean
}) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: spacing[gap],
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── PageShell ────────────────────────────────────────────────────────────────
// Full-height shell for prototype pages.
// Also called: page wrapper, app frame, layout shell, main layout, page chrome.
//
// Slots:
//   - sidebar (required) — left, fixed width. Typically Sage <SideNavigation>.
//   - header  (required) — top of the right column. Typically Sage <Header>.
//                          Must include a country dropdown (see sage-rules.mdc §3).
//   - children (required) — scrollable middle. Typically <PageContent>.
//   - footer  (optional) — bottom of the right column. Defaults to Sage <Footer>.
//                          Pass footer={null} to opt out on special pages.
//
// The outer container uses position: relative so that overlay-style expansions
// (e.g., SideNavigation expanding on hover without reflowing the page) can be
// absolutely positioned within the shell.

export function PageShell({
  sidebar,
  header,
  footer = <Footer />,
  children,
}: {
  sidebar: React.ReactNode
  header: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
}) {
  const { theme } = useTheme()
  return (
    <div suppressHydrationWarning style={{
      position: 'relative',
      display: 'flex',
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
      background: semantic.background.base[theme],
    }}>
      {sidebar}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {header}
        {children}
        {footer}
      </div>
    </div>
  )
}

// ─── PageContent ──────────────────────────────────────────────────────────────
// Scrollable content area below the header. Sets page-level padding and
// rhythm between top-level sections (8pt scale).
// Also called: main content, page body, scrollable area.

export function PageContent({
  children,
  style,
}: ReactChildren & StyleProp) {
  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: `${spacing[600]} ${spacing[600]}`,
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[600],
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── PageToolbar ──────────────────────────────────────────────────────────────
// Sticky toolbar between header and content. Houses search, filters, CTAs.
// Also called: toolbar, filter bar, search bar.

export function PageToolbar({
  children,
  style,
}: ReactChildren & StyleProp) {
  const { theme } = useTheme()
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: spacing[300],
      padding: `${spacing[400]} ${spacing[600]}`,
      background: semantic.background.raised.default[theme],
      borderBottom: `${borderWidth.thin} solid ${semantic.border.default[theme]}`,
      flexShrink: 0,
      flexWrap: 'wrap',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
// Section label + optional trailing action. Two levels:
//   primary   — body/caption/semi + uppercase + wide tracking. Max 2 per view.
//   secondary — body/sm/semi only, no uppercase, no letter spacing.
//               Use for all sub-section labels (Creative Direction, Similar Briefs, etc.)
// Also called: section title, category header, group header, subheading.

export function SectionHeader({
  title,
  count,
  action,
  level = 'primary',
  style,
}: {
  title: string
  count?: number
  action?: React.ReactNode
  level?: 'primary' | 'secondary'
  style?: React.CSSProperties
}) {
  const { theme } = useTheme()
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: spacing[300],
      borderBottom: `${borderWidth.thin} solid ${semantic.border.default[theme]}`,
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[200] }}>
        <span style={{
          ...typography.scale['body/caption/semi'],
          color: semantic.foreground.default.secondary[theme],
          ...(level === 'primary' ? {
            textTransform: 'uppercase' as const,
            letterSpacing: typography.letterSpacing.wide,
          } : {}),
        }}>
          {title}
        </span>
        {count !== undefined && (
          <span style={{
            ...typography.scale['body/xs/regular'],
            color: semantic.foreground.default.secondary[theme],
          }}>
            ({count})
          </span>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ─── PageTitle ────────────────────────────────────────────────────────────────
// Quiet page-level label. One per view. Sits at the top without dominating.
// Also called: page heading, section label.
//
// Typography: body/md/semi (14px Source Sans, weight 600) — intentionally
// quieter than PageHeader. Use PageTitle inside panels and side sheets where
// actions aren't needed. For the canonical page top-of-content title + actions
// block, use <PageHeader> instead.

export function PageTitle({
  children,
  subtitle,
  style,
}: ReactChildren & StyleProp & { subtitle?: string }) {
  const { theme } = useTheme()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[100], ...style }}>
      <h1 style={{
        ...typography.scale['body/md/semi'],
        color: semantic.foreground.default.primary[theme],
        margin: 0,
      }}>
        {children}
      </h1>
      {subtitle && (
        <p style={{
          ...typography.scale['body/sm/regular'],
          color: semantic.foreground.default.secondary[theme],
          margin: 0,
        }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
// Title + action zone composite. One per prototype view, at the top of
// PageContent. Replaces the inline "Cluster + PageTitle + ActionBar" pattern
// that every prototype previously rebuilt.
//
// Typography & colour (all token-driven, no hardcoded values):
//   - Title:    typography.scale['headline/h6']   (20px Agrandir, weight 500)
//               colour: semantic.foreground.default.primary
//   - Subtitle: typography.scale['body/sm/regular']  (14px Source Sans, weight 400)
//               colour: semantic.foreground.default.secondary
//
// Slots (designers pass real Sage components — PageHeader does not style buttons):
//   - title    (required) — page-level label
//   - subtitle (optional) — secondary line beneath title
//   - primary  (optional) — pass <Button variant="filled" color="positive">
//   - secondary (optional) — pass <Button variant="outline">
//   - ghost    (optional) — pass <Button variant="ghost">
//
// Action ordering: ghost → secondary → primary (left to right). Primary anchors
// the far right.

export function PageHeader({
  title,
  subtitle,
  primary,
  secondary,
  ghost,
}: {
  title: string
  subtitle?: string
  primary?: React.ReactNode
  secondary?: React.ReactNode
  ghost?: React.ReactNode
}) {
  const { theme } = useTheme()
  const hasActions = ghost || secondary || primary
  return (
    <Cluster justify="space-between" align="center">
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[100], minWidth: 0 }}>
        <h1 style={{
          ...typography.scale['headline/h6'],
          color: semantic.foreground.default.primary[theme],
          margin: 0,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            ...typography.scale['body/sm/regular'],
            color: semantic.foreground.default.secondary[theme],
            margin: 0,
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {hasActions && (
        <Cluster gap={200}>
          {ghost}
          {secondary}
          {primary}
        </Cluster>
      )}
    </Cluster>
  )
}

// ─── KpiRow ───────────────────────────────────────────────────────────────────
// Equal-width horizontal layout for metric items. The KPI band at the top of
// a dashboard's PageContent.
//
// Also called: split row, metric row, stat row, kpi cards, summary cards,
// metric grid, kpi strip.
//
// Pass whatever fits the content complexity as children:
//   - <KPIData />  for simple label + value (text-only, no card frame)
//   - <Card />     for complex (charts, deltas, trends — bring own frame)
//   - Anything else
//
// CSS Grid auto-fit handles overflow: cells stay at least scale[1700] (168px)
// wide and wrap to a second row when they can't fit. No JS, no breakpoints.
// Each cell can shrink down to its min width before wrapping, so content like
// "$842k" isn't clipped at narrow widths.
//
// dividers (optional): render vertical <Divider> lines between cells. Default
// behaviour: ON if all children are <KPIData> (bare, no card frame); OFF
// otherwise (children have their own frames). Override with dividers={true}
// or dividers={false}.

export function KpiRow({
  children,
  dividers,
}: ReactChildren & { dividers?: boolean }) {
  const childArr = React.Children.toArray(children)
  const allBareKPIData = childArr.length > 0 && childArr.every(c =>
    React.isValidElement(c) && c.type === KPIData
  )
  const showDividers = dividers !== undefined ? dividers : allBareKPIData
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${scale[1700]}px, 1fr))`,
      gap: spacing[400],
    }}>
      {childArr.map((child, i) => {
        const hasDivider = showDividers && i > 0
        if (!hasDivider) {
          return <div key={i} style={{ minWidth: 0 }}>{child}</div>
        }
        return (
          <div key={i} style={{
            minWidth: 0,
            display: 'flex',
            gap: spacing[400],
            alignItems: 'stretch',
          }}>
            <Divider orientation="vertical" />
            <div style={{ flex: 1, minWidth: 0 }}>{child}</div>
          </div>
        )
      })}
    </div>
  )
}

// ─── CardGrid ─────────────────────────────────────────────────────────────────
// Equal-width grid of card-shaped children that auto-fits the available width.
// Use for catalogues of similar items: prototype tiles, product cards, recipe
// thumbnails, team-member cards, anything that reads as "many of the same
// thing." No `columns` prop — the grid reads its container and reflows.
//
// Also called: tile grid, card list, gallery, masonry (note: this is uniform-
// width grid, not Pinterest-style masonry), product grid, catalogue grid,
// thumbnail grid.
//
// CSS Grid `auto-fit, minmax(<min>, 1fr)` handles overflow: cells stay at
// least `min` wide and wrap to a new row when they can't fit. No JS, no
// breakpoints. The optional `min` prop (any `scale.*` step) tunes how wide a
// card needs to be before it gets its own column — default `scale[1900]`
// (272px) suits most card content.
//
// Below 600px container width the grid collapses to a single column via a CSS
// Container Query. Matches the EmptyState breakpoint — one consistent
// narrow-stack point across the layout layer.

export function CardGrid({
  children,
  min = 1900,
  gap = 400,
}: ReactChildren & {
  min?: keyof typeof scale
  gap?: SpacingToken
}) {
  return (
    <div style={{ containerType: 'inline-size', width: '100%' }}>
      <style>{`
        .ll-cg-grid {
          display: grid;
          grid-template-columns: var(--ll-cg-cols, repeat(auto-fit, minmax(272px, 1fr)));
          gap: var(--ll-cg-gap, ${spacing[400]});
        }
        @container (max-width: 600px) {
          .ll-cg-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div
        className="ll-cg-grid"
        style={{
          ['--ll-cg-cols' as string]: `repeat(auto-fit, minmax(${scale[min]}px, 1fr))`,
          ['--ll-cg-gap' as string]: spacing[gap],
        } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  )
}

// ─── SplitPane ────────────────────────────────────────────────────────────────
// Two children side-by-side with a configurable ratio. The canonical layout
// for list+detail, form+preview, settings+helper, content+sidebar.
//
// Exactly two children. Pass `ratio` to set the column proportions:
//   - "1:1"  equal (default)
//   - "1:2"  left third, right two-thirds
//   - "2:1"  left two-thirds, right third
//   - "1:3"  left quarter, right three-quarters
//   - "3:1"  left three-quarters, right quarter
//
// No drag handle, no resize — this is a static composition primitive. For a
// resizable splitter, raise a new primitive via the Unknown Component Protocol.
//
// Also called: two-pane layout, split view, sidebar layout, side-by-side,
// detail pane, master-detail, two-column layout.
//
// Below 600px container width the panes stack vertically via a CSS Container
// Query. The top-listed child appears first when stacked. Matches the
// EmptyState / CardGrid breakpoint.

const SPLIT_PANE_RATIOS = {
  '1:1': '1fr 1fr',
  '1:2': '1fr 2fr',
  '2:1': '2fr 1fr',
  '1:3': '1fr 3fr',
  '3:1': '3fr 1fr',
} as const

export function SplitPane({
  children,
  ratio = '1:1',
  gap = 600,
}: ReactChildren & {
  ratio?: keyof typeof SPLIT_PANE_RATIOS
  gap?: SpacingToken
}) {
  return (
    <div style={{ containerType: 'inline-size', width: '100%' }}>
      <style>{`
        .ll-sp-grid {
          display: grid;
          grid-template-columns: var(--ll-sp-cols, 1fr 1fr);
          gap: var(--ll-sp-gap, ${spacing[600]});
        }
        @container (max-width: 600px) {
          .ll-sp-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div
        className="ll-sp-grid"
        style={{
          ['--ll-sp-cols' as string]: SPLIT_PANE_RATIOS[ratio],
          ['--ll-sp-gap' as string]: spacing[gap],
        } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
// Centered "nothing to show" message for empty tables, lists, dashboards,
// side panels, or full pages. Container-aware — automatically switches between
// a compact treatment (small illustration + smaller type) and a full-emphasis
// treatment (large illustration + bigger type) based on the available width.
//
// Also called: zero state, no-data state, empty placeholder, empty view,
// no-results state.
//
// Sizing is automatic via CSS Container Queries:
//   - Container width  > 600px → large treatment
//   - Container width <= 600px → small treatment
//
// No `size` prop — the EmptyState reads its container. Designers should not
// have to think about which size to pick; the container already encodes that.
//
// Slots:
//   - illustration (optional) — pass an icon, illustration, or visual element
//   - title (required) — headline string
//   - description (optional, ReactNode) — supporting text. Accepts ReactNode
//     so designers can include <a> tags (auto-styled as accent-coloured links)
//     and <strong>/<em> for emphasis. Keep to 1-2 sentences.
//   - primary (optional) — pass a Sage <Button variant="filled" color="positive">
//   - secondary (optional) — pass a Sage <Button variant="outline"> or "ghost"
//
// Buttons stay at their declared size (default Sage md = 40px) and do not
// auto-shrink with the container. Designers can pass <Button size="sm">
// explicitly if a tighter button is needed in a very compact context.

export function EmptyState({
  illustration,
  title,
  description,
  primary,
  secondary,
}: {
  illustration?: React.ReactNode
  title: string
  description?: React.ReactNode
  primary?: React.ReactNode
  secondary?: React.ReactNode
}) {
  const { theme } = useTheme()
  const lg = typography.scale['body/lg/semi']
  const md = typography.scale['body/md/semi']
  const mdReg = typography.scale['body/md/regular']
  const smReg = typography.scale['body/sm/regular']
  return (
    <div style={{
      containerType: 'inline-size',
      width: '100%',
    }}>
      <style>{`
        .ll-es-wrap {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: ${spacing[1200]} ${spacing[400]} ${spacing[600]};
          width: 100%;
        }
        .ll-es-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: ${spacing[400]};
          max-width: 420px;
        }
        .ll-es-title {
          font-family: ${lg.fontFamily};
          font-size: ${lg.fontSize};
          font-weight: ${lg.fontWeight};
          line-height: ${lg.lineHeight};
          color: ${semantic.foreground.default.primary[theme]};
          margin: 0;
        }
        .ll-es-description {
          font-family: ${mdReg.fontFamily};
          font-size: ${mdReg.fontSize};
          font-weight: ${mdReg.fontWeight};
          line-height: ${mdReg.lineHeight};
          color: ${semantic.foreground.default.secondary[theme]};
          margin: 0;
        }
        .ll-es-description a {
          color: ${semantic.foreground.positive.default[theme]};
          text-decoration: underline;
          font-weight: ${typography.fontWeight.semibold};
          cursor: pointer;
        }
        @container (max-width: 600px) {
          .ll-es-wrap {
            padding: ${spacing[600]} ${spacing[400]};
          }
          .ll-es-inner {
            gap: ${spacing[200]};
            max-width: 320px;
          }
          .ll-es-title {
            font-family: ${md.fontFamily};
            font-size: ${md.fontSize};
            font-weight: ${md.fontWeight};
            line-height: ${md.lineHeight};
          }
          .ll-es-description {
            font-family: ${smReg.fontFamily};
            font-size: ${smReg.fontSize};
            font-weight: ${smReg.fontWeight};
            line-height: ${smReg.lineHeight};
          }
        }
      `}</style>
      <div className="ll-es-wrap">
        <div className="ll-es-inner">
          {illustration && <div>{illustration}</div>}
          <h3 className="ll-es-title">{title}</h3>
          {description && <p className="ll-es-description">{description}</p>}
          {(primary || secondary) && (
            <Cluster gap={200} justify="center" style={{ marginTop: spacing[200] }}>
              {secondary}
              {primary}
            </Cluster>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────
// A titled chunk of a page. Header (title + optional description + optional
// action) sits above a body region with built-in vertical rhythm. Sits one
// level below <PageHeader> in the typography hierarchy and one level above
// <SectionHeader>.
//
// Also called: section block, titled section, page section, content section,
// titled card, panel.
//
// When NOT to use: if you only need a background container with no title,
// use <Surface> directly. If you need a bare separator label with no body
// content, use <SectionHeader>.
//
// Typography & colour (all token-driven, no hardcoded values):
//   - Title:       typography.scale['body/lg/semi']     (16px Source Sans, weight 600)
//                  colour: semantic.foreground.default.primary
//   - Description: typography.scale['body/sm/regular']  (14px Source Sans, weight 400)
//                  colour: semantic.foreground.default.secondary
//
// Slots:
//   - title       (required) — section label
//   - description (optional, ReactNode) — supporting copy beneath the title
//   - action      (optional, ReactNode) — typically a single Button or link,
//                 right-aligned in the header row
//   - children    (required) — the section body
//
// Surface: raised by default. A <Section> represents a major page block, so
// it renders with the canonical "section" surface tier — raised background,
// radius.lg (16px) corners, spacing[600] padding. Override with:
//   surface="card"    → Surface tier="card"  wrap, radius.md (12px), spacing[600] padding
//   surface="none"    → flat, no background, no padding — use when the
//                       Section already lives inside another contained
//                       surface (a card, a sidesheet) and an extra tier
//                       would violate the surface hierarchy.
//
// Body gap: vertical spacing between children inside the body. Defaults to
// spacing[400] (16px) — the canonical "items inside a section" rhythm. Pass
// gap={N} to override using any spacing token (e.g. gap={600} for looser
// vertical rhythm).
//
// id (optional): forwarded to the wrapping element so the section can be
// linked to from in-page navigation or table-of-contents anchors.

export function Section({
  title,
  description,
  action,
  surface = 'section',
  gap = 400,
  id,
  children,
  style,
}: ReactChildren & StyleProp & {
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  surface?: 'none' | 'section' | 'card'
  gap?: SpacingToken
  id?: string
}) {
  const { theme } = useTheme()

  const header = (
    <Cluster justify="space-between" align="flex-start">
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[100], minWidth: 0 }}>
        <h2 style={{
          ...typography.scale['body/lg/semi'],
          color: semantic.foreground.default.primary[theme],
          margin: 0,
        }}>
          {title}
        </h2>
        {description && (
          <p style={{
            ...typography.scale['body/sm/regular'],
            color: semantic.foreground.default.secondary[theme],
            margin: 0,
          }}>
            {description}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </Cluster>
  )

  const body = (
    <Stack gap={gap}>
      {children}
    </Stack>
  )

  // Inner layout: header → body, with consistent rhythm between them.
  const inner = (
    <Stack gap={400}>
      {header}
      {body}
    </Stack>
  )

  if (surface === 'none') {
    return <section id={id} style={style}>{inner}</section>
  }

  return (
    <Surface tier={surface} padding={600} style={style}>
      <section id={id}>{inner}</section>
    </Surface>
  )
}

// ─── FieldGroup ───────────────────────────────────────────────────────────────
// Groups form fields with a consistent section label and grid layout.
// Also called: form group, fieldset, input group, form section.

export function FieldGroup({
  title,
  columns = 2,
  children,
  style,
}: ReactChildren & StyleProp & {
  title?: string
  columns?: 1 | 2 | 3
}) {
  const { theme } = useTheme()
  return (
    <Surface tier="sunken" padding={600} style={style}>
      <Stack gap={400}>
        {title && (
          <span style={{
            ...typography.scale['body/sm/semi'],
            color: semantic.foreground.default.primary[theme],
          }}>
            {title}
          </span>
        )}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: spacing[400],
        }}>
          {children}
        </div>
      </Stack>
    </Surface>
  )
}

// ─── FieldReadOnly ────────────────────────────────────────────────────────────
// Read-only field display. Used in side sheets and confirm steps.
// Also called: read-only field, info field, display field, key-value pair.
//
// Typography: body/caption/semi (11px, uppercase, wide tracking) for label;
// body/sm/regular (14px) for value.

export function FieldReadOnly({
  label,
  value,
  style,
}: {
  label: string
  value?: React.ReactNode
  style?: React.CSSProperties
}) {
  const { theme } = useTheme()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[100], ...style }}>
      <span style={{
        ...typography.scale['body/caption/semi'],
        color: semantic.foreground.default.secondary[theme],
        textTransform: 'uppercase',
        letterSpacing: typography.letterSpacing.wide,
      }}>
        {label}
      </span>
      <span style={{
        ...typography.scale['body/sm/regular'],
        color: semantic.foreground.default.primary[theme],
      }}>
        {value ?? '—'}
      </span>
    </div>
  )
}

// ─── BodyText ────────────────────────────────────────────────────────────────
// Body-level content text. The default primitive for any text whose role is
// "content the user reads" — paragraph copy, table row cell content, list
// item titles, dashboard metric values, card body text, search result
// descriptions, form field values, body copy, body text, content text.
//
// Typography (token-driven, no hardcoded values):
//   density="comfortable" (default) → typography.scale['body/md/regular']  (16px / weight 400)
//   density="compact"               → typography.scale['body/sm/regular']  (14px / weight 400)
//   weight="semi" pairs with both densities and uses the matching /semi token.
//
// The 12px tokens (body/caption/*, body/label/*, body/xs/*) are intentionally
// NOT reachable from this primitive. BodyText is for content; if you need
// meta-text (caption, timestamp, status microcopy, dense helper text) use
// <MetaText> instead. See sage-tokens.mdc → "Default body text" for the
// role-based test (content → BodyText, meta → MetaText).
//
// emphasis prop colour groups:
//   default                     — semantic.foreground.default.primary  (the standard body colour)
//   secondary                   — semantic.foreground.default.secondary (less prominent body content)
//   positive / negative         — Use ONLY when the value
//                                 itself carries signal meaning (an in-range
//                                 value rendered green, an out-of-range value
//                                 rendered red, a completion message). Not
//                                 for stylistic emphasis. Counts against the
//                                 per-view signal-colour budget — see
//                                 sage-layouts.mdc §2.3 Surface/Structure/Signal.
//
// as prop — controls the rendered HTML element:
//   "p"    (default) — block-level paragraph, margin: 0
//   "span"           — inline use, e.g. within a <Cluster> or table cell
//   "div"            — block-level without paragraph semantics

type BodyEmphasis = 'default' | 'secondary' | 'positive' | 'negative'
type BodyDensity = 'comfortable' | 'compact'
type BodyWeight = 'regular' | 'semi'
type BodyAs = 'p' | 'span' | 'div'

export function BodyText({
  children,
  emphasis = 'default',
  density = 'comfortable',
  weight = 'regular',
  as = 'p',
  style,
}: ReactChildren & StyleProp & {
  emphasis?: BodyEmphasis
  density?: BodyDensity
  weight?: BodyWeight
  as?: BodyAs
}) {
  const { theme } = useTheme()
  const colorMap: Record<BodyEmphasis, string> = {
    default:   semantic.foreground.default.primary[theme],
    secondary: semantic.foreground.default.secondary[theme],
    positive:  semantic.foreground.positive.default[theme],
    negative:  semantic.foreground.negative.default[theme],
  }
  const scaleKey =
    density === 'compact'
      ? (weight === 'semi' ? 'body/sm/semi' : 'body/sm/regular')
      : (weight === 'semi' ? 'body/md/semi' : 'body/md/regular')
  const Element = as
  return (
    <Element
      style={{
        ...typography.scale[scaleKey],
        color: colorMap[emphasis],
        margin: 0,
        ...style,
      }}
    >
      {children}
    </Element>
  )
}

// ─── MetaText ─────────────────────────────────────────────────────────────────
// Secondary/tertiary supporting text.
// Also called: caption, meta, supporting text, helper text.
//
// Typography: body/caption/regular (12px Source Sans, weight 400).
//
// emphasis prop colour groups:
//   default / secondary / tertiary — neutral text colours, use freely.
//   positive / negative           — SIGNAL colours, use ONLY when the value
//                                   carries signal meaning (deltas, status,
//                                   ranges). Not for stylistic emphasis.
//                                   Counts against per-view signal-colour budget
//                                   (sage-layouts.mdc §2.3 Surface/Structure/Signal).

type MetaEmphasis = 'default' | 'secondary' | 'tertiary' | 'positive' | 'negative'

export function MetaText({
  children,
  emphasis = 'secondary',
  uppercase = false,
  style,
}: ReactChildren & StyleProp & {
  emphasis?: MetaEmphasis
  uppercase?: boolean
}) {
  const { theme } = useTheme()
  const colorMap: Record<MetaEmphasis, string> = {
    default:   semantic.foreground.default.primary[theme],
    secondary: semantic.foreground.default.secondary[theme],
    tertiary:  semantic.foreground.default.tertiary[theme],
    positive:  semantic.foreground.positive.default[theme],
    negative:  semantic.foreground.negative.default[theme],
  }
  return (
    <span style={{
      ...typography.scale['body/caption/regular'],
      color: colorMap[emphasis],
      ...(uppercase ? { textTransform: 'uppercase', letterSpacing: typography.letterSpacing.wide } : {}),
      ...style,
    }}>
      {children}
    </span>
  )
}

// ─── ActionBar ────────────────────────────────────────────────────────────────
// Enforces button hierarchy: one primary, optional secondary, optional ghost.
// Prevents two filled buttons appearing in the same bar.
// Also called: button row, action row, cta bar, form footer.

export function ActionBar({
  primary,
  secondary,
  ghost,
  align = 'flex-end',
  style,
}: {
  primary?: React.ReactNode
  secondary?: React.ReactNode
  ghost?: React.ReactNode
  align?: 'flex-start' | 'flex-end' | 'space-between'
  style?: React.CSSProperties
}) {
  const { theme } = useTheme()
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: align,
      gap: spacing[200],
      paddingTop: spacing[400],
      borderTop: `${borderWidth.thin} solid ${semantic.border.default[theme]}`,
      ...style,
    }}>
      {ghost && <div>{ghost}</div>}
      {secondary && <div>{secondary}</div>}
      {primary && <div>{primary}</div>}
    </div>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────
// Thin separator line. Defaults to horizontal (an <hr>). Pass
// orientation="vertical" for an inline vertical separator (used inside flex
// rows — KpiRow uses this between bare KPI items).
//
// Also called: separator, horizontal rule, vertical rule, hr.

type DividerOrientation = 'horizontal' | 'vertical'

export function Divider({
  orientation = 'horizontal',
  style,
}: StyleProp & { orientation?: DividerOrientation }) {
  const { theme } = useTheme()
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        style={{
          alignSelf: 'stretch',
          width: 0,
          borderLeft: `${borderWidth.thin} solid ${semantic.border.default[theme]}`,
          ...style,
        }}
      />
    )
  }
  return (
    <hr style={{
      border: 'none',
      borderTop: `${borderWidth.thin} solid ${semantic.border.default[theme]}`,
      margin: 0,
      ...style,
    }} />
  )
}

// ─── DataTable ────────────────────────────────────────────────────────────────
// Lightweight table for simple data displays. Self-contained surface — do not
// wrap in Surface tier="section".
// Also called: table, simple table, data grid, list table.
//
// When NOT to use: if the table needs search, filter, sort on column headers,
// row expansion, bulk selection, or pagination — use Sage <Table> instead.
// DataTable is the stripped-down option for read-only or minimally interactive
// tabular data (side panels, confirm steps, audit logs).
//
// density controls vertical breathing room:
//   compact  — spacing[200] top/bottom (8px) — data-dense views
//   default  — spacing[300] top/bottom (12px) — standard views
//   relaxed  — spacing[400] top/bottom (16px) — spacious reading views
//
// All prototypes default to compact. Use default or relaxed when rows
// contain multi-line content or images that need more vertical space.

type TableDensity = 'compact' | 'default' | 'relaxed'

const CELL_PADDING_V: Record<TableDensity, string> = {
  compact:  spacing[200],  // 8px
  default:  spacing[300],  // 12px
  relaxed:  spacing[400],  // 16px
}

export function DataTable({
  density = 'compact',
  children,
  style,
}: ReactChildren & StyleProp & { density?: TableDensity }) {
  const { theme } = useTheme()
  // uid scopes the injected styles to this density variant
  const uid = `ll-dt-${density}`
  const pv = CELL_PADDING_V[density]
  return (
    <div style={{
      overflow: 'hidden',
      borderRadius: radius.md,
      border: `${borderWidth.thin} solid ${semantic.border.default[theme]}`,
      background: semantic.background.raised.default[theme],
      ...style,
    }}>
      <style>{`
        .${uid} { width: 100%; border-collapse: collapse; }
        .${uid} th, .${uid} td { padding: ${pv} ${spacing[400]}; vertical-align: middle; }
        .${uid} thead th {
          background: ${semantic.background.base[theme]};
          font-size: ${typography.scale['body/caption/semi'].fontSize};
          font-weight: ${typography.scale['body/caption/semi'].fontWeight};
          color: ${semantic.foreground.default.secondary[theme]};
          border-bottom: ${borderWidth.thin} solid ${semantic.border.default[theme]};
          white-space: nowrap;
          text-align: left;
        }
        .${uid} tbody tr { border-bottom: ${borderWidth.thin} solid ${semantic.border.default[theme]}; font-size: ${typography.scale['body/sm/regular'].fontSize}; color: ${semantic.foreground.default.primary[theme]}; transition: background 100ms; }
        .${uid} tbody tr:last-child { border-bottom: none; }
        .${uid} tbody tr:hover { background: ${semantic.background.base[theme]}; cursor: pointer; }
      `}</style>
      <table className={uid}>
        {children}
      </table>
    </div>
  )
}

// ─── AttributeTag ─────────────────────────────────────────────────────────────
// @deprecated — will be removed once the Chip DS component absorbs the
// "no-variant outlined category label" treatment. Pending DS work (see #19).
// Left at .light only intentionally; do not wire to useTheme.

export function AttributeTag({
  children,
  style,
}: ReactChildren & StyleProp) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: `${spacing[50]} ${spacing[200]}`,
      borderRadius: radius.round,
      border: `${borderWidth.thin} solid ${semantic.border.default.light}`,
      background: 'transparent',
      color: semantic.foreground.default.secondary.light,
      ...typography.scale['body/caption/regular'],
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {children}
    </span>
  )
}

// ─── StatusPill ───────────────────────────────────────────────────────────────
// @deprecated — will be replaced by an extended StatusIndicator DS component
// (with a pill appearance). Pending DS work (see #19). The `submitted` variant
// currently uses AI purple incorrectly and will be retired in that migration.
// Left at .light only intentionally; do not wire to useTheme.

type StatusVariant = 'complete' | 'draft' | 'archived' | 'active' | 'pending' | 'submitted'

const STATUS_STYLES: Record<StatusVariant, { bg: string; fg: string; label: string }> = {
  complete:  { bg: semantic.background.positive.defaultSubtle.light,     fg: semantic.foreground.positive.default.light,     label: 'Complete'  },
  draft:     { bg: semantic.background.neutral.defaultSubtle.light,      fg: semantic.foreground.default.secondary.light,    label: 'Draft'     },
  archived:  { bg: semantic.background.neutral.defaultSubtle.light,      fg: semantic.foreground.default.tertiary.light,     label: 'Archived'  },
  active:    { bg: semantic.background.information.defaultSubtle.light,  fg: semantic.foreground.information.default.light,  label: 'Active'    },
  pending:   { bg: semantic.background.warning.defaultSubtle.light,      fg: semantic.foreground.warning.default.light,      label: 'Pending'   },
  submitted: { bg: semantic.background.ai.defaultSubtle.light,           fg: semantic.foreground.ai.default.light,           label: 'Submitted' },
}

export function StatusPill({
  variant,
  label,
  style,
}: {
  variant: StatusVariant
  label?: string
  style?: React.CSSProperties
}) {
  const s = STATUS_STYLES[variant]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: `${spacing[50]} ${spacing[300]}`,
      borderRadius: radius.round,
      background: s.bg,
      color: s.fg,
      ...typography.scale['body/caption/semi'],
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {label ?? s.label}
    </span>
  )
}

// Valid call shapes for <BodyText>:
//   <BodyText>Paragraph copy at 16px regular, primary colour.</BodyText>
//   <BodyText emphasis="secondary">Less prominent body content.</BodyText>
//   <BodyText density="compact">14px row content.</BodyText>
//   <BodyText weight="semi">16px semi-weight value.</BodyText>
//   <BodyText as="span" emphasis="positive">$42.00 in-range</BodyText>
