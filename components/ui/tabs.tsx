'use client';

import React, { useState, useId, useRef, useLayoutEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from './utils';
import { DisplayChip } from './chip';
import { borderWidth, components, typography, motion as motionTokens } from '@/lib/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TabsOrientation       = 'horizontal' | 'vertical';
export type TabsIndicatorPos      = 'bottom' | 'right' | 'left';
export type TabsSize              = 'sm' | 'md' | 'lg';
export type TabsTheme             = 'light' | 'dark';
/** `line` — sliding indicator + subtle positive tint on the active tab. `fill` — column: tint + rail edge bar (no line); row: same tint + underline. */
export type TabsActiveAppearance  = 'line' | 'fill';

export interface TabItem {
  /** Unique identifier */
  id:        string;
  /** Display label */
  label:     string;
  /** Optional leading icon */
  icon?:     React.ReactNode;
  /** Optional badge count or short label */
  badge?:    string | number;
  /** Disables interaction for this tab */
  disabled?: boolean;
}

export interface TabsProps {
  /** Array of tab definitions */
  tabs:               TabItem[];
  /**
   * Controls the content layout *inside* each tab trigger.
   * 'horizontal' — icon + label sit side-by-side (left to right).
   * 'vertical'   — icon stacks above label (top to bottom).
   *
   * The flow direction of the tab list itself is derived from indicatorPosition:
   *   indicatorPosition="bottom" → list is a row  (horizontal flow)
   *   indicatorPosition="right" | "left" → list is a column (vertical flow)
   *
   * Common pairings:
   *   horizontal + bottom → standard top-level tabs
   *   horizontal + right  → side navigation (icon before text, indicator on content edge)
   *   horizontal + left   → sidebar rail (icon before text, indicator on outer edge; pair with activeAppearance="fill" for recipe-style rows)
   *   vertical   + bottom → bottom nav / icon tab bar (icon above label, tabs in row)
   *
   * Default: 'horizontal'
   */
  orientation?:       TabsOrientation;
  /**
   * Where the 2 px active indicator line is drawn (when activeAppearance="line"), and which direction the
   * tab list flows. Also sets the list separator edge toward the panels.
   * 'bottom' — underline; list flows as a row.
   * 'right'  — right-edge line; list flows as a column.
   * 'left'   — left-edge line; list flows as a column.
   * Default: 'bottom'
   */
  indicatorPosition?: TabsIndicatorPos;
  /**
   * Active tab visuals. The active trigger always uses the subtle positive rail surface tokens (`railActiveFill`, etc.).
   * `line` — animated 2 px indicator (all layouts). `fill` — column lists swap the line for a 2 px rail-edge accent; row
   * lists keep the underline.
   * Default: 'line'
   */
  activeAppearance?:  TabsActiveAppearance;
  /** Size variant. Default: 'md' */
  size?:              TabsSize;
  /** Theme — controls colour tokens. Default: 'light' */
  theme?:             TabsTheme;
  /** Controlled active tab id */
  value?:             string;
  /** Uncontrolled initial active tab id */
  defaultValue?:      string;
  /** Called when the selected tab changes */
  onChange?:          (id: string) => void;
  /** Scroll the window to the top when the active tab changes. Useful for top-level page navigation tabs. Default: false */
  scrollToTopOnChange?: boolean;
  /**
   * Row list  → each trigger stretches to fill an equal share of the row.
   * Column list → each trigger stretches to fill the full column width.
   * Default: false
   */
  fullWidth?:         boolean;
  /** Show the leading icon slot for all tabs. Default: true */
  showLeadingIcon?:   boolean;
  /** Show the label for all tabs. Default: true */
  showLabel?:         boolean;
  /** Show a trailing dropdown chevron on each tab. Default: false */
  showDropdown?:      boolean;
  /**
   * When true, draws a full 1 px stroke around the entire tab list (`borderWidth.thin` + list border colour).
   * When false, only the separator edge toward the panels is drawn (bottom edge for row lists, right edge for column lists).
   * Default: false
   */
  showGroupBorder?:    boolean;
  /** Optional panel content keyed by tab id */
  panels?:            Record<string, React.ReactNode>;
  className?:         string;
  /** Extra classes for the tab list container (`role="tablist"`) */
  tabListClassName?:  string;
  /** Extra classes for the wrapper around all tab panels */
  panelsWrapperClassName?: string;
}

// ─── Colour tokens (components.tabs.colour) ───────────────────────────────────

type TabsColourSet = (typeof components.tabs.colour)[keyof typeof components.tabs.colour];

// ─── Size Tokens ──────────────────────────────────────────────────────────────
// Horizontal content height: sm=32 px | md=40 px | lg=48 px

const sizeTokens: Record<
  TabsSize,
  {
    // Fixed height for horizontal content triggers (icon + label side-by-side)
    hHeight:       string;
    hPx:           string;
    // Padding-based height for vertical content triggers (icon stacked above label)
    vPy:           string;
    vPx:           string;
    // Shared
    gap:           string;
    labelCls:      string;
    labelFontSize?: string;
    iconCls:       string;
    chevronCls:    string;
  }
> = {
  sm: {
    hHeight:    'h-8',
    hPx:        'px-3',
    vPy:        'py-2',
    vPx:        'px-3',
    gap:        'gap-1.5',
    labelCls:   'font-medium leading-4',
    labelFontSize: typography.fontSize.sm,
    iconCls:    'w-4 h-4 shrink-0',
    chevronCls: 'w-3 h-3 shrink-0',
  },
  md: {
    hHeight:       'h-10',
    hPx:           'px-4',
    vPy:           'py-3',
    vPx:           'px-4',
    gap:           'gap-2',
    labelCls:      'font-medium leading-5',
    labelFontSize: typography.fontSize.md,
    iconCls:       'w-[18px] h-[18px] shrink-0',
    chevronCls:    'w-3.5 h-3.5 shrink-0',
  },
  lg: {
    hHeight:    'h-12',
    hPx:        'px-5',
    vPy:        'py-4',
    vPx:        'px-5',
    gap:        'gap-2',
    labelCls:   'font-medium leading-6',
    labelFontSize: typography.fontSize.md,
    iconCls:    'w-5 h-5 shrink-0',
    chevronCls: 'w-4 h-4 shrink-0',
  },
};

const indicatorThickness = borderWidth.default;

// ─── Dropdown Chevron ─────────────────────────────────────────────────────────

function ChevronDown() {
  return (
    <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden>
      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── TabTrigger ───────────────────────────────────────────────────────────────

interface TabTriggerProps {
  tab:               TabItem;
  isActive:          boolean;
  /** Controls icon+label layout within the trigger */
  contentIsVertical: boolean;
  /** True when the tab list itself flows as a column */
  listIsColumn:      boolean;
  indicatorPosition: TabsIndicatorPos;
  activeAppearance:  TabsActiveAppearance;
  onSelect:          (id: string) => void;
  tabId:             string;
  panelId:           string;
  t:                 TabsColourSet;
  sz:                (typeof sizeTokens)[TabsSize];
  theme:             TabsTheme;
  fullWidth:         boolean;
  showLeadingIcon:   boolean;
  showLabel:         boolean;
  showDropdown:      boolean;
  /** Ref callback to measure tab position for sliding indicator */
  triggerRef?:       (el: HTMLButtonElement | null) => void;
}

function TabTrigger({
  tab,
  isActive,
  contentIsVertical,
  listIsColumn,
  indicatorPosition,
  activeAppearance,
  onSelect,
  tabId,
  panelId,
  t,
  sz,
  theme,
  fullWidth,
  showLeadingIcon,
  showLabel,
  showDropdown,
  triggerRef,
}: TabTriggerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  /** Subtle positive surface on every active tab (both appearances, all orientations). */
  const railTintActive = isActive && !tab.disabled;
  /** Left/right accent bar — only for column + `fill` (replaces sliding line for that layout). */
  const railEdgeAccent = activeAppearance === 'fill' && listIsColumn;

  const labelColor = tab.disabled
    ? t.disabledText
    : railTintActive
      ? t.railActiveLabel
      : isActive
        ? t.activeText
        : t.inactiveText;

  const iconColor = tab.disabled
    ? t.disabledText
    : railTintActive
      ? t.railActiveIcon
      : isActive
        ? t.activeText
        : t.inactiveText;

  let bgColor: string;
  if (tab.disabled) {
    bgColor = 'transparent';
  } else if (railTintActive) {
    bgColor = isHovered || isPressed ? t.railActiveFillHover : t.railActiveFill;
  } else {
    bgColor = isPressed ? t.pressedBg : isHovered ? t.hoverBg : 'transparent';
  }

  const railBorderStyle: React.CSSProperties | undefined =
    railEdgeAccent && isActive && !tab.disabled
      ? indicatorPosition === 'left'
        ? {
            borderLeftWidth:  indicatorThickness,
            borderLeftStyle:  'solid',
            borderLeftColor:  t.activeIndicator,
          }
        : indicatorPosition === 'right'
          ? {
              borderRightWidth:  indicatorThickness,
              borderRightStyle:   'solid',
              borderRightColor:   t.activeIndicator,
            }
          : undefined
      : undefined;

  return (
    <button
      ref={triggerRef}
      id={tabId}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={panelId}
      aria-disabled={tab.disabled ? true : undefined}
      disabled={tab.disabled}
      onClick={() => onSelect(tab.id)}
      onMouseEnter={() => !tab.disabled && setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
      onMouseDown={() => !tab.disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className={cn(
        'relative z-[2] flex transition-colors duration-quick',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]',
        // Content layout: vertical = icon stacked above label, horizontal = side-by-side
        contentIsVertical ? 'flex-col items-center justify-center' : 'flex-row items-center',
        // Sizing: vertical content uses padding-based height; horizontal uses fixed height
        contentIsVertical ? sz.vPy : sz.hHeight,
        contentIsVertical ? sz.vPx : sz.hPx,
        sz.gap,
        // Full-width: column list → fill column width; row list → share available row space
        fullWidth && (listIsColumn ? 'w-full' : 'flex-1 justify-center'),
        tab.disabled && 'cursor-not-allowed opacity-40',
      )}
      style={{
        backgroundColor: bgColor,
        color:             labelColor,
        outlineColor:      t.focusOutline,
        ...railBorderStyle,
      }}
    >
      {showLeadingIcon && tab.icon && (
        <span className={sz.iconCls} style={{ color: iconColor }} aria-hidden>
          {tab.icon}
        </span>
      )}

      {showLabel && (
        <span className={sz.labelCls} style={sz.labelFontSize ? { fontSize: sz.labelFontSize } : undefined}>{tab.label}</span>
      )}

      {tab.badge !== undefined && (
        <DisplayChip
          chipType="display"
          chipColour={isActive ? 'positive' : 'neutral'}
          appearance={isActive ? 'filled' : 'light'}
          size="md"
          theme={theme}
          className="rounded-full min-w-[20px] justify-center"
        >
          {tab.badge}
        </DisplayChip>
      )}

      {showDropdown && (
        <span
          className={sz.chevronCls}
          style={{ color: isActive ? (railTintActive ? t.railActiveLabel : t.activeText) : t.chevronColor }}
        >
          <ChevronDown />
        </span>
      )}
    </button>
  );
}

// ─── Tabs (main export) ───────────────────────────────────────────────────────

function Tabs({
  tabs,
  orientation        = 'horizontal',
  indicatorPosition  = 'bottom',
  activeAppearance   = 'line',
  size               = 'md',
  theme              = 'light',
  value:               controlledValue,
  defaultValue,
  onChange,
  scrollToTopOnChange = false,
  fullWidth          = false,
  showLeadingIcon    = true,
  showLabel          = true,
  showDropdown       = false,
  showGroupBorder     = false,
  panels,
  className,
  tabListClassName,
  panelsWrapperClassName,
}: TabsProps) {
  const uid = useId();

  const [internalValue, setInternalValue] = useState<string>(() => {
    if (defaultValue !== undefined) return defaultValue;
    return tabs.find((tab) => !tab.disabled)?.id ?? '';
  });

  const activeId = controlledValue ?? internalValue;

  const handleSelect = (id: string) => {
    if (controlledValue === undefined) setInternalValue(id);
    onChange?.(id);
    if (scrollToTopOnChange) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t  = components.tabs.colour[theme];
  const sz = sizeTokens[size];
  const prefersReducedMotion = useReducedMotion();

  const listIsColumn      = indicatorPosition !== 'bottom';
  const contentIsVertical = orientation === 'vertical';
  const isBottom          = indicatorPosition === 'bottom';
  const isLeft            = indicatorPosition === 'left';
  /** Rail fill replaces the sliding line only in column layouts; row tabs always use the line. */
  const showSlidingLine   = activeAppearance === 'line' || !listIsColumn;

  const listChromeStyle: React.CSSProperties = {
    backgroundColor: t.listSurface,
    ...(showGroupBorder
      ? { border: `${borderWidth.thin} solid ${t.listBorder}` }
      : isBottom
        ? { borderBottom: `${indicatorThickness} solid ${t.listBorder}` }
        : { borderRight: `${indicatorThickness} solid ${t.listBorder}` }),
  };

  const listRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorLayout, setIndicatorLayout] = useState<
    | { left: number; width: number }
    | { top: number; height: number }
  | null>(null);

  const measureIndicator = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const el = triggerRefs.current.get(activeId);
    if (!el) return;
    const listRect = list.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    if (isBottom) {
      setIndicatorLayout({
        left: elRect.left - listRect.left,
        width: elRect.width,
      });
    } else {
      setIndicatorLayout({
        top: elRect.top - listRect.top,
        height: elRect.height,
      });
    }
  }, [activeId, isBottom]);

  useLayoutEffect(() => {
    let cancelled = false;
    const schedule = () => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        requestAnimationFrame(() => {
          if (!cancelled) measureIndicator();
        });
      });
    };
    schedule();
    const list = listRef.current;
    if (!list) return () => { cancelled = true };
    const ro = new ResizeObserver(schedule);
    ro.observe(list);
    const activeEl = triggerRefs.current.get(activeId);
    if (activeEl) ro.observe(activeEl);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [measureIndicator, activeId, fullWidth, listIsColumn, showSlidingLine]);

  const indicatorTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, ...motionTokens.spring.default };

  const enabledTabs = tabs.filter((t) => !t.disabled);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isHorizontal = !listIsColumn;
    const next = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    const prev = isHorizontal ? 'ArrowLeft'  : 'ArrowUp';

    if (e.key === next || e.key === prev) {
      e.preventDefault();
      const idx = enabledTabs.findIndex((t) => t.id === activeId);
      const nextIdx = e.key === next
        ? (idx + 1) % enabledTabs.length
        : (idx - 1 + enabledTabs.length) % enabledTabs.length;
      const target = enabledTabs[nextIdx];
      if (target) {
        handleSelect(target.id);
        triggerRefs.current.get(target.id)?.focus();
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      const focusedId = (document.activeElement as HTMLElement)?.id?.replace(`${uid}-tab-`, '');
      const tab = tabs.find((t) => t.id === focusedId);
      if (tab && !tab.disabled) {
        e.preventDefault();
        handleSelect(tab.id);
      }
    }
  };

  const triggers = tabs.map((tab) => (
    <TabTrigger
      key={tab.id}
      tab={tab}
      isActive={tab.id === activeId}
      contentIsVertical={contentIsVertical}
      listIsColumn={listIsColumn}
      indicatorPosition={indicatorPosition}
      activeAppearance={activeAppearance}
      onSelect={handleSelect}
      tabId={`${uid}-tab-${tab.id}`}
      panelId={`${uid}-panel-${tab.id}`}
      t={t}
      sz={sz}
      theme={theme}
      fullWidth={fullWidth}
      showLeadingIcon={showLeadingIcon}
      showLabel={showLabel}
      showDropdown={showDropdown}
      triggerRef={(el) => {
        if (el) triggerRefs.current.set(tab.id, el);
      }}
    />
  ));

  return (
    <div
      className={cn(
        // Column list → outer wraps tab list + panels side-by-side
        // Row list    → outer stacks tab list above panels
        listIsColumn ? 'flex flex-row' : 'flex flex-col',
        className,
      )}
    >
      {/* ── Tab list ── */}
      <div
        ref={listRef}
        role="tablist"
        onKeyDown={handleKeyDown}
        className={cn(
          'relative flex',
          listIsColumn ? 'flex-col' : 'flex-row',
          !listIsColumn && fullWidth && 'w-full',
          showSlidingLine && 'isolate',
          tabListClassName,
        )}
        style={listChromeStyle}
      >
        {showSlidingLine && indicatorLayout && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute z-[1]"
            style={
              'left' in indicatorLayout
                ? { backgroundColor: t.activeIndicator, bottom: -1, height: indicatorThickness }
                : isLeft
                  ? { backgroundColor: t.activeIndicator, left: -1, width: indicatorThickness }
                  : { backgroundColor: t.activeIndicator, right: -1, width: indicatorThickness }
            }
            initial={'left' in indicatorLayout ? { left: indicatorLayout.left, width: indicatorLayout.width } : { top: indicatorLayout.top, height: indicatorLayout.height }}
            animate={'left' in indicatorLayout ? { left: indicatorLayout.left, width: indicatorLayout.width } : { top: indicatorLayout.top, height: indicatorLayout.height }}
            transition={indicatorTransition}
          />
        )}
        {triggers}
      </div>

      {/* ── Panels ── */}
      {panels && (
        <div className={cn(listIsColumn ? 'flex-1 pl-5 pt-1' : 'mt-4', panelsWrapperClassName)}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              id={`${uid}-panel-${tab.id}`}
              role="tabpanel"
              aria-labelledby={`${uid}-tab-${tab.id}`}
              hidden={tab.id !== activeId}
              tabIndex={0}
              className="leading-relaxed focus-visible:outline-none"
              style={{ color: t.panelText, fontSize: typography.fontSize.md }}
            >
              {panels[tab.id]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Tabs.displayName = 'Tabs';

export { Tabs };
export default Tabs;
