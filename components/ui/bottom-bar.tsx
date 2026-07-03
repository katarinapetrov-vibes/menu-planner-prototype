'use client'

import React from 'react'
import { cn } from './utils'
import { components, typography, spacing } from '@/lib/tokens'
import { Checkbox } from './checkbox'
import { Button } from './button'
import { Divider } from './divider'

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS v3 — node 2524-8668 (Bottom Fixed Bar/Bulk Actions)

export type BottomBarTheme = 'light' | 'dark'

export interface BottomBarAction {
  label: string
  /** Optional 24px icon node rendered before the label */
  icon?: React.ReactNode
  onClick?: () => void
  /** Visual style of this action button (default: 'text') */
  variant?: 'text' | 'outlined' | 'filled'
  disabled?: boolean
}

export interface BottomBarProps {
  /** Number of selected items — used to build the default selection label */
  selectedCount?: number
  /** Override the auto-generated "N Option(s) selected" string */
  selectionLabel?: string
  /** Checkbox checked state */
  checked?: boolean
  /** Checkbox indeterminate state (some, but not all, items selected) */
  indeterminate?: boolean
  onCheckboxChange?: (checked: boolean) => void
  hideCheckbox?: boolean
  /**
   * Secondary (text-style) action buttons displayed left of the divider.
   * Defaults variant to 'text'.
   */
  secondaryActions?: BottomBarAction[]
  /**
   * Primary action buttons displayed right of the divider.
   * Convention: last item should be 'filled', preceding items 'outlined'.
   * Defaults variant to 'outlined'.
   */
  primaryActions?: BottomBarAction[]
  theme?: BottomBarTheme
  className?: string
  style?: React.CSSProperties
}

// Token alias
const bb = components.bottomBar

/** Map BottomBarAction variant names to Button component variants */
function toButtonVariant(v: BottomBarAction['variant']): 'fill' | 'outline' | 'text' {
  if (v === 'filled')   return 'fill'
  if (v === 'outlined') return 'outline'
  return 'text'
}

// ─── BottomBar ────────────────────────────────────────────────────────────────

export const BottomBar = React.forwardRef<HTMLDivElement, BottomBarProps>(
  (
    {
      selectedCount = 0,
      selectionLabel,
      checked = false,
      indeterminate = false,
      onCheckboxChange,
      hideCheckbox = false,
      secondaryActions = [],
      primaryActions   = [],
      theme = 'light',
      className,
      style,
    },
    ref,
  ) => {
    const col = bb.colour[theme]

    const label = selectionLabel
      ?? `${selectedCount} Option${selectedCount !== 1 ? 's' : ''} selected`

    const hasSecondary = secondaryActions.length > 0
    const hasPrimary   = primaryActions.length > 0

    return (
      <div
        ref={ref}
        role="toolbar"
        aria-label="Bulk actions"
        className={cn(className)}
        style={{
          position:        'fixed',
          bottom:          0,
          left:            0,
          right:           0,
          display:         'flex',
          flexDirection:   'row',
          alignItems:      'center',
          justifyContent:  'space-between',
          paddingTop:      bb.density.comfortable.paddingY,
          paddingBottom:   bb.density.comfortable.paddingY,
          paddingLeft:     bb.density.comfortable.paddingX,
          paddingRight:    bb.density.comfortable.paddingX,
          backgroundColor: col.bg,
          borderTop:       `${bb.dividerWidth} solid ${col.border}`,
          borderRadius:    bb.borderRadius,
          boxShadow:       bb.shadow,
          zIndex:          bb.zIndex,
          ...style,
        }}
      >
        {/* ── Left: selection info ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: bb.selectionGap }}>
          {!hideCheckbox && (
            <Checkbox
              checked={checked}
              indeterminate={indeterminate}
              onChange={onCheckboxChange}
              theme={theme}
              size="md"
            />
          )}
          <span style={{
            fontFamily: typography.fontFamily.body,
            fontWeight: typography.scale['body/md/regular'].fontWeight,
            fontSize:   typography.scale['body/md/regular'].fontSize,
            lineHeight: typography.scale['body/md/regular'].lineHeight,
            color:      col.selectionText,
            userSelect: 'none',
          }}>
            {label}
          </span>
        </div>

        {/* ── Right: action groups ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: bb.primaryGap }}>

          {/* Secondary actions */}
          {hasSecondary && (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing[100] }}>
              {secondaryActions.map((action, i) => (
                <Button
                  key={i}
                  variant={toButtonVariant(action.variant ?? 'text')}
                  color="positive"
                  size="md"
                  theme={theme}
                  disabled={action.disabled}
                  onClick={action.onClick}
                  showLeadingIcon={!!action.icon}
                  leadingIcon={action.icon}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Vertical divider — only rendered when both groups are present */}
          {hasSecondary && hasPrimary && (
            <Divider
              orientation="vertical"
              shade={theme === 'dark' ? 'dark' : 'light'}
              weight="default"
            />
          )}

          {/* Primary actions */}
          {hasPrimary && (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: bb.primaryGap }}>
              {primaryActions.map((action, i) => (
                <Button
                  key={i}
                  variant={toButtonVariant(action.variant ?? 'outlined')}
                  color="positive"
                  size="md"
                  theme={theme}
                  disabled={action.disabled}
                  onClick={action.onClick}
                  showLeadingIcon={!!action.icon}
                  leadingIcon={action.icon}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}

        </div>
      </div>
    )
  },
)

BottomBar.displayName = 'BottomBar'

export default BottomBar
