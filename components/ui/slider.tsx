'use client'

import React, { useState, useId } from 'react'
import { components, typography, motion as motionTokens } from '@/lib/tokens'
import { cn } from './utils'

/**
 * Enterprise DS v3 — Slider
 * Figma node 2519-36338 (base) · 36988-115564 (label + percent variant)
 *
 * A horizontal range-input control for selecting a numeric value within
 * a min–max range. Supports an optional label and percentage display in
 * a header row above the track.
 *
 * Layout — basic (Figma tokens):
 *   display:          flex
 *   width:            140 px
 *   height:           20 px
 *   padding:          4px 0 4px 4px
 *   justify-content:  flex-end
 *   align-items:      center
 *
 * Layout — with label / percent:
 *   display:          inline-flex
 *   flex-direction:   column
 *   align-items:      flex-start
 *   gap:              4 px
 *
 * Figma variables:
 *   Size          — sm | md | lg
 *   Theme         — light | dark
 *   Show Label    — True | False
 *   Show Percent  — True | False
 *   Disabled      — True | False
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type SliderSize  = 'sm' | 'md' | 'lg'
export type SliderTheme = 'light' | 'dark'

export interface SliderProps {
  /** Controlled value. Must be between `min` and `max`. */
  value?: number
  /** Initial value when uncontrolled (default 40). */
  defaultValue?: number
  /** Called on every change with the new numeric value. */
  onChange?: (value: number) => void
  /** Minimum allowed value (default 0). */
  min?: number
  /** Maximum allowed value (default 100). */
  max?: number
  /** Step increment (default 1). */
  step?: number
  /** Visual + hit-target size — sm (12 px thumb), md (16 px), lg (20 px). */
  size?: SliderSize
  /** Canvas theme — drives track, thumb, and text colours. */
  theme?: SliderTheme
  /** Optional text label rendered above the track (activates column layout). */
  label?: string
  /** Show the current value as a percentage above the track (right-aligned). */
  showPercent?: boolean
  /** When true, renders tick marks and value labels below the track at every step interval. */
  marks?: boolean
  /** Disabled state — prevents interaction and applies muted colour palette. */
  disabled?: boolean
  /** When true, thumb cannot be moved. Visual appearance is unchanged (unlike disabled). */
  readOnly?: boolean
  id?: string
  name?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  className?: string
}

// ─── Size tokens ──────────────────────────────────────────────────────────────

const thumbSizeMap:  Record<SliderSize, number> = { sm: 12, md: 16, lg: 20 }
const trackHeightMap: Record<SliderSize, number> = { sm: 2,  md: 4,  lg: 6  }
// Half-thumb offset keeps track visually centred under the thumb at extremes
const thumbHalfMap:  Record<SliderSize, number> = { sm: 6,  md: 8,  lg: 10  }

const labelFontSizeMap: Record<SliderSize, string> = {
  sm: typography.fontSize.sm,
  md: typography.fontSize.sm,
  lg: typography.fontSize.sm,
}

// DS-registered font sizes for mark labels — matches centerFontSize in progressBar size tokens
const markFontSizeMap: Record<SliderSize, string> = {
  sm: typography.fontSize.sm,
  md: typography.fontSize.sm,
  lg: typography.fontSize.sm,
}

// ─── DS v3 colour palette ─────────────────────────────────────────────────────

function sliderTokens(disabled: boolean, isDark: boolean) {
  const { colour } = components.slider
  if (disabled) {
    const d = isDark ? colour.disabled.dark : colour.disabled.light
    return {
      trackFilled:   d.trackFilled,
      trackUnfilled: d.trackUnfilled,
      thumbBg:       d.thumbBg,
      thumbBorder:   d.thumbBorder,
      thumbPillBg:   d.thumbBg,
      focusRing:     'rgba(0,0,0,0)',
      labelColor:    d.labelColor,
      percentColor:  d.percentColor,
    }
  }
  const c = isDark ? colour.dark : colour.light
  return {
    trackFilled:   c.trackFilled,
    trackUnfilled: c.trackUnfilled,
    thumbBg:       c.thumbBg,
    thumbBorder:   c.thumbBorder,
    thumbPillBg:       c.thumbPillBg,
    trackActiveFilled: c.trackActiveFilled,
    focusRing:         c.focusRing,
    labelColor:    c.labelColor,
    percentColor:  c.percentColor,
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Slider({
  value: valueProp,
  defaultValue = 40,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  size = 'md',
  theme = 'light',
  label,
  showPercent = false,
  marks = false,
  disabled = false,
  readOnly = false,
  id: idProp,
  name,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  className,
}: SliderProps) {
  const autoId    = useId()
  const inputId   = idProp ?? `slider-${autoId.replace(/:/g, '')}`
  const labelId   = `${inputId}-label`

  const isControlled   = valueProp !== undefined
  const [internal, setInternal] = useState(defaultValue)
  const [isActive, setIsActive] = useState(false)
  const current = isControlled ? valueProp! : internal

  // Clamp percent for the gradient and display
  const clampedCurrent = Math.min(max, Math.max(min, current))
  const fillPct  = ((clampedCurrent - min) / (max - min)) * 100
  const displayPct = Math.round(fillPct)

  const isDark = theme === 'dark'
  const tok    = sliderTokens(disabled, isDark)

  const thumbSize     = thumbSizeMap[size]
  const trackH        = trackHeightMap[size]
  const thumbHalf     = thumbHalfMap[size]
  const labelFontSize = labelFontSizeMap[size]
  const markFontSize  = markFontSizeMap[size]

  const hasHeader = !!(label || showPercent)

  const ticks: number[] = []
  if (marks) {
    for (let v = min; v <= max; v += step) ticks.push(v)
    if (ticks.length > 0 && ticks[ticks.length - 1] < max) ticks.push(max)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value)
    if (!isControlled) setInternal(next)
    onChange?.(next)
  }

  // CSS variables consumed by .eds-slider pseudo-element rules in globals.css
  const cssVars = {
    '--slider-thumb-size':    `${thumbSize}px`,
    '--slider-track-h':       `${trackH}px`,
    '--slider-thumb-bg':       tok.thumbBg,
    '--slider-thumb-border':   tok.thumbBorder,
    '--slider-focus-ring':     tok.focusRing,
    '--slider-thumb-pill-bg':  isActive ? tok.trackActiveFilled : tok.thumbPillBg,
  } as React.CSSProperties

  const useColumnLayout = hasHeader || marks

  return (
    <div
      className={cn(
        useColumnLayout
          ? 'inline-flex flex-col items-start gap-1'
          : 'flex items-center',
        'w-[140px]',
        className
      )}
    >
      {/* ── Header row: label + percent ─────────────────────────── */}
      {hasHeader && (
        <div className="flex items-center justify-between w-full gap-1">
          {label ? (
            <label
              id={labelId}
              htmlFor={inputId}
              className="font-medium leading-none select-none"
              style={{ color: tok.labelColor, fontSize: labelFontSize }}
            >
              {label}
            </label>
          ) : (
            /* spacer so percent stays right-aligned when no label */
            <span aria-hidden={true} />
          )}

          {showPercent && (
            <span
              className="font-medium tabular-nums leading-none shrink-0"
              aria-hidden
              style={{ color: tok.percentColor, fontSize: labelFontSize }}
            >
              {displayPct}%
            </span>
          )}
        </div>
      )}

      {/* ── Track + thumb ───────────────────────────────────────── */}
      {/*
       * Figma: width 140px · height 20px
       * Track is inset by half the thumb size on each side so the thumb centre
       * sits exactly over the track start/end at 0 % and 100 %.
       */}
      <div
        className="relative flex items-center w-full"
        style={{ height: '20px' }}
      >
        {/* Custom visual track — two layers so fill width is CSS-transitionable */}
        {/* Layer 1: unfilled (full width) */}
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            left: thumbHalf, right: thumbHalf,
            height: trackH,
            top: '50%', transform: 'translateY(-50%)',
            borderRadius: 9999,
            background: tok.trackUnfilled,
          }}
        />
        {/* Layer 2: filled (animates width) */}
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            left: thumbHalf,
            width: `calc((100% - ${thumbHalf * 2}px) * ${fillPct / 100})`,
            height: trackH,
            top: '50%', transform: 'translateY(-50%)',
            borderRadius: 9999,
            background: isActive ? tok.trackActiveFilled : tok.trackFilled,
            transition: `width ${motionTokens.duration.fast} ${motionTokens.easing.easeOut}`,
          }}
        />

        {/* Native range input — appearance stripped; thumb only visible */}
        <input
          type="range"
          id={inputId}
          name={name}
          min={min}
          max={max}
          step={step}
          value={clampedCurrent}
          onChange={readOnly ? () => {} : handleChange}
          onMouseDown={readOnly ? undefined : () => setIsActive(true)}
          onTouchStart={readOnly ? undefined : () => setIsActive(true)}
          onMouseUp={readOnly ? undefined : () => setIsActive(false)}
          onTouchEnd={readOnly ? undefined : () => setIsActive(false)}
          disabled={disabled}
          tabIndex={readOnly ? -1 : undefined}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy ?? (label ? labelId : undefined)}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={clampedCurrent}
          aria-disabled={disabled || undefined}
          className="eds-slider absolute inset-0 w-full"
          style={{ ...cssVars, ...(readOnly ? { pointerEvents: 'none' } : {}) }}
        />
      </div>

      {marks && ticks.length > 0 && (
        <div
          aria-hidden
          className="relative"
          style={{ width: `calc(100% - ${thumbHalf * 2}px)`, marginLeft: thumbHalf }}
        >
          {ticks.map(v => {
            const pct = ((v - min) / (max - min)) * 100
            const col = v <= clampedCurrent ? tok.trackFilled : tok.percentColor
            return (
              <div
                key={v}
                className="absolute flex flex-col items-center"
                style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
              >
                <div style={{ width: 1, height: 4, background: col, borderRadius: 1 }} />
                <span style={{ fontSize: markFontSize, lineHeight: 1, marginTop: 2, color: col, userSelect: 'none', whiteSpace: 'nowrap' }}>
                  {v}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
