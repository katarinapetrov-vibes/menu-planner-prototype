'use client';

import React, { useState, useId, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from './utils';
import { useFieldLocked } from './field-locked-context';
import { semantic, radius as radiusTokens, borderWidth as borderWidthTokens, spacing, typography, motion as motionTokens } from '@/lib/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export type InputFieldSize  = 'sm' | 'md' | 'lg';
export type InputFieldTheme = 'light' | 'dark';
export type InputFieldType  =
  | 'text'
  | 'email'
  | 'password'
  | 'search'
  | 'number'
  | 'tel'
  | 'url';

export interface InputFieldProps {
  /** Label rendered above the field */
  label?:            string;
  /** Placeholder text shown when the field is empty */
  placeholder?:      string;
  /** Controlled value */
  value?:            string;
  /** Uncontrolled initial value. Default: '' */
  defaultValue?:     string;
  /** Called with the new string value on every keystroke */
  onChange?:         (value: string) => void;
  /** HTML input type. Default: 'text' */
  type?:             InputFieldType;
  /** Size variant — controls height, padding, and type scale. Default: 'md' */
  size?:             InputFieldSize;
  /** Theme — controls colour tokens. Default: 'light' */
  theme?:            InputFieldTheme;
  /**
   * Label placement variant.
   * - `'stacked'` (default): label sits above the input container.
   * - `'outlined'`: label floats on the top border of the input container
   *   (fieldset/legend style — as per Figma node 45372-48993).
   */
  variant?:          'stacked' | 'outlined';
  /**
   * Label layout direction.
   * - `'stacked'` (default): label above input.
   * - `'horizontal'`: label to the left of the input (only applies when variant='stacked').
   */
  layout?:           'stacked' | 'horizontal';
  /** Error message; triggers the error state and replaces helperText when set */
  error?:            string;
  /** Supporting helper text shown below the field (hidden when error is set) */
  helperText?:       string;
  /** Disables the input. Default: false */
  disabled?:         boolean;
  /** Marks the field as required — appends * to the label. Default: false */
  required?:         boolean;
  /** Optional leading icon (size-matched per the size prop) */
  leadingIcon?:      React.ReactNode;
  /**
   * Optional trailing icon.
   * Overridden by the password visibility toggle (type="password") and the
   * clear button (clearable=true with a non-empty value).
   */
  trailingIcon?:     React.ReactNode;
  /** Show a character count; requires maxLength to be set. Default: false */
  showCharCount?:    boolean;
  /** maxlength attribute; also used to drive the character counter */
  maxLength?:        number;
  /** Show a clear (×) button when the field has a non-empty value. Default: false */
  clearable?:        boolean;
  /** Static prefix text inside the left edge of the container (e.g. 'https://') */
  prefix?:           string;
  /** Static suffix text inside the right edge of the container (e.g. '.com') */
  suffix?:           string;
  /** HTML id — auto-generated via useId() if omitted */
  id?:               string;
  /** HTML name attribute */
  name?:             string;
  /** Extra class applied to the outer wrapper div */
  className?:        string;
  /** Extra class applied directly to the <input> element */
  inputClassName?:   string;
  onBlur?:           React.FocusEventHandler<HTMLInputElement>;
  onFocus?:          React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?:        React.KeyboardEventHandler<HTMLInputElement>;
  autoComplete?:     string;
  autoFocus?:        boolean;
  readOnly?:         boolean;
  'aria-label'?:     string;
  'aria-describedby'?: string;
}

// ─── Design Tokens ────────────────────────────────────────────────────────────
// Enterprise DS v3 — Figma node 45470-10660
// All values sourced from lib/tokens.ts — no hardcoded colours.

const tokens = {
  light: {
    // Container
    containerBg:     semantic.background.page.light,
    // Borders
    borderDefault:   semantic.border.default.light,
    borderHover:     semantic.border.hover.light,
    borderFocus:     semantic.border.focus.light,
    borderError:     semantic.border.negative.light,
    borderDisabled:  semantic.border.disabled.light,
    // Backgrounds
    disabledBg:      semantic.background.surfaceOffset.light,
    // Text
    textValue:       semantic.foreground.default.primary.light,
    textPlaceholder: semantic.foreground.default.placeholder.light,
    textDisabled:    semantic.foreground.default.disabled.light,
    // Labels & meta
    labelColor:      semantic.foreground.default.secondary.light,
    helperColor:     semantic.foreground.neutral.mid.light,
    errorColor:      semantic.foreground.negative.default.light,
    // Icons & adornments
    iconColor:       semantic.foreground.neutral.mid.light,
    iconErrorColor:  semantic.foreground.negative.default.light,
    adornmentBg:     semantic.background.surfaceOffset.light,
    adornmentText:   semantic.foreground.neutral.mid.light,
    adornmentBorder: semantic.border.default.light,
    // Focus ring
    focusOutline:    semantic.border.focus.light,
    // Box-shadow ring: focusOutline at 40% opacity (hex alpha '66' = 102/255 ≈ 40%)
    focusRing:       semantic.border.focus.light + '66',
  },
  dark: {
    containerBg:     semantic.background.container.dark,
    borderDefault:   semantic.border.default.dark,
    borderHover:     semantic.border.hover.dark,
    borderFocus:     semantic.border.focus.dark,
    borderError:     semantic.border.negative.dark,
    borderDisabled:  semantic.border.disabled.dark,
    disabledBg:      semantic.background.surfaceOffset.dark,
    textValue:       semantic.foreground.default.primary.dark,
    textPlaceholder: semantic.foreground.default.placeholder.dark,
    textDisabled:    semantic.foreground.default.disabled.dark,
    labelColor:      semantic.foreground.neutral.mid.dark,
    helperColor:     semantic.foreground.neutral.mid.dark,
    errorColor:      semantic.foreground.negative.default.dark,
    iconColor:       semantic.foreground.neutral.mid.dark,
    iconErrorColor:  semantic.foreground.negative.default.dark,
    adornmentBg:     semantic.background.surfaceOffset.dark,
    adornmentText:   semantic.foreground.neutral.mid.dark,
    adornmentBorder: semantic.border.default.dark,
    focusOutline:    semantic.border.focus.dark,
    // Box-shadow ring: focusOutline at 40% opacity (hex alpha '66' = 102/255 ≈ 40%)
    focusRing:       semantic.border.focus.dark + '66',
  },
};

// ─── Size Tokens ──────────────────────────────────────────────────────────────
// sm: 32 px  |  md: 40 px  |  lg: 48 px

const sizeTokens: Record<
  InputFieldSize,
  {
    inputHeight:       string;
    plDefault:         string;  // left padding when no leading adornment
    prDefault:         string;  // right padding when no trailing adornment
    plAdornment:       string;  // left padding when leading adornment present
    prAdornment:       string;  // right padding when trailing adornment present
    iconCls:           string;
    iconWrapperW:      string;
    labelCls:          string;
    valueCls:          string;
    helperCls:         string;
    helperFontSize?:   string;
    gap:               string;  // gap between label and input row
    adornmentPx:       string;
    valueFontSize:     string;
    labelFontSize?:    string;
    adornmentFontSize: string;
  }
> = {
  sm: {
    inputHeight:       'h-8',
    plDefault:         'pl-3',
    prDefault:         'pr-3',
    plAdornment:       'pl-2',
    prAdornment:       'pr-2',
    iconCls:           'w-4 h-4 shrink-0',
    iconWrapperW:      'w-8',
    labelCls:          'font-medium leading-4',
    labelFontSize:     typography.fontSize.sm,
    valueCls:          'leading-5',
    helperCls:         'leading-4 mt-1',
    helperFontSize:    typography.fontSize.sm,
    gap:               'gap-1',
    adornmentPx:       'px-2.5',
    valueFontSize:     typography.fontSize.md,
    adornmentFontSize: typography.fontSize.md,
  },
  md: {
    inputHeight:       'h-10',
    plDefault:         'pl-3',
    prDefault:         'pr-3',
    plAdornment:       'pl-2',
    prAdornment:       'pr-2',
    iconCls:           'w-[18px] h-[18px] shrink-0',
    iconWrapperW:      'w-10',
    labelCls:          'font-medium leading-5',
    valueCls:          'leading-5',
    helperCls:         'leading-4 mt-1',
    helperFontSize:    typography.fontSize.sm,
    gap:               'gap-1',
    adornmentPx:       'px-3',
    valueFontSize:     typography.fontSize.md,
    labelFontSize:     typography.fontSize.md,
    adornmentFontSize: typography.fontSize.md,
  },
  lg: {
    inputHeight:       'h-12',
    plDefault:         'pl-4',
    prDefault:         'pr-4',
    plAdornment:       'pl-3',
    prAdornment:       'pr-3',
    iconCls:           'w-5 h-5 shrink-0',
    iconWrapperW:      'w-12',
    labelCls:          'font-medium leading-5',
    valueCls:          'leading-6',
    helperCls:         'leading-4 mt-1',
    helperFontSize:    typography.fontSize.sm,
    gap:               'gap-1',
    adornmentPx:       'px-3.5',
    valueFontSize:     typography.fontSize.md,
    labelFontSize:     typography.fontSize.md,
    adornmentFontSize: typography.fontSize.md,
  },
};

// ─── Inline Icon SVGs ─────────────────────────────────────────────────────────

function EyeOpenIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden>
      <path d="M2 10c0 0 3-6 8-6s8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden>
      <path d="M3 3l14 14M8.59 8.636A2.5 2.5 0 0012.36 12.4M6.07 5.06C4.04 6.258 2.52 8.27 2 10c1.11 3.585 4.61 6 8 6 1.455 0 2.846-.44 4-.95m2.938-2.11C18.255 11.836 18.745 10.838 18 10c-.52-1.73-2.043-3.742-4.07-4.94" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden>
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ErrorCircleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4.5M10 13.5v.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden>
      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17 17l-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── InputField (main export) ─────────────────────────────────────────────────

function InputField({
  label,
  placeholder,
  value: controlledValue,
  defaultValue = '',
  onChange,
  type = 'text',
  size = 'md',
  theme = 'light',
  variant = 'outlined',
  layout = 'stacked',
  error,
  helperText,
  disabled = false,
  required = false,
  leadingIcon,
  trailingIcon,
  showCharCount = false,
  maxLength,
  clearable = false,
  prefix,
  suffix,
  id: providedId,
  name,
  className,
  inputClassName,
  onBlur,
  onFocus,
  onKeyDown,
  autoComplete,
  autoFocus,
  readOnly,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: InputFieldProps) {
  const generatedId   = useId();
  const inputId       = providedId ?? generatedId;
  const helperId      = `${inputId}-helper`;
  const errorId       = `${inputId}-error`;
  const inputRef      = useRef<HTMLInputElement>(null);
  const fieldLocked   = useFieldLocked();

  const t  = tokens[theme];
  const sz = sizeTokens[size];

  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isFocused,     setIsFocused]     = useState(false);
  const [isHovered,     setIsHovered]     = useState(false);
  const [showPassword,  setShowPassword]  = useState(false);
  const [isClearing,    setIsClearing]    = useState(false);

  const isControlled  = controlledValue !== undefined;
  const currentValue  = isControlled ? controlledValue : internalValue;
  const hasError      = Boolean(error);
  const isPassword    = type === 'password';
  const isSearch      = type === 'search';
  const computedType  = isPassword ? (showPassword ? 'text' : 'password') : type;
  const isOutlined    = variant === 'outlined';
  // Label colour for the outlined variant tracks the interactive state
  const outlinedLabelColor = disabled
    ? t.textDisabled
    : hasError
      ? t.errorColor
      : isFocused
        ? t.borderFocus
        : t.labelColor;

  // ── Dev-only prop validation ───────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    if (showCharCount && maxLength === undefined) {
      console.warn('[InputField] showCharCount=true has no effect without maxLength. Pass maxLength to enable the character counter.');
    }
    if (!label && !ariaLabel) {
      console.warn('[InputField] No accessible name provided. Pass `label` or `aria-label` to meet WCAG 1.3.1 / 4.1.2.');
    }
  }

  /** View / read-only: muted chrome; native input uses readOnly when possible so text stays selectable */
  const visuallyLocked = disabled || readOnly || fieldLocked;

  // ── Trailing slot logic (priority order) ──────────────────────────────────
  // Error state takes priority over the clear button: showing a validation
  // error is more important than offering a one-click clear affordance, and
  // prevents the error icon from being hidden when clearable+error coexist.
  const showClearBtn       = clearable && !visuallyLocked && currentValue.length > 0 && !hasError;
  const showPasswordToggle = isPassword && !disabled && !fieldLocked;
  const showErrorIcon      = hasError && !isPassword && !showPasswordToggle;
  const showTrailingCustom = !showClearBtn && !showPasswordToggle && !showErrorIcon && Boolean(trailingIcon);
  const hasLeading         = Boolean(leadingIcon) || (isSearch && !prefix);
  const hasTrailing        = showClearBtn || showPasswordToggle || showErrorIcon || showTrailingCustom;

  // ── Border colour ──────────────────────────────────────────────────────────
  const borderColor = visuallyLocked
    ? t.borderDisabled
    : hasError
      ? t.borderError
      : isFocused
        ? t.borderFocus
        : isHovered
          ? t.borderHover
          : t.borderDefault;

  // ── Event handlers ─────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!isControlled) setInternalValue(v);
    onChange?.(v);
  };

  const handleClear = () => {
    setIsClearing(true);
    const clearDuration = parseFloat(motionTokens.duration.base) * 1.5;
    setTimeout(() => {
      if (!isControlled) setInternalValue('');
      onChange?.('');
      setIsClearing(false);
      inputRef.current?.focus();
    }, clearDuration);
  };

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // ── aria-describedby composition ──────────────────────────────────────────
  const descIds = [
    hasError && errorId,
    !hasError && helperText && helperId,
    ariaDescribedBy,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  // ── Padding ────────────────────────────────────────────────────────────────
  const plCls = hasLeading || prefix ? sz.plAdornment : sz.plDefault;
  const prCls = hasTrailing || suffix ? sz.prAdornment : sz.prDefault;

  // ── Adornment shared style ─────────────────────────────────────────────────
  const adornmentStyle: React.CSSProperties = {
    backgroundColor: visuallyLocked ? t.disabledBg : t.adornmentBg,
    color:           t.adornmentText,
  };

  const labelEl = label ? (
    <label
      htmlFor={inputId}
      className={cn(sz.labelCls, visuallyLocked && 'opacity-50 cursor-not-allowed')}
      style={{ color: t.labelColor, ...(sz.labelFontSize ? { fontSize: sz.labelFontSize } : {}) }}
    >
      {label}
      {required && (
        <span aria-hidden className="ml-0.5" style={{ color: t.errorColor }}>*</span>
      )}
    </label>
  ) : null;

  // ── Shared input row slots ────────────────────────────────────────────────────
  // legendId is set for the outlined variant so the <input> has an accessible
  // name via aria-labelledby pointing to the <legend> element.
  const legendId = isOutlined && label ? `${inputId}-legend` : undefined;

  const inputSlots = (
    <>
      {/* Prefix adornment */}
      {prefix && (
        <span
          className={cn(
            'flex items-center shrink-0 select-none font-medium border-r',
            sz.inputHeight,
            sz.adornmentPx,
          )}
          style={{ ...adornmentStyle, borderColor: borderColor, fontSize: sz.adornmentFontSize }}
        >
          {prefix}
        </span>
      )}

      {/* Leading icon */}
      {(leadingIcon || isSearch) && !prefix && (
        <span
          className="flex items-center justify-center shrink-0 pl-3"
          style={{ color: hasError ? t.iconErrorColor : t.iconColor }}
        >
          <span className={sz.iconCls}>
            {leadingIcon ?? <SearchIcon />}
          </span>
        </span>
      )}

      {/* Native input */}
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type={computedType}
        value={currentValue}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        readOnly={readOnly || (!disabled && fieldLocked)}
        aria-label={ariaLabel}
        aria-labelledby={legendId}
        aria-describedby={descIds}
        aria-invalid={hasError ? true : undefined}
        aria-required={required ? true : undefined}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        className={cn(
          'flex-1 min-w-0 bg-transparent outline-none border-none appearance-none',
          'placeholder:text-[var(--if-placeholder)]',
          sz.inputHeight,
          sz.valueCls,
          plCls,
          prCls,
          visuallyLocked && (disabled ? 'cursor-not-allowed' : 'cursor-default'),
          isSearch && '[&::-webkit-search-cancel-button]:hidden',
          inputClassName,
        )}
        style={{
          color: visuallyLocked ? t.textDisabled : t.textValue,
          '--if-placeholder': t.textPlaceholder,
          fontSize: sz.valueFontSize,
          caretColor: t.borderFocus,
        } as React.CSSProperties}
      />

      {/* Trailing: clear button */}
      {showClearBtn && (
        <button
          type="button"
          onClick={handleClear}
          tabIndex={0}
          aria-label="Clear"
          className={cn(
            'flex items-center justify-center shrink-0 pr-3 transition-opacity hover:opacity-80',
            sz.iconWrapperW,
          )}
          style={{ color: t.iconColor }}
        >
          <span className={sz.iconCls}><ClearIcon /></span>
        </button>
      )}

      {/* Trailing: password toggle */}
      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          tabIndex={0}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className={cn(
            'flex items-center justify-center shrink-0 pr-3 transition-opacity hover:opacity-80',
            sz.iconWrapperW,
          )}
          style={{ color: t.iconColor }}
        >
          <span className={sz.iconCls}>
            {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </span>
        </button>
      )}

      {/* Trailing: error icon */}
      {showErrorIcon && (
        <span
          className={cn('flex items-center justify-center shrink-0 pr-3', sz.iconWrapperW)}
          style={{ color: t.iconErrorColor }}
        >
          <span className={sz.iconCls}><ErrorCircleIcon /></span>
        </span>
      )}

      {/* Trailing: custom icon */}
      {showTrailingCustom && (
        <span
          className={cn('flex items-center justify-center shrink-0 pr-3', sz.iconWrapperW)}
          style={{ color: t.iconColor }}
        >
          <span className={sz.iconCls}>{trailingIcon}</span>
        </span>
      )}

      {/* Suffix adornment */}
      {suffix && (
        <span
          className={cn(
            'flex items-center shrink-0 select-none font-medium border-l',
            sz.inputHeight,
            sz.adornmentPx,
          )}
          style={{ ...adornmentStyle, borderColor: borderColor, fontSize: sz.adornmentFontSize }}
        >
          {suffix}
        </span>
      )}
    </>
  );

  // ── Stacked container (div with border — used in stacked layout) ──────────────
  const inputContainer = (
    <div
      className={cn(
        'relative flex items-stretch border transition-colors duration-quick overflow-hidden w-full',
        visuallyLocked && (disabled ? 'cursor-not-allowed opacity-60' : 'cursor-default opacity-60'),
      )}
      style={{
        borderRadius:    radiusTokens.sm,
        borderColor:     borderColor,
        backgroundColor: visuallyLocked ? t.disabledBg : t.containerBg,
        borderWidth:     borderWidthTokens.thin,
        borderStyle:     'solid',
        boxShadow:       (isFocused && !visuallyLocked) ? `0 0 0 3px ${t.focusRing}` : undefined,
      }}
      onMouseEnter={() => !visuallyLocked && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {inputSlots}
      {/* Erase sweep — wipes right-to-left over the text when clearing */}
      {isClearing && (
        <motion.div
          aria-hidden
          initial={{ scaleX: 0, originX: 1 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: parseFloat(motionTokens.duration.base) / 1000, ease: motionTokens.easing.framer.easeOut }}
          style={{
            position: 'absolute', inset: 0,
            transformOrigin: 'right',
            backgroundColor: t.containerBg,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );

  const footerEl = (error || helperText || (showCharCount && maxLength)) ? (
    <div className={cn('flex items-center justify-between w-full', sz.helperCls)} style={{ fontSize: sz.helperFontSize }}>
      <span
        id={hasError ? errorId : helperId}
        role={hasError ? 'alert' : undefined}
        style={{ color: hasError ? t.errorColor : t.helperColor }}
      >
        {hasError ? error : helperText}
      </span>
      {showCharCount && maxLength && (
        <span
          className="shrink-0 ml-2 tabular-nums"
          aria-live="polite"
          style={{ color: hasError ? t.errorColor : t.helperColor }}
        >
          {currentValue.length}/{maxLength}
        </span>
      )}
    </div>
  ) : null;

  // ── Stacked layout: label above, then input container, then footer ──────────
  if (!isOutlined) {
    if (layout === 'horizontal') {
      return (
        <div className={cn('flex flex-col', className)}>
          <div className={cn('flex items-center', sz.gap)}>
            {labelEl && (
              <div className="w-36 shrink-0 flex items-center self-stretch">
                {labelEl}
              </div>
            )}
            <div className="flex-1 min-w-0">{inputContainer}</div>
          </div>
          {footerEl && <div className="ml-36">{footerEl}</div>}
        </div>
      );
    }
    return (
      <div className={cn('flex flex-col items-start', sz.gap, className)}>
        {labelEl}
        {inputContainer}
        {footerEl}
      </div>
    );
  }

  // ── Outlined layout: fieldset/legend — browser-native border notch ───────────
  // Using <fieldset> + <legend> is the only reliable CSS mechanism to place a
  // label ON a border line. The browser clips the fieldset's top border exactly
  // where the legend sits — no absolute positioning or margin tricks needed.
  return (
    <div className={cn('flex flex-col items-start w-full', className)}>
      <fieldset
        className={cn(
          'w-full transition-colors duration-quick',
          visuallyLocked && (disabled ? 'cursor-not-allowed opacity-60' : 'cursor-default opacity-60'),
        )}
        style={{
          // Reset browser fieldset defaults
          padding:         0,
          margin:          0,
          minInlineSize:   0,
          // Apply design-token border (inline style overrides browser groove default)
          borderRadius:    radiusTokens.sm,
          borderColor:     borderColor,
          borderWidth:     borderWidthTokens.thin,
          borderStyle:     'solid',
          backgroundColor: visuallyLocked ? t.disabledBg : t.containerBg,
          boxShadow:       (isFocused && !visuallyLocked) ? `0 0 0 3px ${t.focusRing}` : undefined,
        }}
        onMouseEnter={() => !visuallyLocked && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Legend creates the notch in the top border automatically */}
        {label && (
          <legend
            id={legendId}
            className={cn(sz.labelCls, visuallyLocked && 'opacity-50')}
            style={{
              marginLeft:   spacing[200],
              paddingLeft:  spacing[100],
              paddingRight: spacing[100],
              lineHeight:   1,
              color:       outlinedLabelColor,
              transition:  `color ${motionTokens.duration.quick} ${motionTokens.easing.easeOut}`,
              // Reset browser legend defaults
              display:     'block',
              float:       'none',
              ...(sz.labelFontSize ? { fontSize: sz.labelFontSize } : {}),
            }}
          >
            {label}
            {required && (
              <span aria-hidden className="ml-0.5" style={{ color: t.errorColor }}>*</span>
            )}
          </legend>
        )}

        {/* Input row */}
        <div className={cn('relative flex items-stretch w-full', sz.inputHeight)}>
          {inputSlots}
          {isClearing && (
            <motion.div
              aria-hidden
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: parseFloat(motionTokens.duration.base) / 1000, ease: motionTokens.easing.framer.easeOut }}
              style={{
                position: 'absolute', inset: 0,
                transformOrigin: 'right',
                backgroundColor: t.containerBg,
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </fieldset>
      {footerEl}
    </div>
  );
}

InputField.displayName = 'InputField';

export { InputField };
export default InputField;
