'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { clsx } from 'clsx'
import { components, motion as motionTokens } from '@/lib/tokens'

/**
 * Enterprise DS v3 — Notification Badge
 * Figma node 3414-50790
 *
 * A compact numeric indicator that overlays or sits adjacent to an element to
 * communicate a tally, unread count, or score.
 *
 * Figma variables
 *   Type            — success | warning | error | info | ai
 *   Theme           — light | dark
 *   Size            — sm | md | lg
 *   Dot             — boolean (show a plain dot with no count)
 *   Count           — number shown inside the badge
 *   Max             — upper cap; displays "99+" when count exceeds max
 *
 * Dark canvas note: G-1/G-3/G-5/G-7/G-9 (all dark pastel bg tokens) RESOLVED.
 * G-2/G-4/G-6/G-8/G-10 (on-fill text tokens for dark pastels) — ALL RESOLVED.
 */

export type BadgeType  = 'success' | 'warning' | 'error' | 'info' | 'ai'
export type BadgeTheme = 'light' | 'dark'
export type BadgeSize  = 'sm' | 'md' | 'lg'

export interface NotificationBadgeProps {
  /** Numeric count to display inside the badge */
  count?: number
  /** Counts above this value render as "max+" (default 99). Must be > 0. */
  max?: number
  /** Render a plain dot with no count */
  dot?: boolean
  /** Semantic type — drives the badge colour */
  type?: BadgeType
  /** Canvas theme — light canvas gets saturated fill, dark canvas gets pastel fill */
  theme?: BadgeTheme
  /** Size — sm (16px) | md (20px) | lg (24px) */
  size?: BadgeSize
  /** Additional class names for the badge pill */
  className?: string
  /** Accessible label — screen readers will announce this instead of the raw count */
  'aria-label'?: string
}

export function NotificationBadge({
  count,
  max = 99,
  dot = false,
  type = 'error',
  theme = 'light',
  size = 'md',
  className,
  'aria-label': ariaLabel,
}: NotificationBadgeProps) {
  const colourTok = components.notificationBadge.colour[type][theme]
  const sizeTok   = components.notificationBadge.size[size]
  const prefersReducedMotion = useReducedMotion()

  // Clamp negative counts to zero
  const safeCount = count !== undefined ? Math.max(0, count) : undefined

  // Derive display label — count of 0 renders nothing (no badge needed for zero)
  const label =
    dot || safeCount === undefined || safeCount === 0
      ? undefined
      : safeCount > Math.max(1, max)
        ? `${max}+`
        : String(safeCount)

  const isJustDot = dot || label === undefined

  const pillTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, ...motionTokens.spring.snappy }

  // Parse dimension token strings to numbers for style props
  const heightPx   = parseInt(sizeTok.height,   10)
  const minWidthPx = parseInt(sizeTok.minWidth,  10)
  const dotSizePx  = parseInt(sizeTok.dotSize,   10)
  const paddingX   = isJustDot ? 0 : parseInt(sizeTok.paddingX, 10)

  return (
    <motion.span
      role="status"
      aria-label={ariaLabel ?? (label ? `${label} notification${Number(label) !== 1 ? 's' : ''}` : 'notification badge')}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={pillTransition}
      className={clsx(
        'inline-flex items-center justify-center font-semibold leading-none rounded-full select-none origin-center',
        className,
      )}
      style={{
        height:          isJustDot ? dotSizePx  : heightPx,
        minWidth:        isJustDot ? dotSizePx  : minWidthPx,
        width:           isJustDot ? dotSizePx  : undefined,
        paddingLeft:     paddingX,
        paddingRight:    paddingX,
        backgroundColor: colourTok.bg,
        color:           colourTok.text,
        fontSize:        sizeTok.fontSize,
      }}
    >
      {!isJustDot && label}
    </motion.span>
  )
}

// ─── BadgeWrapper ─────────────────────────────────────────────────────────────
// Convenience wrapper that positions the badge in the top-right corner of any
// child element — matching the anatomy described in the Figma spec.

export interface BadgeWrapperProps extends NotificationBadgeProps {
  children: React.ReactNode
}

export function BadgeWrapper({ children, ...badgeProps }: BadgeWrapperProps) {
  return (
    <span className="relative inline-flex">
      {children}
      <span className="absolute top-0 right-0 translate-x-[25%] -translate-y-[25%] z-10">
        <NotificationBadge {...badgeProps} />
      </span>
    </span>
  )
}
