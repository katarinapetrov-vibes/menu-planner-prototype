'use client'

import React, { useId, useEffect, useRef, useState, useImperativeHandle } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from './utils'
import { typography, motion as motionTokens } from '@/lib/tokens'

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS v3 — node 46789-4145
// Variables: Size (sm|md|lg), Checked (true|false|indeterminate),
// Error (true|false), Disabled (true|false), Theme (light|dark)

export type CheckboxSize  = 'sm' | 'md' | 'lg'
export type CheckboxTheme = 'light' | 'dark'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange' | 'type'> {
  /** Controlled checked state */
  checked?: boolean
  /** Uncontrolled initial checked state */
  defaultChecked?: boolean
  /** Indeterminate / partial-selection state — overrides the checked visual */
  indeterminate?: boolean
  /** Called with the new checked value whenever the checkbox is toggled */
  onChange?: (checked: boolean) => void
  /** Size variant — sm 16 px · md 20 px · lg 24 px */
  size?: CheckboxSize
  /** Optional label rendered beside the checkbox */
  label?: React.ReactNode
  /** Which side the label appears on — defaults to 'right' */
  labelPosition?: 'left' | 'right'
  /** Optional supporting description rendered below the label */
  description?: string
  /** Error state — pass a string for an inline error message, true for styling only */
  error?: string | boolean
  /** Canvas theme the checkbox is placed on — affects unchecked surface & text colours */
  theme?: CheckboxTheme
}

// ─── Size Tokens ──────────────────────────────────────────────────────────────
// Figma: border-radius 4 px (sm: 3 px), border 1 px, gap between box and label 8 px
// Density: sm 16 px · md 20 px · lg 24 px  (box dimensions from DS v3 node 46789-4145)

const sizeMap: Record<CheckboxSize, {
  box:           string
  icon:          string
  gap:           string
  label:         string
  labelFontSize: string
  desc:          string
  descFontSize:  string
  errPl:         string   // padding-left offset for the error message row
}> = {
  // gap values sourced from spacing tokens: spacing[200]=8px · spacing[300]=12px
  sm: {
    box:   'w-4 h-4 rounded-[3px]',
    icon:  'w-[9px] h-[9px]',
    gap:   'gap-2',                       // spacing[200] = 8px
    label:         'leading-4',             // body/label/regular — 12px / 1.333em / weight 400
    labelFontSize: typography.fontSize.sm,
    desc:          'leading-relaxed',       // body/sm — 12px
    descFontSize:  typography.fontSize.sm,
    errPl:         'pl-[calc(1rem+0.5rem)]',  // w-4 + gap-2
  },
  md: {
    box:   'w-5 h-5 rounded-[4px]',
    icon:  'w-[11px] h-[11px]',
    gap:   'gap-2.5',                     // 10px — between spacing[200] and spacing[300]
    label:         'leading-6',             // body/md/regular — 16px / 1.5em / weight 400
    labelFontSize: typography.fontSize.md,
    desc:          'leading-relaxed',       // body/sm — 12px
    descFontSize:  typography.fontSize.sm,
    errPl:         'pl-[calc(1.25rem+0.625rem)]', // w-5 + gap-2.5
  },
  lg: {
    box:   'w-6 h-6 rounded-[4px]',
    icon:  'w-[13px] h-[13px]',
    gap:   'gap-3',                       // spacing[300] = 12px
    label:         'leading-7',             // body/lg/regular — 20px / 1.4em / weight 400
    labelFontSize: typography.fontSize.lg,
    desc:          'leading-relaxed',       // body/sm — 12px
    descFontSize:  typography.fontSize.sm,
    errPl:         'pl-[calc(1.5rem+0.75rem)]',  // w-6 + gap-3
  },
}

// ─── Colour Tokens ────────────────────────────────────────────────────────────
// Figma Enterprise DS v3 — node 46789-4145
//
//  State          bg (light)   bg (dark)            border (light)  border (dark)
//  ─────────────  ───────────  ───────────────────  ──────────────  ─────────────
//  Idle uncheck   #FFFFFF      transparent          #067A46  1px    #067A46  1px
//  Hover uncheck  #F6FDE9      rgba(6,122,70,.10)   #067A46  1px    #067A46  1px
//  Press uncheck  #E4FABF      rgba(6,122,70,.20)   #056835  1px    #067A46  1px
//  Idle checked   #067A46      #067A46              #067A46  1px    #067A46  1px
//  Hover checked  #056835      #056835              #056835  1px    #056835  1px
//  Press checked  #056835      #056835              #056835  1px    #056835  1px
//  Disabled unch  #E4E4E4      rgba(255,255,255,.1) transparent     transparent
//  Disabled chk   #BBBBBB      #BBBBBB              #BBBBBB  1px    #BBBBBB  1px
//  Error unch     #FFFFFF      transparent          #B30000  1px    #FF7575  1px
//  Error checked  #FFFFFF      transparent          #B30000  1px    #FF7575  1px
//  Focus ring     rgba(150,220,20,.40) — 2 px outline offset

type VisualState = {
  boxBg:       string
  borderColor: string
  borderWidth: string
  cursor:      string
  iconColor:   string
}

// All values use inline CSS — avoids Tailwind v4 scanning issues with opacity modifiers.
// Border logic is co-located here so hover/press can affect it in one place.
function getVisualState({
  isChecked,
  indeterminate,
  hasError,
  disabled,
  theme,
  hovered,
  pressed,
}: {
  isChecked:     boolean
  indeterminate: boolean
  hasError:      boolean
  disabled:      boolean
  theme:         CheckboxTheme
  hovered:       boolean
  pressed:       boolean
}): VisualState {
  // ── Disabled ──────────────────────────────────────────────────────────────
  if (disabled) {
    if (isChecked || indeterminate) {
      return { boxBg: '#BBBBBB', borderColor: '#BBBBBB', borderWidth: '1px', cursor: 'not-allowed', iconColor: '#ffffff' }
    }
    return {
      boxBg: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E4E4E4',
      borderColor: 'transparent',
      borderWidth: '1px',
      cursor: 'not-allowed',
      iconColor: '#ffffff',
    }
  }

  // ── Error (checked or unchecked) — outlined red, red icon when checked ─────
  if (hasError) {
    const idleBg   = theme === 'dark' ? 'transparent'              : '#ffffff'
    const hoverBg  = theme === 'dark' ? 'rgba(255,117,117,0.1)'   : 'rgba(179,0,0,0.05)'
    const activeBg = theme === 'dark' ? 'rgba(255,117,117,0.2)'   : 'rgba(179,0,0,0.10)'
    return {
      boxBg: pressed ? activeBg : hovered ? hoverBg : idleBg,
      borderColor: theme === 'dark' ? '#FF7575' : '#B30000',
      borderWidth: '1px',
      cursor: 'pointer',
      iconColor: (isChecked || indeterminate)
        ? (theme === 'dark' ? '#FF7575' : '#B30000')
        : '#ffffff',
    }
  }

  // ── Checked / indeterminate ────────────────────────────────────────────────
  if (isChecked || indeterminate) {
    if (theme === 'dark') {
      const fill = (hovered || pressed) ? '#D2F895' : '#96DC14'
      return { boxBg: fill, borderColor: fill, borderWidth: '1px', cursor: 'pointer', iconColor: '#035624' }
    }
    const fill = (hovered || pressed) ? '#056835' : '#067A46'
    return { boxBg: fill, borderColor: fill, borderWidth: '1px', cursor: 'pointer', iconColor: '#ffffff' }
  }

  // ── Idle unchecked ─────────────────────────────────────────────────────────
  const idleBg   = theme === 'dark' ? 'transparent'           : '#ffffff'
  const hoverBg  = theme === 'dark' ? 'rgba(6,122,70,0.1)'   : '#F6FDE9'
  const activeBg = theme === 'dark' ? 'rgba(6,122,70,0.2)'   : '#E4FABF'
  return {
    boxBg: pressed ? activeBg : hovered ? hoverBg : idleBg,
    borderColor: pressed ? '#056835' : '#067A46',
    borderWidth: '1px',
    cursor: 'pointer',
    iconColor: '#ffffff',
  }
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function CheckIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 12 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M1.5 5L4.5 8.5L10.5 1.5" />
    </svg>
  )
}

function IndeterminateIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 10 2"
      fill="currentColor"
      aria-hidden
    >
      <rect x="0" y="0" width="10" height="2" rx="1" />
    </svg>
  )
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      defaultChecked,
      indeterminate = false,
      onChange,
      size = 'md',
      label,
      labelPosition = 'right',
      description,
      disabled = false,
      error,
      theme = 'light',
      id: idProp,
      className,
      ...rest
    },
    ref,
  ) => {
    const autoId = useId()
    const inputId = idProp ?? autoId

    // Support both controlled and uncontrolled patterns
    const isControlled = checked !== undefined
    const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false)
    const isChecked = isControlled ? checked : internalChecked

    // Manage the DOM indeterminate property (not an HTML attribute)
    const internalRef = useRef<HTMLInputElement>(null)
    useImperativeHandle(ref, () => internalRef.current!)
    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate
      }
    }, [indeterminate])

    const hasError = !!error
    const sz = sizeMap[size]
    const prefersReducedMotion = useReducedMotion()

    const [hovered, setHovered] = useState(false)
    const [pressed, setPressed] = useState(false)

    const { boxBg, borderColor, borderWidth, cursor, iconColor } = getVisualState({ isChecked, indeterminate, hasError, disabled, theme, hovered, pressed })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalChecked(e.target.checked)
      onChange?.(e.target.checked)
    }

    // Text colours — sourced from lib/tokens.ts semantic + component tokens
    // Label:       semantic.foreground.default.primary   (#242424 / #E4E4E4)
    //              semantic.foreground.default.disabled  (#BBBBBB / #676767)
    // Description: components.menu.colour.description    (#676767 / #BBBBBB)
    //              semantic.foreground.default.disabled  (#BBBBBB / #676767)
    // Error:       semantic.foreground.negative.default  (#B30000 / #FE8680)
    const labelColor = disabled
      ? (theme === 'dark' ? '#676767' : '#BBBBBB')
      : (theme === 'dark' ? '#E4E4E4' : '#242424')

    const descColor = disabled
      ? (theme === 'dark' ? '#676767' : '#BBBBBB')
      : (theme === 'dark' ? '#BBBBBB' : '#676767')

    const errorTextColor = theme === 'dark' ? '#FE8680' : '#B30000'

    return (
      <div className={cn('inline-flex flex-col gap-0.5', className)}>
        <label
          htmlFor={inputId}
          className={cn(
            'inline-flex items-start',
            sz.gap,
            labelPosition === 'left' && 'flex-row-reverse',
            !disabled && 'cursor-pointer',
          )}
        >
          {/* Hidden native input — drives the accessible name + form value */}
          <input
            ref={internalRef}
            type="checkbox"
            id={inputId}
            checked={isControlled ? checked : undefined}
            defaultChecked={!isControlled ? defaultChecked : undefined}
            disabled={disabled}
            onChange={handleChange}
            aria-invalid={hasError || undefined}
            className="sr-only peer"
            {...rest}
          />

          {/* Visual checkbox box */}
          <span
            style={{ backgroundColor: boxBg, borderColor, borderWidth, borderStyle: 'solid', cursor }}
            onMouseEnter={() => !disabled && setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPressed(false) }}
            onMouseDown={() => !disabled && setPressed(true)}
            onMouseUp={() => setPressed(false)}
            className={cn(
              'inline-flex shrink-0 items-center justify-center transition-colors duration-quick',
              sz.box,
              // Focus ring — 2px outline, 2px offset, 40% opacity per DS v3 node 46789-4145
              // outline avoids ring-offset background-colour mismatch on non-white surfaces
              'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2',
              theme === 'dark'
                ? 'peer-focus-visible:outline-[rgba(150,220,20,0.4)]'
                : 'peer-focus-visible:outline-[rgba(6,122,70,0.4)]',
            )}
            aria-hidden
          >
            <AnimatePresence mode="wait">
              {indeterminate && (
                <motion.span
                  key="indeterminate"
                  initial={{ scale: prefersReducedMotion ? 1 : 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: prefersReducedMotion ? 1 : 0 }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', ...motionTokens.spring.snappy }
                  }
                  className="inline-flex items-center justify-center"
                >
                  <IndeterminateIcon className={sz.icon} style={{ color: iconColor }} />
                </motion.span>
              )}
              {!indeterminate && isChecked && (
                <motion.span
                  key="check"
                  initial={{ scale: prefersReducedMotion ? 1 : 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: prefersReducedMotion ? 1 : 0 }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', ...motionTokens.spring.snappy }
                  }
                  className="inline-flex items-center justify-center"
                >
                  <CheckIcon className={sz.icon} style={{ color: iconColor }} />
                </motion.span>
              )}
            </AnimatePresence>
          </span>

          {/* Label + description column */}
          {(label !== undefined || description) && (
            <span className="flex flex-col min-w-0">
              {label !== undefined && (
                <span
                  className={cn(sz.label, 'font-medium select-none')}
                  style={{ color: labelColor, fontSize: sz.labelFontSize }}
                >
                  {label}
                </span>
              )}
              {description && (
                <span
                  className={cn(sz.desc, 'font-medium')}
                  style={{ color: descColor, fontSize: sz.descFontSize }}
                >
                  {description}
                </span>
              )}
            </span>
          )}
        </label>

        {/* Inline error message */}
        {typeof error === 'string' && error && (
          <p
            className={cn('font-medium mt-0.5', sz.errPl)}
            style={{ color: errorTextColor, fontSize: typography.fontSize.sm }}
          >
            {error}
          </p>
        )}
      </div>
    )
  },
)

Checkbox.displayName = 'Checkbox'

export default Checkbox
