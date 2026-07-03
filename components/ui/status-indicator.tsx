'use client'

import React from 'react'
import { cn } from './utils'
import { components as componentTokens, semantic, typography, spacing } from '@/lib/tokens'

/**
 * Enterprise DS v3 — Status Indicator
 * Figma node 45836-14783
 *
 * A compact inline element pairing a coloured semantic dot with a label.
 * Supports an optional value text, close button, and action button.
 *
 * Layout (from Figma):
 *   display: inline-flex; padding: var(--scale-0, 0); align-items: center; gap: var(--scale-200, 8px);
 *
 * Figma variables:
 *   Type            — Success | Warning | Error | Info | AI
 *   Show Value      — True | False
 *   Value           — (text)
 *   Close Button    — True | False
 *   Action          — True | False
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatusType  = 'success' | 'warning' | 'error' | 'info' | 'ai'
export type StatusTheme = 'light' | 'dark'

export interface StatusIndicatorProps {
  /** Semantic type — controls dot colour (Figma: Type) */
  status?: StatusType
  /** Label text rendered next to the dot */
  label?: string
  /** Show Value (Figma: Show Value True/False) */
  showValue?: boolean
  /** Value text — visible when showValue=true */
  value?: string
  /** Show close/dismiss button (Figma: Close Button True/False) */
  closeButton?: boolean
  /** Callback fired when the close button is clicked */
  onClose?: () => void
  /** Show action button (Figma: Action True/False) */
  action?: boolean
  /** Text label for the action button */
  actionLabel?: string
  /** Callback fired when the action button is clicked */
  onAction?: () => void
  /** Light or dark canvas */
  theme?: StatusTheme
  className?: string
}

// ─── Design Tokens ────────────────────────────────────────────────────────────

const tok = componentTokens.statusIndicator.colour

const dotFill: Record<StatusType, Record<StatusTheme, string>> = {
  success: { light: tok.positive.light.background,    dark: tok.positive.dark.background },
  warning: { light: tok.warning.light.background,     dark: tok.warning.dark.background },
  error:   { light: tok.negative.light.background,    dark: tok.negative.dark.background },
  info:    { light: tok.information.light.background, dark: tok.information.dark.background },
  ai:      { light: tok.ai.light.background,          dark: tok.ai.dark.background },
}


// ─── Component ────────────────────────────────────────────────────────────────

export function StatusIndicator({
  status = 'success',
  label = 'Status',
  showValue = false,
  value = 'Value',
  closeButton = false,
  onClose,
  action = false,
  actionLabel = 'Action',
  onAction,
  theme = 'light',
  className,
}: StatusIndicatorProps) {
  const dot = dotFill[status][theme]

  // Layout: inline-flex; padding: 0; align-items: center; gap: 8px
  return (
    <div
      className={cn('inline-flex items-center', className)}
      style={{ gap: spacing[200] }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={label || status}
    >
      {/* Dot — 10 × 10 filled circle, decorative */}
      <span
        className="shrink-0 rounded-full"
        style={{ backgroundColor: dot, width: componentTokens.statusIndicator.dotSize, height: componentTokens.statusIndicator.dotSize }}
        aria-hidden={true}
      />

      {/* Label */}
      <span
        className="min-w-0 truncate leading-none"
        style={{ color: componentTokens.statusIndicator.label[theme], fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold }}
      >
        {label || status}
      </span>

      {/* Value (Show Value = True) */}
      {showValue && (
        <span
          className="min-w-0 truncate leading-none"
          style={{ color: componentTokens.statusIndicator.value[theme], fontSize: typography.fontSize.sm }}
        >
          {value}
        </span>
      )}

      {/* Action button (Figma: Action True/False) */}
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 leading-none underline"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: semantic.foreground.information.default[theme],
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
          }}
        >
          {actionLabel}
        </button>
      )}

      {/* Close button (Figma: Close Button True/False) */}
      {closeButton && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="shrink-0 leading-none"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: componentTokens.statusIndicator.label[theme],
            fontSize: typography.fontSize.sm,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

export default StatusIndicator
