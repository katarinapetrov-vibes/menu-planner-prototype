'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { clsx } from 'clsx'
import { semantic, radius, elevation, spacing, typography } from '@/lib/tokens'

/**
 * Enterprise DS v3 — Side Sheet
 * Figma node: 5394-101750
 *
 * Surfaces that contain supplementary content anchored to the left or right
 * edge of the screen. A fixed-width panel that typically spans the screen height.
 * Their dimensions depend on how the app's layout is subdivided into UI regions.
 *
 * Anatomy:
 *   1. Sheet   — the panel container (background, border, shadow, border-radius)
 *   2. Content — swappable body area with 24 px padding
 *   3. Scrim   — optional backdrop overlay rendered behind the sheet
 *
 * Figma variables:
 *   Close Button — True | False
 *   Action       — True | False
 *   Theme        — light | dark
 *
 * Token mapping (Figma → DS v3):
 *   border-radius    var(--radius-lg)      20 px
 *   header padding   var(--spacing-600)    24 px
 *   content padding  var(--spacing-600)    24 px
 *   footer padding   var(--spacing-600)    24 px
 *   gap (header)     var(--spacing-300)    12 px
 *   shadow           elevation/level3
 *   min-width        362 px
 *   max-width        664 px
 */

const s  = semantic
const r  = radius
const el = elevation
const sp = spacing
const t  = typography

// ─── Types ────────────────────────────────────────────────────────────────────

export type SideSheetTheme = 'light' | 'dark'

export interface SideSheetAction {
  label: string
  onClick: () => void
}

export interface SideSheetProps {
  /** Whether the panel is visible */
  open?: boolean
  /** Header title text */
  title?: string
  /** Optional subtitle rendered below the title — accepts a string or any ReactNode */
  subtitle?: React.ReactNode
  /** Figma variable: Close Button — show / hide the × button in the header */
  showCloseButton?: boolean
  /** Figma variable: Action — show / hide the footer action row */
  showActions?: boolean
  /** Primary (filled positive) footer action */
  primaryAction?: SideSheetAction
  /** Secondary (outline positive) footer action */
  secondaryAction?: SideSheetAction
  /** Called when the close button is pressed */
  onClose?: () => void
  /** Canvas theme — light or dark */
  theme?: SideSheetTheme
  /** Enable drag-to-resize via a handle on the left edge */
  resizable?: boolean
  /** Initial width in px when resizable (clamped 362–664) */
  defaultWidth?: number
  /** Called with the new width whenever the user resizes */
  onWidthChange?: (width: number) => void
  /** Additional className applied to the sheet element */
  className?: string
  /** Additional inline styles applied to the sheet element */
  style?: React.CSSProperties
  /** Override styles applied to the scrollable content area (e.g. remove default padding) */
  contentStyle?: React.CSSProperties
  /** Show the divider line below the header — default true */
  showHeaderDivider?: boolean
  /** Body content — renders a placeholder when omitted */
  children?: React.ReactNode
}

// ─── Token map ────────────────────────────────────────────────────────────────

type TokenSet = {
  sheetBg:           string
  border:            string
  shadow:            string
  titleColor:        string
  subtitleColor:     string
  closeColor:        string
  closeHoverBg:      string
  divider:           string
  primaryBg:         string
  primaryText:       string
  secondaryBorder:   string
  secondaryText:     string
  placeholderBg:     string
  placeholderText:   string
  placeholderBorder: string
}

const tokenMap: Record<SideSheetTheme, TokenSet> = {
  light: {
    sheetBg:           '#FFFFFF',
    border:            s.border.default.light,                     // #E4E4E4
    shadow:            el.level3,
    titleColor:        s.foreground.neutral.default.light,         // #242424
    subtitleColor:     '#676767',                                   // --Foreground-Dark-Neutral-Neutral-light (grey/600)
    closeColor:        s.foreground.neutral.defaultDeep.light,     // #4B4B4B
    closeHoverBg:      'rgba(0,0,0,0.06)',
    divider:           s.border.default.light,                     // #E4E4E4
    primaryBg:         s.background.positive.defaultStrong.light,  // #067A46
    primaryText:       s.foreground.positive.onColour.light,       // #FFFFFF
    secondaryBorder:   s.border.positive.light,                    // #067A46
    secondaryText:     s.foreground.positive.default.light,        // #067A46
    placeholderBg:     s.background.positive.defaultSubtle.light,  // #F6FDE9
    placeholderText:   s.foreground.positive.default.light,        // #067A46
    placeholderBorder: s.border.positive.light,                    // #067A46
  },
  dark: {
    sheetBg:           s.background.container.dark,                // #242424
    border:            s.border.default.dark,                      // #4B4B4B
    shadow:            el.level3,
    titleColor:        s.foreground.neutral.default.dark,          // #E4E4E4
    subtitleColor:     '#BBBBBB',                                   // grey/600 dark-mode equivalent
    closeColor:        '#BBBBBB',
    closeHoverBg:      'rgba(255,255,255,0.06)',
    divider:           s.border.default.dark,                      // #4B4B4B
    primaryBg:         s.background.positive.defaultStrong.dark,   // #96DC14
    primaryText:       s.foreground.positive.onColour.dark,        // #035624
    secondaryBorder:   s.border.positive.dark,                     // #96DC14
    secondaryText:     s.foreground.positive.default.dark,         // #96DC14
    placeholderBg:     s.background.positive.defaultSubtle.dark,   // #035624
    placeholderText:   s.foreground.positive.default.dark,         // #96DC14
    placeholderBorder: s.border.positive.dark,                     // #96DC14
  },
}

// ─── Close icon ───────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

const MIN_WIDTH = 362
const MAX_WIDTH = 664

export function SideSheet({
  open = true,
  title = 'Title',
  subtitle,
  showCloseButton = true,
  showActions = true,
  primaryAction,
  secondaryAction,
  onClose,
  theme = 'light',
  resizable = false,
  defaultWidth,
  onWidthChange,
  className,
  style,
  contentStyle,
  showHeaderDivider = true,
  children,
}: SideSheetProps) {
  const [width, setWidth] = useState<number>(() => {
    if (defaultWidth !== undefined) return Math.min(Math.max(defaultWidth, MIN_WIDTH), MAX_WIDTH)
    return MIN_WIDTH
  })
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current) return
    // Dragging left → larger delta → wider sheet
    const delta = dragRef.current.startX - e.clientX
    const next = Math.min(Math.max(dragRef.current.startWidth + delta, MIN_WIDTH), MAX_WIDTH)
    setWidth(next)
    onWidthChange?.(next)
  }, [onWidthChange])

  const handleMouseUp = useCallback(() => {
    dragRef.current = null
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [handleMouseMove])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = { startX: e.clientX, startWidth: width }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [width, handleMouseMove, handleMouseUp])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!dragRef.current) return
    const touch = e.touches[0]
    const delta = dragRef.current.startX - touch.clientX
    const next = Math.min(Math.max(dragRef.current.startWidth + delta, MIN_WIDTH), MAX_WIDTH)
    setWidth(next)
    onWidthChange?.(next)
  }, [onWidthChange])

  const handleTouchEnd = useCallback(() => {
    dragRef.current = null
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }, [handleTouchMove])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    dragRef.current = { startX: touch.clientX, startWidth: width }
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd)
  }, [width, handleTouchMove, handleTouchEnd])

  // Clean up listeners if component unmounts mid-drag
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  if (!open) return null

  const tk = tokenMap[theme]
  const pAction: SideSheetAction = primaryAction   ?? { label: 'Label', onClick: () => {} }
  const sAction: SideSheetAction = secondaryAction ?? { label: 'Label', onClick: () => {} }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="side-sheet-title"
      className={clsx('flex flex-col', className)}
      style={{
        position:        'relative',
        backgroundColor: tk.sheetBg,
        borderWidth:     '1px',
        borderStyle:     'solid',
        borderColor:     tk.border,
        borderRadius:    r.lg,       // 20px — var(--radius-lg)
        boxShadow:       tk.shadow,  // elevation/level3
        minWidth:        `${MIN_WIDTH}px`,
        maxWidth:        `${MAX_WIDTH}px`,
        width:           resizable ? `${width}px` : '100%',
        height:          '100%',     // fills parent so flex children can scroll
        ...style,
      }}
    >
      {/* ── Drag handle ──────────────────────────────────────────────────────────── */}
      {resizable && (
        <div
          aria-hidden="true"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{
            position:    'absolute',
            top:         0,
            left:        0,
            bottom:      0,
            width:       '4px',
            cursor:      'col-resize',
            zIndex:      10,
            borderLeft:  `1px solid ${tk.border}`,
            marginLeft:  '-2px',
          }}
        />
      )}
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        className="shrink-0"
        style={{
          padding:      sp[400],                      // 16px — var(--spacing-400)
          borderBottom: showHeaderDivider ? `1px solid ${tk.divider}` : 'none',
        }}
      >
        {/* Top row: title + close button */}
        <div className="flex items-start" style={{ gap: sp[300] }}>
          <h2
            id="side-sheet-title"
            className="flex-1"
            style={{
              color:      tk.titleColor,
              fontFamily: t.fontFamily.headline,   // Agrandir Digital — Headline/H6
              fontSize:   typography.fontSize.lg,
              fontWeight: 500,
              lineHeight: '1.2em',
              margin:     0,
            }}
          >
            {title}
          </h2>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close side sheet"
              className="shrink-0 rounded-lg p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#067A46]/40"
              style={{ color: tk.closeColor }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = tk.closeHoverBg }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              <CloseIcon />
            </button>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              color:      tk.subtitleColor,
              fontSize:   typography.fontSize.sm,
              fontWeight: 400,
              lineHeight: '1.667em',
              margin:     `${sp[100]} 0 0`,
            }}
          >
            {subtitle}
          </div>
        )}

      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: sp[400], ...contentStyle }}  // 16px — var(--spacing-400)
      >
        {children ?? (
          <div
            className="flex items-center justify-center rounded-lg font-medium border border-dashed"
            style={{
              minHeight:       '120px',
              backgroundColor: tk.placeholderBg,
              color:           tk.placeholderText,
              borderColor:     tk.placeholderBorder,
              fontSize:        typography.fontSize.md,
            }}
          >
            Swap this content
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      {showActions && (
        <div
          className="shrink-0 flex items-center justify-end"
          style={{
            padding:   sp[400],                      // 16px — var(--spacing-400)
            borderTop: `1px solid ${tk.divider}`,
            gap:       sp[300],                      // 12px — var(--spacing-300)
          }}
        >
          {/* Secondary — outline */}
          <button
            type="button"
            onClick={sAction.onClick}
            className="px-4 py-2 font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#067A46]/40"
            style={{
              borderColor:  tk.secondaryBorder,
              color:        tk.secondaryText,
              borderRadius: r.sm,   // 8px — var(--radius-sm)
              fontSize:     typography.fontSize.md,
            }}
          >
            {sAction.label}
          </button>

          {/* Primary — filled */}
          <button
            type="button"
            onClick={pAction.onClick}
            className="px-4 py-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#067A46]/40"
            style={{
              backgroundColor: tk.primaryBg,
              color:           tk.primaryText,
              borderRadius:    r.sm,  // 8px — var(--radius-sm)
              fontSize:        typography.fontSize.md,
            }}
          >
            {pAction.label}
          </button>
        </div>
      )}
    </div>
  )
}
