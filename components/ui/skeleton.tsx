'use client'

import React from 'react'
import { primitives, radius as radiusTokens, motion as motionTokens } from '@/lib/tokens'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SkeletonVariant    = 'standard' | 'text' | 'button' | 'avatar' | 'image'
export type SkeletonTextSize   = 'large' | 'medium' | 'small' | 'micro'
export type SkeletonButtonSize = 'lg' | 'md' | 'sm'
export type SkeletonAvatarSize = 'lg' | 'md' | 'sm'
export type SkeletonTheme      = 'light' | 'dark'

export interface SkeletonProps {
  /** Shape variant of the skeleton element */
  variant?: SkeletonVariant
  /** Height scale for text lines (variant="text") */
  textSize?: SkeletonTextSize
  /** Height scale for button shapes (variant="button") */
  buttonSize?: SkeletonButtonSize
  /** Diameter of the avatar circle (variant="avatar") */
  avatarSize?: SkeletonAvatarSize
  /** Light or dark canvas */
  theme?: SkeletonTheme
  /** Enable the left-to-right shimmer wave (default: true) */
  animated?: boolean
  /** Override width (any valid CSS value or number px) */
  width?: string | number
  /** Override height (any valid CSS value or number px) */
  height?: string | number
  className?: string
  style?: React.CSSProperties
}

// ─── Design tokens ────────────────────────────────────────────────────────────
// Sourced from Figma: Enterprise DS v3 — Skeleton component fills

const skeletonTokens = {
  /** Base fill of every skeleton element */
  base: {
    light: primitives.grey[300],  // #EEEEEE
    dark:  primitives.grey[700],  // #4B4B4B
  },
  /** Brighter shimmer highlight that sweeps across the base */
  shimmer: {
    light: primitives.grey[100],  // #FFFFFF
    dark:  primitives.grey[600],  // #676767
  },
  /** Placeholder icon stroke (image variant) */
  icon: {
    light: primitives.grey[500],  // #BBBBBB
    dark:  primitives.grey[600],  // #676767
  },
} as const

// ─── Dimension maps (from Figma spec) ─────────────────────────────────────────

const TEXT_HEIGHT: Record<SkeletonTextSize, number> = {
  large:  60,
  medium: 32,
  small:  16,
  micro:   8,
}

const BUTTON_HEIGHT: Record<SkeletonButtonSize, number> = {
  lg: 48,
  md: 40,
  sm: 32,
}

const AVATAR_DIM: Record<SkeletonAvatarSize, number> = {
  lg: 40,
  md: 32,
  sm: 24,
}

// ─── Shimmer keyframe (injected once per component instance) ──────────────────

const SHIMMER_CSS = `
@keyframes sk-shimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}
`

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function Skeleton({
  variant    = 'standard',
  textSize   = 'medium',
  buttonSize = 'md',
  avatarSize = 'md',
  theme      = 'light',
  animated   = true,
  width,
  height,
  className  = '',
  style,
}: SkeletonProps) {
  const isDark = theme === 'dark'
  const bg     = isDark ? skeletonTokens.base.dark    : skeletonTokens.base.light
  const hi     = isDark ? skeletonTokens.shimmer.dark : skeletonTokens.shimmer.light

  // ── Resolve dimensions and border-radius per variant ──────────────────────
  let h: string | number = height ?? 'auto'
  let w: string | number = width  ?? '100%'
  let br: string = radiusTokens.sm        // 8px default
  let showImageIcon = false

  switch (variant) {
    case 'text':
      h  = height ?? TEXT_HEIGHT[textSize]
      w  = width  ?? '100%'
      br = radiusTokens.xs         // 4px — text line bars
      break

    case 'button':
      h  = height ?? BUTTON_HEIGHT[buttonSize]
      w  = width  ?? '100%'
      br = radiusTokens.round      // pill
      break

    case 'avatar': {
      const dim = AVATAR_DIM[avatarSize]
      h  = height ?? dim
      w  = width  ?? dim
      br = '50%'                   // full circle
      break
    }

    case 'image':
      h  = height ?? 'auto'
      w  = width  ?? '100%'
      br = radiusTokens.sm         // 8px
      showImageIcon = true
      break

    case 'standard':
    default:
      h  = height ?? 'auto'
      w  = width  ?? '100%'
      br = radiusTokens.sm         // 8px
      break
  }

  const baseStyle: React.CSSProperties = {
    display:      'block',
    width:        typeof w === 'number' ? `${w}px` : w,
    height:       typeof h === 'number' ? `${h}px` : h,
    borderRadius: br,
    overflow:     'hidden',
    position:     'relative',
    flexShrink:   0,
  }

  const animStyle: React.CSSProperties = animated
    ? {
        backgroundImage:    `linear-gradient(90deg, ${bg} 0%, ${hi} 50%, ${bg} 100%)`,
        backgroundSize:     '200% 100%',
        animation:          `sk-shimmer ${motionTokens.duration.loop.skeleton} ease-in-out infinite`,
      }
    : { backgroundColor: bg }

  return (
    <>
      {animated && (
        // eslint-disable-next-line react/no-danger
        <style dangerouslySetInnerHTML={{ __html: SHIMMER_CSS }} />
      )}
      <div
        aria-hidden="true"
        role="presentation"
        className={className}
        style={{ ...baseStyle, ...animStyle, ...style }}
      >
        {showImageIcon && (
          <div
            style={{
              position:        'absolute',
              inset:           0,
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
            }}
          >
            {/* Figma image-placeholder icon */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isDark ? skeletonTokens.icon.dark : skeletonTokens.icon.light}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>
    </>
  )
}
