'use client'

import React from 'react'
import { cn } from './utils'
import { components, typography } from '@/lib/tokens'

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS v3 — node 48308-5936

export type AvatarSize  = 'sm' | 'md' | 'lg'
export type AvatarType  = 'dark' | 'light'
export type AvatarShape = 'circle' | 'square' | 'rounded'

export interface AvatarProps {
  /** Display name — used to generate initials and optionally shown beside the avatar */
  name?: string
  /** Image URL — when provided, renders a photo avatar */
  src?: string
  /** Alt text for the image */
  alt?: string
  /** Size variant — sm 24px · md 32px · lg 40px */
  size?: AvatarSize
  /** Colour type — light (dark-green fill, for light canvases) or dark (lime fill, for dark canvases) */
  type?: AvatarType
  /** Canvas theme — controls the name label text colour */
  theme?: 'light' | 'dark'
  /** Whether to render the name label beside the avatar */
  showName?: boolean
  /** Force the person-icon fallback even when a name is provided */
  iconOnly?: boolean
  /** Shape of the avatar bubble — circle (fully round), square (sharp corners), rounded (rounded-lg) */
  shape?: AvatarShape
  className?: string
}

// Shorthand alias so the rest of the file stays concise
const av = components.avatar

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// ─── Person Icon ──────────────────────────────────────────────────────────────

function PersonIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="8" r="4" fill={color} />
      <path
        d="M4 20c0-4 3.582-7 8-7s8 3 8 7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      name,
      src,
      alt,
      size     = 'md',
      type     = 'light',
      theme    = 'light',
      showName = false,
      iconOnly = false,
      shape    = 'circle',
      className,
    },
    ref,
  ) => {
    const sz     = av.size[size]
    const colors = av.colour[type]

    const shapeClass =
      shape === 'square'  ? 'rounded-[4px]' :
      shape === 'rounded' ? 'rounded-xl'    :
                            'rounded-full'

    // ── Avatar bubble ─────────────────────────────────────────────────────────
    // iconOnly forces the person-icon regardless of whether name is set
    const bubble = (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden',
          shapeClass,
        )}
        style={{
          width:           sz.bubble,
          height:          sz.bubble,
          backgroundColor: src ? undefined : colors.bubble,
        }}
        aria-hidden={!!name}
      >
        {src ? (
          <img
            src={src}
            alt={alt ?? name ?? 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : name && !iconOnly ? (
          <span
            style={{
              color:      colors.fg,
              fontSize:   sz.initFontSize,
              fontWeight: av.initFontWeight,
              lineHeight: 1,
              fontFamily: typography.fontFamily.body,
              userSelect: 'none',
            }}
          >
            {getInitials(name)}
          </span>
        ) : (
          <PersonIcon size={parseInt(sz.iconSize)} color={colors.fg} />
        )}
      </span>
    )

    // ── Name label ─────────────────────────────────────────────────────────────
    // Show label whenever showName is true AND a name string is provided,
    // regardless of whether the bubble is showing initials or the person icon.
    if (showName && name) {
      return (
        <div
          ref={ref}
          className={cn('inline-flex items-center', className)}
          style={{ gap: av.gap }}
          aria-label={name}
        >
          {bubble}
          <span
            style={{
              color:      av.colour[theme ?? type].label,
              fontSize:   sz.labelFontSize,
              fontWeight: av.labelFontWeight,
              fontFamily: typography.fontFamily.body,
              userSelect: 'none',
            }}
          >
            {name}
          </span>
        </div>
      )
    }

    // ── No label ───────────────────────────────────────────────────────────────
    return (
      <div
        ref={ref}
        className={cn('inline-flex', className)}
        aria-label={name ?? alt ?? 'Avatar'}
      >
        {bubble}
      </div>
    )
  },
)

Avatar.displayName = 'Avatar'

export default Avatar
