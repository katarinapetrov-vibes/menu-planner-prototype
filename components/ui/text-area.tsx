'use client';

import React, { useState, useId, useRef, useEffect, useCallback } from 'react';
import { cn } from './utils';
import { useFieldLocked } from './field-locked-context';
import { semantic, radius as radiusTokens, borderWidth as borderWidthTokens, typography, motion as motionTokens } from '@/lib/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TextAreaVariant      = 'plain' | 'rich';
export type TextAreaSize         = 'sm' | 'md' | 'lg';
export type TextAreaTheme        = 'light' | 'dark';
export type TextAreaLabelVariant = 'stacked' | 'outlined';

export interface TextAreaProps {
  /** Variant — plain (native textarea) or rich (formatted toolbar editor). Default: 'plain' */
  variant?:          TextAreaVariant;
  /**
   * Label placement variant.
   * - `'stacked'` (default): label sits above the textarea container.
   * - `'outlined'`: label floats on the top border (fieldset/legend style).
   */
  labelVariant?:     TextAreaLabelVariant;
  /** Label rendered above the field */
  label?:            string;
  /** Placeholder text shown when the field is empty */
  placeholder?:      string;
  /** Controlled value (plain variant only) */
  value?:            string;
  /** Uncontrolled initial value */
  defaultValue?:     string;
  /** Called with the new string value on every keystroke (plain variant) */
  onChange?:         (value: string) => void;
  /** Size variant — controls padding and type scale. Default: 'md' */
  size?:             TextAreaSize;
  /** Theme — controls colour tokens. Default: 'light' */
  theme?:            TextAreaTheme;
  /** Error message; triggers the error state and replaces helperText when set */
  error?:            string;
  /** Supporting helper text shown below the field (hidden when error is set) */
  helperText?:       string;
  /** Disables the field. Default: false */
  disabled?:         boolean;
  /** Marks the field as required — appends * to the label. Default: false */
  required?:         boolean;
  /** Show a character count; requires maxLength to be set. Default: false */
  showCharCount?:    boolean;
  /** maxlength attribute; drives the character counter */
  maxLength?:        number;
  /** Number of visible text rows (plain only). Default: 4 */
  rows?:             number;
  /** Allow the user to resize the textarea vertically (plain only). Default: true */
  resizable?:        boolean;
  /** HTML id — auto-generated via useId() if omitted */
  id?:               string;
  /** HTML name attribute */
  name?:             string;
  /** Extra class applied to the outer wrapper div */
  className?:        string;
  /** Extra class applied directly to the textarea element (plain only) */
  textareaClassName?: string;
  onBlur?:           React.FocusEventHandler<HTMLTextAreaElement>;
  onFocus?:          React.FocusEventHandler<HTMLTextAreaElement>;
  readOnly?:         boolean;
  autoFocus?:        boolean;
  'aria-label'?:     string;
  'aria-describedby'?: string;
}

// ─── Design Tokens ────────────────────────────────────────────────────────────
// Enterprise DS v3 — all values sourced from lib/tokens.ts semantic tier.

const tokens = {
  light: {
    containerBg:         semantic.background.page.light,
    borderDefault:       semantic.border.default.light,
    borderHover:         semantic.border.hover.light,
    borderFocus:         semantic.border.focus.light,
    borderError:         semantic.border.negative.light,
    borderDisabled:      semantic.border.disabled.light,
    disabledBg:          semantic.background.surfaceOffset.light,
    textValue:           semantic.foreground.default.primary.light,
    textPlaceholder:     semantic.foreground.default.placeholder.light,
    textDisabled:        semantic.foreground.default.disabled.light,
    labelColor:          semantic.foreground.default.secondary.light,
    helperColor:         semantic.foreground.neutral.mid.light,
    errorColor:          semantic.foreground.negative.default.light,
    toolbarBg:           semantic.background.surfaceOffset.light,
    toolbarBorder:       semantic.border.default.light,
    toolbarIcon:         semantic.foreground.default.secondary.light,
    toolbarIconActive:   semantic.border.focus.light,
    // focus color at 8% opacity (hex alpha: round(0.08*255) = 20 = 0x14)
    toolbarIconActiveBg: semantic.border.focus.light + '14',
    focusRing:           semantic.border.focus.light + '66',
  },
  dark: {
    containerBg:         semantic.background.container.dark,
    borderDefault:       semantic.border.default.dark,
    borderHover:         semantic.border.hover.dark,
    borderFocus:         semantic.border.focus.dark,
    borderError:         semantic.border.negative.dark,
    borderDisabled:      semantic.border.disabled.dark,
    disabledBg:          semantic.background.surfaceOffset.dark,
    textValue:           semantic.foreground.default.primary.dark,
    textPlaceholder:     semantic.foreground.default.placeholder.dark,
    textDisabled:        semantic.foreground.default.disabled.dark,
    labelColor:          semantic.foreground.neutral.mid.dark,
    helperColor:         semantic.foreground.neutral.mid.dark,
    errorColor:          semantic.foreground.negative.default.dark,
    toolbarBg:           semantic.background.surfaceOffset.dark,
    toolbarBorder:       semantic.border.default.dark,
    toolbarIcon:         semantic.foreground.neutral.mid.dark,
    toolbarIconActive:   semantic.border.focus.dark,
    toolbarIconActiveBg: semantic.border.focus.dark + '14',
    focusRing:           semantic.border.focus.dark + '66',
  },
};

// ─── Size Tokens ──────────────────────────────────────────────────────────────

const sizeTokens: Record<TextAreaSize, {
  paddingX:       string;
  paddingY:       string;
  fontSize:       string;
  lineHeight:     string;
  labelCls:        string;
  labelFontSize?:  string;
  helperCls:       string;
  helperFontSize?: string;
  gap:            string;
  minHeight:      string;
  toolbarPad:     string;
  toolbarIconSz:  string;
}> = {
  sm: {
    paddingX:      '12px',
    paddingY:      '8px',
    fontSize:      typography.fontSize.sm,
    lineHeight:    '1.667em',
    labelCls:      'font-medium leading-4',
    labelFontSize: typography.fontSize.sm,
    helperCls:     'leading-4',
    helperFontSize: typography.fontSize.sm,
    gap:           'gap-1',
    minHeight:     '80px',
    toolbarPad:    '6px 8px',
    toolbarIconSz: '14px',
  },
  md: {
    paddingX:      '12px',
    paddingY:      '10px',
    fontSize:      typography.fontSize.md,
    lineHeight:    '1.5em',
    labelCls:      'font-medium leading-5',
    labelFontSize: typography.fontSize.md,
    helperCls:     'leading-4',
    helperFontSize: typography.fontSize.sm,
    gap:           'gap-1.5',
    minHeight:     '96px',
    toolbarPad:    '8px 10px',
    toolbarIconSz: '16px',
  },
  lg: {
    paddingX:      '16px',
    paddingY:      '12px',
    fontSize:      typography.fontSize.md,
    lineHeight:    '1.5em',
    labelCls:      'font-medium leading-5',
    labelFontSize: typography.fontSize.md,
    helperCls:     'leading-4',
    helperFontSize: typography.fontSize.sm,
    gap:           'gap-1.5',
    minHeight:     '128px',
    toolbarPad:    '8px 12px',
    toolbarIconSz: '18px',
  },
};

// ─── Toolbar Icon SVGs ─────────────────────────────────────────────────────────

function BoldIcon()          { return <svg viewBox="0 0 16 16" fill="none" width="100%" height="100%" aria-hidden><path d="M4 3h5a3 3 0 010 6H4V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M4 9h6a3 3 0 010 6H4V9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg> }
function ItalicIcon()        { return <svg viewBox="0 0 16 16" fill="none" width="100%" height="100%" aria-hidden><line x1="10" y1="3" x2="6" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="7" y1="3" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="3" y1="13" x2="9" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function UnderlineIcon()     { return <svg viewBox="0 0 16 16" fill="none" width="100%" height="100%" aria-hidden><path d="M4 3v5a4 4 0 008 0V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="2" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function BulletListIcon()    { return <svg viewBox="0 0 16 16" fill="none" width="100%" height="100%" aria-hidden><circle cx="3" cy="5" r="1.25" fill="currentColor"/><line x1="6.5" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="3" cy="9" r="1.25" fill="currentColor"/><line x1="6.5" y1="9" x2="14" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="3" cy="13" r="1.25" fill="currentColor"/><line x1="6.5" y1="13" x2="14" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function OrderedListIcon()   { return <svg viewBox="0 0 16 16" fill="none" width="100%" height="100%" aria-hidden><text x="1" y="6" fontSize="5" fill="currentColor" fontFamily="monospace">1.</text><line x1="7" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><text x="1" y="10.5" fontSize="5" fill="currentColor" fontFamily="monospace">2.</text><line x1="7" y1="9" x2="14" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><text x="1" y="15" fontSize="5" fill="currentColor" fontFamily="monospace">3.</text><line x1="7" y1="13" x2="14" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function ClearFormatIcon()   { return <svg viewBox="0 0 16 16" fill="none" width="100%" height="100%" aria-hidden><path d="M3 13L9.5 3M13 3L7.5 13M12 13H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="11" x2="14" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="14" y1="11" x2="12" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function LinkIcon()          { return <svg viewBox="0 0 16 16" fill="none" width="100%" height="100%" aria-hidden><path d="M6.5 9.5a3.536 3.536 0 005 0l2-2a3.536 3.536 0 00-5-5L7.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M9.5 6.5a3.536 3.536 0 00-5 0l-2 2a3.536 3.536 0 005 5l1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function DividerBarIcon()    { return <svg viewBox="0 0 2 16" fill="none" width="100%" height="100%" aria-hidden><line x1="1" y1="2" x2="1" y2="14" stroke="currentColor" strokeWidth="1"/></svg> }

// ─── Toolbar ──────────────────────────────────────────────────────────────────

type TokenSet = (typeof tokens)['light'] | (typeof tokens)['dark'];

type ToolbarButtonProps = {
  icon:     React.ReactNode;
  label:    string;
  active?:  boolean;
  onClick:  () => void;
  tok:      TokenSet;
  iconSz:   string;
  disabled?: boolean;
};

function ToolbarButton({ icon, label, active, onClick, tok, iconSz, disabled }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="flex items-center justify-center rounded transition-colors duration-fast"
      style={{
        width:           iconSz === '14px' ? '24px' : iconSz === '16px' ? '28px' : '30px',
        height:          iconSz === '14px' ? '24px' : iconSz === '16px' ? '28px' : '30px',
        color:           active ? tok.toolbarIconActive : tok.toolbarIcon,
        backgroundColor: active ? tok.toolbarIconActiveBg : 'transparent',
        opacity:         disabled ? 0.4 : 1,
        cursor:          disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span style={{ width: iconSz, height: iconSz, display: 'flex' }}>{icon}</span>
    </button>
  );
}

// ─── RichTextArea ─────────────────────────────────────────────────────────────

function RichTextArea({
  label,
  placeholder,
  defaultValue = '',
  size = 'md',
  theme = 'light',
  labelVariant = 'stacked',
  error,
  helperText,
  disabled = false,
  required = false,
  showCharCount = false,
  maxLength,
  id: providedId,
  className,
  autoFocus,
}: Omit<TextAreaProps, 'variant' | 'value' | 'onChange' | 'rows' | 'resizable' | 'textareaClassName' | 'onBlur' | 'onFocus' | 'readOnly' | 'name'>) {
  const generatedId = useId();
  const editorId    = providedId ?? generatedId;
  const helperId    = `${editorId}-helper`;
  const errorId     = `${editorId}-error`;
  const editorRef   = useRef<HTMLDivElement>(null);

  const tk  = tokens[theme];
  const sz  = sizeTokens[size];

  const [isFocused,  setIsFocused]  = useState(false);
  const [isHovered,  setIsHovered]  = useState(false);
  const [charCount,  setCharCount]  = useState(0);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  const hasError       = Boolean(error);
  const isOutlined     = labelVariant === 'outlined';
  const legendId       = isOutlined && label ? `${editorId}-legend` : undefined;

  const outlinedLabelColor = disabled
    ? tk.textDisabled
    : hasError
      ? tk.errorColor
      : isFocused
        ? tk.borderFocus
        : tk.labelColor;

  const borderColor = disabled
    ? tk.borderDisabled
    : hasError
      ? tk.borderError
      : isFocused
        ? tk.borderFocus
        : isHovered
          ? tk.borderHover
          : tk.borderDefault;

  // Detect active formats on selection change
  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    if (document.queryCommandState('bold'))          formats.add('bold');
    if (document.queryCommandState('italic'))        formats.add('italic');
    if (document.queryCommandState('underline'))     formats.add('underline');
    if (document.queryCommandState('insertUnorderedList')) formats.add('ul');
    if (document.queryCommandState('insertOrderedList'))   formats.add('ol');
    setActiveFormats(formats);
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', updateActiveFormats);
    return () => document.removeEventListener('selectionchange', updateActiveFormats);
  }, [updateActiveFormats]);

  const execFormat = (command: string, value?: string) => {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    updateActiveFormats();
  };

  const handleInput = () => {
    const text = editorRef.current?.innerText ?? '';
    setCharCount(text.replace(/\n$/, '').length);
  };

  useEffect(() => {
    if (autoFocus && editorRef.current) editorRef.current.focus();
  }, [autoFocus]);

  const TOOLBAR_GROUPS: Array<Array<{ cmd: string; icon: React.ReactNode; label: string; fmtKey?: string }>> = [
    [
      { cmd: 'bold',      icon: <BoldIcon />,      label: 'Bold',      fmtKey: 'bold'      },
      { cmd: 'italic',    icon: <ItalicIcon />,    label: 'Italic',    fmtKey: 'italic'    },
      { cmd: 'underline', icon: <UnderlineIcon />, label: 'Underline', fmtKey: 'underline' },
    ],
    [
      { cmd: 'insertUnorderedList', icon: <BulletListIcon />,  label: 'Bullet list',   fmtKey: 'ul' },
      { cmd: 'insertOrderedList',   icon: <OrderedListIcon />, label: 'Ordered list',  fmtKey: 'ol' },
    ],
    [
      { cmd: 'createLink',          icon: <LinkIcon />,        label: 'Insert link'  },
      { cmd: 'removeFormat',        icon: <ClearFormatIcon />, label: 'Clear formatting' },
    ],
  ];

  const containerStyle: React.CSSProperties = {
    borderRadius:    radiusTokens.sm,
    borderColor:     borderColor,
    backgroundColor: disabled ? tk.disabledBg : tk.containerBg,
    borderWidth:     borderWidthTokens.thin,
    borderStyle:     'solid',
    boxShadow:       (isFocused && !disabled) ? `0 0 0 3px ${tk.focusRing}` : undefined,
  };

  const legendEl = isOutlined && label ? (
    <legend
      id={legendId}
      className={cn(sz.labelCls, disabled && 'opacity-50')}
      style={{
        marginLeft:   '8px',
        paddingLeft:  '4px',
        paddingRight: '4px',
        lineHeight:   1,
        color:        outlinedLabelColor,
        transition:   `color ${motionTokens.duration.quick} ${motionTokens.easing.easeOut}`,
        display:      'block',
        float:        'none',
        fontSize:     sz.labelFontSize,
      }}
    >
      {label}
      {required && (
        <span aria-hidden className="ml-0.5" style={{ color: tk.errorColor }}>*</span>
      )}
    </legend>
  ) : null;

  const editorBody = (
    <>
      {/* Toolbar */}
      <div
        className="flex items-center gap-1 border-b"
        style={{
          padding:         sz.toolbarPad,
          backgroundColor: tk.toolbarBg,
          borderColor:     tk.toolbarBorder,
        }}
        aria-label="Rich text formatting toolbar"
        role="toolbar"
      >
        {TOOLBAR_GROUPS.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && (
              <span
                className="mx-0.5"
                style={{ width: 2, height: sz.toolbarIconSz, color: tk.toolbarBorder }}
                aria-hidden
              >
                <DividerBarIcon />
              </span>
            )}
            {group.map(({ cmd, icon, label: btnLabel, fmtKey }) => (
              <ToolbarButton
                key={cmd}
                icon={icon}
                label={btnLabel}
                active={fmtKey ? activeFormats.has(fmtKey) : false}
                onClick={() => {
                  if (cmd === 'createLink') {
                    const url = window.prompt('Enter URL:');
                    if (url) execFormat(cmd, url);
                  } else {
                    execFormat(cmd);
                  }
                }}
                tok={tk}
                iconSz={sz.toolbarIconSz}
                disabled={disabled}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        id={editorId}
        role="textbox"
        aria-multiline="true"
        aria-required={required ? true : undefined}
        aria-invalid={hasError ? true : undefined}
        aria-describedby={[hasError && errorId, !hasError && helperText && helperId].filter(Boolean).join(' ') || undefined}
        aria-label={!label ? 'Rich text editor' : undefined}
        aria-labelledby={legendId}
        contentEditable={!disabled}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'outline-none w-full',
          '[&:empty]:before:content-[attr(data-placeholder)]',
          '[&:empty]:before:pointer-events-none',
        )}
        style={{
          padding:      `${sz.paddingY} ${sz.paddingX}`,
          fontSize:     sz.fontSize,
          lineHeight:   sz.lineHeight,
          minHeight:    sz.minHeight,
          color:        disabled ? tk.textDisabled : tk.textValue,
          cursor:       disabled ? 'not-allowed' : 'text',
          '--ta-ph': tk.textPlaceholder,
        } as React.CSSProperties}
      />
    </>
  );

  const richFooterEl = (error || helperText || (showCharCount && maxLength)) ? (
    <div className={cn('flex items-center justify-between', sz.helperCls)} style={{ fontSize: sz.helperFontSize }}>
      <span
        id={hasError ? errorId : helperId}
        role={hasError ? 'alert' : undefined}
        style={{ color: hasError ? tk.errorColor : tk.helperColor }}
      >
        {hasError ? error : helperText}
      </span>
      {showCharCount && maxLength && (
        <span
          className="shrink-0 ml-2 tabular-nums"
          aria-live="polite"
          style={{ color: hasError ? tk.errorColor : tk.helperColor }}
        >
          {charCount}/{maxLength}
        </span>
      )}
    </div>
  ) : null;

  if (isOutlined) {
    return (
      <div className={cn('flex flex-col w-full', className)}>
        <fieldset
          className={cn('w-full transition-colors duration-quick overflow-hidden', disabled && 'cursor-not-allowed opacity-60')}
          style={{ padding: 0, margin: 0, minInlineSize: 0, ...containerStyle }}
          onMouseEnter={() => !disabled && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {legendEl}
          {editorBody}
        </fieldset>
        {richFooterEl}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', sz.gap, className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={editorId}
          className={cn(sz.labelCls, disabled && 'opacity-50 cursor-not-allowed')}
          style={{ color: tk.labelColor, fontSize: sz.labelFontSize }}
        >
          {label}
          {required && (
            <span aria-hidden className="ml-0.5" style={{ color: tk.errorColor }}>*</span>
          )}
        </label>
      )}

      {/* Editor container */}
      <div
        className={cn(
          'border transition-colors duration-quick overflow-hidden',
          disabled && 'cursor-not-allowed opacity-60',
        )}
        style={containerStyle}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {editorBody}
      </div>
      {richFooterEl}

    </div>
  );
}

// ─── PlainTextArea ────────────────────────────────────────────────────────────

function PlainTextArea({
  label,
  placeholder,
  value: controlledValue,
  defaultValue = '',
  onChange,
  size = 'md',
  theme = 'light',
  labelVariant = 'stacked',
  error,
  helperText,
  disabled = false,
  required = false,
  showCharCount = false,
  maxLength,
  rows = 4,
  resizable = true,
  id: providedId,
  name,
  className,
  textareaClassName,
  onBlur,
  onFocus,
  readOnly,
  autoFocus,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: Omit<TextAreaProps, 'variant'>) {
  const generatedId = useId();
  const taId        = providedId ?? generatedId;
  const helperId    = `${taId}-helper`;
  const errorId     = `${taId}-error`;
  const taRef       = useRef<HTMLTextAreaElement>(null);
  const fieldLocked = useFieldLocked();

  const tk  = tokens[theme];
  const sz  = sizeTokens[size];

  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isFocused,     setIsFocused]     = useState(false);
  const [isHovered,     setIsHovered]     = useState(false);

  const isControlled  = controlledValue !== undefined;
  const currentValue  = isControlled ? controlledValue : internalValue;
  const hasError      = Boolean(error);
  const isOutlined    = labelVariant === 'outlined';
  const legendId      = isOutlined && label ? `${taId}-legend` : undefined;
  const visuallyLocked = disabled || readOnly || fieldLocked;

  const outlinedLabelColor = disabled
    ? tk.textDisabled
    : hasError
      ? tk.errorColor
      : isFocused
        ? tk.borderFocus
        : tk.labelColor;

  const borderColor = visuallyLocked
    ? tk.borderDisabled
    : hasError
      ? tk.borderError
      : isFocused
        ? tk.borderFocus
        : isHovered
          ? tk.borderHover
          : tk.borderDefault;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    if (!isControlled) setInternalValue(v);
    onChange?.(v);
  };

  const handleFocus: React.FocusEventHandler<HTMLTextAreaElement> = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur: React.FocusEventHandler<HTMLTextAreaElement> = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const descIds = [
    hasError && errorId,
    !hasError && helperText && helperId,
    ariaDescribedBy,
  ].filter(Boolean).join(' ') || undefined;

  const containerStyle: React.CSSProperties = {
    borderRadius:    radiusTokens.sm,
    borderColor:     borderColor,
    backgroundColor: visuallyLocked ? tk.disabledBg : tk.containerBg,
    borderWidth:     borderWidthTokens.thin,
    borderStyle:     'solid',
    boxShadow:       (isFocused && !visuallyLocked) ? `0 0 0 3px ${tk.focusRing}` : undefined,
  };

  const nativeTextarea = (
    <textarea
      ref={taRef}
      id={taId}
      name={name}
      value={currentValue}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      maxLength={maxLength}
      rows={rows}
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
      className={cn(
        'w-full bg-transparent outline-none border-none appearance-none',
        'placeholder:text-[var(--ta-placeholder)]',
        !resizable && 'resize-none',
        resizable && 'resize-y',
        visuallyLocked && (disabled ? 'cursor-not-allowed' : 'cursor-default'),
        textareaClassName,
      )}
      style={{
        padding:    `${sz.paddingY} ${sz.paddingX}`,
        fontSize:   sz.fontSize,
        lineHeight: sz.lineHeight,
        minHeight:  sz.minHeight,
        color:      visuallyLocked ? tk.textDisabled : tk.textValue,
        '--ta-placeholder': tk.textPlaceholder,
      } as React.CSSProperties}
    />
  );

  const footerEl = (error || helperText || (showCharCount && maxLength)) ? (
    <div className={cn('flex items-center justify-between', sz.helperCls)} style={{ fontSize: sz.helperFontSize }}>
      <span
        id={hasError ? errorId : helperId}
        role={hasError ? 'alert' : undefined}
        style={{ color: hasError ? tk.errorColor : tk.helperColor }}
      >
        {hasError ? error : helperText}
      </span>
      {showCharCount && maxLength && (
        <span
          className="shrink-0 ml-2 tabular-nums"
          aria-live="polite"
          style={{ color: hasError ? tk.errorColor : tk.helperColor }}
        >
          {currentValue.length}/{maxLength}
        </span>
      )}
    </div>
  ) : null;

  // ── Outlined layout: fieldset/legend — browser-native border notch ────────
  if (isOutlined) {
    return (
      <div className={cn('flex flex-col w-full', className)}>
        <fieldset
          className={cn(
            'w-full transition-colors duration-quick',
            visuallyLocked && (disabled ? 'cursor-not-allowed opacity-60' : 'cursor-default opacity-60'),
          )}
          style={{ padding: 0, margin: 0, minInlineSize: 0, ...containerStyle }}
          onMouseEnter={() => !visuallyLocked && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {label && (
            <legend
              id={legendId}
              className={cn(sz.labelCls, visuallyLocked && 'opacity-50')}
              style={{
                marginLeft:   '8px',
                paddingLeft:  '4px',
                paddingRight: '4px',
                lineHeight:   1,
                color:        outlinedLabelColor,
                transition:   `color ${motionTokens.duration.quick} ${motionTokens.easing.easeOut}`,
                display:      'block',
                float:        'none',
                fontSize:     sz.labelFontSize,
              }}
            >
              {label}
              {required && (
                <span aria-hidden className="ml-0.5" style={{ color: tk.errorColor }}>*</span>
              )}
            </legend>
          )}
          {nativeTextarea}
        </fieldset>
        {footerEl}
      </div>
    );
  }

  // ── Stacked layout: label above, then container, then footer ─────────────
  return (
    <div className={cn('flex flex-col', sz.gap, className)}>
      {label && (
        <label
          htmlFor={taId}
          className={cn(sz.labelCls, visuallyLocked && 'opacity-50 cursor-not-allowed')}
          style={{ color: tk.labelColor, fontSize: sz.labelFontSize }}
        >
          {label}
          {required && (
            <span aria-hidden className="ml-0.5" style={{ color: tk.errorColor }}>*</span>
          )}
        </label>
      )}
      <div
        className={cn(
          'relative border transition-colors duration-quick overflow-hidden',
          visuallyLocked && 'cursor-default opacity-60',
        )}
        style={containerStyle}
        onMouseEnter={() => !visuallyLocked && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {nativeTextarea}
      </div>
      {footerEl}
    </div>
  );
}

// ─── TextArea (main export) ───────────────────────────────────────────────────

function TextArea({ variant = 'plain', labelVariant = 'stacked', ...props }: TextAreaProps) {
  if (variant === 'rich') {
    return <RichTextArea labelVariant={labelVariant} {...props} />;
  }
  return <PlainTextArea labelVariant={labelVariant} {...props} />;
}

TextArea.displayName = 'TextArea';

export { TextArea };
export default TextArea;
