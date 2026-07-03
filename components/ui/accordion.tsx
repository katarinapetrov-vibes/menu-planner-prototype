'use client';

import React, { useState, useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from './utils';
import { components, typography } from '@/lib/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AccordionDensity  = 'compact' | 'default' | 'comfortable';
export type AccordionTheme    = 'light' | 'dark';
export type AccordionVariant  = 'outlined' | 'flush';

export interface AccordionItemData {
  /** Unique identifier for the item */
  id:           string;
  /** Header title text */
  title:        string;
  /** Optional classes merged onto the title row (e.g. font-bold) */
  titleClassName?: string;
  /** Optional supporting text shown below the title */
  subtitle?:    string;
  /** Optional leading icon slot */
  leadingIcon?: React.ReactNode;
  /** Expanded panel content */
  content:      React.ReactNode;
  /** Disables interaction for this item */
  disabled?:    boolean;
}

export type AccordionChevronPosition = 'left' | 'right';

export interface AccordionProps {
  /** Array of accordion items */
  items:              AccordionItemData[];
  /** 'outlined' wraps items in a bordered container; 'flush' uses dividers only. Default: 'outlined' */
  variant?:           AccordionVariant;
  /**
   * Controls spacing density — adjusts padding and gap, not font size.
   * 'compact' · 'default' · 'comfortable'. Default: 'default'
   */
  density?:           AccordionDensity;
  /** Theme — passed through for canvas context. Default: 'light' */
  theme?:             AccordionTheme;
  /** Allow more than one item to be open at once. Default: false */
  allowMultiple?:     boolean;
  /** IDs of items that start open. Default: [] */
  defaultOpen?:       string[];
  /**
   * Which side the expand/collapse chevron sits on.
   * 'right' — trailing chevron (default, most common).
   * 'left'  — leading chevron; icon points right when collapsed, down when expanded.
   */
  chevronPosition?:   AccordionChevronPosition;
  className?:         string;
}

// ─── Density Tokens ───────────────────────────────────────────────────────────
// Font sizes are fixed across all densities (md/16px title, xs/12px subtitle).
// Only padding, gap, and trigger height change.
//
// compact:     36 px trigger · px-3 · gap-2 · py-1.5
// default:     44 px trigger · px-4 · gap-3 · py-2.5
// comfortable: 56 px trigger · px-5 · gap-4 · py-4

const densityTokens: Record<
  AccordionDensity,
  {
    triggerCls:      string;
    px:              string;
    gap:             string;
    titleCls:        string;
    titleFontSize:   string;
    subtitleCls:     string;
    subtitleFontSize: string;
    iconCls:         string;
    chevronCls:      string;
    contentCls:      string;
    contentFontSize: string;
  }
> = {
  compact: {
    triggerCls:      'py-1.5',
    px:              'px-3',
    gap:             'gap-2',
    titleCls:        'font-medium leading-5',
    titleFontSize:   typography.fontSize.md,
    subtitleCls:     'leading-4',
    subtitleFontSize: typography.fontSize.sm,
    iconCls:         'w-4 h-4 shrink-0 flex items-center',
    chevronCls:      'w-4 h-4 shrink-0',
    contentCls:      'pb-2',
    contentFontSize: typography.fontSize.md,
  },
  default: {
    triggerCls:      'py-2.5',
    px:              'px-4',
    gap:             'gap-3',
    titleCls:        'font-medium leading-5',
    titleFontSize:   typography.fontSize.md,
    subtitleCls:     'leading-4',
    subtitleFontSize: typography.fontSize.sm,
    iconCls:         'w-[18px] h-[18px] shrink-0 flex items-center',
    chevronCls:      'w-4 h-4 shrink-0',
    contentCls:      'pb-4',
    contentFontSize: typography.fontSize.md,
  },
  comfortable: {
    triggerCls:      'py-4',
    px:              'px-5',
    gap:             'gap-4',
    titleCls:        'font-medium leading-5',
    titleFontSize:   typography.fontSize.md,
    subtitleCls:     'leading-4',
    subtitleFontSize: typography.fontSize.sm,
    iconCls:         'w-[18px] h-[18px] shrink-0 flex items-center',
    chevronCls:      'w-4 h-4 shrink-0',
    contentCls:      'pb-6',
    contentFontSize: typography.fontSize.md,
  },
};

// ─── Chevron Icon ─────────────────────────────────────────────────────────────

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      aria-hidden
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Animated Panel ───────────────────────────────────────────────────────────

function AnimatedPanel({ open, children }: { open: boolean; children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  const transition = prefersReducedMotion
    ? { duration: components.accordion.motion.reducedDuration }
    : { type: 'spring' as const, stiffness: components.accordion.motion.stiffness, damping: components.accordion.motion.damping };

  return (
    <motion.div
      initial={false}
      animate={{
        height: open ? 'auto' : 0,
        opacity: open ? 1 : 0,
      }}
      transition={transition}
      aria-hidden={!open}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  );
}

// ─── AccordionItem ────────────────────────────────────────────────────────────

interface AccordionItemInternalProps {
  item:             AccordionItemData;
  open:             boolean;
  onToggle:         () => void;
  density:          AccordionDensity;
  theme:            AccordionTheme;
  isFirst:          boolean;
  triggerId:        string;
  panelId:          string;
  chevronPosition:  AccordionChevronPosition;
}

function AccordionItemInternal({
  item,
  open,
  onToggle,
  density,
  theme,
  isFirst,
  triggerId,
  panelId,
  chevronPosition,
}: AccordionItemInternalProps) {
  const t  = components.accordion.colour[theme];
  const sz = densityTokens[density];

  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const bgColor = item.disabled
    ? 'transparent'
    : isPressed
      ? t.pressedBg
      : isHovered
        ? t.hoverBg
        : 'transparent';

  return (
    <div
      style={isFirst ? undefined : { borderTopColor: t.divider }}
      className={cn(!isFirst && 'border-t')}
    >
      {/* ── Trigger ── */}
      <button
        id={triggerId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        disabled={item.disabled}
        onClick={onToggle}
        onMouseEnter={() => !item.disabled && setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
        onMouseDown={() => !item.disabled && setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        className={cn(
          'w-full flex items-center text-left transition-colors duration-fast',
          'focus-visible:outline focus-visible:outline-2',
          sz.triggerCls,
          sz.px,
          sz.gap,
          item.disabled && 'opacity-40 cursor-not-allowed',
        )}
        style={{
          backgroundColor: bgColor,
          outlineColor: t.focusOutline,
          outlineOffset: components.accordion.focusOutlineOffset,
          minHeight: components.accordion.density[density].triggerMinHeight,
        } as React.CSSProperties}
      >
        {/* Chevron — left */}
        {chevronPosition === 'left' && (
          <span
            className={cn(sz.chevronCls, 'transition-transform duration-base', open ? 'rotate-0' : '-rotate-90')}
            style={{ color: t.chevronColor }}
          >
            <ChevronIcon />
          </span>
        )}

        {/* Leading icon — uses iconColor (title-level colour) not chevronColor */}
        {item.leadingIcon && (
          <span className={sz.iconCls} style={{ color: t.iconColor }}>
            {item.leadingIcon}
          </span>
        )}

        {/* Title + optional subtitle */}
        <span className="flex-1 min-w-0">
          {item.title && (
            <span
              className={cn('block truncate', sz.titleCls, item.titleClassName)}
              style={{ color: t.titleText, fontSize: sz.titleFontSize }}
            >
              {item.title}
            </span>
          )}
          {item.subtitle && (
            <span
              className={cn('block truncate', sz.subtitleCls)}
              style={{ color: t.subtitleText, fontSize: sz.subtitleFontSize }}
            >
              {item.subtitle}
            </span>
          )}
        </span>

        {/* Chevron — right */}
        {chevronPosition === 'right' && (
          <span
            className={cn(sz.chevronCls, 'transition-transform duration-base', open && 'rotate-180')}
            style={{ color: t.chevronColor }}
          >
            <ChevronIcon />
          </span>
        )}
      </button>

      {/* ── Content panel ── */}
      <AnimatedPanel open={open}>
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          className={cn(sz.px, sz.contentCls)}
          style={{ color: t.contentText, fontSize: sz.contentFontSize }}
        >
          {item.content}
        </div>
      </AnimatedPanel>
    </div>
  );
}

// ─── Accordion (main export) ──────────────────────────────────────────────────

function Accordion({
  items,
  variant         = 'outlined',
  density         = 'default',
  theme           = 'light',
  allowMultiple   = false,
  defaultOpen     = [],
  chevronPosition = 'right',
  className,
}: AccordionProps) {
  const uid = useId();
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(defaultOpen));

  const t = components.accordion.colour[theme];

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div
      className={cn(
        'w-full',
        variant === 'outlined' && 'rounded-lg border overflow-hidden',
        className,
      )}
      style={{
        backgroundColor: t.containerBg,
        ...(variant === 'outlined' && { borderColor: t.containerBorder }),
      }}
    >
      {items.map((item, idx) => (
        <AccordionItemInternal
          key={item.id}
          item={item}
          open={openIds.has(item.id)}
          onToggle={() => toggle(item.id)}
          density={density}
          theme={theme}
          isFirst={idx === 0}
          triggerId={`${uid}-trigger-${item.id}`}
          panelId={`${uid}-panel-${item.id}`}
          chevronPosition={chevronPosition}
        />
      ))}
    </div>
  );
}

Accordion.displayName = 'Accordion';

export { Accordion };
export default Accordion;
