'use client'

import React, { useState, useEffect } from 'react'
import { cn } from './utils'
import { components, typography, motion as motionTokens } from '@/lib/tokens'
import { DisplayChip } from './chip'
import { Checkbox } from './checkbox'
import { Toggle } from './toggle-switch'

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS v3
//   Container: node 36226-31517 (Selector component set)
//     Variants: List/search results · DC · Category · Supplier · Market ·
//               Action menu · Sort · Year · Month · Day/Numbers · Week · Time ·
//               🗓️ 1 month · 🗓️ 2 months
//   Atom: node 36226-31865 (_item list)
//
// Architecture: ALL list-based variants (List through Time) use the same
//   Menu + MenuItem atoms with different pre-populated data.
//   The "1 month" and "2 months" variants are dedicated calendar components.

export type MenuTheme = 'light' | 'dark'

export type MenuItemState =
  | 'default'
  | 'hover'
  | 'pressed'
  | 'expanded'
  | 'selected'
  | 'rangeSelect'
  | 'weekSelected'
  | 'focused'
  | 'disabled'
  | 'disabledSelected'

export interface MenuItemProps {
  label: string
  description?: string
  state?: MenuItemState
  sectionTitle?: boolean
  showCheckbox?: boolean
  checked?: boolean
  indeterminate?: boolean
  showLeadingIcon?: boolean
  leadingIcon?: React.ReactNode
  showChip?: boolean
  chipLabel?: string
  /** Chevron points down; rotates 180° when expanded=true */
  showChevron?: boolean
  expanded?: boolean
  /** Called when the chevron icon itself is clicked — allows row click and chevron click to be independent */
  onChevronClick?: () => void
  theme?: MenuTheme
  onClick?: () => void
  className?: string
}

export interface MenuProps {
  children: React.ReactNode
  maxHeight?: number | string
  theme?: MenuTheme
  className?: string
  style?: React.CSSProperties
}

// List-picker shared props
interface ListPickerBase {
  theme?: MenuTheme
  className?: string
  style?: React.CSSProperties
  maxHeight?: number | string
}

export interface MenuYearPickerProps extends ListPickerBase {
  startYear?: number
  endYear?: number
  value?: number
  onSelect?: (year: number) => void
  selectedKeys?: Set<number>
  onToggle?: (key: number) => void
  showCheckbox?: boolean
}

export interface MenuMonthListPickerProps extends ListPickerBase {
  /** Selected month index 0–11 */
  value?: number
  onSelect?: (month: number) => void
  selectedKeys?: Set<number>
  onToggle?: (key: number) => void
  showCheckbox?: boolean
}

export interface MenuDayListPickerProps extends ListPickerBase {
  /** Selected day 1–31 */
  value?: number
  onSelect?: (day: number) => void
  selectedKeys?: Set<number>
  onToggle?: (key: number) => void
  showCheckbox?: boolean
}

export interface MenuWeekPickerProps extends ListPickerBase {
  /** ISO year */
  year?: number
  /** Single-select: selected week number */
  value?: number
  onSelect?: (week: number) => void
  /** Range selection: first endpoint — shown with weekSelected (dark-green) state */
  rangeStart?: number
  /** Range selection: last endpoint — shown with weekSelected (dark-green) state */
  rangeEnd?: number
  /** Called on click for both single and range selection */
  onToggle?: (week: number) => void
  /** Multi-select: set of selected week numbers */
  selectedKeys?: Set<number>
  showCheckbox?: boolean
  /** How many weeks to show (default 52) */
  visibleWeeks?: number
  /** Hide weeks before this ISO week number (e.g. current week to hide past weeks) */
  minWeek?: number
}

export interface MenuTimePickerProps extends ListPickerBase {
  /** Selected time string e.g. "09:00" */
  value?: string
  onSelect?: (time: string) => void
  /** Interval in minutes (default 30) */
  interval?: 15 | 30 | 60
  /** Show "All day" as first item with a checkbox */
  showAllDay?: boolean
  allDay?: boolean
  onAllDayChange?: (v: boolean) => void
}

export interface MenuDateCalendarProps {
  value?: Date
  /** Range end date — when set, enables range highlight between value and rangeEnd */
  rangeEnd?: Date
  onSelect?: (date: Date) => void
  onRangeSelect?: (start: Date, end: Date | null) => void
  /** Show 1 or 2 months side-by-side (default 1) */
  months?: 1 | 2
  /** "Multiple weeks" toggle state */
  multipleWeeks?: boolean
  onMultipleWeeksChange?: (v: boolean) => void
  /** Hide the "Multiple weeks" toggle in the side panel */
  hideMultipleWeeksToggle?: boolean
  /** Enable two-click date range selection (first click = start, second click = end) */
  rangeSelect?: boolean
  /** Dates strictly before this date are disabled (e.g. pass `new Date()` to block past dates) */
  minDate?: Date
  /** Restrict selectable days to specific weekday indices (0=Sun…6=Sat). Other days are disabled. */
  enabledDaysOfWeek?: number[]
  theme?: MenuTheme
  className?: string
  style?: React.CSSProperties
}

// Token alias
const mn = components.menu

// ─── Shared icons ─────────────────────────────────────────────────────────────

function DefaultLeadingIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="2" rx="1" fill={color} />
      <rect x="3" y="11" width="14" height="2" rx="1" fill={color} />
      <rect x="3" y="17" width="10" height="2" rx="1" fill={color} />
    </svg>
  )
}

function ChevronDownIcon({ color, flipped = false }: { color: string; flipped?: boolean }) {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden
      style={{ transform: flipped ? 'rotate(180deg)' : 'none', transition: `transform ${motionTokens.duration.base} ${motionTokens.easing.easeOut}` }}
    >
      <path d="M6 9l6 6 6-6" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronNavIcon({ color, direction }: { color: string; direction: 'left' | 'right' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      {direction === 'left'
        ? <path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        : <path d="M9 18l6-6-6-6" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      }
    </svg>
  )
}

// ─── MenuItem ─────────────────────────────────────────────────────────────────

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  (
    {
      label, description, state = 'default', sectionTitle = false,
      showCheckbox = false, checked = false, indeterminate = false,
      showLeadingIcon = false, leadingIcon,
      showChip = false, chipLabel = 'Recommended',
      showChevron = false, expanded = false, onChevronClick,
      theme = 'light', onClick, className,
    },
    ref,
  ) => {
    const col = mn.colour[theme]
    const isDisabled     = state === 'disabled' || state === 'disabledSelected'
    const isSelected     = state === 'selected'  || state === 'disabledSelected'
    const isRangeSelect  = state === 'rangeSelect'
    const isWeekSelected = state === 'weekSelected'
    const isFocused      = state === 'focused'

    let bgColor: string = col.bg.default
    if (state === 'hover')     bgColor = col.bg.hover
    if (state === 'pressed')   bgColor = col.bg.pressed
    if (isSelected)            bgColor = col.bg.selected
    if (isRangeSelect)         bgColor = col.bg.rangeSelect
    if (isWeekSelected)        bgColor = col.selectedBorder
    if (state === 'disabled')  bgColor = col.bg.disabled
    if (isFocused)             bgColor = col.bg.focused

    const hasAccentBorder = isSelected || isRangeSelect

    if (sectionTitle) {
      return (
        <>
          <div ref={ref} className={cn(className)}
            style={{
              display: 'flex', flexDirection: 'row', alignItems: 'center', gap: mn.gap,
              paddingLeft: mn.paddingX, paddingRight: mn.paddingX,
              minHeight: mn.itemHeight, userSelect: 'none',
              backgroundColor: col.bg.default,
            }}
            role="presentation">
            {showLeadingIcon && (
              <span className="shrink-0 flex items-center justify-center" style={{ width: mn.iconSize, height: mn.iconSize }}>
                {leadingIcon ?? <DefaultLeadingIcon color={col.icon} />}
              </span>
            )}
            <span style={{
              fontSize: mn.sectionTitleFontSize, fontWeight: mn.sectionTitleFontWeight,
              color: col.label, fontFamily: typography.fontFamily.body,
              lineHeight: 1.4,
            }}>{label}</span>
          </div>
          <div style={{ paddingLeft: mn.paddingX, paddingRight: mn.paddingX }}
            role="separator" aria-hidden>
            <div style={{ borderTop: `1px solid ${col.divider}`, width: '100%' }} />
          </div>
        </>
      )
    }

    const labelColor   = isDisabled ? col.disabledLabel : isWeekSelected ? col.weekSelectedLabel : col.label
    const descColor    = isDisabled ? col.disabledLabel : isWeekSelected ? col.weekSelectedDesc  : col.description
    const iconColor    = isDisabled ? col.disabledLabel : isWeekSelected ? col.weekSelectedLabel : col.icon
    const chevronColor = isDisabled ? col.disabledLabel : isWeekSelected ? col.weekSelectedLabel : col.icon

    return (
      <div
        ref={ref}
        role="menuitem"
        aria-disabled={isDisabled || undefined}
        aria-expanded={showChevron ? expanded : undefined}
        tabIndex={isDisabled ? -1 : 0}
        className={cn(className)}
        style={{
          display: 'flex', flexDirection: 'row', alignItems: 'center', gap: mn.gap,
          paddingLeft:  hasAccentBorder ? `calc(${mn.paddingX} - 3px)` : mn.paddingX,
          paddingRight: showChevron ? '8px' : mn.paddingX,
          minHeight: mn.itemHeight,
          backgroundColor: bgColor,
          borderLeft: hasAccentBorder ? `3px solid ${col.selectedBorder}` : '3px solid transparent',
          outline: isFocused ? `2px solid ${col.focusRing}` : 'none',
          outlineOffset: isFocused ? '-2px' : undefined,
          opacity: state === 'disabled' ? 0.48 : 1,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          transition: `background-color ${motionTokens.duration.quick} ${motionTokens.easing.easeOut}`,
        }}
        onClick={() => { if (!isDisabled) onClick?.() }}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) { e.preventDefault(); onClick?.() }
        }}
      >
        {showCheckbox && (
          <span style={{ pointerEvents: 'none' }}>
            <Checkbox checked={isSelected || checked} indeterminate={indeterminate}
              disabled={isDisabled} theme={theme} size="md" aria-hidden tabIndex={-1} />
          </span>
        )}
        {showLeadingIcon && (
          <span className="shrink-0 flex items-center justify-center" style={{ width: mn.iconSize, height: mn.iconSize }}>
            {leadingIcon ?? <DefaultLeadingIcon color={iconColor} />}
          </span>
        )}
        <span className="flex-1 min-w-0 flex flex-col justify-center py-2">
          <span style={{
            fontSize: mn.labelFontSize,
            fontWeight: (isWeekSelected || isRangeSelect) ? mn.semiBoldFontWeight : mn.labelFontWeight,
            color: labelColor, fontFamily: typography.fontFamily.body,
            lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{label}</span>
          {description && (
            <span style={{
              fontSize: mn.descFontSize, fontWeight: mn.descFontWeight,
              color: descColor, fontFamily: typography.fontFamily.body,
              lineHeight: 1.4, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{description}</span>
          )}
        </span>
        {showChip && (
          <DisplayChip chipColour="positive" appearance="light" size="sm" theme={theme}>{chipLabel}</DisplayChip>
        )}
        {showChevron && (
          <span
            className="shrink-0 flex items-center justify-center"
            style={{ width: mn.iconSize, height: mn.iconSize }}
            onClick={onChevronClick ? (e) => { e.stopPropagation(); onChevronClick() } : undefined}
          >
            <ChevronDownIcon color={chevronColor} flipped={expanded} />
          </span>
        )}
      </div>
    )
  },
)
MenuItem.displayName = 'MenuItem'

// ─── MenuDivider ──────────────────────────────────────────────────────────────

export function MenuDivider({ theme = 'light' }: { theme?: MenuTheme }) {
  const col = mn.colour[theme]
  return (
    <div style={{ paddingLeft: mn.paddingX, paddingRight: mn.paddingX, paddingTop: '4px', paddingBottom: '4px' }}
      role="separator" aria-hidden>
      <div style={{ borderTop: `1px solid ${col.divider}`, width: '100%' }} />
    </div>
  )
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  ({ children, maxHeight, theme = 'light', className, style }, ref) => {
    const col = mn.colour[theme]
    return (
      <div ref={ref} role="menu" className={cn('flex flex-col', className)}
        style={{
          backgroundColor: col.container,
          borderRadius: mn.containerRadius,
          border: `1px solid ${col.border}`,
          boxShadow: mn.containerShadow,
          paddingTop: mn.containerPaddingY,
          paddingBottom: mn.containerPaddingY,
          maxHeight, overflowY: maxHeight ? 'auto' : undefined,
          minWidth: 200,
          ...style,
        }}>
        {children}
      </div>
    )
  },
)
Menu.displayName = 'Menu'

// ─── Internal helper: item with built-in hover/pressed ────────────────────────
// Used by all the list pickers so they work out-of-the-box without canvas wrappers.

function PickerItem({
  id, label, description, selected, selectedState = 'selected', theme, onClick, showCheckbox, leadingIcon,
}: {
  id: string | number
  label: string
  description?: string
  selected: boolean
  selectedState?: MenuItemState
  theme: MenuTheme
  onClick: () => void
  showCheckbox?: boolean
  leadingIcon?: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const state: MenuItemState = pressed ? 'pressed' : selected ? selectedState : hovered ? 'hover' : 'default'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      <MenuItem
        theme={theme}
        label={label}
        description={description}
        state={state}
        showCheckbox={showCheckbox}
        checked={selected}
        showLeadingIcon={!!leadingIcon}
        leadingIcon={leadingIcon}
        onClick={onClick}
      />
    </div>
  )
}

// ─── MenuYearPicker ───────────────────────────────────────────────────────────
// Figma: Selector=🗓️ Year — scrollable list of year numbers

export const MenuYearPicker = React.forwardRef<HTMLDivElement, MenuYearPickerProps>(
  ({ startYear = 2020, endYear = new Date().getFullYear() + 2, value, onSelect, selectedKeys, onToggle, showCheckbox, theme = 'light', className, style, maxHeight = 300 }, ref) => {
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
    return (
      <Menu ref={ref} theme={theme} className={className} style={{ minWidth: 200, ...style }} maxHeight={maxHeight}>
        {years.map(y => {
          const isSelected = selectedKeys ? selectedKeys.has(y) : y === value
          return (
            <PickerItem key={y} id={y} label={String(y)} selected={isSelected}
              showCheckbox={showCheckbox} theme={theme}
              onClick={() => onToggle ? onToggle(y) : onSelect?.(y)} />
          )
        })}
      </Menu>
    )
  },
)
MenuYearPicker.displayName = 'MenuYearPicker'

// ─── MenuMonthListPicker ──────────────────────────────────────────────────────
// Figma: Selector=🗓️ Month — scrollable list of month names

const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']

export const MenuMonthListPicker = React.forwardRef<HTMLDivElement, MenuMonthListPickerProps>(
  ({ value, onSelect, selectedKeys, onToggle, showCheckbox, theme = 'light', className, style, maxHeight = 300 }, ref) => (
    <Menu ref={ref} theme={theme} className={className} style={{ minWidth: 200, ...style }} maxHeight={maxHeight}>
      {MONTHS_FULL.map((name, i) => {
        const isSelected = selectedKeys ? selectedKeys.has(i) : i === value
        return (
          <PickerItem key={i} id={i} label={name} selected={isSelected}
            showCheckbox={showCheckbox} theme={theme}
            onClick={() => onToggle ? onToggle(i) : onSelect?.(i)} />
        )
      })}
    </Menu>
  ),
)
MenuMonthListPicker.displayName = 'MenuMonthListPicker'

// ─── MenuDayListPicker ────────────────────────────────────────────────────────
// Figma: Selector=🗓️ Day/Numbers — scrollable list of day numbers 01–31

export const MenuDayListPicker = React.forwardRef<HTMLDivElement, MenuDayListPickerProps>(
  ({ value, onSelect, selectedKeys, onToggle, showCheckbox, theme = 'light', className, style, maxHeight = 300 }, ref) => (
    <Menu ref={ref} theme={theme} className={className} style={{ minWidth: 200, ...style }} maxHeight={maxHeight}>
      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
        const isSelected = selectedKeys ? selectedKeys.has(d) : d === value
        return (
          <PickerItem key={d} id={d} label={String(d).padStart(2, '0')} selected={isSelected}
            showCheckbox={showCheckbox} theme={theme}
            onClick={() => onToggle ? onToggle(d) : onSelect?.(d)} />
        )
      })}
    </Menu>
  ),
)
MenuDayListPicker.displayName = 'MenuDayListPicker'

// ─── MenuWeekPicker ───────────────────────────────────────────────────────────
// Figma: Selector=🗓️ Week — scrollable list of ISO week labels

const MONTHS_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getWeekRange(year: number, week: number): { label: string; description: string } {
  // Find the Monday of ISO week `week` in `year`
  const jan4    = new Date(year, 0, 4) // Jan 4 is always in week 1
  const jan4Day = jan4.getDay() || 7   // Mon=1…Sun=7
  const monday  = new Date(jan4)
  monday.setDate(jan4.getDate() - (jan4Day - 1) + (week - 1) * 7)
  const sunday  = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2,'0')} ${MONTHS_ABBR[d.getMonth()]}. ${d.getFullYear()}`
  return {
    label:       `W${String(week).padStart(2,'0')}`,
    description: `${fmt(monday)}-${fmt(sunday)}`,
  }
}

export const MenuWeekPicker = React.forwardRef<HTMLDivElement, MenuWeekPickerProps>(
  ({ year = new Date().getFullYear(), value, onSelect, rangeStart, rangeEnd, onToggle, selectedKeys, showCheckbox, theme = 'light', className, style, maxHeight = 300, visibleWeeks = 52, minWeek }, ref) => {
    const hasRange = rangeStart !== undefined && rangeEnd !== undefined
    const lo = hasRange ? Math.min(rangeStart!, rangeEnd!) : undefined
    const hi = hasRange ? Math.max(rangeStart!, rangeEnd!) : undefined
    return (
      <Menu ref={ref} theme={theme} className={className} style={{ minWidth: 220, ...style }} maxHeight={maxHeight}>
        {Array.from({ length: visibleWeeks }, (_, i) => i + 1).filter(w => minWeek === undefined || w >= minWeek).map(w => {
          const { label, description } = getWeekRange(year, w)
          const handleClick = onToggle ? () => onToggle(w) : () => onSelect?.(w)

          let isSelected = false
          let selState: MenuItemState = 'selected'

          if (selectedKeys) {
            isSelected = selectedKeys.has(w)
          } else if (hasRange) {
            const isEndpoint = w === lo || w === hi
            const isMid      = lo !== undefined && hi !== undefined && w > lo && w < hi
            isSelected = isEndpoint || isMid
            selState   = isEndpoint ? 'weekSelected' : 'rangeSelect'
          } else {
            isSelected = w === value
          }

          return <PickerItem key={w} id={w} label={label} description={description}
            selected={isSelected} selectedState={selState} showCheckbox={showCheckbox}
            theme={theme} onClick={handleClick} />
        })}
      </Menu>
    )
  },
)
MenuWeekPicker.displayName = 'MenuWeekPicker'

// ─── MenuTimePicker ───────────────────────────────────────────────────────────
// Figma: Selector=⏰ Time — scrollable list of time slots, optional All Day checkbox

function buildTimeSlots(interval: 15 | 30 | 60): string[] {
  const slots: string[] = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += interval) {
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
    }
  }
  return slots
}

export const MenuTimePicker = React.forwardRef<HTMLDivElement, MenuTimePickerProps>(
  ({ value, onSelect, theme = 'light', className, style, maxHeight = 300, interval = 30, showAllDay = true, allDay = false, onAllDayChange }, ref) => {
    const slots = buildTimeSlots(interval)
    const col   = mn.colour[theme]
    return (
      <Menu ref={ref} theme={theme} className={className} style={{ minWidth: 200, ...style }} maxHeight={maxHeight}>
        {showAllDay && (
          <>
            {/* All day row with checkbox — matching Figma Time selector's Show checkbox=true */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: mn.gap,
              paddingLeft: mn.paddingX, paddingRight: mn.paddingX, minHeight: mn.itemHeight,
              cursor: 'pointer', userSelect: 'none',
              transition: `background-color ${motionTokens.duration.quick} ${motionTokens.easing.easeOut}`,
            }}
              onClick={() => onAllDayChange?.(!allDay)}
            >
              <span style={{ pointerEvents: 'none' }}>
                <Checkbox checked={allDay} theme={theme} size="md" aria-hidden tabIndex={-1} />
              </span>
              <span style={{
                fontSize: mn.labelFontSize, fontWeight: mn.labelFontWeight,
                color: col.label, fontFamily: typography.fontFamily.body,
              }}>All day</span>
            </div>
            <MenuDivider theme={theme} />
          </>
        )}
        {!allDay && slots.map(t => (
          <PickerItem key={t} id={t} label={t} selected={t === value} theme={theme} onClick={() => onSelect?.(t)} />
        ))}
        {allDay && (
          <div style={{ padding: `8px ${mn.paddingX}`, textAlign: 'center' }}>
            <span style={{ fontSize: mn.descFontSize, color: col.description, fontFamily: typography.fontFamily.body }}>
              All-day event selected
            </span>
          </div>
        )}
      </Menu>
    )
  },
)
MenuTimePicker.displayName = 'MenuTimePicker'

// ─── MenuAction ───────────────────────────────────────────────────────────────
// Figma Enterprise DS v3 — Action menu variant (node 36226-31332)
// Contextual list of labelled actions — no selection state, optional leading
// icons, danger variant for destructive items, dividers between groups.

export interface MenuActionItem {
  /** Unique identifier */
  id: string
  /** Visible label */
  label: string
  /** Optional leading icon (20×20 recommended) */
  icon?: React.ReactNode
  /** 'danger' renders the item in the negative/destructive colour */
  variant?: 'default' | 'danger'
  disabled?: boolean
  onClick?: () => void
}

/** Pass `null` to insert a divider between groups */
export type MenuActionEntry = MenuActionItem | null

export interface MenuActionProps {
  items: MenuActionEntry[]
  theme?: MenuTheme
  className?: string
  style?: React.CSSProperties
  maxHeight?: number | string
}

const ACTION_DANGER_COLOR: Record<MenuTheme, string> = {
  light: '#B30000',
  dark:  '#FE8680',
}
const ACTION_DANGER_HOVER_BG: Record<MenuTheme, string> = {
  light: 'rgba(179,0,0,0.06)',
  dark:  'rgba(254,134,128,0.08)',
}

function ActionItem({
  item, theme,
}: {
  item: MenuActionItem
  theme: MenuTheme
}) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const col      = mn.colour[theme]
  const isDanger = item.variant === 'danger'

  const labelColor = item.disabled
    ? col.disabledLabel
    : isDanger
      ? ACTION_DANGER_COLOR[theme]
      : col.label

  const bg = item.disabled
    ? 'transparent'
    : pressed
      ? isDanger ? ACTION_DANGER_HOVER_BG[theme] : col.bg.pressed
      : hovered
        ? isDanger ? ACTION_DANGER_HOVER_BG[theme] : col.bg.hover
        : 'transparent'

  return (
    <div
      role="menuitem"
      aria-disabled={item.disabled || undefined}
      onMouseEnter={() => !item.disabled && setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => !item.disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onClick={() => !item.disabled && item.onClick?.()}
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             mn.gap,
        padding:         `${mn.paddingY} ${mn.paddingX}`,
        backgroundColor: bg,
        cursor:          item.disabled ? 'not-allowed' : 'pointer',
        opacity:         item.disabled ? 0.48 : 1,
        transition:      `background-color ${motionTokens.duration.fast}`,
        userSelect:      'none',
        minHeight:       mn.itemHeight,
      }}
    >
      {item.icon && (
        <span style={{ width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: labelColor }}>
          {item.icon}
        </span>
      )}
      <span style={{
        flex:       1,
        minWidth:   0,
        fontSize:   mn.labelFontSize,
        fontWeight: mn.labelFontWeight,
        lineHeight: '1.4em',
        fontFamily: typography.fontFamily.body,
        color:      labelColor,
      }}>
        {item.label}
      </span>
    </div>
  )
}

export const MenuAction = React.forwardRef<HTMLDivElement, MenuActionProps>(
  ({ items, theme = 'light', className, style, maxHeight }, ref) => (
    <Menu ref={ref} theme={theme} className={className} style={style} maxHeight={maxHeight}>
      {items.map((entry, i) =>
        entry === null
          ? <MenuDivider key={`divider-${i}`} theme={theme} />
          : <ActionItem key={entry.id} item={entry} theme={theme} />
      )}
    </Menu>
  ),
)
MenuAction.displayName = 'MenuAction'

// ─── MenuCountryPicker ────────────────────────────────────────────────────────
// Figma Enterprise DS v3 — Country selector variant
// Each item has a flag emoji as leading icon + country name

export interface MenuCountryPickerProps extends ListPickerBase {
  /** Controlled selected country code (ISO 3166-1 alpha-2, e.g. 'US') */
  value?: string
  /** Called on single-select */
  onSelect?: (code: string) => void
  /** Multi-select: set of selected country codes */
  selectedKeys?: Set<string>
  /** Called on multi-select toggle */
  onToggle?: (code: string) => void
  /** Show checkboxes (multi-select mode) */
  showCheckbox?: boolean
}

const COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: 'AU', name: 'Australia',      flag: '🇦🇺' },
  { code: 'BR', name: 'Brazil',         flag: '🇧🇷' },
  { code: 'CA', name: 'Canada',         flag: '🇨🇦' },
  { code: 'CN', name: 'China',          flag: '🇨🇳' },
  { code: 'DE', name: 'Germany',        flag: '🇩🇪' },
  { code: 'ES', name: 'Spain',          flag: '🇪🇸' },
  { code: 'FR', name: 'France',         flag: '🇫🇷' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'IN', name: 'India',          flag: '🇮🇳' },
  { code: 'IT', name: 'Italy',          flag: '🇮🇹' },
  { code: 'JP', name: 'Japan',          flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea',    flag: '🇰🇷' },
  { code: 'MX', name: 'Mexico',         flag: '🇲🇽' },
  { code: 'NL', name: 'Netherlands',    flag: '🇳🇱' },
  { code: 'PL', name: 'Poland',         flag: '🇵🇱' },
  { code: 'SE', name: 'Sweden',         flag: '🇸🇪' },
  { code: 'SG', name: 'Singapore',      flag: '🇸🇬' },
  { code: 'US', name: 'United States',  flag: '🇺🇸' },
  { code: 'ZA', name: 'South Africa',   flag: '🇿🇦' },
]

function FlagIcon({ flag }: { flag: string }) {
  return (
    <span role="img" aria-hidden style={{ fontSize: typography.fontSize.md, lineHeight: 1, display: 'flex', alignItems: 'center' }}>
      {flag}
    </span>
  )
}

export const MenuCountryPicker = React.forwardRef<HTMLDivElement, MenuCountryPickerProps>(
  ({ value, onSelect, selectedKeys, onToggle, showCheckbox = false, theme = 'light', className, style, maxHeight = 300 }, ref) => (
    <Menu ref={ref} theme={theme} className={className} style={{ minWidth: 220, ...style }} maxHeight={maxHeight}>
      {COUNTRIES.map(({ code, name, flag }) => {
        const isSelected = selectedKeys ? selectedKeys.has(code) : code === value
        return (
          <PickerItem
            key={code}
            id={code}
            label={name}
            selected={isSelected}
            showCheckbox={showCheckbox}
            theme={theme}
            onClick={() => onToggle ? onToggle(code) : onSelect?.(code)}
            leadingIcon={<FlagIcon flag={flag} />}
          />
        )
      })}
    </Menu>
  ),
)
MenuCountryPicker.displayName = 'MenuCountryPicker'

// ─── MenuDateCalendar ─────────────────────────────────────────────────────────
// Figma: Selector=🗓️ 1 month (node 36226-31598) / 🗓️ 2 months (node 36226-31719)
// Layout: [side panel: Multiple weeks toggle + Day/Week button + list] | [month(s)]
// Header background: #EEEEEE (light) / #2E2E2E (dark)
// Day headers: Mon…Sun, 40px wide, Body/Medium/Bold centred
// Date cells: 40px wide, Body/Small/Regular, prev/next month shown grey

const CAL_DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS_SHORT   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

/** Returns the ISO week number (1–53) for a given date */
function getISOWeek(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

/** Returns the Monday–Sunday Date bounds for an ISO week in the given year */
function getWeekBounds(year: number, week: number): { start: Date; end: Date } {
  const jan4    = new Date(year, 0, 4)
  const jan4Day = jan4.getDay() || 7
  const monday  = new Date(jan4)
  monday.setDate(jan4.getDate() - (jan4Day - 1) + (week - 1) * 7)
  const sunday  = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { start: monday, end: sunday }
}

function CalendarMonth({
  year, month, startDate, endDate, weekHighlights, onDayClick, theme,
  showPrevArrow, showNextArrow, onPrev, onNext, minDate, enabledDaysOfWeek,
}: {
  year: number
  month: number
  startDate: Date | null
  endDate: Date | null
  /** Week ranges from the side-panel selection — shown with rangeSelect highlight */
  weekHighlights: { start: Date; end: Date }[]
  onDayClick: (d: Date) => void
  theme: MenuTheme
  showPrevArrow: boolean
  showNextArrow: boolean
  onPrev: () => void
  onNext: () => void
  minDate?: Date
  enabledDaysOfWeek?: number[]
}) {
  const col       = mn.colour[theme]
  const today     = new Date()
  const todayY    = today.getFullYear()
  const todayM    = today.getMonth()
  const todayD    = today.getDate()
  const headerBg  = theme === 'light' ? '#EEEEEE' : '#2E2E2E'

  // Build Monday-first grid, filling prev/next month's days
  type Cell = { day: number; date: Date; inMonth: boolean }
  const firstDay    = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7   // Mon=0…Sun=6
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMo      = month === 0 ? 11 : month - 1
  const prevYr      = month === 0 ? year - 1 : year
  const daysInPrev  = new Date(prevYr, prevMo + 1, 0).getDate()
  const nextMo      = month === 11 ? 0 : month + 1
  const nextYr      = month === 11 ? year + 1 : year

  const cells: Cell[] = []
  for (let i = 0; i < startOffset; i++) {
    const d = daysInPrev - (startOffset - 1 - i)
    cells.push({ day: d, date: new Date(prevYr, prevMo, d), inMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, date: new Date(year, month, d), inMonth: true })
  let nd = 1
  while (cells.length % 7 !== 0)
    cells.push({ day: nd, date: new Date(nextYr, nextMo, nd++), inMonth: false })

  const weeks: Cell[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  function isSame(d1: Date, d2: Date | null) {
    return d2 && d1.getFullYear() === d2.getFullYear()
      && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
  }
  function inRange(d: Date) {
    if (!startDate || !endDate) return false
    const t = d.getTime()
    return t > startDate.getTime() && t < endDate.getTime()
  }

  const navBtn: React.CSSProperties = {
    width: 20, height: 20, background: 'none', border: 'none',
    cursor: 'pointer', padding: 0, display: 'flex',
    alignItems: 'center', justifyContent: 'center', borderRadius: 4,
    flexShrink: 0,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header — grey background */}
      <div style={{ backgroundColor: headerBg }}>
        {/* Month / Year navigation */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16,
        }}>
          {showPrevArrow
            ? <button type="button" onClick={onPrev} style={navBtn} aria-label="Previous month">
                <ChevronNavIcon color={col.icon} direction="left" />
              </button>
            : <span style={{ width: 20, flexShrink: 0 }} />
          }
          <span style={{
            fontFamily: typography.fontFamily.body,
            fontWeight: mn.sectionTitleFontWeight, fontSize: mn.sectionTitleFontSize,
            color: col.label, whiteSpace: 'nowrap',
          }}>
            {MONTHS_SHORT[month]} {year}
          </span>
          {showNextArrow
            ? <button type="button" onClick={onNext} style={navBtn} aria-label="Next month">
                <ChevronNavIcon color={col.icon} direction="right" />
              </button>
            : <span style={{ width: 20, flexShrink: 0 }} />
          }
        </div>
        {/* Day-of-week column headers */}
        <div style={{ display: 'flex', padding: '0 16px' }}>
          {CAL_DAY_LABELS.map(d => (
            <div key={d} style={{
              width: 40, textAlign: 'center',
              fontFamily: typography.fontFamily.body,
              fontWeight: mn.sectionTitleFontWeight, fontSize: mn.sectionTitleFontSize,
              color: col.label, padding: '6px 0',
            }}>{d}</div>
          ))}
        </div>
      </div>

      {/* Date grid */}
      <div style={{ padding: '16px 0', backgroundColor: col.container }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', padding: '0 16px' }}>
            {week.map((cell, di) => {
              const isStart    = !!isSame(cell.date, startDate)
              const isEnd      = !!isSame(cell.date, endDate)
              const isSelected = isStart || isEnd
              const isInRange  = inRange(cell.date)
              const isToday    = cell.inMonth && cell.day === todayD
                                   && year === todayY && month === todayM
              const t              = cell.date.getTime()
              const isPast         = minDate != null && cell.date < minDate
              const isDisabledDay  = enabledDaysOfWeek != null && !enabledDaysOfWeek.includes(cell.date.getDay())
              const isDisabled     = isPast || isDisabledDay

              // Week highlights show for all non-past cells (including disabled days like non-Thursdays)
              const isWeekStart = !isPast && weekHighlights.some(({ start }) => isSame(cell.date, start))
              const isWeekEnd   = !isPast && weekHighlights.some(({ end })   => isSame(cell.date, end))
              const isWeekMid   = !isPast && !isWeekStart && !isWeekEnd && weekHighlights.some(
                ({ start, end }) => t > start.getTime() && t < end.getTime()
              )
              const isWeekCap   = isWeekStart || isWeekEnd
              const isInWeek    = isWeekCap || isWeekMid

              let cellBg: string    = 'transparent'
              // Enabled days always get full label color; disabled/past get muted color
              const isEnabledDay = !isPast && !isDisabledDay
              let cellColor: string = isEnabledDay || isInWeek ? col.label : col.disabledLabel
              let btnBorder         = '1.5px solid transparent'
              let btnRadius         = '50%'

              if (isPast) {
                // past dates — no highlight, just muted text
              } else if (isSelected && !isDisabledDay) { cellBg = col.selectedBorder; cellColor = '#FFFFFF' }
              else if (isWeekCap)   { cellBg = col.selectedBorder; cellColor = '#FFFFFF' }
              else if (isInRange && !isDisabledDay)   { cellBg = col.bg.rangeSelect; btnRadius = '0' }
              else if (isWeekMid)   { cellBg = col.bg.rangeSelect; btnRadius = '0' }
              else if (isToday && !isDisabledDay)     { btnBorder = `1.5px solid ${col.selectedBorder}` }

              // Radius caps for direct range selection
              if (!isDisabled && isStart && endDate)   btnRadius = '50% 0 0 50%'
              if (!isDisabled && isEnd && startDate)   btnRadius = '0 50% 50% 0'

              // Radius caps for week highlights (Mon = left cap, Sun = right cap)
              if (!isSelected && isWeekStart) btnRadius = '50% 0 0 50%'
              if (!isSelected && isWeekEnd)   btnRadius = '0 50% 50% 0'

              return (
                <div key={di} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <button type="button"
                    onClick={() => !isDisabled && onDayClick(cell.date)}
                    disabled={isDisabled}
                    style={{
                      width: 32, height: 32, borderRadius: btnRadius,
                      fontSize: mn.labelFontSize, fontWeight: mn.labelFontWeight,
                      fontFamily: typography.fontFamily.body,
                      color: cellColor, backgroundColor: cellBg, border: btnBorder,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      transition: `background-color ${motionTokens.duration.quick}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      // Only dim cells that are truly inactive (past, or disabled day not in a highlighted week)
                      opacity: isPast || (isDisabledDay && !isInWeek) ? 0.4 : 1,
                    }}>
                    {cell.day}
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export const MenuDateCalendar = React.forwardRef<HTMLDivElement, MenuDateCalendarProps>(
  (
    {
      value, rangeEnd, onSelect, onRangeSelect,
      months = 1, multipleWeeks = false, onMultipleWeeksChange,
      hideMultipleWeeksToggle = false, rangeSelect = false, minDate, enabledDaysOfWeek,
      theme = 'light', className, style,
    },
    ref,
  ) => {
    const today = new Date()
    const [viewYear,    setViewYear]    = useState(value?.getFullYear() ?? today.getFullYear())
    const [viewMonth,   setViewMonth]   = useState(value?.getMonth()    ?? today.getMonth())
    const [rangeStart,  setRangeStart]  = useState<Date | null>(value ?? null)
    const [rangeEndLoc, setRangeEndLoc] = useState<Date | null>(rangeEnd ?? null)
    const [selecting,   setSelecting]   = useState(false)

    // Side-panel state — pre-select week(s) from value/rangeEnd when enabledDaysOfWeek is set
    const initialWeekRange = (() => {
      if (!value || !enabledDaysOfWeek) return null
      const wStart = getISOWeek(value)
      const wEnd   = rangeEnd ? getISOWeek(rangeEnd) : wStart
      return { start: Math.min(wStart, wEnd), end: Math.max(wStart, wEnd) }
    })()
    const [weekRange,     setWeekRange]     = useState<{ start: number; end: number } | null>(initialWeekRange)
    const [weekPicking,   setWeekPicking]   = useState(false)

    // Reset week selection when multipleWeeks is toggled off
    useEffect(() => {
      if (!multipleWeeks) {
        setWeekRange(null)
        setWeekPicking(false)
      }
    }, [multipleWeeks])

    // Used when enabledDaysOfWeek is set: two-click range — first click = anchor, second = end
    function handleWeekSelect(week: number) {
      if (!weekPicking || weekRange === null) {
        setWeekRange({ start: week, end: week })
        setWeekPicking(true)
        setRangeStart(null)
        setRangeEndLoc(null)
        // Navigate calendar to this week's month
        const { start: monday } = getWeekBounds(viewYear, week)
        const thursday = new Date(monday); thursday.setDate(monday.getDate() + 3)
        setViewYear(thursday.getFullYear()); setViewMonth(thursday.getMonth())
      } else {
        const lo = Math.min(weekRange.start, week)
        const hi = Math.max(weekRange.start, week)
        setWeekRange({ start: lo, end: hi })
        setWeekPicking(false)
        // Fire range callback via onRangeSelect using the Monday of each endpoint week
        const { start: s } = getWeekBounds(viewYear, lo)
        const { start: e } = getWeekBounds(viewYear, hi)
        onRangeSelect?.(s, e)
      }
    }

    function handleWeekClick(week: number) {
      if (!multipleWeeks) {
        // Single-week mode: click selects; click same week deselects
        setWeekRange(prev => (prev?.start === week ? null : { start: week, end: week }))
        // Clear any individual date selection so calendar shows only the week highlight
        setRangeStart(null)
        setRangeEndLoc(null)
        setWeekPicking(false)
        return
      }
      // Range mode: first click = anchor, second click = complete range
      if (!weekPicking || weekRange === null) {
        setWeekRange({ start: week, end: week })
        setWeekPicking(true)
      } else {
        const lo = Math.min(weekRange.start, week)
        const hi = Math.max(weekRange.start, week)
        setWeekRange({ start: lo, end: hi })
        setWeekPicking(false)
      }
    }

    // Compute Date ranges for every week in the range so the calendar can shade them
    const weekHighlights = weekRange
      ? Array.from({ length: weekRange.end - weekRange.start + 1 }, (_, i) =>
          getWeekBounds(viewYear, weekRange.start + i))
      : []

    const col    = mn.colour[theme]
    const isDark = theme === 'dark'

    function prevMonth() {
      if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
      else setViewMonth(m => m - 1)
    }
    function nextMonth() {
      const step = months === 2 ? 2 : 1
      if (viewMonth + step > 11) { setViewYear(y => y + 1); setViewMonth(m => (m + step) % 12) }
      else setViewMonth(m => m + step)
    }

    function handleDayClick(date: Date) {
      if (enabledDaysOfWeek) {
        // Monday-only mode: two-click week range
        const week = getISOWeek(date)
        if (!weekPicking || weekRange === null) {
          setWeekRange({ start: week, end: week })
          setWeekPicking(true)
          setRangeStart(null); setRangeEndLoc(null)
          onSelect?.(date)
        } else {
          const lo = Math.min(weekRange.start, week)
          const hi = Math.max(weekRange.start, week)
          setWeekRange({ start: lo, end: hi })
          setWeekPicking(false)
          const { start: s } = getWeekBounds(viewYear, lo)
          const { start: e } = getWeekBounds(viewYear, hi)
          onRangeSelect?.(s, e)
        }
        return
      }
      if (!multipleWeeks && !rangeSelect) {
        setRangeStart(date); setRangeEndLoc(null)
        setSelecting(false)
        onSelect?.(date)
      } else if (!selecting || !rangeStart) {
        setRangeStart(date); setRangeEndLoc(null); setSelecting(true)
      } else {
        const [s, e] = date < rangeStart ? [date, rangeStart] : [rangeStart, date]
        setRangeStart(s); setRangeEndLoc(e); setSelecting(false)
        onRangeSelect?.(s, e)
      }
    }

    const month2 = (viewMonth + 1) % 12
    const year2  = viewMonth === 11 ? viewYear + 1 : viewYear

    const flatListStyle: React.CSSProperties = {
      border: 'none', borderRadius: 0, boxShadow: 'none', width: '100%',
      paddingTop: 0, paddingBottom: 0,
      maxHeight: 'none',  // outer scrollable div handles clipping; remove inner 300px cap
    }

    return (
      <div
        ref={ref}
        className={cn(className)}
        style={{
          display: 'flex', flexDirection: 'row',
          backgroundColor: col.container,
          borderRadius: 6,
          border: `1px solid ${col.border}`,
          boxShadow: '0px 2px 4px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* ── Side panel ──────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', flexDirection: 'column', flexShrink: 0,
          borderRight: `1px solid ${col.divider}`,
          backgroundColor: col.container,
        }}>
          {/* Controls: optional Multiple weeks toggle */}
          {!hideMultipleWeeksToggle && (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 16,
              padding: '15px 16px', borderBottom: `1px solid ${col.divider}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{
                  fontSize: mn.labelFontSize, color: col.label,
                  fontFamily: typography.fontFamily.body, whiteSpace: 'nowrap',
                }}>
                  Multiple weeks
                </span>
                <Toggle checked={multipleWeeks} onChange={onMultipleWeeksChange} density="compact" theme={theme} />
              </div>
            </div>
          )}
          {/* Week list — flex:1 gives this div the remaining column height;
               position:relative makes it a containing block so the inner
               absolute div can be sized to exactly that height and scroll.
               minWidth:220 keeps the panel visible when the toggle is hidden
               (position:absolute children are out of flow and don't contribute
               to intrinsic width). */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative', minWidth: 220 }}>
            <div style={{
              position: 'absolute', inset: 0,
              overflowY: 'auto',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ height: mn.containerPaddingY, flexShrink: 0 }} />
              <MenuWeekPicker theme={theme} year={viewYear}
                rangeStart={weekRange?.start} rangeEnd={weekRange?.end}
                onSelect={enabledDaysOfWeek ? handleWeekSelect : undefined}
                onToggle={enabledDaysOfWeek ? undefined : handleWeekClick}
                minWeek={minDate != null ? getISOWeek(minDate) : undefined}
                maxHeight={undefined}
                style={flatListStyle} />
              <div style={{ height: mn.containerPaddingY, flexShrink: 0 }} />
            </div>
          </div>
        </div>

        {/* ── Month(s) ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexShrink: 0 }}>
          <CalendarMonth
            year={viewYear} month={viewMonth}
            startDate={rangeStart} endDate={rangeEndLoc}
            weekHighlights={weekHighlights}
            onDayClick={handleDayClick} theme={theme}
            showPrevArrow showNextArrow={months === 1}
            onPrev={prevMonth} onNext={nextMonth}
            minDate={minDate}
            enabledDaysOfWeek={enabledDaysOfWeek}
          />
          {months === 2 && (
            <>
              <div style={{ width: 1, backgroundColor: col.divider, alignSelf: 'stretch' }} />
              <CalendarMonth
                year={year2} month={month2}
                startDate={rangeStart} endDate={rangeEndLoc}
                weekHighlights={weekHighlights}
                onDayClick={handleDayClick} theme={theme}
                showPrevArrow={false} showNextArrow
                onPrev={prevMonth} onNext={nextMonth}
                minDate={minDate}
                enabledDaysOfWeek={enabledDaysOfWeek}
              />
            </>
          )}
        </div>
      </div>
    )
  },
)
MenuDateCalendar.displayName = 'MenuDateCalendar'

export default Menu
