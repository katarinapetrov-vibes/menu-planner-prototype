'use client'

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from './utils'
import { components, elevation, typography, motion as motionTokens } from '@/lib/tokens'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'
export type TooltipArrowPosition = 'start' | 'center' | 'end'
export type TooltipTheme = 'dark' | 'light'

export interface TooltipProps {
  /** Content shown in the tooltip */
  content: React.ReactNode
  /** Where the tooltip appears relative to the trigger */
  placement?: TooltipPlacement
  /** Where the arrow sits along the tooltip edge (start = left/top, end = right/bottom) */
  arrowPosition?: TooltipArrowPosition
  /** Dark or light tooltip theme */
  theme?: TooltipTheme
  /** Optional delay before showing (ms) */
  delay?: number
  /**
   * When true, use alternate fixed positioning (for triggers inside overflow-hidden cells).
   * Default behavior matches the design-system tooltip (body portal + edge-aware placement).
   */
  portal?: boolean
  /** Trigger element (tooltip wraps this) */
  children: React.ReactNode
  /** Additional class for the trigger wrapper */
  className?: string
  /** When true, suppresses the tooltip entirely (e.g. while a related dropdown is open) */
  disabled?: boolean
  /** Tab index for the trigger span; default 0 ensures keyboard focusability */
  triggerTabIndex?: number
}

type PlacementArrowKey = `${TooltipPlacement}-${TooltipArrowPosition}`

const arrowPositionClasses: Record<PlacementArrowKey, string> = {
  'top-start': 'top-full left-2 -translate-x-0',
  'top-center': 'top-full left-1/2 -translate-x-1/2',
  'top-end': 'top-full right-2 translate-x-0',
  'bottom-start': 'bottom-full left-2 -translate-x-0',
  'bottom-center': 'bottom-full left-1/2 -translate-x-1/2',
  'bottom-end': 'bottom-full right-2 translate-x-0',
  'left-start': 'left-full top-2 -translate-y-0',
  'left-center': 'left-full top-1/2 -translate-y-1/2',
  'left-end': 'left-full bottom-2 translate-y-0',
  'right-start': 'right-full top-2 -translate-y-0',
  'right-center': 'right-full top-1/2 -translate-y-1/2',
  'right-end': 'right-full bottom-2 translate-y-0',
}

type PortalCoords = { left: number; top: number; transform: string }

export function Tooltip({
  content,
  placement = 'top',
  arrowPosition = 'center',
  theme = 'dark',
  delay = 150,
  portal = false,
  children,
  className,
  disabled = false,
  triggerTabIndex = 0,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [tipStyle, setTipStyle] = useState<React.CSSProperties>({})
  const [motionStaticStyle, setMotionStaticStyle] = useState<{ x?: string; y?: string }>({})
  const [portalCoords, setPortalCoords] = useState<PortalCoords | null>(null)
  const [clampAdjust, setClampAdjust] = useState(0)
  const tooltipId = React.useId()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLSpanElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    setMounted(true)
  }, [])

  const GAP = components.tooltip.gap

  const computeStyle = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let tip: React.CSSProperties = {}
    let mot: { x?: string; y?: string } = {}

    if (placement === 'top') {
      tip = { bottom: window.innerHeight - rect.top + GAP }
      if (arrowPosition === 'center') {
        tip.left = cx
        mot = { x: '-50%' }
      } else if (arrowPosition === 'start') {
        tip.left = rect.left
      } else {
        tip.right = window.innerWidth - rect.right
      }
    } else if (placement === 'bottom') {
      tip = { top: rect.bottom + GAP }
      if (arrowPosition === 'center') {
        tip.left = cx
        mot = { x: '-50%' }
      } else if (arrowPosition === 'start') {
        tip.left = rect.left
      } else {
        tip.right = window.innerWidth - rect.right
      }
    } else if (placement === 'left') {
      tip = { right: window.innerWidth - rect.left + GAP }
      if (arrowPosition === 'center') {
        tip.top = cy
        mot = { y: '-50%' }
      } else if (arrowPosition === 'start') {
        tip.top = rect.top
      } else {
        tip.bottom = window.innerHeight - rect.bottom
      }
    } else {
      tip = { left: rect.right + GAP }
      if (arrowPosition === 'center') {
        tip.top = cy
        mot = { y: '-50%' }
      } else if (arrowPosition === 'start') {
        tip.top = rect.top
      } else {
        tip.bottom = window.innerHeight - rect.bottom
      }
    }

    setTipStyle(tip)
    setMotionStaticStyle(mot)
  }, [placement, arrowPosition])

  const updatePortalPosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const margin = 8
    const shift =
      arrowPosition === 'start' ? -12 : arrowPosition === 'end' ? 12 : 0

    let coords: PortalCoords
    switch (placement) {
      case 'top':
        coords = {
          left: rect.left + rect.width / 2 + shift,
          top: rect.top - margin,
          transform: 'translate(-50%, -100%)',
        }
        break
      case 'bottom':
        coords = {
          left: rect.left + rect.width / 2 + shift,
          top: rect.bottom + margin,
          transform: 'translate(-50%, 0)',
        }
        break
      case 'left':
        coords = {
          left: rect.left - margin,
          top: rect.top + rect.height / 2,
          transform: 'translate(-100%, -50%)',
        }
        break
      default:
        coords = {
          left: rect.right + margin,
          top: rect.top + rect.height / 2,
          transform: 'translate(0, -50%)',
        }
    }
    setPortalCoords(coords)
  }, [placement, arrowPosition])

  const show = () => {
    if (disabled) return
    if (!portal) computeStyle()
    timeoutRef.current = setTimeout(() => setVisible(true), delay)
  }

  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setVisible(false)
    setPortalCoords(null)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (disabled) hide()
  }, [disabled])

  useLayoutEffect(() => {
    if (!visible || !portal) {
      if (!visible) { setPortalCoords(null); setClampAdjust(0) }
      return
    }
    updatePortalPosition()
  }, [visible, portal, updatePortalPosition])

  // Clamp tooltip horizontally so it never bleeds off screen edges
  useLayoutEffect(() => {
    if (!visible || !tooltipRef.current) return
    const el = tooltipRef.current
    const rect = el.getBoundingClientRect()
    const PADDING = 8
    if (rect.left < PADDING) {
      setClampAdjust(PADDING - rect.left)
    } else if (rect.right > window.innerWidth - PADDING) {
      setClampAdjust(window.innerWidth - PADDING - rect.right)
    } else {
      setClampAdjust(0)
    }
  }, [visible, tipStyle, portalCoords])

  useEffect(() => {
    if (!visible || !portal) return
    const onReposition = () => updatePortalPosition()
    window.addEventListener('scroll', onReposition, true)
    window.addEventListener('resize', onReposition)
    return () => {
      window.removeEventListener('scroll', onReposition, true)
      window.removeEventListener('resize', onReposition)
    }
  }, [visible, portal, updatePortalPosition])

  const placementKey: PlacementArrowKey = `${placement}-${arrowPosition}`

  const motionOffset = 16 // spacing[400]
  const initialMotion =
    placement === 'top'
      ? { opacity: 0, y: motionOffset }
      : placement === 'bottom'
        ? { opacity: 0, y: -motionOffset }
        : placement === 'left'
          ? { opacity: 0, x: motionOffset }
          : { opacity: 0, x: -motionOffset }
  const animateMotion =
    placement === 'top' || placement === 'bottom'
      ? { opacity: 1, y: 0 }
      : { opacity: 1, x: 0 }
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, ...motionTokens.spring.gentle }

  const tt = components.tooltip.colour[theme]

  const tooltipDefault = (
    <motion.span
      ref={tooltipRef}
      role="tooltip"
      id={tooltipId}
      initial={initialMotion}
      animate={animateMotion}
      transition={transition}
      style={{
        position: 'fixed',
        backgroundColor: tt.bg,
        color: tt.text,
        maxWidth: components.tooltip.maxWidth,
        minWidth: components.tooltip.minWidth,
        paddingTop: components.tooltip.density.comfortable.paddingY,
        paddingBottom: components.tooltip.density.comfortable.paddingY,
        paddingLeft: components.tooltip.density.comfortable.paddingX,
        paddingRight: components.tooltip.density.comfortable.paddingX,
        boxShadow: elevation.level3,
        fontSize: typography.fontSize.sm,
        ...tipStyle,
        ...motionStaticStyle,
        ...(clampAdjust !== 0 ? { marginLeft: clampAdjust } : {}),
      }}
      className="z-[9999] flex items-start rounded-xl font-medium pointer-events-none"
    >
      {content}
      <span
        className={cn(
          'absolute flex items-center justify-center',
          arrowPositionClasses[placementKey],
          placement === 'top' && '-translate-y-1/2',
          placement === 'bottom' && 'translate-y-1/2',
          placement === 'left' && '-translate-x-1/2',
          placement === 'right' && 'translate-x-1/2',
        )}
        aria-hidden
      >
        <svg
          width="12"
          height="6"
          viewBox="0 0 12 6"
          fill="none"
          className={cn(
            placement === 'top' && 'rotate-0',
            placement === 'bottom' && 'rotate-180',
            placement === 'left' && '-rotate-90',
            placement === 'right' && 'rotate-90',
          )}
        >
          <path d="M6 6L0 0h12L6 6z" fill={tt.bg} stroke="none" />
        </svg>
      </span>
    </motion.span>
  )

  const tooltipPortalMode = (
    <motion.span
      ref={tooltipRef}
      role="tooltip"
      id={tooltipId}
      initial={initialMotion}
      animate={animateMotion}
      transition={transition}
      style={{
        position: 'fixed',
        left: portalCoords?.left,
        top: portalCoords?.top,
        transform: portalCoords?.transform,
        zIndex: 10_000,
        backgroundColor: tt.bg,
        color: tt.text,
        maxWidth: components.tooltip.maxWidth,
        paddingTop: components.tooltip.density.comfortable.paddingY,
        paddingBottom: components.tooltip.density.comfortable.paddingY,
        paddingLeft: components.tooltip.density.comfortable.paddingX,
        paddingRight: components.tooltip.density.comfortable.paddingX,
        fontSize: typography.fontSize.sm,
        ...(clampAdjust !== 0 ? { marginLeft: clampAdjust } : {}),
      }}
      className="flex items-start rounded font-medium pointer-events-none shadow-xl"
    >
      {content}
      <span
        className={cn(
          'absolute flex items-center justify-center',
          arrowPositionClasses[placementKey],
          placement === 'top' && '-translate-y-1/2',
          placement === 'bottom' && 'translate-y-1/2',
          placement === 'left' && '-translate-x-1/2',
          placement === 'right' && 'translate-x-1/2',
        )}
        aria-hidden
      >
        <svg
          width="12"
          height="6"
          viewBox="0 0 12 6"
          fill="none"
          className={cn(
            placement === 'top' && 'rotate-0',
            placement === 'bottom' && 'rotate-180',
            placement === 'left' && '-rotate-90',
            placement === 'right' && 'rotate-90',
          )}
        >
          <path d="M6 6L0 0h12L6 6z" fill={tt.bg} stroke="none" />
        </svg>
      </span>
    </motion.span>
  )

  return (
    <span
      ref={triggerRef}
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      aria-describedby={visible ? tooltipId : undefined}
      tabIndex={triggerTabIndex}
    >
      {children}
      {mounted &&
        visible &&
        !disabled &&
        (portal
          ? portalCoords != null &&
            typeof document !== 'undefined' &&
            ReactDOM.createPortal(tooltipPortalMode, document.body)
          : ReactDOM.createPortal(tooltipDefault, document.body))}
    </span>
  )
}

export default Tooltip
