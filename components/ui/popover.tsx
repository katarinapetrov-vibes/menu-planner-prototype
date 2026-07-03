'use client'

import React, { useState, useRef, useId, useEffect, useCallback, useLayoutEffect } from 'react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { semantic, elevation, typography, motion as motionTokens, radius, spacing, borderWidth, sizing, scale } from '@/lib/tokens'
import { Tabs } from './tabs'
import { Button } from './button'
import { LimeAi } from './icons/lime-ai'

/**
 * Enterprise DS v3 — Figma node 47763-4712
 *
 * Popover is a hover-triggered floating card anchored to a trigger element
 * (e.g. a table cell, button, or icon). It surfaces rich contextual information
 * — data summaries, orders, forecasts, mini-charts — in-context without
 * navigating the user away from the page.
 *
 * Usage:
 *   <Popover
 *     trigger={<button>20000</button>}
 *     title="Total recommended: 20000"
 *     headerLabel="W6-Region: NJ"
 *     type="ai"
 *   >
 *     <PopoverSection title="Orders to place this week" icon={<ClipboardIcon />}>
 *       ...
 *     </PopoverSection>
 *   </Popover>
 *
 * Figma variables:
 *   Type:         Success | Warning | Error | Info | AI
 *   Close Button: True | False
 *   Action:       True | False  (rendered inside children as needed)
 *
 * Light canvas: white card (#FFFFFF), neutral 1 px border (#E4E4E4), dark text
 * Dark canvas:  dark card  (#242424), neutral 1 px border (#4B4B4B), light text
 * The semantic type only colours the icon chip in the header — the card itself
 * always uses the neutral border token regardless of type.
 */

const s  = semantic
const el = elevation

export type PopoverType      = 'success' | 'warning' | 'error' | 'info' | 'ai'
export type PopoverTheme     = 'light' | 'dark'
export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface PopoverTab {
  /** Unique identifier for the tab */
  id: string
  /** Tab button label */
  label: string
  /** Content rendered when this tab is active */
  content: React.ReactNode
}

export interface PopoverProps {
  /** Element that the user hovers to reveal the popover */
  trigger: React.ReactNode
  /**
   * Rich content rendered in the card body.
   * Used when `tabs` is not provided.
   */
  children?: React.ReactNode
  /** Bold heading in the header */
  title?: React.ReactNode
  /** Secondary line rendered below the title */
  subtitle?: string
  /**
   * Optional tab sections (up to 3 recommended).
   * When provided, a tab bar replaces the plain children slot.
   */
  tabs?: PopoverTab[]
  /** Id of the tab that is active by default */
  defaultTab?: string
  /**
   * Semantic type — drives the icon's colour and its tinted
   * circle background. Figma variable: Type.
   */
  type?: PopoverType
  /** Figma variable: Close Button True/False */
  showCloseButton?: boolean
  /** Show the leading status icon in the header. Default: true */
  showIcon?: boolean
  /** Show the directional arrow pointer. Default: true */
  showArrow?: boolean
  /**
   * Where the card appears relative to the trigger:
   *   "top"    → above the trigger
   *   "bottom" → below the trigger
   *   "left"   → to the left of the trigger
   *   "right"  → to the right of the trigger
   */
  placement?: PopoverPlacement
  /**
   * Controlled open state. When provided, hover events are ignored
   * and the parent manages visibility.
   */
  open?: boolean
  /** Called when the close button is pressed */
  onClose?: () => void
  /** Light or dark canvas */
  theme?: PopoverTheme
  /** Gap (px) between the trigger's edge and the card */
  offset?: number
  /** Width of the floating card in px. Default: 500 */
  width?: number
  /**
   * Render the card as position:absolute inside the nearest positioned ancestor
   * instead of position:fixed in the viewport. Use this for static documentation
   * canvases where the card should scroll with the page and stay anchored to its
   * container. Disables getBoundingClientRect and all scroll/resize listeners.
   */
  isStatic?: boolean
  /**
   * Plain-text accessible name for the card.
   * Only needed when `title` is a React element (not a string).
   */
  'aria-label'?: string
  /** Applied to the trigger wrapper div */
  className?: string
}

// ─── Icons ─────────────────────────────────────────────────────────────────

function SuccessIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  )
}
function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  )
}
function ErrorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
    </svg>
  )
}
function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  )
}
function AIIcon() {
  return <LimeAi size={16} />
}

const typeIcons: Record<PopoverType, React.ComponentType> = {
  success: SuccessIcon,
  warning: WarningIcon,
  error:   ErrorIcon,
  info:    InfoIcon,
  ai:      AIIcon,
}

// ─── Design Token Sets ──────────────────────────────────────────────────────
//
// Note: cardBorder is always the neutral border token — not a semantic colour.
// The semantic type only affects iconColor and iconBgColor.

type TokenSet = {
  cardBg:      string
  cardBorder:  string
  cardShadow:  string
  titleColor:  string
  labelColor:  string
  bodyColor:   string
  iconColor:   string
  iconBgColor: string
  closeColor:  string
  arrowFill:   string
  arrowBorder: string
}

const tokens: Record<PopoverType, Record<PopoverTheme, TokenSet>> = {
  success: {
    light: {
      cardBg:      s.background.page.light,                        // #FFFFFF
      cardBorder:  s.border.default.light,                         // #E4E4E4
      cardShadow:  el.level2,
      titleColor:  s.foreground.default.primary.light,             // #242424
      labelColor:  s.foreground.neutral.defaultDeep.light,         // #4B4B4B
      bodyColor:   s.foreground.neutral.defaultDeep.light,         // #4B4B4B
      iconColor:   s.foreground.positive.default.light,            // #067A46
      iconBgColor: s.background.positive.defaultSubtle.light,      // #F6FDE9
      closeColor:  s.foreground.neutral.defaultDeep.light,         // #4B4B4B
      arrowFill:   s.background.page.light,                        // #FFFFFF
      arrowBorder: s.border.default.light,                         // #E4E4E4
    },
    dark: {
      cardBg:      s.background.container.dark,                    // #242424
      cardBorder:  s.border.default.dark,                          // #4B4B4B
      cardShadow:  el.level1,
      titleColor:  s.foreground.default.primary.dark,              // #E4E4E4
      labelColor:  s.foreground.neutral.defaultDeep.dark,          // #EEEEEE
      bodyColor:   s.foreground.neutral.defaultDeep.dark,          // #EEEEEE
      iconColor:   s.foreground.positive.default.dark,             // #96DC14
      iconBgColor: s.background.positive.defaultSubtle.dark,       // #035624
      closeColor:  s.foreground.neutral.defaultDeep.dark,
      arrowFill:   s.background.container.dark,
      arrowBorder: s.border.default.dark,
    },
  },
  warning: {
    light: {
      cardBg:      s.background.page.light,
      cardBorder:  s.border.default.light,
      cardShadow:  el.level2,
      titleColor:  s.foreground.default.primary.light,
      labelColor:  s.foreground.neutral.defaultDeep.light,
      bodyColor:   s.foreground.neutral.defaultDeep.light,
      iconColor:   s.foreground.warning.default.light,             // #CE4500
      iconBgColor: s.background.warning.defaultSubtle.light,       // #FFECD3
      closeColor:  s.foreground.neutral.defaultDeep.light,
      arrowFill:   s.background.page.light,
      arrowBorder: s.border.default.light,
    },
    dark: {
      cardBg:      s.background.container.dark,
      cardBorder:  s.border.default.dark,
      cardShadow:  el.level1,
      titleColor:  s.foreground.default.primary.dark,
      labelColor:  s.foreground.neutral.defaultDeep.dark,
      bodyColor:   s.foreground.neutral.defaultDeep.dark,
      iconColor:   s.foreground.warning.default.dark,              // #FF941A
      iconBgColor: s.background.warning.defaultSubtle.dark,        // #7B2900
      closeColor:  s.foreground.neutral.defaultDeep.dark,
      arrowFill:   s.background.container.dark,
      arrowBorder: s.border.default.dark,
    },
  },
  error: {
    light: {
      cardBg:      s.background.page.light,
      cardBorder:  s.border.default.light,
      cardShadow:  el.level2,
      titleColor:  s.foreground.default.primary.light,
      labelColor:  s.foreground.neutral.defaultDeep.light,
      bodyColor:   s.foreground.neutral.defaultDeep.light,
      iconColor:   s.foreground.negative.default.light,            // #B30000
      iconBgColor: s.background.negative.defaultSubtle.light,      // #FFEAE9
      closeColor:  s.foreground.neutral.defaultDeep.light,
      arrowFill:   s.background.page.light,
      arrowBorder: s.border.default.light,
    },
    dark: {
      cardBg:      s.background.container.dark,
      cardBorder:  s.border.default.dark,
      cardShadow:  el.level1,
      titleColor:  s.foreground.default.primary.dark,
      labelColor:  s.foreground.neutral.defaultDeep.dark,
      bodyColor:   s.foreground.neutral.defaultDeep.dark,
      iconColor:   s.foreground.negative.default.dark,             // #FE8680
      iconBgColor: s.background.negative.defaultSubtle.dark,       // #7C0000
      closeColor:  s.foreground.neutral.defaultDeep.dark,
      arrowFill:   s.background.container.dark,
      arrowBorder: s.border.default.dark,
    },
  },
  info: {
    light: {
      cardBg:      s.background.page.light,
      cardBorder:  s.border.default.light,
      cardShadow:  el.level2,
      titleColor:  s.foreground.default.primary.light,
      labelColor:  s.foreground.neutral.defaultDeep.light,
      bodyColor:   s.foreground.neutral.defaultDeep.light,
      iconColor:   s.foreground.information.default.light,         // #002AFF
      iconBgColor: s.background.information.defaultSubtle.light,   // #E9FAFF
      closeColor:  s.foreground.neutral.defaultDeep.light,
      arrowFill:   s.background.page.light,
      arrowBorder: s.border.default.light,
    },
    dark: {
      cardBg:      s.background.container.dark,
      cardBorder:  s.border.default.dark,
      cardShadow:  el.level1,
      titleColor:  s.foreground.default.primary.dark,
      labelColor:  s.foreground.neutral.defaultDeep.dark,
      bodyColor:   s.foreground.neutral.defaultDeep.dark,
      iconColor:   s.foreground.information.default.dark,          // #40BDF0
      iconBgColor: s.background.information.defaultSubtle.dark,    // #00178C
      closeColor:  s.foreground.neutral.defaultDeep.dark,
      arrowFill:   s.background.container.dark,
      arrowBorder: s.border.default.dark,
    },
  },
  ai: {
    // AI uses purple primitives — no dedicated semantic.border.ai token
    light: {
      cardBg:      s.background.page.light,
      cardBorder:  s.border.default.light,
      cardShadow:  el.level2,
      titleColor:  s.foreground.default.primary.light,
      labelColor:  s.foreground.neutral.defaultDeep.light,
      bodyColor:   s.foreground.neutral.defaultDeep.light,
      iconColor:   semantic.foreground.ai.default.light,
      iconBgColor: semantic.background.ai.defaultSubtle.light,     // purple/200 — nearest step to purple/100 (no p/100 semantic alias)
      closeColor:  s.foreground.neutral.defaultDeep.light,
      arrowFill:   s.background.page.light,
      arrowBorder: s.border.default.light,
    },
    dark: {
      cardBg:      s.background.container.dark,
      cardBorder:  s.border.default.dark,
      cardShadow:  el.level1,
      titleColor:  s.foreground.default.primary.dark,
      labelColor:  s.foreground.neutral.defaultDeep.dark,
      bodyColor:   s.foreground.neutral.defaultDeep.dark,
      iconColor:   semantic.foreground.ai.default.dark,
      iconBgColor: semantic.background.ai.defaultSubtle.dark,
      closeColor:  s.foreground.neutral.defaultDeep.dark,
      arrowFill:   s.background.container.dark,
      arrowBorder: s.border.default.dark,
    },
  },
}

// ─── Arrow ──────────────────────────────────────────────────────────────────
// Layered SVG arrow — outer polygon in border colour, inner polygon in card bg.

const ARROW_HALF   = 8   // half the base width of the triangle
const ARROW_HEIGHT = 8   // height of the triangle

interface ArrowProps {
  placement: PopoverPlacement
  fill:      string   // card background — fills the inner triangle
  border:    string   // card border colour — fills the outer triangle
}

function Arrow({ placement, fill, border }: ArrowProps) {
  const H  = ARROW_HALF
  const ht = ARROW_HEIGHT

  type Cfg = { w: number; h: number; outer: string; inner: string; cls: string }

  const map: Record<PopoverPlacement, Cfg> = {
    // Card ABOVE trigger → arrow at bottom of card, tip points DOWN toward trigger
    top: {
      w: H * 2, h: ht,
      outer: `0,0 ${H*2},0 ${H},${ht}`,
      inner: `1,0 ${H*2-1},0 ${H},${ht-1}`,
      cls:   'absolute top-full left-1/2 -translate-x-1/2 -mt-px',
    },
    // Card BELOW trigger → arrow at top of card, tip points UP toward trigger
    bottom: {
      w: H * 2, h: ht,
      outer: `0,${ht} ${H*2},${ht} ${H},0`,
      inner: `1,${ht} ${H*2-1},${ht} ${H},1`,
      cls:   'absolute bottom-full left-1/2 -translate-x-1/2 -mb-px',
    },
    // Card LEFT of trigger → arrow at right of card, tip points RIGHT toward trigger
    left: {
      w: ht, h: H * 2,
      outer: `0,0 0,${H*2} ${ht},${H}`,
      inner: `0,1 0,${H*2-1} ${ht-1},${H}`,
      cls:   'absolute top-1/2 -translate-y-1/2 left-full -ml-px',
    },
    // Card RIGHT of trigger → arrow at left of card, tip points LEFT toward trigger
    right: {
      w: ht, h: H * 2,
      outer: `${ht},0 ${ht},${H*2} 0,${H}`,
      inner: `${ht},1 ${ht},${H*2-1} 1,${H}`,
      cls:   'absolute top-1/2 -translate-y-1/2 right-full -mr-px',
    },
  }

  const c = map[placement]
  return (
    <span className={c.cls} style={{ display: 'block', width: c.w, height: c.h }}>
      <svg width={c.w} height={c.h} viewBox={`0 0 ${c.w} ${c.h}`} fill="none" aria-hidden>
        <polygon points={c.outer} fill={border} />
        <polygon points={c.inner} fill={fill} />
      </svg>
    </span>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────

export function Popover({
  trigger,
  children,
  title,
  subtitle,
  tabs,
  defaultTab,
  type            = 'ai',
  showCloseButton = false,
  showIcon        = true,
  showArrow       = true,
  placement       = 'top',
  open,
  onClose,
  theme           = 'light',
  offset          = 8,
  width           = 500,
  isStatic        = false,
  'aria-label':     ariaLabel,
  className,
}: PopoverProps) {
  const uid          = useId()
  const triggerId    = `${uid}-trigger`
  const cardId       = `${uid}-card`

  const [hoverOpen,          setHoverOpen]          = useState(false)
  const [cardCoords,         setCardCoords]          = useState<React.CSSProperties>({})
  const [resolvedPlacement,  setResolvedPlacement]   = useState<PopoverPlacement>(placement)
  const showTimer      = useRef<ReturnType<typeof setTimeout>>(undefined)
  const hideTimer      = useRef<ReturnType<typeof setTimeout>>(undefined)
  const triggerRef     = useRef<HTMLDivElement | null>(null)
  const cardRef        = useRef<HTMLDivElement | null>(null)
  const returnFocusTo  = useRef<HTMLElement | null>(null)

  const isControlled  = open !== undefined
  const isOpen        = isControlled ? open : hoverOpen
  // Interactive = has a close button or tabs — drives role="dialog" vs role="tooltip"
  const isInteractive = showCloseButton || (tabs && tabs.length > 0)

  const handleMouseEnter = () => {
    if (isControlled) return
    clearTimeout(hideTimer.current)
    showTimer.current = setTimeout(() => setHoverOpen(true), 150)
  }

  const handleMouseLeave = () => {
    if (isControlled) return
    clearTimeout(showTimer.current)
    hideTimer.current = setTimeout(() => setHoverOpen(false), 120)
  }

  const handleClose = useCallback(() => {
    onClose?.()
    if (!isControlled) setHoverOpen(false)
  }, [isControlled, onClose])

  // Escape dismisses interactive popovers
  useEffect(() => {
    if (!isOpen || !isInteractive) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, isInteractive, handleClose])

  // Move focus into interactive popover on open; restore on close (A4)
  useEffect(() => {
    if (!isOpen || !isInteractive) return
    returnFocusTo.current = document.activeElement as HTMLElement
    const card = cardRef.current
    if (!card) return
    const focusable = card.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    focusable[0]?.focus()
    return () => { returnFocusTo.current?.focus() }
  }, [isOpen, isInteractive])

  const tk   = tokens[type][theme]
  const Icon = typeIcons[type]

  const computeCoords = useCallback(() => {
    const triggerEl = triggerRef.current
    const cardEl    = cardRef.current
    if (!triggerEl) return

    const rect   = triggerEl.getBoundingClientRect()
    const vw     = window.innerWidth
    const vh     = window.innerHeight
    const GAP    = offset
    const W      = width
    // Estimate card height from the rendered card, or fall back to a safe estimate
    const cardH  = cardEl ? cardEl.offsetHeight : 300

    const cx = rect.left + rect.width  / 2
    const cy = rect.top  + rect.height / 2

    // ── Flip logic ──────────────────────────────────────────────────────────
    // Prefer the requested placement, but flip to the opposite side if the
    // card would overflow the viewport on that edge.
    let resolved = placement
    if (placement === 'top'    && rect.top  - cardH - GAP < 0         && rect.bottom + cardH + GAP <= vh) resolved = 'bottom'
    if (placement === 'bottom' && rect.bottom + cardH + GAP > vh       && rect.top   - cardH - GAP >= 0)  resolved = 'top'
    if (placement === 'left'   && rect.left  - W    - GAP < 0         && rect.right  + W    + GAP <= vw)  resolved = 'right'
    if (placement === 'right'  && rect.right + W    + GAP > vw        && rect.left   - W    - GAP >= 0)   resolved = 'left'

    // ── Base position (absolute px, no CSS transform needed) ────────────────
    // Compute the card's top-left corner directly so Framer Motion can own
    // the transform property for its enter/exit scale animation.
    const EDGE = 8
    let cardLeft = 0
    let cardTop  = 0

    switch (resolved) {
      case 'top':
        cardLeft = cx - W / 2
        cardTop  = rect.top - GAP - cardH
        break
      case 'bottom':
        cardLeft = cx - W / 2
        cardTop  = rect.bottom + GAP
        break
      case 'left':
        cardLeft = rect.left - GAP - W
        cardTop  = cy - cardH / 2
        break
      case 'right':
        cardLeft = rect.right + GAP
        cardTop  = cy - cardH / 2
        break
    }

    // ── Shift / clamp (collision avoidance on the cross-axis) ───────────────
    if (resolved === 'top' || resolved === 'bottom') {
      cardLeft = Math.max(EDGE, Math.min(cardLeft, vw - W - EDGE))
    } else {
      cardTop  = Math.max(EDGE, Math.min(cardTop, vh - cardH - EDGE))
    }

    setCardCoords({
      position: 'fixed',
      left:     cardLeft,
      top:      cardTop,
      zIndex:   30,
      width:    W,
      maxWidth: W,
    })

    // Store the resolved placement so the arrow and animation direction update
    setResolvedPlacement(resolved)
  }, [placement, offset, width])

  useLayoutEffect(() => {
    if (!isOpen || isStatic) return
    // rAF defers measurement until after the browser has finished layout,
    // preventing stale getBoundingClientRect values on first paint.
    const raf = requestAnimationFrame(() => computeCoords())
    return () => cancelAnimationFrame(raf)
  }, [isOpen, isStatic, computeCoords])

  useEffect(() => {
    if (!isOpen || isStatic) return
    const reposition = () => computeCoords()
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [isOpen, isStatic, computeCoords])

  const hasTabs = tabs && tabs.length > 0
  const hasBody = hasTabs || !!children

  // Accessible name: explicit aria-label > string title > silent fallback (A3)
  const cardLabel = ariaLabel ?? (typeof title === 'string' ? title : 'Popover')

  // Build panels map for Tabs component
  const tabItems    = hasTabs ? tabs!.map(({ id, label }) => ({ id, label })) : []
  const tabPanels   = hasTabs
    ? Object.fromEntries(tabs!.map(({ id, content }) => [id, content]))
    : {}
  const defaultTabId = defaultTab ?? (hasTabs ? tabs![0].id : undefined)

  return (
    <div
      className={clsx('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger — linked to card for tooltip mode */}
      <div
        ref={triggerRef}
        id={triggerId}
        aria-describedby={!isInteractive && isOpen ? cardId : undefined}
      >
        {trigger}
      </div>

      <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={cardRef}
          id={cardId}
          role={isInteractive ? 'dialog' : 'tooltip'}
          aria-modal={isInteractive ? true : undefined}
          aria-label={cardLabel}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          initial={{
            opacity: 0,
            scale: 0.88,
            y: resolvedPlacement === 'top' ? 8 : resolvedPlacement === 'bottom' ? -8 : 0,
            x: resolvedPlacement === 'left' ? 8 : resolvedPlacement === 'right' ? -8 : 0,
          }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{
            opacity: 0,
            scale: 0.92,
            y: resolvedPlacement === 'top' ? 6 : resolvedPlacement === 'bottom' ? -6 : 0,
            x: resolvedPlacement === 'left' ? 6 : resolvedPlacement === 'right' ? -6 : 0,
          }}
          transition={{ type: 'spring', ...motionTokens.spring.snappy }}
          style={{
            // Static mode: position:absolute inside the nearest positioned ancestor.
            // The trigger wrapper is already position:relative + inline-block, so the
            // card is anchored to the trigger element and scrolls with the page.
            ...(isStatic ? {
              position: 'absolute',
              zIndex:   'auto',
              width,
              maxWidth: width,
              ...(resolvedPlacement === 'top'    && { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: offset }),
              ...(resolvedPlacement === 'bottom' && { top:    '100%', left: '50%', transform: 'translateX(-50%)', marginTop:    offset }),
              ...(resolvedPlacement === 'left'   && { right:  '100%', top:  '50%', transform: 'translateY(-50%)', marginRight:  offset }),
              ...(resolvedPlacement === 'right'  && { left:   '100%', top:  '50%', transform: 'translateY(-50%)', marginLeft:   offset }),
            } : cardCoords),
            transformOrigin:
              resolvedPlacement === 'top'    ? 'bottom center' :
              resolvedPlacement === 'bottom' ? 'top center' :
              resolvedPlacement === 'left'   ? 'right center' :
                                               'left center',
            display:         'flex',
            flexDirection:   'column',
            gap:             spacing[0],
            padding:         spacing[400],
            borderRadius:    radius.xs,
            backgroundColor: tk.cardBg,
            border:          `${borderWidth.thin} solid ${tk.cardBorder}`,
            boxShadow:       tk.cardShadow,
          }}
        >
          {/* Directional arrow — uses resolvedPlacement so it flips with the card */}
          {showArrow && (
            <Arrow placement={resolvedPlacement} fill={tk.arrowFill} border={tk.arrowBorder} />
          )}

          {/* ── Header row: icon + title/subtitle + close ── */}
          {(showIcon || title || subtitle || showCloseButton) && (
            <div className="flex items-start" style={{ gap: spacing[200] }}>
              {showIcon && (
                <span
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    width:           sizing.iconButton,
                    height:          sizing.iconButton,
                    borderRadius:    radius.round,
                    backgroundColor: tk.iconBgColor,
                    color:           tk.iconColor,
                  }}
                  aria-hidden
                >
                  <Icon />
                </span>
              )}
              <div className="flex-1 min-w-0">
                {title && (
                  <div
                    className="font-semibold leading-snug"
                    style={{ color: tk.titleColor, fontSize: typography.fontSize.md }}
                  >
                    {title}
                  </div>
                )}
                {subtitle && (
                  <div
                    className="leading-snug"
                    style={{ color: tk.labelColor, fontSize: typography.fontSize.sm, marginTop: spacing[50] }}
                  >
                    {subtitle}
                  </div>
                )}
              </div>
              {showCloseButton && (
                <Button
                  variant="text"
                  color="neutral"
                  size="sm"
                  theme={theme}
                  iconOnly
                  showLeadingIcon
                  leadingIcon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  }
                  aria-label="Close popover"
                  onClick={handleClose}
                  className="shrink-0"
                />
              )}
            </div>
          )}

          {/* ── Divider ── */}
          {(title || subtitle || showIcon || showCloseButton) && hasBody && (
            <div
              style={{
                height:          scale[25],
                backgroundColor: tk.cardBorder,
                margin:          `${spacing[300]} -${spacing[400]} 0`,
              }}
            />
          )}

          {/* ── Body ── */}
          {hasTabs && (
            <div style={{ paddingTop: spacing[300] }}>
              <Tabs
                tabs={tabItems}
                defaultValue={defaultTabId}
                panels={tabPanels}
                theme={theme}
                size="sm"
              />
            </div>
          )}

          {!hasTabs && children && (
            <div style={{ paddingTop: spacing[300] }}>
              {children}
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}
