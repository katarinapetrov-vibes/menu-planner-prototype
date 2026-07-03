'use client'

import React, { useState } from 'react'
import { cn } from './utils'
import { components, typography, spacing } from '@/lib/tokens'

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS — Dialog/Cards - Jaya
// Static:      node 47845-10305
// Navigational: node 47851-7686
// Selectable:   node 48121-15376

export type CardBehaviour   = 'static' | 'navigational' | 'selectable'
export type CardType        = 'filled' | 'elevated' | 'outlined'
export type CardTheme       = 'light' | 'dark'
export type CardSelectorType = 'radio' | 'checkbox'

export interface CardProps {
  /** Visual appearance — filled (white bg), elevated (white + shadow), outlined (white + border) */
  type?: CardType
  /** Interaction behaviour — static (display only), navigational (link/button), selectable (toggle) */
  behaviour?: CardBehaviour
  /** Canvas theme */
  theme?: CardTheme

  // ── Content ─────────────────────────────────────────────────────────────────
  title?: string
  description?: string
  /** Full-width slot rendered at the top of the card — 160 px tall */
  heroSlot?: React.ReactNode
  /** Optional 32 × 32 icon shown at the leading edge of the content row */
  iconSlot?: React.ReactNode
  /** Slot for chips, action buttons, or metadata — rendered below the text block */
  actionsSlot?: React.ReactNode
  /** Array of swappable content rows rendered below actionsSlot — each item fills full width */
  slots?: React.ReactNode[]

  // ── Navigational ────────────────────────────────────────────────────────────
  /** Renders the card as an <a> element */
  href?: string
  onClick?: () => void

  // ── Selectable ──────────────────────────────────────────────────────────────
  selected?: boolean
  selectorType?: CardSelectorType
  onSelect?: (selected: boolean) => void

  className?: string
  style?: React.CSSProperties
}

// Token alias
const cd = components.card

// ─── Card ─────────────────────────────────────────────────────────────────────

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      type       = 'filled',
      behaviour  = 'static',
      theme      = 'light',
      title,
      description,
      heroSlot,
      iconSlot,
      actionsSlot,
      slots,
      href,
      onClick,
      selected   = false,
      selectorType = 'radio',
      onSelect,
      className,
      style,
    },
    ref,
  ) => {
    const [hovered, setHovered] = useState(false)
    const [pressed, setPressed] = useState(false)

    const col = cd.colour[theme]
    const isInteractive = behaviour !== 'static'
    const isSelectable  = behaviour === 'selectable'

    // ── Background ────────────────────────────────────────────────────────────
    let bg: string = col.filledBg
    if (type === 'elevated') bg = col.elevatedBg
    if (type === 'outlined') bg = col.outlinedBg
    if (isInteractive && pressed) bg = col.pressedBg
    else if (isInteractive && hovered) bg = col.hoverBg

    // ── Border ────────────────────────────────────────────────────────────────
    // Always use 1px border (transparent when not visible) to prevent layout shift on select
    let border = '1px solid transparent'
    if (type === 'outlined') {
      border = `1px solid ${isSelectable && selected ? col.selectedBorder : col.outlinedBorder}`
    } else if (isSelectable && selected) {
      border = `1px solid ${col.selectedBorder}`
    }

    // ── Shadow ────────────────────────────────────────────────────────────────
    const shadow = type === 'elevated' ? col.elevatedShadow : 'none'

    // ── Shared container styles ───────────────────────────────────────────────
    const containerStyle: React.CSSProperties = {
      '--card-focus-ring': col.focusRing,
      position:        'relative',
      display:         'flex',
      flexDirection:   'column',
      gap:             cd.gap,
      padding:         cd.padding,
      borderRadius:    cd.borderRadius,
      backgroundColor: bg,
      border,
      boxShadow:       shadow,
      overflow:        'hidden',
      width:           '100%',
      transition:      'background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
      cursor:          isInteractive ? 'pointer' : 'default',
      userSelect:      'none',
      outline:         'none',
      ...style,
    } as React.CSSProperties

    // ── Focus ring via CSS custom property ────────────────────────────────────
    // Dynamic hex interpolation in Tailwind JIT does NOT work; use a CSS var instead.
    const focusClass = isInteractive
      ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--card-focus-ring)] focus-visible:ring-offset-2'
      : ''

    // ── Interaction handlers ───────────────────────────────────────────────────
    const interactionProps = isInteractive
      ? {
          onMouseEnter: () => setHovered(true),
          onMouseLeave: () => { setHovered(false); setPressed(false) },
          onMouseDown:  () => setPressed(true),
          onMouseUp:    () => setPressed(false),
          onClick:      isSelectable
            ? () => onSelect?.(!selected)
            : onClick,
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault()
              isSelectable ? onSelect?.(!selected) : onClick?.()
            }
          },
          tabIndex: 0,
        }
      : {}

    // ── ARIA ──────────────────────────────────────────────────────────────────
    const ariaProps = isSelectable
      ? {
          role:         selectorType === 'radio' ? 'radio' : 'checkbox',
          'aria-checked': selected,
        }
      : behaviour === 'navigational' && !href
      ? { role: 'button' as const }
      : {}

    // ── Content ───────────────────────────────────────────────────────────────
    const content = (
      <>
        {/* Hero image area */}
        {heroSlot && (
          <div
            style={{
              width:         '100%',
              height:        cd.heroHeight,
              borderRadius:  '4px',
              overflow:      'hidden',
              flexShrink:    0,
              backgroundColor: col.heroPlaceholderBg,
              display:       'flex',
              alignItems:    'center',
              justifyContent: 'center',
            }}
          >
            {heroSlot}
          </div>
        )}

        {/* Content row: icon + text */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: cd.iconTextGap, alignItems: 'flex-start' }}>
          {iconSlot && (
            <div style={{ width: cd.iconSize, height: cd.iconSize, flexShrink: 0 }}>
              {iconSlot}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            {title && (
              <span style={{
                fontFamily:  typography.fontFamily.headline,
                fontSize:    typography.scale['headline/h5'].fontSize,
                fontWeight:  typography.scale['headline/h5'].fontWeight,
                lineHeight:  typography.scale['headline/h5'].lineHeight,
                color:       col.titleColour,
                display:     'block',
              }}>
                {title}
              </span>
            )}
            {description && (
              <span style={{
                fontFamily: typography.fontFamily.body,
                fontSize:   typography.scale['body/md/regular'].fontSize,
                fontWeight: typography.scale['body/md/regular'].fontWeight,
                lineHeight: typography.scale['body/md/regular'].lineHeight,
                color:      col.descColour,
                display:    'block',
                marginTop:  title ? spacing[100] : undefined,
              }}>
                {description}
              </span>
            )}
          </div>
        </div>

        {/* Swappable content slots — directly below description */}
        {slots && slots.length > 0 && slots.map((slot, i) => (
          <div key={i} style={{ width: '100%' }}>
            {slot}
          </div>
        ))}

        {/* Actions / chips slot */}
        {actionsSlot && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: cd.gap }}>
            {actionsSlot}
          </div>
        )}

        {/* Selector indicator — selectable cards only.
            Inline SVG avoids layout shift from DS component padding/label slots
            and eliminates framer-motion reflow on mount/unmount. */}
        {isSelectable && (
          <div
            style={{
              position:      'absolute',
              top:           cd.padding,
              right:         cd.padding,
              pointerEvents: 'none',
            }}
            aria-hidden
          >
            {selectorType === 'checkbox' ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect
                  x="1" y="1" width="18" height="18" rx="3"
                  fill={selected ? col.selectedBorder : 'transparent'}
                  stroke={col.selectedBorder}
                  strokeWidth="1.5"
                  style={{ transition: 'fill 150ms ease' }}
                />
                {selected && (
                  <path
                    d="M5 10l3.5 3.5L15 7"
                    stroke={theme === 'dark' ? '#035624' : '#ffffff'}
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" fill="transparent" stroke={col.selectedBorder} strokeWidth="1.5" />
                {selected && (
                  <circle cx="10" cy="10" r="5" fill={col.selectedBorder} style={{ transition: 'opacity 150ms ease' }} />
                )}
              </svg>
            )}
          </div>
        )}
      </>
    )

    // ── Render as <a> for navigational cards with href ────────────────────────
    if (behaviour === 'navigational' && href) {
      return (
        <a
          href={href}
          className={cn(focusClass, className)}
          style={{ textDecoration: 'none', display: 'block', outline: 'none', ...containerStyle, ...style }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => { setHovered(false); setPressed(false) }}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
        >
          {content}
        </a>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(focusClass, className)}
        style={containerStyle}
        {...interactionProps}
        {...ariaProps}
      >
        {content}
      </div>
    )
  },
)

Card.displayName = 'Card'

// ── CardGroup ─────────────────────────────────────────────────────────────────
// Provides the required role="radiogroup" container for selectable cards that
// use selectorType="radio". Without this wrapper, role="radio" on individual
// cards is invalid ARIA (a radio must be owned by a radiogroup).

export interface CardGroupProps {
  /** Accessible label describing the group of options */
  label: string
  children: React.ReactNode
  className?: string
}

export function CardGroup({ label, children, className }: CardGroupProps) {
  return (
    <div role="radiogroup" aria-label={label} className={className}>
      {children}
    </div>
  )
}

CardGroup.displayName = 'CardGroup'

export default Card
