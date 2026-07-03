'use client'

import React, { useId, useState, useRef, createContext, useContext } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from './utils'
import { typography, motion as motionTokens } from '@/lib/tokens'

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS v3 — node 46726-5647
// Variables: Size (sm|md|lg), Checked (true|false),
// Error (true|false), Disabled (true|false), Theme (light|dark)

export type RadioSize  = 'sm' | 'md' | 'lg'
export type RadioTheme = 'light' | 'dark'

// ─── RadioGroup Context ───────────────────────────────────────────────────────

interface RadioGroupContextValue {
  name:     string
  value:    string | undefined
  onChange: (value: string) => void
  size:     RadioSize
  theme:    RadioTheme
  disabled: boolean
  error:    string | boolean | undefined
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

// ─── Size Tokens ──────────────────────────────────────────────────────────────
// Figma: border-radius 50% (fully round), border 2 px, gap between circle and label 8 px

const sizeMap: Record<RadioSize, {
  circle:       string
  dot:          string
  gap:          string
  label:        string
  labelFontSize: string
  desc:         string
  descFontSize:  string
  errPl:        string   // padding-left offset for the error message row
}> = {
  // gap values sourced from spacing tokens: spacing[200]=8px · spacing[300]=12px
  sm: {
    circle: 'w-4 h-4',
    dot:    'w-1.5 h-1.5',
    gap:    'gap-2',                       // spacing[200] = 8px
    label:         'leading-4',             // body/label/regular — 12px / 1.333em / weight 400
    labelFontSize: typography.fontSize.sm,
    desc:          'leading-relaxed',       // body/sm — 12px
    descFontSize:  typography.fontSize.sm,
    errPl:         'pl-[calc(1rem+0.5rem)]',  // w-4 + gap-2
  },
  md: {
    circle: 'w-5 h-5',
    dot:    'w-2 h-2',
    gap:    'gap-2.5',                     // 10px — between spacing[200] and spacing[300]
    label:         'leading-6',             // body/md/regular — 16px / 1.5em / weight 400
    labelFontSize: typography.fontSize.md,
    desc:          'leading-relaxed',       // body/sm — 12px
    descFontSize:  typography.fontSize.sm,
    errPl:         'pl-[calc(1.25rem+0.625rem)]', // w-5 + gap-2.5
  },
  lg: {
    circle: 'w-6 h-6',
    dot:    'w-2.5 h-2.5',
    gap:    'gap-3',                       // spacing[300] = 12px
    label:         'leading-7',             // body/lg/regular — 20px / 1.4em / weight 400
    labelFontSize: typography.fontSize.lg,
    desc:          'leading-relaxed',       // body/sm — 12px
    descFontSize:  typography.fontSize.sm,
    errPl:         'pl-[calc(1.5rem+0.75rem)]',  // w-6 + gap-3
  },
}

// ─── Colour Tokens ────────────────────────────────────────────────────────────
// Selected colours are theme-agnostic — positive green works on both surfaces.
// Unchecked surface and border adapt per theme.

// Colour tokens are applied via inline styles (JS hover state) to avoid Tailwind
// scanning issues with the space in this filename. This function is kept only for
// any additional className overrides that may be needed in future.
function getCircleClass(): string {
  return ''
}

// ─── RadioButton ──────────────────────────────────────────────────────────────

export interface RadioButtonProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange' | 'type'> {
  /** The value this radio represents */
  value: string
  /** Controlled checked state (when used standalone outside a RadioGroup) */
  checked?: boolean
  /** Called with the value when this radio is selected */
  onChange?: (value: string) => void
  /** Size variant — sm 16 px · md 20 px · lg 24 px */
  size?: RadioSize
  /** Optional label rendered beside the radio */
  label?: React.ReactNode
  /** Which side the label appears on — defaults to 'right' */
  labelPosition?: 'left' | 'right'
  /** Optional supporting description rendered below the label */
  description?: string
  /** Error state — pass a string for an inline error message, true for visual-only styling */
  error?: string | boolean
  /** Canvas theme the radio is placed on — affects unchecked surface & text colours */
  theme?: RadioTheme
}

export const RadioButton = React.forwardRef<HTMLInputElement, RadioButtonProps>(
  (
    {
      value,
      checked,
      onChange,
      size: sizeProp,
      label,
      labelPosition = 'right',
      description,
      disabled: disabledProp = false,
      error: errorProp,
      theme: themeProp,
      id: idProp,
      name: nameProp,
      className,
      ...rest
    },
    ref,
  ) => {
    const autoId  = useId()
    const inputId = idProp ?? autoId

    // Inherit values from RadioGroup context when present
    const ctx       = useContext(RadioGroupContext)
    const size      = sizeProp  ?? ctx?.size     ?? 'md'
    const theme     = themeProp ?? ctx?.theme    ?? 'light'
    const disabled  = disabledProp || (ctx?.disabled ?? false)
    const error     = errorProp ?? ctx?.error
    const inputName = nameProp  ?? ctx?.name

    // Checked state: use group context comparison when inside RadioGroup
    // and no explicit checked prop was passed
    const isChecked = ctx !== null && checked === undefined
      ? ctx.value === value
      : (checked ?? false)

    const hasError = !!error
    const sz       = sizeMap[size]
    const prefersReducedMotion = useReducedMotion()

    const [hovered, setHovered] = useState(false)
    const [pressed, setPressed] = useState(false)

    // All visual values via inline style — Tailwind can't reliably scan filenames with spaces
    const idleBorderColor  = disabled ? 'transparent' : hasError ? (theme === 'dark' ? '#ff7575' : '#b30000') : theme === 'dark' ? '#96DC14' : '#067a46'
    const hoverBorderColor = disabled ? 'transparent' : hasError ? '#b30000' : theme === 'dark' ? '#D2F895' : '#056835'  // --radioButton-default-border
    const borderColor = pressed
      ? 'transparent'        // press: --radioButton-default-border-focus rgba(0,0,0,0)
      : hovered
        ? hoverBorderColor   // hover: --radioButton-default-border #056835
        : idleBorderColor    // idle:  #067a46

    // border-width: 1px idle & hover (--scale-25), 2px press (--scale-50)
    const borderWidth = pressed ? '2px' : '1px'

    // background: transparent idle, #F6FDE9 (--radioButton-default-background) on hover/press
    const idleBg      = disabled ? (isChecked ? '#9e9e9e' : '#c4c4c4') : 'transparent'
    const hoverBg     = disabled ? idleBg : hasError ? '#fff0f0' : '#F6FDE9'  // --radioButton-default-background
    const activeBg    = disabled ? idleBg : hasError ? '#ffd9d9' : '#d1ead9'
    const backgroundColor = pressed ? activeBg : hovered ? hoverBg : idleBg

    const dotColor = disabled ? 'white' : hasError ? (theme === 'dark' ? '#ff7575' : '#b30000') : theme === 'dark' ? '#96DC14' : '#067a46'

    // border-radius: 40px (scale-1000) for all states except disabled-selected which uses 32px (scale-800)
    const borderRadius = disabled && isChecked ? '32px' : '40px'

    const handleChange = () => {
      if (disabled) return
      if (ctx !== null && checked === undefined) {
        ctx.onChange(value)
      } else {
        onChange?.(value)
      }
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
            'inline-flex',
            labelPosition === 'left' && 'flex-row-reverse',
            disabled
              ? 'items-center p-1 gap-2 cursor-not-allowed'  // padding: 4px 4px; gap: 8px; align-items: center
              : cn('items-start cursor-pointer', sz.gap),
          )}
        >
          {/* Hidden native radio input — drives accessible name + form value */}
          <input
            ref={ref}
            type="radio"
            id={inputId}
            name={inputName}
            value={value}
            checked={isChecked}
            disabled={disabled}
            onChange={handleChange}
            aria-invalid={hasError || undefined}
            className="sr-only peer"
            {...rest}
          />

          {/* Visual radio circle — border-radius: var(--scale-1000, 40px); border: var(--scale-50, 2px) */}
          <span
            style={{ borderColor, backgroundColor, borderWidth, borderRadius }}
            onMouseEnter={() => !disabled && setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPressed(false) }}
            onMouseDown={() => !disabled && setPressed(true)}
            onMouseUp={() => setPressed(false)}
            className={cn(
              'inline-flex shrink-0 items-center justify-center',
              'border-2 transition-colors duration-quick',
              sz.circle,
              disabled ? 'cursor-not-allowed' : 'cursor-pointer',
              // Focus ring — 2px outline, 2px offset, 40% opacity per DS v3 node 46789-4145
              'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2',
              theme === 'dark'
                ? 'peer-focus-visible:outline-[rgba(150,220,20,0.4)]'
                : 'peer-focus-visible:outline-[rgba(6,122,70,0.4)]',
            )}
            aria-hidden
          >
            <AnimatePresence mode="wait">
              {isChecked && (
                <motion.span
                  key="dot"
                  initial={{ scale: prefersReducedMotion ? 1 : 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: prefersReducedMotion ? 1 : 0 }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', ...motionTokens.spring.snappy }
                  }
                  style={{ backgroundColor: dotColor }}
                  className={cn('rounded-full', sz.dot)}
                />
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

        {/* Inline error message — only for standalone usage; RadioGroup renders its own */}
        {typeof errorProp === 'string' && errorProp && (
          <p
            className={cn('font-medium mt-0.5', sz.errPl)}
            style={{ color: errorTextColor, fontSize: typography.fontSize.sm }}
          >
            {errorProp}
          </p>
        )}
      </div>
    )
  },
)

RadioButton.displayName = 'RadioButton'

// ─── RadioGroup ───────────────────────────────────────────────────────────────

export interface RadioGroupProps {
  /** Currently selected value (controlled) */
  value?: string
  /** Default selected value (uncontrolled) */
  defaultValue?: string
  /** Called with the new value on selection change */
  onChange?: (value: string) => void
  /** name attribute shared across all radio inputs in the group */
  name?: string
  /** Size variant applied to all radio items */
  size?: RadioSize
  /** Canvas theme applied to all radio items */
  theme?: RadioTheme
  /** Whether all radio items are disabled */
  disabled?: boolean
  /** Error state for the group — a string renders an error message below the group */
  error?: string | boolean
  /** Optional visible legend label for the fieldset */
  label?: string
  /** RadioButton children */
  children: React.ReactNode
  /** Additional className on the fieldset */
  className?: string
}

export const RadioGroup = React.forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      name: nameProp,
      size = 'md',
      theme = 'light',
      disabled = false,
      error,
      label,
      children,
      className,
    },
    ref,
  ) => {
    const autoName   = useId()
    const name       = nameProp ?? autoName

    const isControlled = value !== undefined
    const [internalValue, setInternalValue] = useState(defaultValue ?? '')
    const currentValue = isControlled ? value : internalValue

    const handleChange = (val: string) => {
      if (!isControlled) setInternalValue(val)
      onChange?.(val)
    }

    const errorTextColor = theme === 'dark' ? '#ff7575' : '#b30000'
    const legendColor    = theme === 'dark' ? 'rgba(255,255,255,0.8)' : '#242424'

    return (
      <RadioGroupContext.Provider
        value={{ name, value: currentValue, onChange: handleChange, size, theme, disabled, error }}
      >
        <fieldset ref={ref} className={cn('border-none p-0 m-0 min-w-0', className)}>
          {label && (
            <legend
              className="font-semibold font-medium mb-2 float-none w-full"
              style={{ color: legendColor, fontSize: typography.fontSize.md }}
            >
              {label}
            </legend>
          )}
          <div className="flex flex-col gap-4 items-start">
            {children}
          </div>
          {typeof error === 'string' && error && (
            <p className="font-medium mt-1.5" style={{ color: errorTextColor, fontSize: typography.fontSize.sm }}>
              {error}
            </p>
          )}
        </fieldset>
      </RadioGroupContext.Provider>
    )
  },
)

RadioGroup.displayName = 'RadioGroup'

export default RadioButton
