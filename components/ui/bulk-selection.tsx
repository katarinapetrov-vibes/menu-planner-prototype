'use client'

import React, { useState, useId } from 'react'
import { cn } from './utils'
import { typography } from '@/lib/tokens'

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS v3 — Bulk Selection (footer bar)
// Node: 10235-217574
//
// Variables:
//   Selection State  : 'none' | 'partial' | 'all'
//   Count            : number
//   Actions          : 0 | 1 | 2 | 3  (number of visible action buttons)
//   Theme            : 'light' | 'dark'

export type BulkSelectionTheme  = 'light' | 'dark'
export type BulkSelectionState  = 'none' | 'partial' | 'all'
export type BulkActionVariant   = 'default' | 'destructive'
/** How many action buttons to render. Maximum 3 per DS spec. */
export type BulkActionCount     = 0 | 1 | 2 | 3

export interface BulkSelectionAction {
  /** Button label */
  label: string
  /** Optional 16 × 16 leading icon */
  icon?: React.ReactNode
  /** Click handler */
  onClick: () => void
  /** Disabled state */
  disabled?: boolean
  /**
   * Semantic variant:
   *   'default'     — neutral outline (Export, Move, Archive …)
   *   'destructive' — negative outline (Delete, Remove …)
   */
  variant?: BulkActionVariant
}

export interface BulkSelectionProps {
  /** Number of currently selected items */
  selectedCount?: number
  /** Total item count — enables "X of Y" label; omit for "X items selected" */
  totalCount?: number
  /**
   * Leading checkbox appearance:
   *   'none'    → unchecked
   *   'partial' → indeterminate dash (some selected)
   *   'all'     → checked (all selected)
   */
  selectionState?: BulkSelectionState
  /** Called when the leading checkbox is toggled */
  onToggleAll?: () => void
  /** Called when the Cancel button is clicked */
  onCancel?: () => void
  /**
   * Action buttons to render (max 3 per DS spec).
   * Pass an empty array or omit to show no actions.
   */
  actions?: BulkSelectionAction[]
  /** Canvas theme — light or dark */
  theme?: BulkSelectionTheme
  /** Extra classes applied to the root element */
  className?: string
}

// ─── DS v3 Colour Tokens ──────────────────────────────────────────────────────
// Source: Figma Enterprise DS v3 — node 10235-217574
//
//                              light                         dark
//  bar bg                      #FFFFFF  bg/page              #00178C  bg/page dark
//  bar border-top              #E4E4E4  border/default        #4B4B4B  border/default dark
//  checkbox accent             #067A46  border/positive       #96DC14  border/positive dark
//  count number                #067A46  fg/positive/default   #96DC14  fg/positive/default dark
//  count text                  #242424  fg/neutral/default    #E4E4E4  fg/neutral/default dark
//  action default border       #E4E4E4  border/default        #4B4B4B  border/default dark
//  action default border-hover #BBBBBB  border/strong         #676767  border/strong dark
//  action default text         #242424  fg/neutral/default    #E4E4E4  fg/neutral/default dark
//  action default hover bg     rgba(0,0,0,0.04)              rgba(255,255,255,0.06)
//  action destructive border   #B30000  border/negative       #FF7575  border/negative dark
//  action destructive text     #B30000  fg/negative/default   #FF7575  fg/negative/default dark
//  action destructive hover bg rgba(179,0,0,0.06)            rgba(255,117,117,0.08)
//  action disabled text        #BBBBBB  fg/disabled           #676767  fg/disabled dark
//  separator (vertical)        #E4E4E4  border/default        #4B4B4B  border/default dark
//  focus ring                  #067A46/40                    #96DC14/40

const tok = {
  light: {
    barBg:                    '#FFFFFF',
    barBorderTop:             '#E4E4E4',
    checkboxAccent:           '#067A46',
    countNumber:              '#067A46',
    countText:                '#242424',
    actionDefaultBorder:      '#E4E4E4',
    actionDefaultBorderHover: '#BBBBBB',
    actionDefaultText:        '#242424',
    actionDefaultHoverBg:     'rgba(0,0,0,0.04)',
    actionDestructiveBorder:  '#B30000',
    actionDestructiveText:    '#B30000',
    actionDestructiveHoverBg: 'rgba(179,0,0,0.06)',
    actionDisabledText:       '#BBBBBB',
    actionDisabledBorder:     '#E4E4E4',
    separator:                '#E4E4E4',
    focusRing:                'rgba(6,122,70,0.40)',
  },
  dark: {
    barBg:                    '#00178C',   // semantic.background.page.dark
    barBorderTop:             '#4B4B4B',   // semantic.border.default.dark
    checkboxAccent:           '#96DC14',
    countNumber:              '#96DC14',
    countText:                '#E4E4E4',
    actionDefaultBorder:      '#4B4B4B',
    actionDefaultBorderHover: '#676767',
    actionDefaultText:        '#E4E4E4',
    actionDefaultHoverBg:     'rgba(255,255,255,0.06)',
    actionDestructiveBorder:  '#FF7575',
    actionDestructiveText:    '#FF7575',
    actionDestructiveHoverBg: 'rgba(255,117,117,0.08)',
    actionDisabledText:       '#676767',
    actionDisabledBorder:     '#4B4B4B',
    separator:                '#4B4B4B',
    focusRing:                'rgba(150,220,20,0.40)',
  },
} as const

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function CheckSvg() {
  return (
    <svg width="11" height="9" viewBox="0 0 11 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 4.5L4 7.5L10 1.5" />
    </svg>
  )
}

function DashSvg() {
  return (
    <svg width="10" height="2" viewBox="0 0 10 2" fill="currentColor" aria-hidden>
      <rect x="0" y="0" width="10" height="2" rx="1" />
    </svg>
  )
}

// ─── Internal: Checkbox ───────────────────────────────────────────────────────

interface InlineCheckboxProps {
  state: BulkSelectionState
  onChange?: () => void
  theme: BulkSelectionTheme
  id?: string
}

function InlineCheckbox({ state, onChange, theme, id }: InlineCheckboxProps) {
  const c = tok[theme]
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const isChecked = state === 'all'
  const isIndet   = state === 'partial'
  const isActive  = isChecked || isIndet

  let boxBg: string
  let borderColor: string
  if (isActive) {
    boxBg       = hovered || pressed
      ? (theme === 'light' ? '#056835' : '#D2F895')
      : c.checkboxAccent
    borderColor = boxBg
  } else {
    boxBg = pressed
      ? (theme === 'light' ? '#E4FABF' : 'rgba(6,122,70,0.20)')
      : hovered
        ? (theme === 'light' ? '#F6FDE9' : 'rgba(6,122,70,0.10)')
        : 'transparent'
    borderColor = c.checkboxAccent
  }

  const iconColor = isActive
    ? (theme === 'light' ? '#FFFFFF' : '#035624')
    : 'transparent'

  return (
    <label
      htmlFor={id}
      style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
    >
      <input
        id={id}
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
        readOnly={!onChange}
        aria-checked={isIndet ? 'mixed' : isChecked}
        className="sr-only peer"
      />
      <span
        aria-hidden
        style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          border: `1.5px solid ${borderColor}`,
          backgroundColor: boxBg,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background-color 120ms, border-color 120ms',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false) }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        className={cn(
          'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
          theme === 'dark'
            ? 'peer-focus-visible:ring-[#96DC14]/40 peer-focus-visible:ring-offset-[#242424]'
            : 'peer-focus-visible:ring-[#067A46]/40 peer-focus-visible:ring-offset-white',
        )}
      >
        <span style={{ color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isIndet ? <DashSvg /> : <CheckSvg />}
        </span>
      </span>
    </label>
  )
}

// ─── Internal: Outline Action Button ─────────────────────────────────────────
// DS spec: outline style, 32px height, radius/sm (8px), padding 0 12px
// body/sm/regular — 14px / 400

interface ActionButtonProps {
  action: BulkSelectionAction
  theme: BulkSelectionTheme
}

function ActionButton({ action, theme }: ActionButtonProps) {
  const c = tok[theme]
  const [hovered, setHovered] = useState(false)

  const isDestructive = action.variant === 'destructive'
  const isDisabled    = !!action.disabled

  const borderColor = isDisabled
    ? c.actionDisabledBorder
    : isDestructive
      ? c.actionDestructiveBorder
      : hovered
        ? c.actionDefaultBorderHover
        : c.actionDefaultBorder

  const textColor = isDisabled
    ? c.actionDisabledText
    : isDestructive
      ? c.actionDestructiveText
      : c.actionDefaultText

  const bgColor = isDisabled
    ? 'transparent'
    : isDestructive
      ? (hovered ? c.actionDestructiveHoverBg : 'transparent')
      : (hovered ? c.actionDefaultHoverBg : 'transparent')

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : action.onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      onMouseEnter={() => !isDisabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        // DS layout tokens
        height: 32,
        padding: '0 12px',
        borderRadius: 8,         // radius/sm
        border: `1px solid ${borderColor}`,
        // DS colour tokens
        color: textColor,
        backgroundColor: bgColor,
        // DS typography: body/sm/regular
        fontSize: typography.fontSize.md,
        fontWeight: 400,
        lineHeight: '20px',
        fontFamily: typography.fontFamily.body,
        // Interaction
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.48 : 1,
        // Layout
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        transition: 'background-color 120ms, border-color 120ms, color 120ms',
      }}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#067A46]/40"
    >
      {action.icon && (
        <span
          aria-hidden
          style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          {action.icon}
        </span>
      )}
      {action.label}
    </button>
  )
}

// ─── Internal: Vertical separator ────────────────────────────────────────────

function VSeparator({ theme }: { theme: BulkSelectionTheme }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'block',
        width: 1,
        height: 20,
        backgroundColor: tok[theme].separator,
        flexShrink: 0,
      }}
    />
  )
}

// ─── BulkSelection (footer bar) ───────────────────────────────────────────────
// Full-width bar designed to anchor at the bottom of a list, table, or page.
//
// Layout:
//   ┌─────────────────────────────────────────────────────────────────────┐
//   │ [✓] 3 of 12 selected     [Cancel] [Export] [Archive] [Delete]       │
//   └─────────────────────────────────────────────────────────────────────┘
//
// DS tokens:
//   bg:            colour/background/page
//   border-top:    colour/border/default (1px separator above)
//   padding:       spacing/300 spacing/600  →  12px 24px
//   gap (actions): spacing/200             →  8px

export function BulkSelection({
  selectedCount = 0,
  totalCount,
  selectionState = 'none',
  onToggleAll,
  onCancel,
  actions = [],
  theme = 'light',
  className,
}: BulkSelectionProps) {
  const checkboxId = useId()
  const c = tok[theme]

  // Cap visible actions at 3 per DS spec
  const visibleActions = actions.slice(0, 3)
  const hasActions = visibleActions.length > 0

  return (
    <div
      role="toolbar"
      aria-label="Bulk selection actions"
      className={cn('flex items-center w-full', className)}
      style={{
        // DS tokens
        backgroundColor: c.barBg,
        borderTop: `1px solid ${c.barBorderTop}`,
        // DS padding: spacing/300 (12px) vertical, spacing/600 (24px) horizontal
        padding: '12px 24px',
        // typography baseline
        fontFamily: typography.fontFamily.body,
        // min-height: 56px (spacing/300 × 2 + 32px button)
        minHeight: 56,
      }}
    >
      {/* ── LEFT: checkbox + count ───────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <InlineCheckbox
          id={checkboxId}
          state={selectionState}
          onChange={onToggleAll}
          theme={theme}
        />

        {/* Count label — "3 of 12 selected" or "3 items selected" */}
        <span
          style={{
            fontSize: typography.fontSize.md,
            fontWeight: 400,
            lineHeight: '20px',
            color: c.countText,
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          <span style={{ fontWeight: 600, color: c.countNumber }}>
            {selectedCount}
          </span>
          {totalCount !== undefined
            ? <> of {totalCount} selected</>
            : <> item{selectedCount !== 1 ? 's' : ''} selected</>
          }
        </span>
      </div>

      {/* ── SPACER ───────────────────────────────────────────────── */}
      <div style={{ flex: 1 }} aria-hidden />

      {/* ── RIGHT: cancel + (optional separator) + actions ─────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Cancel button — leftmost in the CTA group */}
        <ActionButton
          action={{ label: 'Cancel', onClick: onCancel ?? (() => {}), variant: 'default' }}
          theme={theme}
        />

        {/* Vertical separator between Cancel and action buttons */}
        {hasActions && <VSeparator theme={theme} />}

        {/* Action buttons (max 3) */}
        {visibleActions.map((action, i) => (
          <ActionButton key={i} action={action} theme={theme} />
        ))}
      </div>
    </div>
  )
}

export default BulkSelection
