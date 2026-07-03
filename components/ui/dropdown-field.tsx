'use client';

import React, { useState, useId, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from './utils';
import { useFieldLocked } from './field-locked-context';
import { typography, motion as motionTokens, semantic, spacing, radius } from '@/lib/tokens';
import { InputChip, DisplayChip } from './chip';
import { Checkbox } from './checkbox';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DropdownFieldSize  = 'sm' | 'md' | 'lg';
export type DropdownFieldTheme = 'light' | 'dark';

export interface DropdownOption {
  /** Display text for the option */
  label:     string;
  /** Value passed to onChange */
  value:     string;
  /** Prevents the option from being selected */
  disabled?: boolean;
  /**
   * Optional icon rendered to the left of the label in the options panel.
   * When the option is selected, this icon also replaces the static `leadingIcon`
   * in the trigger — useful for dynamic indicators like country flags.
   */
  icon?:     React.ReactNode;
}

export interface DropdownFieldProps {
  /** Label rendered above the trigger */
  label?:              string;
  /** Placeholder shown when no option is selected */
  placeholder?:        string;
  /** List of selectable options */
  options:             DropdownOption[];
  /**
   * Enable multi-select mode. Selected values are displayed as chips.
   * Default: false
   */
  multi?:              boolean;
  /**
   * Controlled value.
   * Single-select: string. Multi-select: string[].
   */
  value?:              string | string[];
  /**
   * Uncontrolled initial value.
   * Single-select: string. Multi-select: string[]. Default: '' / []
   */
  defaultValue?:       string | string[];
  /**
   * Change handler.
   * Single-select: receives string. Multi-select: receives string[].
   */
  onChange?:           (value: string | string[]) => void;
  /** Size variant — controls height, padding, and type scale. Default: 'md' */
  size?:               DropdownFieldSize;
  /** Theme — controls colour tokens. Default: 'light' */
  theme?:              DropdownFieldTheme;
  /** Error message; triggers the error state and replaces helperText when set */
  error?:              string;
  /** Supporting helper text shown below the field (hidden when error is set) */
  helperText?:         string;
  /** Disables the dropdown. Default: false */
  disabled?:           boolean;
  /** View-only: cannot open or change; same chrome as disabled. Default: false */
  readOnly?:           boolean;
  /** Marks the field as required — appends * to the label. Default: false */
  required?:           boolean;
  /** Optional leading icon (size-matched per the size prop) */
  leadingIcon?:        React.ReactNode;
  /** Optional trailing icon rendered between the selected value and the chevron */
  trailingIcon?:       React.ReactNode;
  /** Shows a clear (×) button when a value is selected, allowing the user to reset. Default: false */
  clearable?:          boolean;
  /** Shows a selected-count badge "(N)" to the left of the chevron. Default: false */
  showCount?:          boolean;
  /** Renders a search input at the top of the panel to filter options. Default: false */
  searchable?:         boolean;
  /** HTML id — auto-generated via useId() if omitted */
  id?:                 string;
  /** HTML name attribute (for hidden form input) */
  name?:               string;
  /** Extra class applied to the outer wrapper div */
  className?:          string;
  /**
   * Label layout direction.
   * - `'stacked'` (default): label above the trigger.
   * - `'horizontal'`: label to the left of the trigger.
   */
  layout?:             'stacked' | 'horizontal';
  'aria-label'?:       string;
  'aria-describedby'?: string;
}

// ─── Design Tokens ────────────────────────────────────────────────────────────
// Enterprise DS v3 — Figma node 45470-10660

const tokens = {
  light: {
    containerBg:        '#FFFFFF',
    borderDefault:      '#E4E4E4',
    borderHover:        '#BBBBBB',
    borderFocus:        '#067A46',
    borderError:        '#B30000',
    borderDisabled:     '#E4E4E4',
    disabledBg:         '#F8F8F8',
    textValue:          '#242424',
    textPlaceholder:    '#BBBBBB',
    textDisabled:       '#BBBBBB',
    labelColor:         '#4B4B4B',
    helperColor:        '#676767',
    errorColor:         '#B30000',
    iconColor:          '#676767',
    iconErrorColor:     '#B30000',
    focusOutline:       '#067A46',
    panelBg:            '#FFFFFF',
    panelBorder:        '#E4E4E4',
    panelShadow:        '0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
    optionText:         semantic.foreground.default.primary.light,
    optionDisabledText: '#BBBBBB',
    optionHoverBg:      semantic.background.neutral.defaultSubtle.light,
    optionSelectedBg:   semantic.background.positive.defaultSubtle.light,
    optionSelectedText: semantic.border.positive.light,
  },
  dark: {
    containerBg:        '#242424',
    borderDefault:      '#4B4B4B',
    borderHover:        '#676767',
    borderFocus:        '#96DC14',
    borderError:        '#FF7575',
    borderDisabled:     '#4B4B4B',
    disabledBg:         '#242424',
    textValue:          '#E4E4E4',
    textPlaceholder:    '#BBBBBB',
    textDisabled:       '#4B4B4B',
    labelColor:         '#BBBBBB',
    helperColor:        '#BBBBBB',
    errorColor:         '#FF7575',
    iconColor:          '#BBBBBB',
    iconErrorColor:     '#FF7575',
    focusOutline:       '#96DC14',
    panelBg:            '#242424',
    panelBorder:        '#4B4B4B',
    panelShadow:        '0 4px 20px rgba(0,0,0,0.50), 0 1px 4px rgba(0,0,0,0.30)',
    optionText:         '#E4E4E4',
    optionDisabledText: '#4B4B4B',
    optionHoverBg:      '#242424',
    optionSelectedBg:   '#1A2E1A',
    optionSelectedText: '#96DC14',
  },
} as const;

// ─── Size Tokens ──────────────────────────────────────────────────────────────
// sm: 32 px  |  md: 40 px  |  lg: 48 px

const sizeTokens: Record<
  DropdownFieldSize,
  {
    triggerHeight:  string;
    // Multi-select: min-height + padding so chips center on the first row
    multiMinH:      string;
    multiPy:        string;
    multiChevronPt: string;
    plDefault:      string;
    prDefault:      string;
    plLeading:      string;
    iconCls:        string;
    iconWrapperW:   string;
    labelCls:       string;
    valueCls:       string;
    helperCls:      string;
    helperFontSize?: string;
    gap:            string;
    optionPadding:  string;
    checkCls:       string;
    chipSize:       'sm' | 'md';
    valueFontSize:  string;
    labelFontSize?: string;
    optionFontSize: string;
  }
> = {
  sm: {
    triggerHeight:  'h-8',
    multiMinH:      'min-h-8',
    multiPy:        'py-1',
    multiChevronPt: 'pt-1',
    plDefault:      'pl-3',
    prDefault:      'pr-3',
    plLeading:      'pl-2',
    iconCls:        'w-4 h-4 shrink-0',
    iconWrapperW:   'w-8',
    labelCls:       'font-medium leading-4',
    labelFontSize:  typography.fontSize.sm,
    valueCls:       'leading-5',
    helperCls:      'leading-4 mt-1',
    helperFontSize: typography.fontSize.sm,
    gap:            'gap-1',
    optionPadding:  'px-3 py-1.5',
    checkCls:       'w-4 h-4',
    chipSize:       'md',
    valueFontSize:  typography.fontSize.md,
    optionFontSize: typography.fontSize.md,
  },
  md: {
    triggerHeight:  'h-10',
    multiMinH:      'min-h-10',
    multiPy:        'py-2',
    multiChevronPt: 'pt-2',
    plDefault:      'pl-3',
    prDefault:      'pr-3',
    plLeading:      'pl-2',
    iconCls:        'w-[18px] h-[18px] shrink-0',
    iconWrapperW:   'w-10',
    labelCls:       'font-medium leading-5',
    valueCls:       'leading-5',
    helperCls:      'leading-4 mt-1',
    helperFontSize: typography.fontSize.sm,
    gap:            'gap-1.5',
    optionPadding:  'px-3 py-2',
    checkCls:       'w-[18px] h-[18px]',
    chipSize:       'md',
    valueFontSize:  typography.fontSize.md,
    labelFontSize:  typography.fontSize.md,
    optionFontSize: typography.fontSize.md,
  },
  lg: {
    triggerHeight:  'h-12',
    multiMinH:      'min-h-12',
    multiPy:        'py-2.5',
    multiChevronPt: 'pt-2.5',
    plDefault:      'pl-4',
    prDefault:      'pr-4',
    plLeading:      'pl-3',
    iconCls:        'w-5 h-5 shrink-0',
    iconWrapperW:   'w-12',
    labelCls:       'font-medium leading-5',
    valueCls:       'leading-6',
    helperCls:      'leading-4 mt-1',
    helperFontSize: typography.fontSize.sm,
    gap:            'gap-1.5',
    optionPadding:  'px-4 py-2.5',
    checkCls:       'w-5 h-5',
    chipSize:       'md',
    valueFontSize:  typography.fontSize.md,
    labelFontSize:  typography.fontSize.md,
    optionFontSize: typography.fontSize.md,
  },
};

// ─── Inline Icon SVGs ─────────────────────────────────────────────────────────

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden>
      <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden>
      <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden>
      <path d="M4 10.5l4 4L16 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toArray(v: string | string[] | undefined): string[] {
  if (v === undefined || v === '') return [];
  return Array.isArray(v) ? v : [v];
}

// ─── DropdownField (main export) ──────────────────────────────────────────────

function DropdownField({
  label,
  placeholder = 'Select an option',
  options,
  multi = false,
  value: controlledValue,
  defaultValue,
  onChange,
  size = 'md',
  theme = 'light',
  error,
  helperText,
  disabled = false,
  readOnly = false,
  required = false,
  leadingIcon,
  trailingIcon,
  clearable = false,
  showCount = false,
  searchable = false,
  id: providedId,
  name,
  className,
  layout = 'stacked',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: DropdownFieldProps) {
  const generatedId = useId();
  const fieldId     = providedId ?? generatedId;
  const listboxId   = `${fieldId}-listbox`;
  const helperId    = `${fieldId}-helper`;
  const errorId     = `${fieldId}-error`;
  const labelId     = `${fieldId}-label`;

  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const t  = tokens[theme];
  const sz = sizeTokens[size];
  const prefersReducedMotion = useReducedMotion();

  const [internalValues, setInternalValues] = useState<string[]>(() => toArray(defaultValue));
  const [isOpen,         setIsOpen]         = useState(false);
  const [focusedIndex,   setFocusedIndex]   = useState(-1);
  const [isHovered,      setIsHovered]      = useState(false);
  const [panelPos,       setPanelPos]       = useState<{ top?: number; bottom?: number; left: number; width: number } | null>(null);
  const [searchQuery,    setSearchQuery]    = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = searchable && searchQuery
    ? options.filter(o => o.label.toLowerCase().startsWith(searchQuery.toLowerCase()))
    : options;

  const isControlled    = controlledValue !== undefined;
  const currentValues   = isControlled ? toArray(controlledValue) : internalValues;

  // Derived — single-select helpers
  const selectedOption  = multi ? undefined : options.find((o) => o.value === currentValues[0]);
  // Multi-select helpers
  // Preserve insertion order — map each selected value to its option in the order it was selected
  const selectedOptions = multi
    ? currentValues.map((v) => options.find((o) => o.value === v)).filter(Boolean) as typeof options
    : [];

  const hasError  = Boolean(error);
  const hasChips  = multi && selectedOptions.length > 0;

  const fieldLockedCtx = useFieldLocked();
  const locked = disabled || readOnly || fieldLockedCtx;

  useEffect(() => {
    if (locked) {
      setIsOpen(false);
      setFocusedIndex(-1);
      setSearchQuery('');
    }
  }, [locked]);

  // ── Border colour ──────────────────────────────────────────────────────────
  const borderColor = locked
    ? t.borderDisabled
    : hasError
      ? t.borderError
      : isOpen
        ? t.borderFocus
        : isHovered
          ? t.borderHover
          : t.borderDefault;

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !panelRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // ── Focus the active option after panel opens ──────────────────────────────
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      optionRefs.current[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const openDropdown = useCallback(() => {
    if (locked) return;
    setIsOpen(true);
    setSearchQuery('');
    const firstSelected = options.findIndex((o) => !o.disabled && currentValues.includes(o.value));
    setFocusedIndex(firstSelected >= 0 ? firstSelected : options.findIndex((o) => !o.disabled));
    if (searchable) setTimeout(() => searchInputRef.current?.focus(), 10);
  }, [locked, options, currentValues, searchable]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    setPanelPos(null);
    setSearchQuery('');
    triggerRef.current?.focus();
  }, []);

  const updatePanelPos = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const panelHeight = 248; // max-h-60 (240) + padding
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < panelHeight && rect.top > panelHeight) {
      setPanelPos({ bottom: window.innerHeight - rect.top + 4, left: rect.left, width: rect.width });
    } else {
      setPanelPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePanelPos();
    window.addEventListener('scroll', updatePanelPos, true);
    window.addEventListener('resize', updatePanelPos);
    return () => {
      window.removeEventListener('scroll', updatePanelPos, true);
      window.removeEventListener('resize', updatePanelPos);
    };
  }, [isOpen, updatePanelPos]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const empty = multi ? [] : '';
      if (!isControlled) setInternalValues([]);
      onChange?.(empty);
      setIsOpen(false);
    },
    [multi, isControlled, onChange],
  );

  const handleOptionSelect = useCallback(
    (option: DropdownOption) => {
      if (option.disabled) return;
      if (multi) {
        const newValues = currentValues.includes(option.value)
          ? currentValues.filter((v) => v !== option.value)
          : [...currentValues, option.value];
        if (!isControlled) setInternalValues(newValues);
        onChange?.(newValues);
        // Panel stays open in multi mode
      } else {
        if (!isControlled) setInternalValues([option.value]);
        onChange?.(option.value);
        closeDropdown();
      }
    },
    [multi, currentValues, isControlled, onChange, closeDropdown],
  );

  const handleChipRemove = useCallback(
    (value: string) => {
      const newValues = currentValues.filter((v) => v !== value);
      if (!isControlled) setInternalValues(newValues);
      onChange?.(newValues);
    },
    [currentValues, isControlled, onChange],
  );

  // ── Trigger keyboard interaction ───────────────────────────────────────────
  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        isOpen ? closeDropdown() : openDropdown();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else {
          const next = options.findIndex((o, i) => i > focusedIndex && !o.disabled);
          if (next >= 0) setFocusedIndex(next);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else {
          const prev = [...options].map((o, i) => (!o.disabled && i < focusedIndex ? i : -1)).filter((i) => i >= 0);
          if (prev.length > 0) setFocusedIndex(prev[prev.length - 1]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeDropdown();
        break;
      case 'Tab':
        if (isOpen) closeDropdown();
        break;
    }
  };

  // ── Option keyboard interaction ────────────────────────────────────────────
  const handleOptionKeyDown = (
    e: React.KeyboardEvent<HTMLLIElement>,
    option: DropdownOption,
    index: number,
  ) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleOptionSelect(option);
        break;
      case 'ArrowDown': {
        e.preventDefault();
        const next = filteredOptions.findIndex((o, i) => i > index && !o.disabled);
        if (next >= 0) setFocusedIndex(next);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = [...filteredOptions].map((o, i) => (!o.disabled && i < index ? i : -1)).filter((i) => i >= 0);
        if (prev.length > 0) setFocusedIndex(prev[prev.length - 1]);
        else triggerRef.current?.focus();
        break;
      }
      case 'Escape':
        e.preventDefault();
        closeDropdown();
        break;
      case 'Tab':
        closeDropdown();
        break;
    }
  };

  // ── aria-describedby composition ──────────────────────────────────────────
  const descIds =
    [hasError && errorId, !hasError && helperText && helperId, ariaDescribedBy]
      .filter(Boolean)
      .join(' ') || undefined;

  const hasLeadingSlot = Boolean(leadingIcon) || Boolean(selectedOption?.icon);
  const plCls = hasLeadingSlot ? sz.plLeading : sz.plDefault;

  // ── Trigger shared styles (used by horizontal layout) ────────────────────
  const triggerSharedStyle: React.CSSProperties = {
    borderRadius:    '8px',
    borderColor:     borderColor,
    backgroundColor: locked ? t.disabledBg : t.containerBg,
    borderWidth:     '1px',
    borderStyle:     'solid',
    outlineColor:    t.focusOutline,
  };

  // ── Fieldset style — carries border + focus ring (mirrors InputField outlined) ─
  const fieldsetStyle: React.CSSProperties = {
    padding:         0,
    margin:          0,
    minInlineSize:   0,
    borderRadius:    '8px',
    borderColor:     borderColor,
    backgroundColor: locked ? t.disabledBg : t.containerBg,
    borderWidth:     '1px',
    borderStyle:     'solid',
    boxShadow:       isOpen && !locked ? `0 0 0 3px ${t.focusOutline}66` : undefined,
    transition:      `border-color ${motionTokens.duration.quick} ${motionTokens.easing.easeOut}, box-shadow ${motionTokens.duration.quick} ${motionTokens.easing.easeOut}`,
  };

  const labelEl = label ? (
    <label
      id={labelId}
      htmlFor={fieldId}
      className={cn(sz.labelCls, locked && 'opacity-50 cursor-not-allowed')}
      style={{ color: t.labelColor, ...(sz.labelFontSize ? { fontSize: sz.labelFontSize } : {}) }}
    >
      {label}
      {required && (
        <span aria-hidden className="ml-0.5" style={{ color: t.errorColor }}>*</span>
      )}
    </label>
  ) : null;

  if (layout === 'horizontal') {
    return (
      <div className={cn('flex flex-col', className)}>
        <div className={cn('flex items-center', sz.gap)}>
          {labelEl && (
            <div className="w-36 shrink-0 flex items-center self-stretch">
              {labelEl}
            </div>
          )}
          <div className="flex-1 min-w-0 relative">
            {/* ── Single-select trigger ── */}
            {!multi && (
              <div
                ref={triggerRef}
                id={fieldId}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={isOpen ? listboxId : undefined}
                aria-labelledby={label ? labelId : undefined}
                aria-label={!label ? ariaLabel : undefined}
                aria-describedby={descIds}
                aria-required={required ? true : undefined}
                aria-invalid={hasError ? true : undefined}
                aria-disabled={locked ? true : undefined}
                tabIndex={locked ? -1 : 0}
                className={cn(
                  'relative w-full flex items-center border transition-colors duration-quick overflow-hidden text-left',
                  sz.triggerHeight,
                  locked && 'cursor-default opacity-60',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]',
                )}
                style={triggerSharedStyle}
                onClick={() => { if (locked) return; if (searchable) { searchInputRef.current?.focus(); if (!isOpen) openDropdown(); } else { isOpen ? closeDropdown() : openDropdown(); } }}
                onKeyDown={!searchable ? handleTriggerKeyDown : undefined}
                onMouseEnter={() => !locked && setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {(selectedOption?.icon ?? leadingIcon) && (
                  <span className="flex items-center justify-center shrink-0 pl-3" style={{ color: hasError ? t.iconErrorColor : t.iconColor }}>
                    <span className={cn(sz.iconCls, 'flex items-center justify-center')}>{selectedOption?.icon ?? leadingIcon}</span>
                  </span>
                )}
                {searchable ? (
                  <input
                    ref={searchInputRef}
                    value={isOpen ? searchQuery : (selectedOption?.label ?? '')}
                    onChange={(e) => { setSearchQuery(e.target.value); if (!isOpen) { setIsOpen(true); updatePanelPos(); } setFocusedIndex(0); }}
                    onFocus={() => { if (!isOpen) openDropdown(); }}
                    onKeyDown={handleTriggerKeyDown}
                    placeholder={isOpen && selectedOption ? selectedOption.label : placeholder}
                    disabled={locked}
                    className={cn('flex-1 min-w-0 bg-transparent border-none outline-none truncate', sz.valueCls, plCls, 'pr-2')}
                    style={{ color: !isOpen && selectedOption ? (locked ? t.textDisabled : t.textValue) : isOpen && searchQuery ? t.textValue : t.textPlaceholder, cursor: locked ? 'not-allowed' : 'text', fontSize: sz.valueFontSize }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className={cn('flex-1 min-w-0 truncate', sz.valueCls, plCls, 'pr-2')} style={{ color: selectedOption ? (locked ? t.textDisabled : t.textValue) : t.textPlaceholder, fontSize: sz.valueFontSize }}>
                    {selectedOption ? selectedOption.label : placeholder}
                  </span>
                )}
                {trailingIcon && (
                  <span className="flex items-center justify-center shrink-0 pr-1" style={{ color: t.iconColor }}>
                    <span className={sz.iconCls}>{trailingIcon}</span>
                  </span>
                )}
                {showCount && currentValues.length > 0 && (
                  <span aria-hidden style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: semantic.background.neutral.defaultSubtle.light, borderRadius: radius.round, padding: `2px ${spacing[200]}`, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: semantic.foreground.default.secondary.light, flexShrink: 0, lineHeight: '16px' }}>
                    +{currentValues.length}
                  </span>
                )}
                {clearable && currentValues.length > 0 && !locked && (
                  <button type="button" onClick={handleClear} className="flex items-center justify-center shrink-0 pr-1 hover:opacity-70 transition-opacity focus:outline-none" style={{ color: t.iconColor }} aria-label="Clear selection">
                    <span className={sz.iconCls}><ClearIcon /></span>
                  </button>
                )}
                <span className="flex items-center justify-center shrink-0 pl-1 pr-3" style={{ color: hasError ? t.iconErrorColor : t.iconColor }}>
                  <motion.span className={sz.iconCls} animate={{ rotate: hasError ? 0 : isOpen ? 180 : 0 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: parseFloat(motionTokens.duration.base) / 1000, ease: motionTokens.easing.framer.easeInOut }}>
                    {hasError ? <ErrorCircleIcon /> : <ChevronDownIcon />}
                  </motion.span>
                </span>
              </div>
            )}
          </div>
        </div>
        {(error || helperText) && (
          <div className="ml-36">
            <span id={hasError ? errorId : helperId} role={hasError ? 'alert' : undefined} className={sz.helperCls} style={{ color: hasError ? t.errorColor : t.helperColor }}>
              {hasError ? error : helperText}
            </span>
          </div>
        )}
        {typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {isOpen && panelPos && (
              <motion.div
                ref={panelRef}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6, transition: { duration: parseFloat(motionTokens.duration.quick) / 1000, ease: motionTokens.easing.framer.easeIn } }}
                transition={prefersReducedMotion ? { duration: 0 } : { opacity: { duration: parseFloat(motionTokens.duration.fast) / 1000, ease: motionTokens.easing.framer.easeOut }, y: { type: 'spring' as const, ...motionTokens.spring.panel } }}
                className="overflow-hidden"
                style={{ position: 'fixed', ...(panelPos.bottom !== undefined ? { bottom: panelPos.bottom } : { top: panelPos.top }), left: panelPos.left, width: panelPos.width, zIndex: 9999, borderRadius: '8px', border: `1px solid ${t.panelBorder}`, backgroundColor: t.panelBg, boxShadow: t.panelShadow }}
              >
                <ul id={listboxId} role="listbox" aria-label={label ?? ariaLabel ?? 'Options'} aria-multiselectable={multi ? true : undefined} aria-activedescendant={focusedIndex >= 0 ? `${fieldId}-opt-${focusedIndex}` : undefined} className="py-1 max-h-60 overflow-y-auto">
                  {filteredOptions.length === 0 && <li className="px-3 py-2" style={{ color: t.textPlaceholder, fontSize: typography.fontSize.md }}>No results</li>}
                  {filteredOptions.map((option, index) => {
                    const isSelected = currentValues.includes(option.value);
                    const isFocused  = index === focusedIndex;
                    return (
                      <li key={option.value} id={`${fieldId}-opt-${index}`} ref={(el) => { optionRefs.current[index] = el; }} role="option" aria-selected={isSelected} aria-disabled={option.disabled ? true : undefined} tabIndex={option.disabled ? -1 : 0}
                        className={cn('flex items-center justify-between select-none transition-colors duration-fast outline-none', sz.optionPadding, option.disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
                        style={{ color: option.disabled ? t.optionDisabledText : isSelected ? t.optionSelectedText : t.optionText, backgroundColor: isSelected ? t.optionSelectedBg : isFocused ? t.optionHoverBg : 'transparent', fontSize: sz.optionFontSize }}
                        onClick={() => !option.disabled && handleOptionSelect(option)}
                        onKeyDown={(e) => handleOptionKeyDown(e, option, index)}
                        onMouseEnter={() => !option.disabled && setFocusedIndex(index)}
                        onMouseLeave={() => setFocusedIndex(-1)}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          {multi && <span className="pointer-events-none flex-shrink-0"><Checkbox checked={isSelected} size="sm" onChange={() => {}} theme={theme} /></span>}
                          {option.icon && <span className={cn('shrink-0 flex items-center justify-center', sz.iconCls)} aria-hidden>{option.icon}</span>}
                          <span className="truncate">{option.label}</span>
                        </span>
                        {!multi && isSelected && <span className={cn(sz.checkCls, 'shrink-0 ml-2')} style={{ color: t.optionSelectedText }}><CheckIcon /></span>}
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
        {name && !multi && <input type="hidden" name={name} value={currentValues[0] ?? ''} />}
        {name && multi && currentValues.map((v, i) => <input key={i} type="hidden" name={`${name}[]`} value={v} />)}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>

      {/* ── Fieldset — label notches into the top border (mirrors InputField outlined) ── */}
      <fieldset
        className={cn('relative w-full', locked && 'cursor-default opacity-60')}
        style={fieldsetStyle}
        onMouseEnter={() => !locked && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {label && (
          <legend
            id={labelId}
            className={cn(sz.labelCls, locked && 'opacity-50')}
            style={{
              marginLeft:      '8px',
              paddingLeft:      '4px',
              paddingRight:     '4px',
              lineHeight:       1,
              color:            locked ? t.labelColor : hasError ? t.errorColor : isOpen ? t.borderFocus : t.labelColor,
              transition:       `color ${motionTokens.duration.quick} ${motionTokens.easing.easeOut}`,
              display:          'block',
              float:            'none',
              ...(sz.labelFontSize ? { fontSize: sz.labelFontSize } : {}),
            }}
          >
            {label}
            {required && (
              <span aria-hidden className="ml-0.5" style={{ color: t.errorColor }}>*</span>
            )}
          </legend>
        )}

      {/* ── Trigger + Panel wrapper ── */}
      <div className="relative">

        {/* ── Single-select trigger ── */}
        {!multi && (
          <div
            ref={triggerRef}
            id={fieldId}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
            aria-labelledby={label ? labelId : undefined}
            aria-label={!label ? ariaLabel : undefined}
            aria-describedby={descIds}
            aria-required={required ? true : undefined}
            aria-invalid={hasError ? true : undefined}
            aria-disabled={locked ? true : undefined}
            tabIndex={locked ? -1 : 0}
            className={cn(
              'relative w-full flex items-center overflow-hidden text-left outline-none',
              sz.triggerHeight,
            )}
            onClick={() => { if (locked) return; if (searchable) { searchInputRef.current?.focus(); if (!isOpen) openDropdown(); } else { isOpen ? closeDropdown() : openDropdown(); } }}
            onKeyDown={!searchable ? handleTriggerKeyDown : undefined}
          >
            {(selectedOption?.icon ?? leadingIcon) && (
              <span
                className="flex items-center justify-center shrink-0 pl-3"
                style={{ color: hasError ? t.iconErrorColor : t.iconColor }}
              >
                <span className={cn(sz.iconCls, 'flex items-center justify-center')}>{selectedOption?.icon ?? leadingIcon}</span>
              </span>
            )}
            {searchable ? (
              <input
                ref={searchInputRef}
                value={isOpen ? searchQuery : (selectedOption?.label ?? '')}
                onChange={(e) => { setSearchQuery(e.target.value); if (!isOpen) { setIsOpen(true); updatePanelPos(); } setFocusedIndex(0); }}
                onFocus={() => { if (!isOpen) openDropdown(); }}
                onKeyDown={handleTriggerKeyDown}
                placeholder={isOpen && selectedOption ? selectedOption.label : placeholder}
                disabled={locked}
                className={cn('flex-1 min-w-0 bg-transparent border-none outline-none truncate', sz.valueCls, plCls, 'pr-2')}
                style={{ color: !isOpen && selectedOption ? (locked ? t.textDisabled : t.textValue) : isOpen && searchQuery ? t.textValue : t.textPlaceholder, cursor: locked ? 'not-allowed' : 'text', fontSize: sz.valueFontSize }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className={cn('flex-1 min-w-0 truncate', sz.valueCls, plCls, 'pr-2')}
                style={{ color: selectedOption ? (locked ? t.textDisabled : t.textValue) : t.textPlaceholder, fontSize: sz.valueFontSize }}
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            )}
            {trailingIcon && (
              <span
                className="flex items-center justify-center shrink-0 pr-1"
                style={{ color: t.iconColor }}
              >
                <span className={sz.iconCls}>{trailingIcon}</span>
              </span>
            )}
            {showCount && currentValues.length > 0 && (
              <span aria-hidden style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: semantic.background.neutral.defaultSubtle.light, borderRadius: radius.round, padding: `2px ${spacing[200]}`, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: semantic.foreground.default.secondary.light, flexShrink: 0, lineHeight: '16px' }}>
                +{currentValues.length}
              </span>
            )}
            {clearable && currentValues.length > 0 && !locked && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center justify-center shrink-0 pr-1 hover:opacity-70 transition-opacity focus:outline-none"
                style={{ color: t.iconColor }}
                aria-label="Clear selection"
              >
                <span className={sz.iconCls}><ClearIcon /></span>
              </button>
            )}
            <span
              className="flex items-center justify-center shrink-0 pl-1 pr-3"
              style={{ color: hasError ? t.iconErrorColor : t.iconColor }}
            >
              <motion.span
                className={sz.iconCls}
                animate={{ rotate: hasError ? 0 : isOpen ? 180 : 0 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: parseFloat(motionTokens.duration.base) / 1000, ease: motionTokens.easing.framer.easeInOut }
                }
              >
                {hasError ? <ErrorCircleIcon /> : <ChevronDownIcon />}
              </motion.span>
            </span>
          </div>
        )}

        {/* ── Multi-select trigger ── */}
        {multi && (
          <div
            ref={triggerRef}
            id={fieldId}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
            aria-labelledby={label ? labelId : undefined}
            aria-label={!label ? ariaLabel : undefined}
            aria-describedby={descIds}
            aria-required={required ? true : undefined}
            aria-invalid={hasError ? true : undefined}
            aria-disabled={locked ? true : undefined}
            tabIndex={locked ? -1 : 0}
            className={cn(
              'relative w-full flex items-start text-left overflow-hidden outline-none',
              sz.multiMinH,
            )}
            onClick={() => { if (locked) return; isOpen ? closeDropdown() : openDropdown() }}
            onKeyDown={handleTriggerKeyDown}
          >
            {/* Leading icon — aligned to first row */}
            {leadingIcon && (
              <span
                className={cn('flex items-center justify-center shrink-0 pl-3', sz.multiChevronPt)}
                style={{ color: hasError ? t.iconErrorColor : t.iconColor }}
              >
                <span className={sz.iconCls}>{leadingIcon}</span>
              </span>
            )}

            {/* Chip area — wraps */}
            <div
              className={cn(
                'flex-1 flex flex-nowrap items-center gap-1.5 min-w-0 pr-2',
                sz.multiPy,
                plCls,
              )}
            >
              {hasChips ? (
                // When showCount is enabled, only render the first chip — extras shown as +N badge
                (showCount ? selectedOptions.slice(0, 1) : selectedOptions).map((opt) => (
                  // stopPropagation prevents the chip × click from toggling the panel
                  <span key={opt.value} onClick={(e) => e.stopPropagation()}>
                    <InputChip
                      chipType="input"
                      chipColour="positive"
                      appearance="light"
                      size={sz.chipSize}
                      theme={theme}
                      disabled={locked}
                      onRemove={() => handleChipRemove(opt.value)}
                    >
                      {opt.label}
                    </InputChip>
                  </span>
                ))
              ) : (
                <span className={sz.valueCls} style={{ color: t.textPlaceholder, fontSize: sz.valueFontSize }}>
                  {placeholder}
                </span>
              )}
              {showCount && currentValues.length > 1 && (
                <DisplayChip
                  aria-hidden
                  chipColour="positive"
                  appearance="light"
                  size={sz.chipSize}
                >
                  +{currentValues.length - 1}
                </DisplayChip>
              )}
            </div>

            {/* Optional trailing icon — aligned to first row */}
            {trailingIcon && (
              <span
                className={cn('flex items-center justify-center shrink-0 pr-1', sz.multiChevronPt)}
                style={{ color: t.iconColor }}
              >
                <span className={sz.iconCls}>{trailingIcon}</span>
              </span>
            )}

            {/* Clear button — aligned to first row */}
            {clearable && currentValues.length > 0 && !locked && (
              <button
                type="button"
                onClick={handleClear}
                className={cn('flex items-center justify-center shrink-0 pr-1 hover:opacity-70 transition-opacity focus:outline-none', sz.multiChevronPt)}
                style={{ color: t.iconColor }}
                aria-label="Clear selection"
              >
                <span className={sz.iconCls}><ClearIcon /></span>
              </button>
            )}

            {/* Trailing chevron / error icon — aligned to first row */}
            <span
              className={cn('flex items-center justify-center shrink-0 pl-1 pr-3', sz.multiChevronPt)}
              style={{ color: hasError ? t.iconErrorColor : t.iconColor }}
            >
              <motion.span
                className={sz.iconCls}
                animate={{ rotate: hasError ? 0 : isOpen ? 180 : 0 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: parseFloat(motionTokens.duration.base) / 1000, ease: motionTokens.easing.framer.easeInOut }
                }
              >
                {hasError ? <ErrorCircleIcon /> : <ChevronDownIcon />}
              </motion.span>
            </span>
          </div>
        )}

      </div>

      </fieldset>

      {/* ── Dropdown panel — rendered in a portal so it escapes overflow:hidden containers ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && panelPos && (
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: parseFloat(motionTokens.duration.quick) / 1000, ease: motionTokens.easing.framer.easeIn } }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : {
                      opacity: { duration: parseFloat(motionTokens.duration.fast) / 1000, ease: motionTokens.easing.framer.easeOut },
                      y: { type: 'spring' as const, ...motionTokens.spring.panel },
                    }
              }
              className="overflow-hidden"
              style={{
                position:        'fixed',
                ...(panelPos.bottom !== undefined
                  ? { bottom: panelPos.bottom }
                  : { top: panelPos.top }),
                left:            panelPos.left,
                width:           panelPos.width,
                zIndex:          9999,
                borderRadius:    '8px',
                border:          `1px solid ${t.panelBorder}`,
                backgroundColor: t.panelBg,
                boxShadow:       t.panelShadow,
              }}
            >
          <ul
            id={listboxId}
            role="listbox"
            aria-label={label ?? ariaLabel ?? 'Options'}
            aria-multiselectable={multi ? true : undefined}
            aria-activedescendant={
              focusedIndex >= 0 ? `${fieldId}-opt-${focusedIndex}` : undefined
            }
            className="py-1 max-h-60 overflow-y-auto"
          >
            {filteredOptions.length === 0 && (
              <li className="px-3 py-2" style={{ color: t.textPlaceholder, fontSize: typography.fontSize.md }}>No results</li>
            )}
            {filteredOptions.map((option, index) => {
              const isSelected = currentValues.includes(option.value);
              const isFocused  = index === focusedIndex;
              return (
                <li
                  key={option.value}
                  id={`${fieldId}-opt-${index}`}
                  ref={(el) => { optionRefs.current[index] = el; }}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled ? true : undefined}
                  tabIndex={option.disabled ? -1 : 0}
                  className={cn(
                    'flex items-center justify-between select-none transition-colors duration-fast outline-none',
                    sz.optionPadding,
                    option.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                  )}
                  style={{
                    color: option.disabled
                      ? t.optionDisabledText
                      : isSelected
                        ? t.optionSelectedText
                        : t.optionText,
                    backgroundColor: isSelected
                      ? t.optionSelectedBg
                      : isFocused
                        ? t.optionHoverBg
                        : 'transparent',
                    fontSize: sz.optionFontSize,
                  }}
                  onClick={() => !option.disabled && handleOptionSelect(option)}
                  onKeyDown={(e) => handleOptionKeyDown(e, option, index)}
                  onMouseEnter={() => !option.disabled && setFocusedIndex(index)}
                  onMouseLeave={() => setFocusedIndex(-1)}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {multi && (
                      <span className="pointer-events-none flex-shrink-0">
                        <Checkbox checked={isSelected} size="sm" onChange={() => {}} theme={theme} />
                      </span>
                    )}
                    {option.icon && <span className={cn('shrink-0 flex items-center justify-center', sz.iconCls)} aria-hidden>{option.icon}</span>}
                    <span className="truncate">{option.label}</span>
                  </span>
                  {!multi && isSelected && (
                    <span
                      className={cn(sz.checkCls, 'shrink-0 ml-2')}
                      style={{ color: t.optionSelectedText }}
                    >
                      <CheckIcon />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {/* Hidden inputs for form submission */}
      {name && !multi && (
        <input type="hidden" name={name} value={currentValues[0] ?? ''} />
      )}
      {name && multi && currentValues.map((v, i) => (
        <input key={i} type="hidden" name={`${name}[]`} value={v} />
      ))}

      {/* ── Footer: helper / error text ── */}
      {(error || helperText) && (
        <span
          id={hasError ? errorId : helperId}
          role={hasError ? 'alert' : undefined}
          className={sz.helperCls}
          style={{ color: hasError ? t.errorColor : t.helperColor, fontSize: sz.helperFontSize }}
        >
          {hasError ? error : helperText}
        </span>
      )}

    </div>
  );
}

DropdownField.displayName = 'DropdownField';

export { DropdownField };
export default DropdownField;
