'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Button } from './button'
import { MenuItem, MenuDivider } from './menu'
import {
  SearchOutline,
  CloseOutline,
  ChevronRightOutline,
  ChevronLeftOutline,
  KeyboardDoubleArrowRightOutline,
  KeyboardDoubleArrowLeftOutline,
} from './icons'
import { semantic, spacing, radius, borderWidth, typography, components } from '@/lib/tokens'

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS — Transfer List component (node 7232:132543)
//
// Structure:
//   ┌─ choices panel (border semantic.border.default, radius.xs)
//   │   ├─ panel heading + item count
//   │   ├─ search input (spacing[400] horizontal padding)
//   │   ├─ Select All row (MenuItem + "X of Y selected" description)
//   │   ├─ MenuDivider
//   │   └─ scrollable item list (MenuItem × n with checkboxes)
//   ├─ actions column (centred, gap spacing[200], height: fill)
//   │   ├─ Move all →  (KeyboardDoubleArrowRight)
//   │   ├─ Move selected → (ChevronRight)
//   │   ├─ Move selected ← (ChevronLeft)
//   │   └─ Move all ←  (KeyboardDoubleArrowLeft)
//   └─ chosen panel (same structure)

export interface TransferListItem {
  /** Unique identifier */
  key: string
  /** Primary label text */
  label: string
  /** Optional secondary description shown below the label */
  description?: string
}

export type TransferListTheme = 'light' | 'dark'

export interface TransferListProps {
  /** Full pool of items that can be transferred */
  items: TransferListItem[]
  /** Controlled: keys currently in the chosen (right) list */
  chosen?: string[]
  /** Uncontrolled default chosen keys */
  defaultChosen?: string[]
  /** Fired whenever the chosen list changes */
  onChosenChange?: (chosenKeys: string[]) => void
  /** Left panel heading (default "Choices") */
  leftTitle?: string
  /** Right panel heading (default "Chosen") */
  rightTitle?: string
  /** Show search inputs (default true) */
  searchable?: boolean
  /** Fixed height of the scrollable item area in px (default 280) */
  listHeight?: number
  theme?: TransferListTheme
  className?: string
  style?: React.CSSProperties
}

// ─── Design tokens ────────────────────────────────────────────────────────────
// All values sourced directly from lib/tokens.ts — no raw hex values here.

const { menu: menuTokens } = components

const COL = {
  light: {
    // Panel surface — page background (white)
    panelBg:     semantic.background.page.light,
    // Container border — default border colour
    panelBorder: semantic.border.default.light,
    // Input field border — strong border (one step above default)
    inputBorder: semantic.border.strong.light,
    // Input field surface — same as page background
    inputBg:     semantic.background.page.light,
    // Primary text — foreground/default/primary
    inputText:   semantic.foreground.default.primary.light,
    // Secondary/placeholder text — menu description colour
    placeholder: menuTokens.colour.light.description,
    // Panel title — foreground/default/primary
    titleText:   semantic.foreground.default.primary.light,
    // Item count — menu description colour (subdued)
    countText:   menuTokens.colour.light.description,
    // Icon colour — menu icon colour
    icon:        menuTokens.colour.light.icon,
  },
  dark: {
    // Panel surface — container surface (dark)
    panelBg:     semantic.background.container.dark,
    // Container border — default border colour (dark)
    panelBorder: semantic.border.default.dark,
    // Input field border — strong border (dark)
    inputBorder: semantic.border.strong.dark,
    // Input field surface — container dark
    inputBg:     semantic.background.container.dark,
    // Primary text — foreground/default/primary (dark)
    inputText:   semantic.foreground.default.primary.dark,
    // Secondary/placeholder text — menu description colour (dark)
    placeholder: menuTokens.colour.dark.description,
    // Panel title — foreground/default/primary (dark)
    titleText:   semantic.foreground.default.primary.dark,
    // Item count — menu description colour (dark)
    countText:   menuTokens.colour.dark.description,
    // Icon colour — menu icon colour (dark)
    icon:        menuTokens.colour.dark.icon,
  },
} as const

// Typography — sourced from components.menu and typography tokens
const FONT = {
  // Panel heading — Body/sm semi-bold (menu label weight)
  titleSize:   menuTokens.labelFontSize,        // 14px
  titleWeight: menuTokens.semiBoldFontWeight,   // 600
  // Item count and empty state — body/xs regular
  countSize:   typography.fontSize.sm,          // 12px
  countWeight: typography.fontWeight.regular,   // 400
  // Search input — body/md regular
  inputSize:   typography.fontSize.md,          // 16px
  inputWeight: typography.fontWeight.regular,   // 400
  lineHeight:  typography.lineHeight.relaxed,   // 1.5em (body/md)
  family:      typography.fontFamily.body,
} as const

// ─── PanelHeader ──────────────────────────────────────────────────────────────

function PanelHeader({
  title, count, theme,
}: { title: string; count: number; theme: TransferListTheme }) {
  const col = COL[theme]
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: `${spacing[300]} ${spacing[400]} ${spacing[200]}`,
    }}>
      <span style={{
        fontSize:   FONT.titleSize,
        fontWeight: FONT.titleWeight,
        lineHeight: typography.lineHeight.loose,
        color:      col.titleText,
        fontFamily: FONT.family,
      }}>
        {title}
      </span>
      <span style={{
        fontSize:   FONT.countSize,
        fontWeight: FONT.countWeight,
        lineHeight: typography.lineHeight.base,
        color:      col.countText,
        fontFamily: FONT.family,
      }}>
        {count} items
      </span>
    </div>
  )
}

// ─── SearchInput ──────────────────────────────────────────────────────────────

function SearchInput({
  value, onChange, theme,
}: { value: string; onChange: (v: string) => void; theme: TransferListTheme }) {
  const col = COL[theme]
  return (
    <div style={{ padding: `0 ${spacing[400]} ${spacing[200]}`, minWidth: 0, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: spacing[200],
        border: `${borderWidth.thin} solid ${col.inputBorder}`,
        borderRadius: radius.xs,
        padding: spacing[200],
        background: col.inputBg,
        minWidth: 0,
      }}>
        <span style={{ color: col.icon, flexShrink: 0, display: 'flex' }}>
          <SearchOutline size={16} />
        </span>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Quick search"
          size={1}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontSize:   FONT.inputSize,
            fontWeight: FONT.inputWeight,
            lineHeight: FONT.lineHeight,
            color:      col.inputText,
            fontFamily: FONT.family,
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              border: 'none', background: 'none', cursor: 'pointer',
              color: col.icon, padding: 0, lineHeight: 1, flexShrink: 0,
              display: 'flex', alignItems: 'center',
            }}
            aria-label="Clear search"
          >
            <CloseOutline size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── InteractiveMenuItem ──────────────────────────────────────────────────────
// Wraps the DS MenuItem atom — drives state from pointer events so we don't
// duplicate the hover/pressed colour logic that lives inside MenuItem itself.

function InteractiveMenuItem({
  label, description, checked, indeterminate = false, theme, onClick,
}: {
  label: string
  description?: string
  checked: boolean
  indeterminate?: boolean
  theme: TransferListTheme
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const state = pressed ? 'pressed' : checked ? 'selected' : hovered ? 'hover' : 'default'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      <MenuItem
        label={label}
        description={description}
        state={state}
        showCheckbox
        checked={checked}
        indeterminate={indeterminate}
        theme={theme}
        onClick={onClick}
      />
    </div>
  )
}

// ─── TransferPanel ────────────────────────────────────────────────────────────

function TransferPanel({
  title, items, checkedKeys, onToggleItem, onToggleAll,
  searchValue, onSearchChange, searchable, listHeight, theme,
}: {
  title: string
  items: TransferListItem[]
  checkedKeys: Set<string>
  onToggleItem: (key: string) => void
  onToggleAll: () => void
  searchValue: string
  onSearchChange: (v: string) => void
  searchable: boolean
  listHeight: number
  theme: TransferListTheme
}) {
  const col = COL[theme]

  const filteredItems = useMemo(
    () => searchValue
      ? items.filter(it => it.label.toLowerCase().includes(searchValue.toLowerCase()))
      : items,
    [items, searchValue],
  )

  const checkedCount = items.filter(it => checkedKeys.has(it.key)).length
  const allChecked   = items.length > 0 && checkedCount === items.length
  const someChecked  = checkedCount > 0 && !allChecked

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      flex: '1 1 0', minWidth: 200,
      background: col.panelBg,
      border: `${borderWidth.thin} solid ${col.panelBorder}`,
      borderRadius: radius.xs,
      overflow: 'hidden',
    }}>
      {/* Panel heading + item count */}
      <PanelHeader title={title} count={items.length} theme={theme} />

      {/* Optional search */}
      {searchable && (
        <SearchInput value={searchValue} onChange={onSearchChange} theme={theme} />
      )}

      {/* Select All — DS MenuItem atom with indeterminate checkbox + count description */}
      <InteractiveMenuItem
        label="Select All"
        description={`${checkedCount} of ${items.length} selected`}
        checked={allChecked}
        indeterminate={someChecked}
        theme={theme}
        onClick={onToggleAll}
      />

      {/* DS MenuDivider separating the header row from the item list */}
      <MenuDivider theme={theme} />

      {/* Scrollable item list — each row is a DS MenuItem atom */}
      <div style={{ overflowY: 'auto', height: listHeight }}>
        {filteredItems.length === 0 ? (
          <div style={{
            padding: spacing[400],
            fontSize:   menuTokens.labelFontSize,
            fontWeight: typography.fontWeight.regular,
            lineHeight: typography.lineHeight.loose,
            color:      col.placeholder,
            fontFamily: FONT.family,
            textAlign: 'center',
          }}>
            No items
          </div>
        ) : (
          filteredItems.map(item => (
            <InteractiveMenuItem
              key={item.key}
              label={item.label}
              description={item.description}
              checked={checkedKeys.has(item.key)}
              theme={theme}
              onClick={() => onToggleItem(item.key)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── TransferList ─────────────────────────────────────────────────────────────

const TransferList = React.forwardRef<HTMLDivElement, TransferListProps>(
  (
    {
      items,
      chosen: chosenProp,
      defaultChosen,
      onChosenChange,
      leftTitle  = 'Choices',
      rightTitle = 'Chosen',
      searchable = true,
      listHeight = 280,
      theme      = 'light',
      className,
      style,
    },
    ref,
  ) => {
    // ── Controlled / uncontrolled chosen keys ──────────────────────────────
    const isControlled = chosenProp !== undefined
    const [internalChosen, setInternalChosen] = useState<Set<string>>(
      () => new Set(defaultChosen ?? []),
    )
    const chosenKeys = isControlled ? new Set(chosenProp) : internalChosen

    const setChosen = (next: Set<string>) => {
      if (!isControlled) setInternalChosen(next)
      onChosenChange?.(Array.from(next))
    }

    // ── Per-panel checked state ────────────────────────────────────────────
    const [leftChecked,  setLeftChecked]  = useState<Set<string>>(new Set())
    const [rightChecked, setRightChecked] = useState<Set<string>>(new Set())

    // ── Per-panel search state ─────────────────────────────────────────────
    const [leftSearch,  setLeftSearch]  = useState('')
    const [rightSearch, setRightSearch] = useState('')

    // Clear stale search values when searchable is turned off so the panels
    // don't stay filtered while the input is hidden.
    useEffect(() => {
      if (!searchable) {
        setLeftSearch('')
        setRightSearch('')
      }
    }, [searchable])

    // ── Derived item lists ─────────────────────────────────────────────────
    const availableItems = useMemo(
      () => items.filter(it => !chosenKeys.has(it.key)),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [items, chosenKeys],
    )
    const chosenItems = useMemo(
      () => items.filter(it => chosenKeys.has(it.key)),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [items, chosenKeys],
    )

    // ── Toggle helpers ─────────────────────────────────────────────────────
    const toggleItem = (panel: 'left' | 'right') => (key: string) => {
      const [checked, setChecked] = panel === 'left'
        ? [leftChecked,  setLeftChecked]
        : [rightChecked, setRightChecked]
      const next = new Set(checked)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      setChecked(next)
    }

    const toggleAll = (panel: 'left' | 'right') => () => {
      const sourceItems = panel === 'left' ? availableItems : chosenItems
      const [checked, setChecked] = panel === 'left'
        ? [leftChecked,  setLeftChecked]
        : [rightChecked, setRightChecked]
      const allSelected = sourceItems.length > 0 && sourceItems.every(it => checked.has(it.key))
      setChecked(allSelected ? new Set() : new Set(sourceItems.map(it => it.key)))
    }

    // ── Transfer actions ───────────────────────────────────────────────────
    const moveAllRight = () => {
      const next = new Set(chosenKeys)
      availableItems.forEach(it => next.add(it.key))
      setChosen(next)
      setLeftChecked(new Set())
    }

    const moveSelectedRight = () => {
      if (leftChecked.size === 0) return
      const next = new Set(chosenKeys)
      leftChecked.forEach(k => next.add(k))
      setChosen(next)
      setLeftChecked(new Set())
    }

    const moveSelectedLeft = () => {
      if (rightChecked.size === 0) return
      const next = new Set(chosenKeys)
      rightChecked.forEach(k => next.delete(k))
      setChosen(next)
      setRightChecked(new Set())
    }

    const moveAllLeft = () => {
      setChosen(new Set())
      setRightChecked(new Set())
    }

    return (
      <div
        ref={ref}
        className={className}
        style={{
          display: 'flex', flexDirection: 'row', alignItems: 'stretch',
          gap: spacing[200],
          ...style,
        }}
      >
        {/* ── Left panel: Choices ─────────────────────────────────────── */}
        <TransferPanel
          title={leftTitle}
          items={availableItems}
          checkedKeys={leftChecked}
          onToggleItem={toggleItem('left')}
          onToggleAll={toggleAll('left')}
          searchValue={leftSearch}
          onSearchChange={setLeftSearch}
          searchable={searchable}
          listHeight={listHeight}
          theme={theme}
        />

        {/* ── Actions column — DS Button atoms (fill/positive/sm) ─────── */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: spacing[200], flexShrink: 0,
        }}>
          {/* Move all → */}
          <Button
            variant="fill"
            color="positive"
            size="sm"
            theme={theme}
            showLeadingIcon
            leadingIcon={<KeyboardDoubleArrowRightOutline size={16} />}
            onClick={moveAllRight}
            disabled={availableItems.length === 0}
            aria-label="Move all to chosen"
            style={{ width: '32px', padding: 0 }}
          />
          {/* Move selected → */}
          <Button
            variant="fill"
            color="positive"
            size="sm"
            theme={theme}
            showLeadingIcon
            leadingIcon={<ChevronRightOutline size={16} />}
            onClick={moveSelectedRight}
            disabled={!availableItems.some(it => leftChecked.has(it.key))}
            aria-label="Move selected to chosen"
            style={{ width: '32px', padding: 0 }}
          />
          {/* Move selected ← */}
          <Button
            variant="fill"
            color="positive"
            size="sm"
            theme={theme}
            showLeadingIcon
            leadingIcon={<ChevronLeftOutline size={16} />}
            onClick={moveSelectedLeft}
            disabled={!chosenItems.some(it => rightChecked.has(it.key))}
            aria-label="Move selected to choices"
            style={{ width: '32px', padding: 0 }}
          />
          {/* Move all ← */}
          <Button
            variant="fill"
            color="positive"
            size="sm"
            theme={theme}
            showLeadingIcon
            leadingIcon={<KeyboardDoubleArrowLeftOutline size={16} />}
            onClick={moveAllLeft}
            disabled={chosenItems.length === 0}
            aria-label="Move all to choices"
            style={{ width: '32px', padding: 0 }}
          />
        </div>

        {/* ── Right panel: Chosen ─────────────────────────────────────── */}
        <TransferPanel
          title={rightTitle}
          items={chosenItems}
          checkedKeys={rightChecked}
          onToggleItem={toggleItem('right')}
          onToggleAll={toggleAll('right')}
          searchValue={rightSearch}
          onSearchChange={setRightSearch}
          searchable={searchable}
          listHeight={listHeight}
          theme={theme}
        />
      </div>
    )
  },
)

TransferList.displayName = 'TransferList'

export { TransferList }
export default TransferList
