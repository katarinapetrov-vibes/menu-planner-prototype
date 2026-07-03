'use client'

import React, { useState } from 'react'
import { semantic, radius, spacing, sizing, typography, opacity } from '@/lib/tokens'

/**
 * Enterprise DS v3 — Like & Comment Counter
 * Figma node 36988-45874
 *
 * A compact interactive counter button used for social feedback actions such as
 * likes, comments, favourites, and views. Appears in comment threads, content
 * cards, and activity feeds.
 *
 * Figma variables
 *   IconType   — like | comment | favourite | view
 *   Layout     — horizontal | vertical
 *   Active     — boolean (user has already performed this action)
 *   ShowLabel  — boolean (show text label beside / below the icon)
 *   ShowCount  — boolean (show the numeric count)
 *   Disabled   — boolean
 *   Theme      — light | dark
 *   Count      — number displayed beside or below the icon
 *
 * Token mapping
 *   Inactive  bg transparent  border colour/border/default          text colour/foreground/default/secondary
 *   Hover     bg state/hover  border colour/border/strong           text colour/foreground/default/primary
 *   Active    bg transparent                                         border transparent
 *             text colour/foreground/positive/default              icon filled
 *   Disabled  opacity/disabled (0.48) applied to entire element
 */

const s  = semantic
const r  = radius
const sp = spacing
const sz = sizing
const t  = typography
const op = opacity

// ─── Types ────────────────────────────────────────────────────────────────────

export type CounterIconType = 'like' | 'dislike' | 'comment' | 'favourite' | 'view'
export type CounterLayout   = 'horizontal' | 'vertical'
export type CounterTheme    = 'light' | 'dark'

export interface LikeCommentCounterProps {
  /** Icon type — determines which icon is displayed */
  iconType?: CounterIconType
  /** Numeric count to display */
  count?: number
  /** Whether this counter is in the active/selected state (e.g. user has liked) */
  active?: boolean
  /** Layout direction */
  layout?: CounterLayout
  /** Show the text label (e.g. "Like", "Comment") */
  showLabel?: boolean
  /** Override the default label text */
  label?: string
  /** Show the numeric count */
  showCount?: boolean
  /** Disabled state — renders at reduced opacity, non-interactive */
  disabled?: boolean
  /** Canvas theme */
  theme?: CounterTheme
  /** Click handler — omit to render as a static display element */
  onClick?: () => void
  /** Additional CSS class names */
  className?: string
  /** Accessible label for screen readers */
  'aria-label'?: string
}

// ─── Component tokens ─────────────────────────────────────────────────────────
// Sourced from Figma node 36988-45874 spec annotations

const CT = {
  paddingX:      '6px',                                    // horizontal padding (Figma spec)
  paddingY:      sp[100],                                   // 4px vertical padding
  paddingXVert:  sp[100],                                   // 4px for vertical layout
  gap:           sp[100],                                   // 4px gap between icon and text
  borderRadius:  r.xs,                                      // 4px (closest DS token to Figma 3px)
  borderWidth:   '1px',
  height:        sz.componentHeight.sm,                     // 24px — horizontal counter height
  iconSize:      sz.icon.sm,                                // 16px
  fontSize:      t.scale['body/sm/semi'].fontSize,          // 12px
  fontWeight:    t.scale['body/sm/semi'].fontWeight,        // 600
  lineHeight:    t.scale['body/sm/semi'].lineHeight,        // 1.667em
} as const

// ─── State token resolver ─────────────────────────────────────────────────────

type TokenSet = { bg: string; border: string; text: string }

function resolveTokens(
  active:  boolean,
  hovered: boolean,
  theme:   CounterTheme,
): TokenSet {
  if (active) {
    return {
      bg:     'transparent',
      border: 'transparent',
      text:   s.foreground.positive.default[theme],        // 067A46 / 96DC14
    }
  }
  return {
    bg:     hovered
      ? (theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)')
      : 'transparent',
    border: hovered ? s.border.strong[theme] : 'transparent',
    text:   hovered
      ? s.foreground.default.primary[theme]                // 242424 / E4E4E4
      : s.foreground.default.secondary[theme],             // 4B4B4B / EEEEEE
  }
}

// ─── SVG icons ────────────────────────────────────────────────────────────────

function LikeIcon({ filled }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden>
        <path d="M5.333 14H11.6a1.333 1.333 0 0 0 1.267-.907l1.8-5.333A1.333 1.333 0 0 0 13.4 6.667H9.733l.534-2.667A1 1 0 0 0 9.293 2.667a.993.993 0 0 0-.8.4L5.333 7.333Z" />
        <path d="M5.333 14H2.667A.667.667 0 0 1 2 13.333V8A.667.667 0 0 1 2.667 7.333h2.666Z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden>
      <path
        d="M5.333 14H11.6a1.333 1.333 0 0 0 1.267-.907l1.8-5.333A1.333 1.333 0 0 0 13.4 6.667H9.733l.534-2.667A1 1 0 0 0 9.293 2.667a.993.993 0 0 0-.8.4L5.333 7.333M5.333 14H2.667A.667.667 0 0 1 2 13.333V8A.667.667 0 0 1 2.667 7.333h2.666M5.333 14V7.333"
        stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

function DislikeIcon({ filled }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden>
        <path d="M10.667 2H4.4a1.333 1.333 0 0 0-1.267.907l-1.8 5.333A1.333 1.333 0 0 0 2.6 9.333h3.667l-.534 2.667a1 1 0 0 0 .974 1.333.993.993 0 0 0 .8-.4l3.16-4.266Z" />
        <path d="M10.667 2h2.666A.667.667 0 0 1 14 2.667V8a.667.667 0 0 1-.667.667h-2.666Z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden>
      <path
        d="M10.667 2H4.4a1.333 1.333 0 0 0-1.267.907l-1.8 5.333A1.333 1.333 0 0 0 2.6 9.333h3.667l-.534 2.667a1 1 0 0 0 .974 1.333.993.993 0 0 0 .8-.4l3.16-4.266M10.667 2h2.666A.667.667 0 0 1 14 2.667V8a.667.667 0 0 1-.667.667h-2.666M10.667 2v6.667"
        stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

function CommentIcon({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden>
      <path
        d="M13.333 9.333A5.333 5.333 0 0 1 8 14H2.667L2 14.667V9.333A5.333 5.333 0 0 1 7.333 4H8a5.333 5.333 0 0 1 5.333 5.333Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

function FavouriteIcon({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden>
      <path
        d="M8 13.333S2 10 2 5.333a3.333 3.333 0 0 1 6-2 3.333 3.333 0 0 1 6 2C14 10 8 13.333 8 13.333Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

function ViewIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden>
      <path
        d="M1.333 8S3.333 3.333 8 3.333 14.667 8 14.667 8 12.667 12.667 8 12.667 1.333 8 1.333 8Z"
        stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.33" />
    </svg>
  )
}

// ─── Default labels ────────────────────────────────────────────────────────────

const DEFAULT_LABELS: Record<CounterIconType, string> = {
  like:      'Like',
  dislike:   'Dislike',
  comment:   'Comment',
  favourite: 'Favourite',
  view:      'View',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LikeCommentCounter({
  iconType   = 'like',
  count,
  active     = false,
  layout     = 'horizontal',
  showLabel  = false,
  label,
  showCount  = true,
  disabled   = false,
  theme      = 'light',
  onClick,
  className,
  'aria-label': ariaLabel,
}: LikeCommentCounterProps) {
  const [hovered, setHovered] = useState(false)

  const tok          = resolveTokens(active, hovered && !disabled, theme)
  const isVertical   = layout === 'vertical'
  const displayLabel = label ?? DEFAULT_LABELS[iconType]
  const countStr     = count !== undefined ? String(count) : undefined

  // Build accessible label
  const descParts: string[] = [displayLabel]
  if (countStr)  descParts.push(countStr)
  if (active)    descParts.push('active')
  const finalAriaLabel = ariaLabel ?? descParts.join(', ')

  // Decide what text to render
  const hasText = (showLabel && displayLabel) || (showCount && countStr)
  const textNode = hasText ? (
    <span style={{ lineHeight: CT.lineHeight }}>
      {showLabel ? displayLabel : null}
      {showLabel && showCount && countStr ? ` ${countStr}` : null}
      {!showLabel && showCount && countStr ? countStr : null}
    </span>
  ) : null

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={finalAriaLabel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={className}
      style={{
        display:         'inline-flex',
        flexDirection:   isVertical ? 'column' : 'row',
        alignItems:      'center',
        justifyContent:  'center',
        gap:             CT.gap,
        paddingLeft:     isVertical ? CT.paddingXVert : CT.paddingX,
        paddingRight:    isVertical ? CT.paddingXVert : CT.paddingX,
        paddingTop:      CT.paddingY,
        paddingBottom:   CT.paddingY,
        minHeight:       isVertical ? undefined : CT.height,
        borderRadius:    CT.borderRadius,
        border:          `${CT.borderWidth} solid ${tok.border}`,
        backgroundColor: tok.bg,
        color:           tok.text,
        fontSize:        CT.fontSize,
        fontWeight:      CT.fontWeight,
        lineHeight:      CT.lineHeight,
        fontFamily:      t.fontFamily.body,
        cursor:          disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
        opacity:         disabled ? op.half : 1,
        transition:      'background-color 150ms ease, border-color 150ms ease, color 150ms ease',
        userSelect:      'none',
        whiteSpace:      'nowrap',
      }}
    >
      {/* Icon */}
      <span
        style={{
          width:          CT.iconSize,
          height:         CT.iconSize,
          flexShrink:     0,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}
      >
        {iconType === 'like'      && <LikeIcon filled={active} />}
        {iconType === 'dislike'   && <DislikeIcon filled={active} />}
        {iconType === 'comment'   && <CommentIcon filled={active} />}
        {iconType === 'favourite' && <FavouriteIcon filled={active} />}
        {iconType === 'view'      && <ViewIcon />}
      </span>

      {/* Label / count */}
      {textNode}
    </button>
  )
}
