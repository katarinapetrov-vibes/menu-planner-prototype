'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from './utils';
import { useFieldLocked } from './field-locked-context';
import { components, typography, opacity } from '@/lib/tokens';

export type ToggleDensity = 'compact' | 'default' | 'comfortable';
export type ToggleTheme   = 'light' | 'dark';

export interface ToggleProps {
  /** Controlled checked state */
  checked?:            boolean;
  defaultChecked?:     boolean;
  onChange?:           (checked: boolean) => void;
  disabled?:           boolean;
  /** Error state — renders track in error colours */
  error?:              boolean;
  /** Density variant — controls gap and padding. Default: 'default' */
  density?:            ToggleDensity;
  /** Canvas theme — affects track colour and label text colour */
  theme?:              ToggleTheme;
  label?:              React.ReactNode;
  /** Whether to render the label text. Defaults to true. */
  showLabel?:          boolean;
  labelPosition?:      'left' | 'right';
  id?:                 string;
  name?:               string;
  className?:          string;
  'aria-label'?:       string;
  'aria-describedby'?: string;
}

// ─── Track + Thumb dimensions (fixed — density only affects gap/padding) ──────
// Track: 32×20 px | borderRadius: 12 px (pill)
// Thumb: 16×16 px | off x: 2 px | on x: 14 px
const TRACK_W    = 'w-8';   // 32 px
const TRACK_H    = 'h-5';   // 20 px
const THUMB_W    = 'w-4';   // 16 px
const THUMB_H    = 'h-4';   // 16 px
const THUMB_X_OFF = components.toggle.thumb.xOff;
const THUMB_X_ON  = components.toggle.thumb.xOn;

// ─── Density tokens ────────────────────────────────────────────────────────────
// compact: gap 4 px, p 2 px | default: gap 8 px, p 4 px | comfortable: gap 12 px, p 12 px
const densityTokens: Record<ToggleDensity, { gap: string; padding: string; fontSize: string }> = {
  compact:     { gap: 'gap-1.5', padding: 'p-0.5', fontSize: typography.fontSize.md },
  default:     { gap: 'gap-2',   padding: 'p-1',   fontSize: typography.fontSize.md },
  comfortable: { gap: 'gap-3',   padding: 'p-3',   fontSize: typography.fontSize.md },
};

// ─── Toggle ────────────────────────────────────────────────────────────────────

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      checked,
      defaultChecked  = false,
      onChange,
      disabled        = false,
      error           = false,
      density         = 'default',
      theme           = 'light',
      label,
      showLabel       = true,
      labelPosition   = 'right',
      id,
      name,
      className,
      'aria-label':       ariaLabel,
      'aria-describedby': ariaDescribedBy,
    },
    ref
  ) => {
    const fieldLocked = useFieldLocked();
    const isDisabled = disabled || fieldLocked;
    const isControlled = checked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isOn   = isControlled ? checked : internalChecked;
    const isDark = theme === 'dark';
    const hasLabel = !!(label && showLabel);
    const tc = components.toggle.colour[theme];

    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleToggle = () => {
      if (isDisabled) return;
      const next = !isOn;
      if (!isControlled) setInternalChecked(next);
      onChange?.(next);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleToggle();
      }
    };

    // ─── Derived colours ───────────────────────────────────────────────────────
    const trackBg = error
      ? tc.errorTrack
      : isOn
        ? (isPressed || isHovered) ? tc.trackOnHover : tc.trackOn
        : isHovered ? tc.trackOffHover : tc.trackOff;

    const trackBorder = error
      ? tc.errorBorder
      : isOn
        ? isPressed ? tc.pressedOnBorder : tc.trackOnBorder
        : tc.trackOffBorder;

    const thumbColor = error
      ? tc.errorThumb
      : isOn
        ? isPressed ? tc.pressedOnThumb : tc.thumbOn
        : tc.thumbOff;

    // ─── Focus ring ────────────────────────────────────────────────────────────
    const focusBoxShadow = isFocused && !isDisabled
      ? isDark
        ? `0 0 0 2px ${(tc as typeof components.toggle.colour.dark).focusRingOffset}, 0 0 0 4px ${tc.focusRing}`
        : `0 0 0 2px ${tc.focusRing}`
      : undefined;

    const dt = densityTokens[density];

    // ─── Track element ─────────────────────────────────────────────────────────
    const trackEl = (
      <button
        ref={ref}
        type="button"
        role="switch"
        id={id}
        name={name}
        aria-checked={isOn}
        aria-invalid={error || undefined}
        aria-label={hasLabel ? undefined : ariaLabel}
        aria-describedby={ariaDescribedBy}
        disabled={isDisabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => { if (!isDisabled) setIsHovered(true); }}
        onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
        onMouseDown={() => { if (!isDisabled) setIsPressed(true); }}
        onMouseUp={() => setIsPressed(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          backgroundColor: trackBg,
          borderColor: trackBorder,
          ...(focusBoxShadow ? { boxShadow: focusBoxShadow } : {}),
        }}
        className={cn(
          'relative inline-flex shrink-0 items-center rounded-full border',
          'transition-colors duration-base ease-in-out',
          'focus:outline-none',
          'disabled:cursor-not-allowed',
          TRACK_W,
          TRACK_H,
        )}
      >
        {/* Thumb */}
        <motion.span
          aria-hidden
          className={cn(
            'pointer-events-none inline-block rounded-full shadow-sm',
            THUMB_W,
            THUMB_H,
          )}
          style={{ backgroundColor: thumbColor }}
          animate={{ x: isOn ? THUMB_X_ON : THUMB_X_OFF }}
          transition={{ type: 'spring', stiffness: components.toggle.animation.stiffness, damping: components.toggle.animation.damping }}
        />
      </button>
    );

    // ─── No-label variant ──────────────────────────────────────────────────────
    if (!hasLabel) {
      return (
        <span className={cn('inline-flex', className)} style={isDisabled ? { opacity: opacity.half } : undefined}>
          {trackEl}
        </span>
      );
    }

    // ─── Labeled variant ───────────────────────────────────────────────────────
    const labelEl = (
      <span
        style={{ fontFamily: typography.fontFamily.body, color: tc.labelText, fontSize: dt.fontSize }}
        className="font-semibold select-none"
      >
        {label}
      </span>
    );

    return (
      <label
        htmlFor={id}
        className={cn(
          'inline-flex items-center rounded-xl',
          'cursor-pointer',
          dt.gap,
          dt.padding,
          isDisabled && 'cursor-not-allowed',
          className,
        )}
        style={isDisabled ? { opacity: opacity.half } : undefined}
      >
        {labelPosition === 'left' && labelEl}
        {trackEl}
        {labelPosition === 'right' && labelEl}
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle };
export default Toggle;
