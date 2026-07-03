'use client'

import React from 'react'
import { semantic, primitives, spacing, sizing, typography } from '@/lib/tokens'

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS — KPI/Large (node 2907-37539) + KPI/Small (node 2507-37661)
//
// Variants:
//   Size            = large | small
//   Label position  = top | bottom | left
//   Icon            = none | left | right | both   (per value item)
//   Multiple values = single row | stacked list
//
// Token mapping:
//   Large value   → Headline/Desktop/H5: typography.fontFamily.headline, 500, 16px, 1.25em
//   Small value   → Body/Medium/Regular: typography.fontFamily.body, 400, 16px, 1.5em
//   Large label   → Body/Small/Regular:  typography.fontFamily.body, 400, 14px, 1.4286em
//   Small label   → HF/Desktop/Micro Text: typography.fontFamily.body, 400, 12px, 1.333em
//   Value colour  → semantic.foreground.neutral.default  (#242424 / #E4E4E4)
//   Label colour  → primitives.grey[600] / primitives.grey[500] (#676767 / #BBBBBB)
//   Large icon    → 24 × 24 px (layout_RR41PX)
//   Small icon    → 20 × 20 px (layout_ZO28SG)
//   Large row gap → spacing[200] = 8px (layout_JOIXRA)
//   Small row gap → spacing[100] = 4px (layout_J64GWI)
//   Large outer gap (top/bottom label) → 4px
//   Large outer gap (left label)       → spacing[400] = 16px
//   Small outer gap (top/bottom label) → 2px
//   Small outer gap (left label)       → spacing[200] = 8px
//   Large multi-value list gap (top label)  → 4px (layout_EBEAVH)
//   Large multi-value list gap (left label) → spacing[200] = 8px (layout_JR8IN3)
//   Small multi-value list gap              → spacing[200] = 8px (layout_JLWZ7N)

export type KPISize          = 'large' | 'small'
export type KPILabelPosition = 'top' | 'bottom' | 'left'
export type KPITheme         = 'light' | 'dark'

/** A single value row — optionally decorated with leading/trailing icons */
export interface KPIValueItem {
  /** The main value content — string or ReactNode */
  value: React.ReactNode
  /** Icon rendered before the value */
  leadingIcon?: React.ReactNode
  /** Icon rendered after the value */
  trailingIcon?: React.ReactNode
}

export interface KPIDataProps {
  /**
   * Display size.
   * - `large` — value uses Headline/Desktop/H5 (Agrandir Digital 500 16px)
   * - `small` — value uses Body/Medium/Regular (Source Sans Pro 400 16px)
   * Default: `'large'`
   */
  size?: KPISize
  /** Label text — the "key" in the key-value pair */
  label: string
  /**
   * Label placement relative to the value.
   * - `top`    — label above value (column, gap 4px large / 2px small)
   * - `bottom` — label below value (column, gap 4px large / 2px small)
   * - `left`   — label left of value (row, gap 16px large / 8px small)
   * Default: `'top'`
   */
  labelPosition?: KPILabelPosition
  /** Single value — string or ReactNode; ignored when `values` is provided */
  value?: React.ReactNode
  /** Leading icon for single-value mode */
  leadingIcon?: React.ReactNode
  /** Trailing icon for single-value mode */
  trailingIcon?: React.ReactNode
  /**
   * Multiple value rows — overrides `value`, `leadingIcon`, `trailingIcon`.
   * Renders a stacked list; each item can have its own leading/trailing icon.
   */
  values?: KPIValueItem[]
  theme?: KPITheme
  className?: string
  style?: React.CSSProperties
}

// ─── Style helpers ────────────────────────────────────────────────────────────

type Mode = 'light' | 'dark'

function getTokens(size: KPISize, mode: Mode) {
  const isLarge = size === 'large'

  // Value typography
  // Large value uses Headline/Desktop/H5 (Agrandir Digital — loaded as named font, no CSS var)
  // Small value uses Body/Medium/Regular (Source Sans 3 — loaded as var(--font-source-sans-3))
  const valueFontFamily  = isLarge ? typography.fontFamily.headline : typography.fontFamily.body
  const valueFontWeight  = isLarge ? typography.fontWeight.medium   : typography.fontWeight.regular
  const valueFontSize    = typography.fontSize.md                   // 16px — body/md + headline shared
  const valueLineHeight  = isLarge ? '1.25em' : typography.lineHeight.relaxed // Figma H5 spec / body/md

  // Label typography — always body (Source Sans 3)
  const labelFontFamily  = typography.fontFamily.body
  const labelFontWeight  = typography.fontWeight.regular
  const labelFontSize    = isLarge ? typography.fontSize.md : typography.fontSize.sm // Figma Body/Small 14px / Micro 12px
  const labelLineHeight  = isLarge ? '1.4285714em' : typography.lineHeight.base // Figma spec / body/xs

  // Colors
  const valueColor = semantic.foreground.neutral.default[mode]    // #242424 / #E4E4E4
  const labelColor = mode === 'light' ? primitives.grey[600] : primitives.grey[500]  // #676767 / #BBBBBB

  // Spacing & sizing
  const iconSize    = isLarge ? sizing.icon.lg : sizing.icon.md   // '24px' / '20px'
  const rowGap      = isLarge ? spacing[200] : spacing[100]       // 8px / 4px
  const rowHeight   = isLarge ? undefined    : sizing.icon.md     // '20px'

  // Outer container gap
  const outerGapVertical   = isLarge ? spacing[100] : '2px'       // 4px / 2px (2px not in scale)
  const outerGapHorizontal = isLarge ? spacing[400] : spacing[200] // left label — 16px / 8px

  // Multi-value list gap
  const listGapTop  = isLarge ? spacing[100] : spacing[200]        // 4px / 8px
  const listGapLeft = spacing[200]                                  // 8px for both sizes

  return {
    valueFontFamily, valueFontWeight, valueFontSize, valueLineHeight, valueColor,
    labelFontFamily, labelFontWeight, labelFontSize, labelLineHeight, labelColor,
    iconSize, rowGap, rowHeight,
    outerGapVertical, outerGapHorizontal,
    listGapTop, listGapLeft,
  }
}

// ─── ValueRow ─────────────────────────────────────────────────────────────────
// Renders: [leadingIcon?] Value [trailingIcon?]

function ValueRow({
  item,
  tk,
}: {
  item: KPIValueItem
  tk: ReturnType<typeof getTokens>
}) {
  const { leadingIcon, value, trailingIcon } = item
  return (
    <div
      style={{
        display:     'flex',
        flexDirection: 'row',
        alignItems:  'center',
        gap:         tk.rowGap,
        height:      tk.rowHeight,
      }}
    >
      {leadingIcon && (
        <span
          style={{
            display:    'flex',
            alignItems: 'center',
            flexShrink: 0,
            width:      tk.iconSize,
            height:     tk.iconSize,
            color:      tk.valueColor,
          }}
          aria-hidden
        >
          {leadingIcon}
        </span>
      )}
      <span
        style={{
          fontFamily:  tk.valueFontFamily,
          fontSize:    tk.valueFontSize,
          fontWeight:  tk.valueFontWeight,
          lineHeight:  tk.valueLineHeight,
          color:       tk.valueColor,
          whiteSpace:  'nowrap',
        }}
      >
        {value}
      </span>
      {trailingIcon && (
        <span
          style={{
            display:    'flex',
            alignItems: 'center',
            flexShrink: 0,
            width:      tk.iconSize,
            height:     tk.iconSize,
            color:      tk.valueColor,
          }}
          aria-hidden
        >
          {trailingIcon}
        </span>
      )}
    </div>
  )
}

// ─── KPIData ──────────────────────────────────────────────────────────────────

export function KPIData({
  size          = 'large',
  label,
  labelPosition = 'top',
  value,
  leadingIcon,
  trailingIcon,
  values,
  theme         = 'light',
  className,
  style,
}: KPIDataProps) {
  const mode = theme === 'dark' ? 'dark' : 'light'
  const tk   = getTokens(size, mode)

  // Normalise to a list of value items
  const items: KPIValueItem[] = values
    ? values
    : [{ value, leadingIcon, trailingIcon }]

  const isMultiple = items.length > 1
  const isLeft     = labelPosition === 'left'

  // Label element
  const labelEl = (
    <span
      style={{
        fontFamily:  tk.labelFontFamily,
        fontSize:    tk.labelFontSize,
        fontWeight:  tk.labelFontWeight,
        lineHeight:  tk.labelLineHeight,
        color:       tk.labelColor,
        whiteSpace:  'nowrap',
      }}
    >
      {label}
    </span>
  )

  // Values block — single row or stacked list
  const valuesBlock = isMultiple ? (
    <div
      style={{
        display:         'flex',
        flexDirection:   'column',
        gap:             isLeft ? tk.listGapLeft : tk.listGapTop,
        justifyContent:  isLeft && size === 'large' ? 'center' : undefined,
        width:           isLeft && size === 'small' ? '100%' : undefined,
      }}
    >
      {items.map((item, i) => (
        <ValueRow key={i} item={item} tk={tk} />
      ))}
    </div>
  ) : (
    <ValueRow item={items[0]} tk={tk} />
  )

  // Outer layout
  const outerStyle: React.CSSProperties = isLeft
    ? {
        display:       'flex',
        flexDirection: 'row',
        alignItems:    'center',
        gap:           tk.outerGapHorizontal,
      }
    : {
        display:       'flex',
        flexDirection: 'column',
        gap:           tk.outerGapVertical,
      }

  return (
    <div style={{ ...outerStyle, ...style }} className={className}>
      {labelPosition === 'bottom' ? (
        <>
          {valuesBlock}
          {labelEl}
        </>
      ) : (
        <>
          {labelEl}
          {valuesBlock}
        </>
      )}
    </div>
  )
}

KPIData.displayName = 'KPIData'

export default KPIData
