'use client'

import React, { useState, useRef, useCallback, useLayoutEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from './utils'
import { Button } from './button'
import { opacity as opacityTokens, typography, motion as motionTokens } from '@/lib/tokens'

// ─── Types ────────────────────────────────────────────────────────────────────
// Enterprise DS v3 — Figma node 46789-4675
// Variables: Size (sm|md|lg), Theme (light|dark), Disabled (true|false)
// Items: value, label, icon?, disabled?

export type ButtonGroupSize  = 'sm' | 'md' | 'lg'
export type ButtonGroupTheme = 'light' | 'dark'

export interface ButtonGroupItem {
  /** Unique value identifying this option */
  value: string
  /** Visible label text — omit or pass undefined for icon-only items */
  label?: string
  /** Optional leading icon (16 × 16 recommended) */
  icon?: React.ReactNode
  /** Optional trailing icon (16 × 16 recommended) */
  trailingIcon?: React.ReactNode
  /** Disable this specific item only */
  disabled?: boolean
}

export interface ButtonGroupProps {
  /** Option items to render inside the button group */
  items: ButtonGroupItem[]
  /** Controlled selected value */
  value?: string
  /** Uncontrolled initial selected value */
  defaultValue?: string
  /** Called when the selected value changes */
  onChange?: (value: string) => void
  /** Size variant — sm · md · lg */
  size?: ButtonGroupSize
  /** Canvas theme the button group is placed on */
  theme?: ButtonGroupTheme
  /** Disable all items */
  disabled?: boolean
  /** Stretch the button group to fill its container */
  fullWidth?: boolean
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

// ─── Size Tokens ──────────────────────────────────────────────────────────────

const sizeMap: Record<ButtonGroupSize, {
  track:        string
  item:         string
  text:         string
  textFontSize: string
  gap:          string
  iconSz:  string
  padding: string
}> = {
  sm: {
    track:   'h-7',
    item:    'px-2.5 py-0.5',
    text:         'leading-4',
    textFontSize: typography.fontSize.sm,
    gap:          'gap-1',
    iconSz:  'w-3.5 h-3.5',
    padding: 'p-1',
  },
  md: {
    track:   'h-8',
    item:    'px-3 py-0.5',
    text:         'leading-5',
    textFontSize: typography.fontSize.sm,
    gap:     'gap-1.5',
    iconSz:  'w-4 h-4',
    padding: 'p-1',
  },
  lg: {
    track:   'h-10',
    item:    'px-4 py-1.5',
    text:         'leading-5',
    textFontSize: typography.fontSize.sm,
    gap:     'gap-1.5',
    iconSz:  'w-4 h-4',
    padding: 'p-1',
  },
}

// ─── Colour Tokens ────────────────────────────────────────────────────────────
// Item colours are delegated to <Button> which already has the correct
// Figma Enterprise DS v3 tokens (light #067A46, dark #96DC14).
// Only the pill track needs its own inline styles.

const trackColors: Record<ButtonGroupTheme, { bg: string; border: string; pill: string; pillShadow: string }> = {
  light: { bg: 'rgba(255,255,255,0.72)', border: 'rgba(0,0,0,0.10)', pill: '#067A46', pillShadow: '0px 2px 4px rgba(36,36,36,0.24)' },
  dark:  { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.10)', pill: '#96DC14', pillShadow: '0px 2px 6px rgba(0,0,0,0.48)' },
}

// Map ButtonGroup size → Button size (closest match)
const buttonSizeMap: Record<ButtonGroupSize, 'sm' | 'md'> = {
  sm: 'sm',
  md: 'sm',
  lg: 'md',
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      items,
      value,
      defaultValue,
      onChange,
      size       = 'md',
      theme      = 'light',
      disabled   = false,
      fullWidth  = false,
      className,
      'aria-label':      ariaLabel,
      'aria-labelledby': ariaLabelledBy,
    },
    ref,
  ) => {
    const isControlled = value !== undefined
    const [internalValue, setInternalValue] = useState<string>(
      defaultValue ?? items[0]?.value ?? ''
    )
    const selected = isControlled ? value : internalValue

    const sz    = sizeMap[size]
    const track = trackColors[theme]
    const prefersReducedMotion = useReducedMotion()

    const trackRef       = useRef<HTMLDivElement>(null)
    const itemRefs       = useRef<(HTMLButtonElement | null)[]>([])
    const [pillLayout, setPillLayout] = useState<{ left: number; top: number; width: number; height: number } | null>(null)

    const measurePill = useCallback(() => {
      const track = trackRef.current
      if (!track) return
      const selIndex = items.findIndex((it) => it.value === selected)
      if (selIndex < 0) return
      const btn = itemRefs.current[selIndex]
      if (!btn) return
      const trackRect = track.getBoundingClientRect()
      const btnRect   = btn.getBoundingClientRect()
      // Account for track border — pill is positioned relative to padding edge
      const style = getComputedStyle(track)
      const borderLeft = parseFloat(style.borderLeftWidth) || 0
      const borderTop  = parseFloat(style.borderTopWidth) || 0
      setPillLayout({
        left:   btnRect.left - trackRect.left - borderLeft,
        top:    btnRect.top - trackRect.top - borderTop,
        width:  btnRect.width,
        height: btnRect.height,
      })
    }, [selected, items])

    useLayoutEffect(() => {
      let cancelled = false
      const schedule = () => {
        requestAnimationFrame(() => {
          if (!cancelled) measurePill()
        })
      }
      schedule()
      const track = trackRef.current
      if (!track) return () => { cancelled = true }
      const ro = new ResizeObserver(schedule)
      ro.observe(track)
      const selIndex = items.findIndex((it) => it.value === selected)
      const selectedBtn = selIndex >= 0 ? itemRefs.current[selIndex] : null
      if (selectedBtn) ro.observe(selectedBtn)
      return () => {
        cancelled = true
        ro.disconnect()
      }
    }, [measurePill, size, fullWidth, selected, items])

    const handleSelect = useCallback((itemValue: string, itemDisabled?: boolean) => {
      if (disabled || itemDisabled) return
      if (!isControlled) setInternalValue(itemValue)
      onChange?.(itemValue)
    }, [disabled, isControlled, onChange])

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
        const enabledIndices = items
          .map((item, i) => (disabled || item.disabled ? null : i))
          .filter((i): i is number => i !== null)

        if (enabledIndices.length === 0) return

        const pos     = enabledIndices.indexOf(index)
        let nextIndex = -1

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault()
          nextIndex = enabledIndices[(pos + 1) % enabledIndices.length]
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault()
          nextIndex = enabledIndices[(pos - 1 + enabledIndices.length) % enabledIndices.length]
        } else if (e.key === 'Home') {
          e.preventDefault()
          nextIndex = enabledIndices[0]
        } else if (e.key === 'End') {
          e.preventDefault()
          nextIndex = enabledIndices[enabledIndices.length - 1]
        } else if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          handleSelect(items[index].value, items[index].disabled)
          return
        }

        if (nextIndex !== -1) {
          itemRefs.current[nextIndex]?.focus()
          handleSelect(items[nextIndex].value, items[nextIndex].disabled)
        }
      },
      [items, disabled, handleSelect],
    )

    const setTrackRef = useCallback(
      (el: HTMLDivElement | null) => {
        (trackRef as React.MutableRefObject<HTMLDivElement | null>).current = el
        if (typeof ref === 'function') ref(el)
        else if (ref && 'current' in ref) { (ref as { current: HTMLDivElement | null }).current = el }
      },
      [ref],
    )

    return (
      <div
        ref={setTrackRef}
        role="radiogroup"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-disabled={disabled || undefined}
        style={{
          backgroundColor: track.bg,
          borderColor:     track.border,
          borderStyle:     'solid',
          borderWidth:     '1px',
          opacity:         disabled ? opacityTokens.half : undefined,
        }}
        className={cn(
          'relative inline-flex items-center rounded-full gap-1',
          sz.track,
          sz.padding,
          fullWidth ? 'w-full' : 'w-max',
          className,
        )}
      >
        {pillLayout && (
          <motion.div
            aria-hidden
            className="absolute rounded-full pointer-events-none"
            style={{
              top: pillLayout.top,
              height: pillLayout.height,
              backgroundColor: track.pill,
              boxShadow: track.pillShadow,
            }}
            initial={{ left: pillLayout.left, width: pillLayout.width }}
            animate={{
              left: pillLayout.left,
              width: pillLayout.width,
            }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: 'tween', duration: parseFloat(motionTokens.duration.base) / 1000, ease: motionTokens.easing.framer.easeInOut }
            }
          />
        )}
        {items.map((item, index) => {
          const isSelected     = item.value === selected
          const isItemDisabled = disabled || !!item.disabled
          const isTabFocusable = isSelected
            ? true
            : !isSelected && items.every((it) => it.value !== selected)
              ? index === 0
              : false

          return (
            <Button
              key={item.value}
              ref={(el) => { itemRefs.current[index] = el }}
              variant={isSelected ? 'fill' : 'text'}
              color={isSelected ? 'positive' : 'neutral'}
              size={buttonSizeMap[size]}
              theme={theme}
              disabled={isItemDisabled}
              role="radio"
              aria-checked={isSelected}
              aria-disabled={isItemDisabled || undefined}
              tabIndex={isTabFocusable ? 0 : -1}
              onClick={() => handleSelect(item.value, item.disabled)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              showLeadingIcon={!!item.icon}
              leadingIcon={item.icon as React.ReactNode}
              showTrailingIcon={!!item.trailingIcon}
              trailingIcon={item.trailingIcon as React.ReactNode}
              className={cn(
                'relative z-10 rounded-full h-auto whitespace-nowrap',
                isSelected && '!bg-transparent',
                sz.item,
                sz.text,
                sz.gap,
              )}
              style={{ fontSize: sz.textFontSize }}
            >
              {item.label}
            </Button>
          )
        })}
      </div>
    )
  }
)

ButtonGroup.displayName = 'ButtonGroup'

export default ButtonGroup
