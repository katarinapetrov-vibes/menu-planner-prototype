'use client'

import React, { useId } from 'react'
import { cn } from './utils'
import { components } from '@/lib/tokens'

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS v3 — node 45001-17736
// Orientation=vertical · Orientation=horizontal

export type ScrollbarOrientation = 'vertical' | 'horizontal' | 'both'
export type ScrollbarTheme       = 'light' | 'dark'

export interface ScrollbarProps {
  children: React.ReactNode
  /** Which axis carries the custom scrollbar */
  orientation?: ScrollbarOrientation
  /** Canvas theme — switches track / thumb colours */
  theme?: ScrollbarTheme
  className?: string
  style?: React.CSSProperties
}

// Token shorthand
const sc = components.scrollbar

// ─── Scrollbar ────────────────────────────────────────────────────────────────

export const Scrollbar = React.forwardRef<HTMLDivElement, ScrollbarProps>(
  (
    {
      children,
      orientation = 'vertical',
      theme       = 'light',
      className,
      style,
    },
    ref,
  ) => {
    // useId gives a stable, SSR-safe unique string; strip colons for CSS class safety
    const uid = useId().replace(/:/g, '')
    const cls = `sb-${uid}`
    const col = sc.colour[theme]

    const overflowX = orientation === 'horizontal' || orientation === 'both' ? 'auto' : 'hidden'
    const overflowY = orientation === 'vertical'   || orientation === 'both' ? 'auto' : 'hidden'

    return (
      <>
        {/* Scoped CSS — applied only to this instance via the generated class */}
        <style>{`
          .${cls}::-webkit-scrollbar {
            width:  ${sc.size};
            height: ${sc.size};
          }
          .${cls}::-webkit-scrollbar-track {
            background:    ${col.track};
            border-radius: ${sc.borderRadius};
          }
          .${cls}::-webkit-scrollbar-thumb {
            background:    ${col.thumb};
            border-radius: ${sc.borderRadius};
          }
          .${cls}::-webkit-scrollbar-thumb:hover {
            background: ${col.thumbHover};
          }
          /* Firefox */
          .${cls} {
            scrollbar-width: thin;
            scrollbar-color: ${col.thumb} ${col.track};
          }
        `}</style>

        <div
          ref={ref}
          tabIndex={0}
          className={cn(cls, className)}
          style={{ overflowX, overflowY, ...style }}
        >
          {children}
        </div>
      </>
    )
  },
)

Scrollbar.displayName = 'Scrollbar'

export default Scrollbar
