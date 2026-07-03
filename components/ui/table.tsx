'use client'

import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useReducedMotion } from 'framer-motion'
import { cn } from './utils'
import { components, typography, spacing, radius, motion as motionTokens, borderWidth } from '@/lib/tokens'
import { Checkbox } from './checkbox'
import { Button } from './button'
import { Divider } from './divider'
import { Menu, MenuItem, MenuDivider } from './menu'

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS — Table node 34782-89519
// Atoms: _table-cell (41825-116672), _header cell variant (16547-259436),
//        _table-cell-trend (41718-54851), _cell chevron (35490-51425),
//        _table-sort (41825-82174)

export type TableSize      = 'compact' | 'comfortable' | 'spacious'
export type TableTheme     = 'light' | 'dark'
export type SortDirection  = 'asc' | 'desc' | null

export interface TableColumn {
  /** Matches a key in each row data object */
  key: string
  /** Column header label */
  label: string
  /** Fixed pixel width or CSS value — omit for flex-grow */
  width?: number | string
  /** Minimum width in pixels when the column uses flex-grow (no fixed `width`) */
  minWidth?: number
  /** Show sort toggle on this column */
  sortable?: boolean
  /** Show an inline filter input below the header for this column (AG Grid agTextColumnFilter style) */
  filterable?: boolean
  /**
   * Header cell variant — matches Figma _header cell variant:
   * - 'label'   (default): text label, sort icon on hover/active
   * - 'chevron': collapse/expand chevron (row grouping)
   * - 'icon':    icon-only header cell
   */
  headerType?: 'label' | 'chevron' | 'icon'
  /** Icon rendered in 'icon' header type or as a prefix in 'label' type */
  headerIcon?: React.ReactNode
  /** Text alignment within cells */
  align?: 'left' | 'center' | 'right'
  /**
   * Custom cell renderer.
   * Return any React node — status badge, chip, progress bar, etc.
   */
  render?: (value: unknown, row: Record<string, unknown>, rowIndex: number) => React.ReactNode
}

export interface TableAction {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: 'fill' | 'outline' | 'text'
}

export interface TableProps {
  /** Column definitions */
  columns: TableColumn[]
  /** Row data — each object key maps to a column key */
  data: Record<string, unknown>[]

  // ── Title bar ──────────────────────────────────────────────────────────────
  title?: string
  /** Show a count badge next to the title e.g. "Orders (32)" */
  showCount?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  /** Extra controls in the title bar, after search and before the column Filter button */
  titleBarBeforeFilter?: React.ReactNode
  filterButton?: boolean
  onFilter?: () => void
  /** Action buttons rendered at the right of the title bar */
  actions?: TableAction[]

  // ── Selection ──────────────────────────────────────────────────────────────
  selectable?: boolean
  /** Controlled set of selected row keys */
  selectedKeys?: Set<string | number>
  onSelectionChange?: (keys: Set<string | number>) => void
  /** Property name or function to derive a unique key per row (defaults to index) */
  rowKey?: string | ((row: Record<string, unknown>) => string | number)

  // ── Sorting ────────────────────────────────────────────────────────────────
  /** Controlled: key of currently sorted column */
  sortKey?: string
  /** Controlled: current sort direction */
  sortDirection?: SortDirection
  /** Called when user clicks a sortable header. Implement to control sort state. */
  onSort?: (key: string, direction: SortDirection) => void

  // ── Column filtering (AG Grid agTextColumnFilter style) ────────────────────
  /**
   * Show the filter row below headers. Each column with filterable=true
   * renders an inline text input for per-column filtering.
   */
  showFilterRow?: boolean
  /** Controlled: current filter values keyed by column key */
  filterValues?: Record<string, string>
  onFilterChange?: (key: string, value: string) => void

  // ── Row expansion (chevron column) ────────────────────────────────────────
  /**
   * Render function for expanded row content.
   * When provided, chevron columns become interactive expand/collapse toggles.
   */
  expandedContent?: (row: Record<string, unknown>, rowIndex: number) => React.ReactNode
  /** Controlled: set of expanded row keys */
  expandedKeys?: Set<string | number>
  onExpandChange?: (keys: Set<string | number>) => void

  // ── Display ────────────────────────────────────────────────────────────────
  size?: TableSize
  theme?: TableTheme
  emptyMessage?: string

  className?: string
  style?: React.CSSProperties
}

// Token alias
const tb = components.table

// ─── Sort icon (Material/swap_vert — Figma node 41825-82174) ──────────────────
// Default: both arrows at low opacity
// asc (A→Z): down-arrow highlighted  (Figma gradient shows bottom half)
// desc (Z→A): up-arrow highlighted   (Figma gradient shows top half)
function SortIcon({ dir, color }: { dir: SortDirection; color: string }) {
  const upOpacity   = dir === 'desc' ? 1 : dir === 'asc' ? 0.3 : 0.4
  const downOpacity = dir === 'asc'  ? 1 : dir === 'desc' ? 0.3 : 0.4
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      {/* Up arrow — M9 3L5 6.99h3V14h2V6.99h3L9 3z */}
      <path fill={color} fillOpacity={upOpacity}   d="M9 3L5 6.99h3V14h2V6.99h3L9 3z" />
      {/* Down arrow — M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3z */}
      <path fill={color} fillOpacity={downOpacity} d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3z" />
    </svg>
  )
}

// ─── Search icon ──────────────────────────────────────────────────────────────
function SearchIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
      <path d="M16.5 16.5 L21 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ─── Filter icon ─────────────────────────────────────────────────────────────
function FilterIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6h16M7 12h10M10 18h4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ─── Trend cell (Figma: _table-cell-trend node 41718-54851) ───────────────────
// Layout: row, hug — icon 16×16 (Material/arrow_downward or arrow_upward) + text
// Text: Body/Extra Small/Regular — Source Sans Pro 400 12px 1.333em, right-aligned
// Down color: #DB1D1D (light) | trendDown token (dark)
// Up color:   #00A846 (light) | trendUp token (dark)
function TrendCell({ value, theme }: { value: number; theme: TableTheme }) {
  const col   = tb.colour[theme]
  const up    = value >= 0
  const color = up ? col.trendUp : col.trendDown
  // Material/arrow_upward: M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z
  // Material/arrow_downward: M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z
  const arrowPath = up
    ? 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z'
    : 'M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: spacing[50],
      fontFamily: typography.fontFamily.body,
      fontSize: typography.scale['body/label/regular'].fontSize,
      fontWeight: typography.scale['body/label/regular'].fontWeight,
      lineHeight: typography.scale['body/label/regular'].lineHeight,
      color,
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <path fill={color} d={arrowPath} />
      </svg>
      {Math.abs(value).toFixed(2)}%
    </span>
  )
}

// ─── FilterMenuItem ───────────────────────────────────────────────────────────
// Thin wrapper to add hover/pressed state to MenuItem inside the filter dropdown.

function FilterMenuItem({ label, theme, onClick }: { label: string; theme: TableTheme; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <MenuItem label={label} state={hovered ? 'hover' : 'default'} theme={theme} onClick={onClick} />
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

export const Table = React.forwardRef<HTMLDivElement, TableProps>(
  (
    {
      columns,
      data,
      title,
      showCount = false,
      searchable = false,
      searchPlaceholder = 'Quick search',
      onSearch,
      titleBarBeforeFilter,
      filterButton = false,
      actions = [],
      selectable = false,
      selectedKeys: selectedKeysProp,
      onSelectionChange,
      rowKey,
      sortKey: sortKeyProp,
      sortDirection: sortDirectionProp,
      onSort,
      showFilterRow = false,
      filterValues: filterValuesProp,
      onFilterChange,
      expandedContent,
      expandedKeys: expandedKeysProp,
      onExpandChange,
      size = 'comfortable',
      theme = 'light',
      emptyMessage = 'No data to display.',
      className,
      style,
    },
    ref,
  ) => {
    const col = tb.colour[theme]
    const prefersReducedMotion = useReducedMotion()
    const rowTransition = prefersReducedMotion ? undefined : `background-color ${motionTokens.duration.fast} ${motionTokens.easing.easeOut}`

    // ── Internal state (used when uncontrolled) ───────────────────────────────
    const [internalSelected, setInternalSelected]       = useState<Set<string | number>>(new Set())
    const [internalSortKey, setInternalSortKey]         = useState<string | null>(null)
    const [internalSortDir, setInternalSortDir]         = useState<SortDirection>(null)
    const [internalFilterValues, setInternalFilterValues] = useState<Record<string, string>>({})
    const [searchQuery, setSearchQuery]                 = useState('')
    const [internalExpanded, setInternalExpanded]       = useState<Set<string | number>>(new Set())
    const [hoveredRow, setHoveredRow]                   = useState<string | number | null>(null)
    const [hoveredHeader, setHoveredHeader]             = useState<string | null>(null)
    const [openFilterKey, setOpenFilterKey]             = useState<string | null>(null)
    const [filterDropdownPos, setFilterDropdownPos]     = useState<{ top: number; left: number; width: number } | null>(null)
    const [titleFilterOpen, setTitleFilterOpen]         = useState(false)
    const [titleFilterPos, setTitleFilterPos]           = useState<{ top: number; left: number; width: number } | null>(null)
    const headerCellRefs  = useRef<Map<string, HTMLDivElement>>(new Map())
    const titleFilterBtnRef = useRef<HTMLButtonElement>(null)

    // Close column filter dropdown on outside click
    useEffect(() => {
      if (!openFilterKey) return
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node
        const dropdown = document.getElementById('__table-filter-dropdown')
        const headerEl = headerCellRefs.current.get(openFilterKey)
        if (dropdown?.contains(target)) return
        if (headerEl?.contains(target)) return
        setOpenFilterKey(null)
        setFilterDropdownPos(null)
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [openFilterKey])

    // Close title-bar filter dropdown on outside click
    useEffect(() => {
      if (!titleFilterOpen) return
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node
        const dropdown = document.getElementById('__table-title-filter-dropdown')
        const btn = titleFilterBtnRef.current
        if (dropdown?.contains(target)) return
        if (btn?.contains(target)) return
        setTitleFilterOpen(false)
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [titleFilterOpen])

    const isControlledSelection = selectedKeysProp !== undefined
    const isControlledSort      = sortKeyProp !== undefined && sortDirectionProp !== undefined
    const isControlledFilter    = filterValuesProp !== undefined
    const isControlledExpand    = expandedKeysProp !== undefined

    const activeSelected     = isControlledSelection ? selectedKeysProp           : internalSelected
    const activeExpanded     = isControlledExpand    ? expandedKeysProp!          : internalExpanded
    const activeSortKey      = isControlledSort      ? sortKeyProp!               : internalSortKey
    const activeSortDir      = isControlledSort      ? sortDirectionProp!         : internalSortDir
    const activeFilterValues = isControlledFilter    ? filterValuesProp!          : internalFilterValues

    // ── Row key helper ────────────────────────────────────────────────────────
    const getRowKey = (row: Record<string, unknown>, index: number): string | number => {
      if (typeof rowKey === 'function') return rowKey(row)
      if (typeof rowKey === 'string')   return row[rowKey] as string | number
      return index
    }

    // ── Selection handlers ────────────────────────────────────────────────────
    const toggleRow = (key: string | number) => {
      const next = new Set(activeSelected)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      if (!isControlledSelection) setInternalSelected(next)
      onSelectionChange?.(next)
    }

    const toggleAll = (checked: boolean) => {
      const next = checked
        ? new Set(data.map((r, i) => getRowKey(r, i)))
        : new Set<string | number>()
      if (!isControlledSelection) setInternalSelected(next)
      onSelectionChange?.(next)
    }

    const toggleExpand = (key: string | number) => {
      const next = new Set(activeExpanded)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      if (!isControlledExpand) setInternalExpanded(next)
      onExpandChange?.(next)
    }

    const toggleExpandAll = () => {
      const allKeys   = processedData.map((r, i) => getRowKey(r, i))
      const allOpen   = allKeys.length > 0 && allKeys.every(k => activeExpanded.has(k))
      const next      = allOpen ? new Set<string | number>() : new Set<string | number>(allKeys)
      if (!isControlledExpand) setInternalExpanded(next)
      onExpandChange?.(next)
    }

    const allSelected  = data.length > 0 && data.every((r, i) => activeSelected.has(getRowKey(r, i)))
    const someSelected = !allSelected && data.some((r, i) => activeSelected.has(getRowKey(r, i)))

    // ── Sort handler ──────────────────────────────────────────────────────────
    const handleSort = (key: string) => {
      let next: SortDirection
      if (activeSortKey !== key) next = 'asc'
      else if (activeSortDir === 'asc')  next = 'desc'
      else if (activeSortDir === 'desc') next = null
      else next = 'asc'

      // Always update internal state so uncontrolled mode works reliably
      setInternalSortKey(next === null ? null : key)
      setInternalSortDir(next)
      onSort?.(key, next)
    }

    // ── Filter handler ────────────────────────────────────────────────────────
    const handleFilterChange = (key: string, value: string) => {
      if (!isControlledFilter) {
        setInternalFilterValues(prev => ({ ...prev, [key]: value }))
      }
      onFilterChange?.(key, value)
    }

    const toggleFilterDropdown = (key: string) => {
      if (openFilterKey === key) {
        setOpenFilterKey(null)
        setFilterDropdownPos(null)
        return
      }
      const el = headerCellRefs.current.get(key)
      if (!el) return
      const rect = el.getBoundingClientRect()
      setFilterDropdownPos({
        top: rect.bottom,
        left: rect.left,
        width: Math.max(rect.width, 240),
      })
      setOpenFilterKey(key)
    }

    const toggleTitleFilter = () => {
      if (titleFilterOpen) {
        setTitleFilterOpen(false)
        return
      }
      const rect = titleFilterBtnRef.current?.getBoundingClientRect()
      if (!rect) return
      setTitleFilterPos({ top: rect.bottom, left: rect.left, width: Math.max(rect.width, 280) })
      setTitleFilterOpen(true)
    }

    const handleClearAllFilters = () => {
      if (!isControlledFilter) setInternalFilterValues({})
      Object.keys(activeFilterValues).forEach(key => { if (activeFilterValues[key]) onFilterChange?.(key, '') })
    }

    // ── Filtered + sorted data ────────────────────────────────────────────────
    let processedData: Record<string, unknown>[] = data
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      processedData = processedData.filter(row =>
        columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q))
      )
    }
    const filterKeys = Object.keys(activeFilterValues)
    if (filterKeys.length > 0) {
      processedData = processedData.filter(row =>
        filterKeys.every(key => {
          const query = activeFilterValues[key]?.trim().toLowerCase()
          if (!query) return true
          return String(row[key] ?? '').toLowerCase().includes(query)
        }),
      )
    }
    if (activeSortKey && activeSortDir !== null) {
      processedData = [...processedData].sort((a, b) => {
        const av = a[activeSortKey]
        const bv = b[activeSortKey]
        const cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true })
        return activeSortDir === 'asc' ? cmp : -cmp
      })
    }

    // ── Density ───────────────────────────────────────────────────────────────
    const cellPaddingY = tb.density[size].rowCell.paddingY

    // ── Container styles ──────────────────────────────────────────────────────
    const containerStyle: React.CSSProperties = {
      width: '100%',
      border: `1px solid ${col.border}`,
      borderRadius: tb.borderRadius,
      /** Horizontal scroll when row width exceeds container — avoids clipping trailing columns (e.g. row actions) */
      overflowX: 'auto',
      overflowY: 'hidden',
      backgroundColor: col.rowBg,
      ...style,
    }

    const bodyFont: React.CSSProperties = {
      fontFamily: typography.fontFamily.body,
      fontSize: typography.scale['body/md/regular'].fontSize,
      fontWeight: typography.scale['body/md/regular'].fontWeight,
      lineHeight: typography.scale['body/md/regular'].lineHeight,
    }

    const headerFont: React.CSSProperties = {
      fontFamily: typography.fontFamily.body,
      fontSize: tb.headerFontSize,
      fontWeight: tb.headerFontWeight,
      lineHeight: tb.headerLineHeight,
    }

    const smallFont: React.CSSProperties = {
      fontFamily: typography.fontFamily.body,
      fontSize: tb.uiFontSize,
      fontWeight: 400,
      lineHeight: tb.headerLineHeight,
    }

    return (
      <>
      <div ref={ref} role="grid" aria-label={title} className={cn(className)} style={containerStyle}>

        {/* ── Title bar ───────────────────────────────────────────────────── */}
        {(title || searchable || filterButton || actions.length > 0) && (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: `${tb.density[size].titleBar.paddingY} ${tb.density[size].titleBar.paddingX}`,
              backgroundColor: col.titleBg,
              gap: tb.density[size].titleBar.gap,
              flexWrap: 'wrap',
            }}>
              {/* Left: title + count */}
              {title && (
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[200], flexShrink: 0 }}>
                  <span style={{
                    ...bodyFont,
                    fontWeight: 600,
                    color: col.bodyText,
                  }}>
                    {title}
                  </span>
                  {showCount && (
                    <span style={{
                      ...smallFont,
                      fontSize: typography.scale['body/label/regular'].fontSize,
                      padding: `${borderWidth.thin} ${spacing[200]}`,
                      borderRadius: radius.round,
                      background: col.countBadgeBg,
                      color: col.countBadgeText,
                      border: `1px solid ${col.border}`,
                    }}>
                      {data.length}
                    </span>
                  )}
                </div>
              )}

              {/* Right: tools */}
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[200], flexWrap: 'wrap' }}>
                {/* Search */}
                {searchable && (
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: spacing[200], pointerEvents: 'none', display: 'flex' }}>
                      <SearchIcon color={col.searchPlaceholder} />
                    </span>
                    <input
                      type="text"
                      aria-label="Search"
                      value={searchQuery}
                      placeholder={searchPlaceholder}
                      onChange={e => {
                        setSearchQuery(e.target.value)
                        onSearch?.(e.target.value)
                      }}
                      style={{
                        ...smallFont,
                        paddingLeft: '34px', paddingRight: spacing[300],
                        paddingTop: spacing[200], paddingBottom: spacing[200],
                        background: col.searchBg,
                        border: `1px solid ${col.searchBorder}`,
                        borderRadius: radius.sm,
                        color: col.searchText,
                        outline: 'none',
                        width: '220px',
                      }}
                    />
                  </div>
                )}

                {titleBarBeforeFilter}

                {/* Filter button */}
                {filterButton && (() => {
                  const hasAnyFilter = Object.values(activeFilterValues).some(v => !!v)
                  const activeCount  = Object.values(activeFilterValues).filter(v => !!v).length
                  return (
                    <Button
                      ref={titleFilterBtnRef}
                      variant={hasAnyFilter ? 'fill' : 'outline'}
                      color="positive"
                      size="sm"
                      theme={theme}
                      showLeadingIcon
                      leadingIcon={<FilterIcon color="currentColor" />}
                      onClick={toggleTitleFilter}
                    >
                      {hasAnyFilter ? `Filter (${activeCount})` : 'Filter'}
                    </Button>
                  )
                })()}

                {/* Divider before primary actions */}
                {(searchable || filterButton) && actions.length > 0 && (
                  <Divider orientation="vertical" shade={theme === 'dark' ? 'dark' : 'light'} weight="default" />
                )}

                {/* Action buttons */}
                {actions.map((action, i) => (
                  <Button
                    key={i}
                    variant={action.variant === 'fill' ? 'fill' : action.variant === 'text' ? 'text' : 'outline'}
                    color="positive"
                    size="sm"
                    theme={theme}
                    onClick={action.onClick}
                    showLeadingIcon={!!action.icon}
                    leadingIcon={action.icon}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
            <div style={{ height: borderWidth.thin, background: col.border }} />
          </>
        )}

        {/* ── Header row ──────────────────────────────────────────────────── */}
        <div role="rowgroup">
        <div role="row" style={{
          display: 'flex',
          alignItems: 'stretch',
          backgroundColor: col.headerBg,
          borderBottom: `1px solid ${col.border}`,
          minHeight: tb.headerHeight,
        }}>
          {/* Checkbox header cell */}
          {selectable && (
            <div role="columnheader" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: `0 ${spacing[200]}`,
              flexShrink: 0,
              width: tb.checkboxColumnWidth,
            }}>
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={toggleAll}
                aria-label="Select all rows"
                theme={theme}
                size="sm"
              />
            </div>
          )}

          {/* Column headers */}
          {columns.map(column => {
            const isHoveredHdr  = hoveredHeader === column.key
            const isSorted      = activeSortKey === column.key
            const hdrType       = column.headerType ?? 'label'
            const showSortIcon  = column.sortable && (isHoveredHdr || isSorted)
            const hdrBg         = isHoveredHdr ? col.headerHoverBg : undefined

            // ── Chevron header (Figma: _header chevron, node 35490-52691) ────
            // State=Close (all collapsed) → expand_all icon  (↑↓ outward)
            // State=Open  (all expanded)  → collapse_all icon (↓↑ inward)
            if (hdrType === 'chevron') {
              const w = column.width ? (typeof column.width === 'number' ? `${column.width}px` : column.width) : '40px'
              const allExpanded = processedData.length > 0 && processedData.every((r, i) => activeExpanded.has(getRowKey(r, i)))
              return (
                <div
                  key={column.key}
                  role="columnheader"
                  aria-label={allExpanded ? 'Collapse all rows' : 'Expand all rows'}
                  tabIndex={expandedContent ? 0 : undefined}
                  onMouseEnter={() => setHoveredHeader(column.key)}
                  onMouseLeave={() => setHoveredHeader(null)}
                  onClick={expandedContent ? toggleExpandAll : undefined}
                  onKeyDown={expandedContent ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpandAll() } } : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: w, minWidth: w, maxWidth: w, flexShrink: 0,
                    backgroundColor: hdrBg,
                    transition: rowTransition,
                    cursor: expandedContent ? 'pointer' : 'default',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
                    {allExpanded ? (
                      // collapse_all — Figma Material/collapse_all node 29857:7515
                      <path fill={col.headerText} d="M7.4 22L6 20.6L12 14.6L18 20.6L16.6 22L12 17.4L7.4 22ZM12 9.4L6 3.4L7.4 2L12 6.6L16.6 2L18 3.4L12 9.4Z" />
                    ) : (
                      // expand_all — Figma Material/expand_all node 29857:9081
                      <path fill={col.headerText} d="M12 22L6 16L7.425 14.575L12 19.15L16.575 14.575L18 16L12 22ZM7.45 9.4L6 8L12 2L18 8L16.55 9.4L12 4.85L7.45 9.4Z" />
                    )}
                  </svg>
                </div>
              )
            }

            // ── Icon header (Figma: Variant=Icon) ───────────────────────────
            // Fixed-width column showing an icon — light green tint in default state
            if (hdrType === 'icon') {
              const w = column.width ? (typeof column.width === 'number' ? `${column.width}px` : column.width) : tb.checkboxColumnWidth
              return (
                <div
                  key={column.key}
                  role="columnheader"
                  onMouseEnter={() => setHoveredHeader(column.key)}
                  onMouseLeave={() => setHoveredHeader(null)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: w, minWidth: w, maxWidth: w, flexShrink: 0,
                    backgroundColor: isHoveredHdr ? col.headerHoverBg : col.rowSelectedBg,
                    transition: rowTransition,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', color: col.headerText }}>
                    {column.headerIcon ?? (
                      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
                        <path fill={col.headerText} d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                      </svg>
                    )}
                  </span>
                </div>
              )
            }

            // ── Label header (default) ───────────────────────────────────────
            const hasActiveFilter  = !!activeFilterValues[column.key]
            const isFilterOpen     = openFilterKey === column.key
            const showFilterBtn    = column.filterable && (isHoveredHdr || hasActiveFilter || isFilterOpen)
            const ariaSortValue: React.AriaAttributes['aria-sort'] = isSorted
              ? (activeSortDir === 'asc' ? 'ascending' : 'descending')
              : (column.sortable ? 'none' : undefined)
            return (
              <div
                key={column.key}
                role="columnheader"
                aria-sort={ariaSortValue}
                ref={(el) => { if (el) headerCellRefs.current.set(column.key, el); else headerCellRefs.current.delete(column.key) }}
                tabIndex={column.sortable ? 0 : undefined}
                onMouseEnter={() => setHoveredHeader(column.key)}
                onMouseLeave={() => setHoveredHeader(null)}
                onClick={column.sortable ? () => handleSort(column.key) : undefined}
                onKeyDown={column.sortable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort(column.key) } } : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[100],
                  padding: `0 ${spacing[200]}`,
                  flexGrow:   column.width ? 0 : 1,
                  flexShrink: column.width ? 0 : 1,
                  flexBasis:  column.width ? 'auto' : 0,
                  width: column.width ? (typeof column.width === 'number' ? `${column.width}px` : column.width) : undefined,
                  minWidth: column.minWidth !== undefined ? `${column.minWidth}px` : 0,
                  cursor: column.sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                  backgroundColor: hdrBg,
                  transition: rowTransition,
                }}
              >
                {/* Sort icon — left of label, visible on hover or when actively sorted */}
                {showSortIcon && (
                  <SortIcon
                    dir={isSorted ? activeSortDir : null}
                    color={col.sortIcon}
                  />
                )}
                {column.headerIcon && (
                  <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: col.headerText }}>
                    {column.headerIcon}
                  </span>
                )}
                {/* Label — fills remaining space; text aligned per column.align */}
                <span style={{
                  ...headerFont, color: col.headerText,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flexGrow: 1, flexShrink: 1, flexBasis: 0,
                  minWidth: 0,
                  textAlign: column.align === 'right' ? 'right' : column.align === 'center' ? 'center' : 'left',
                }}>
                  {column.label}
                </span>
                {showFilterBtn && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFilterDropdown(column.key) }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: tb.filterBtnSize, height: tb.filterBtnSize, flexShrink: 0,
                      borderRadius: radius.xs, border: 'none', background: 'transparent',
                      cursor: 'pointer', padding: '0',
                      color: (isFilterOpen || hasActiveFilter) ? col.sortIcon : col.secondaryText,
                      backgroundColor: isFilterOpen ? col.rowSelectedBg : 'transparent',
                    }}
                    aria-label={`Filter ${column.label}`}
                    title={`Filter ${column.label}`}
                  >
                    {/* 3 lines of decreasing width forming a triangle/funnel shape */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M3 6h18v2H3V6zm3 5h12v2H6v-2zm3 5h6v2H9v-2z"/>
                    </svg>
                  </button>
                )}
              </div>
            )
          })}
        </div>
        </div>

        {/* ── Filter row (AG Grid style) ────────────────────────────────── */}
        {showFilterRow && (
          <div role="rowgroup">
          <div role="row" style={{
            display: 'flex',
            alignItems: 'stretch',
            backgroundColor: col.headerBg,
            borderBottom: `1px solid ${col.border}`,
          }}>
            {selectable && <div role="columnheader" style={{ width: tb.checkboxColumnWidth, flexShrink: 0 }} />}
            {columns.map(column => {
              const isFixed = column.headerType === 'chevron' || column.headerType === 'icon'
              const w = column.width
                ? typeof column.width === 'number' ? `${column.width}px` : column.width
                : undefined
              if (isFixed) {
                return <div key={column.key} role="columnheader" style={{ width: w, minWidth: w, flexShrink: 0 }} />
              }
              return (
                <div
                  key={column.key}
                  role="columnheader"
                  style={{
                    flexGrow:   w ? 0 : 1,
                    flexShrink: w ? 0 : 1,
                    flexBasis:  w ? 'auto' : 0,
                    width: w,
                    padding: `${spacing[100]} ${spacing[200]}`,
                    minWidth: column.minWidth !== undefined ? `${column.minWidth}px` : 0,
                  }}
                >
                  {column.filterable && (
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: spacing[100], color: col.secondaryText, display: 'flex', pointerEvents: 'none' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M3 6h18M6 12h12M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </span>
                      <input
                        aria-label={`Filter ${column.label || column.key}`}
                        value={activeFilterValues[column.key] ?? ''}
                        onChange={e => handleFilterChange(column.key, e.target.value)}
                        placeholder="Filter..."
                        style={{
                          width: '100%',
                          paddingLeft: spacing[600],
                          paddingRight: spacing[100],
                          paddingTop: spacing[100],
                          paddingBottom: spacing[100],
                          fontSize: typography.scale['body/label/regular'].fontSize,
                          fontFamily: typography.fontFamily.body,
                          background: col.searchBg,
                          border: `1px solid ${col.searchBorder}`,
                          borderRadius: radius.xs,
                          color: col.searchText,
                          outline: 'none',
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          </div>
        )}

        {/* ── Body rows ───────────────────────────────────────────────────── */}
        <div role="rowgroup">
        {processedData.length === 0 ? (
          <div style={{
            padding: `${spacing[800]} ${spacing[600]}`, textAlign: 'center',
            ...bodyFont, color: col.secondaryText,
          }}>
            {emptyMessage}
          </div>
        ) : (
          processedData.map((row, rowIndex) => {
            const key = getRowKey(row, rowIndex)
            const isSelected = activeSelected.has(key)
            const isHovered  = hoveredRow === key
            let rowBg: string = col.rowBg
            if (isSelected) rowBg = col.rowSelectedBg
            else if (isHovered) rowBg = col.rowHoverBg

            return (
              <React.Fragment key={key}>
                <div
                  role="row"
                  aria-selected={isSelected}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: rowBg,
                    transition: rowTransition,
                    cursor: selectable ? 'pointer' : 'default',
                  }}
                  onMouseEnter={() => setHoveredRow(key)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={selectable ? () => toggleRow(key) : undefined}
                >
                  {/* Row checkbox */}
                  {selectable && (
                    <div
                      role="gridcell"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: `${cellPaddingY} ${spacing[200]}`,
                        flexShrink: 0, width: tb.checkboxColumnWidth,
                      }}
                      onClick={e => { e.stopPropagation(); toggleRow(key) }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleRow(key)}
                        aria-label={`Select row ${String(key)}`}
                        theme={theme}
                        size="sm"
                      />
                    </div>
                  )}

                  {/* Row cells */}
                  {columns.map(column => {
                    const value   = row[column.key]
                    const isFixed = column.headerType === 'chevron' || column.headerType === 'icon'
                    const w       = column.width ? (typeof column.width === 'number' ? `${column.width}px` : column.width) : undefined

                    // ── Chevron cell — Figma: _cell chevron node 35490-51425 ──
                    // State=Down (collapsed) → chevron_arrow_down
                    // State=Up   (expanded)  → chevron_arrow_up
                    if (column.headerType === 'chevron') {
                      const isExpanded = activeExpanded.has(key)
                      return (
                        <div
                          key={column.key}
                          role="gridcell"
                          onClick={expandedContent ? (e) => { e.stopPropagation(); toggleExpand(key) } : undefined}
                          onKeyDown={expandedContent ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(key) } } : undefined}
                          tabIndex={expandedContent ? 0 : undefined}
                          aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: `${cellPaddingY} 0`,
                            width: w, minWidth: w, maxWidth: w, flexShrink: 0,
                            cursor: expandedContent ? 'pointer' : 'default',
                            color: col.secondaryText,
                          }}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
                            {isExpanded ? (
                              // chevron_arrow_up — Figma Material/chevron_arrow_up node 29857:11169
                              <path fill="currentColor" d="M12 10.8L7.4 15.4L6 14L12 8L18 14L16.6 15.4L12 10.8Z" />
                            ) : (
                              // chevron_arrow_down — Figma Material/chevron_arrow_down node 29857:11157
                              <path fill="currentColor" d="M12 15.4L6 9.4L7.4 8L12 12.6L16.6 8L18 9.4L12 15.4Z" />
                            )}
                          </svg>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={column.key}
                        role="gridcell"
                        style={{
                          padding: `${cellPaddingY} ${spacing[200]}`,
                          flexGrow:   !isFixed && !w ? 1 : 0,
                          flexShrink: isFixed ? 0 : 1,
                          flexBasis:  !isFixed && !w ? 0 : 'auto',
                          width:    w,
                          minWidth: isFixed ? w : (column.minWidth !== undefined ? `${column.minWidth}px` : 0),
                          maxWidth: isFixed ? w : undefined,
                          /** Fixed-width columns (icon/chevron-style): visible so focus rings / icon buttons are not clipped */
                          overflow: isFixed ? 'visible' : 'hidden',
                          textAlign: column.align ?? 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: isFixed ? 'center' : (column.align === 'right' ? 'flex-end' : 'flex-start'),
                        }}
                      >
                        {column.render
                          ? column.render(value, row, rowIndex)
                          : (
                            <span style={{
                              ...bodyFont,
                              color: col.bodyText,
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {value == null ? '—' : String(value)}
                            </span>
                          )
                        }
                      </div>
                    )
                  })}
                </div>
                {/* Expanded content row */}
                {activeExpanded.has(key) && expandedContent && (
                  <div role="row" style={{ backgroundColor: col.rowBg, borderBottom: `1px solid ${col.border}` }}>
                    {expandedContent(row, rowIndex)}
                  </div>
                )}
                {/* Row divider — omitted on last row per DS guideline */}
                {!activeExpanded.has(key) && rowIndex < processedData.length - 1 && (
                  <div style={{ height: borderWidth.thin, background: col.border }} />
                )}
              </React.Fragment>
            )
          })
        )}
        </div>

      </div>

      {/* ── Title-bar filter dropdown (portal, Menu-based) ─────────────────── */}
      {titleFilterOpen && titleFilterPos && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div id="__table-title-filter-dropdown" role="dialog" aria-label="Filter columns" style={{ position: 'fixed', top: `${titleFilterPos.top}px`, marginTop: tb.filterDropdownOffset, left: `${titleFilterPos.left}px`, width: `${titleFilterPos.width}px`, zIndex: 9999 }}>
          <Menu theme={theme} style={{ minWidth: 'unset', width: '100%' }}>
            {columns.filter(c => c.filterable).map((column, i, arr) => (
              <React.Fragment key={column.key}>
                {/* Section label */}
                <div style={{
                  padding: `${spacing[100]} ${spacing[300]} ${spacing[100]}`,
                  fontSize: tb.filterSectionFontSize, fontWeight: tb.filterSectionFontWeight,
                  letterSpacing: typography.letterSpacing.wide, textTransform: 'uppercase',
                  color: tb.colour[theme].secondaryText, fontFamily: typography.fontFamily.body,
                  userSelect: 'none',
                }}>
                  {column.label || column.key}
                </div>
                {/* Filter input */}
                <div style={{ padding: `0 ${spacing[300]}`, paddingBottom: i < arr.length - 1 ? spacing[200] : spacing[100] }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: spacing[200], color: tb.colour[theme].secondaryText, display: 'flex', pointerEvents: 'none' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                        <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </span>
                    <input
                      aria-label={`Filter ${column.label || column.key}`}
                      value={activeFilterValues[column.key] ?? ''}
                      onChange={e => handleFilterChange(column.key, e.target.value)}
                      placeholder={`Filter ${column.label || column.key}...`}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        paddingLeft: '26px', paddingRight: spacing[200], paddingTop: spacing[100], paddingBottom: spacing[100],
                        fontSize: tb.filterInputFontSize, fontFamily: typography.fontFamily.body,
                        background: tb.colour[theme].searchBg, border: `1px solid ${tb.colour[theme].searchBorder}`,
                        borderRadius: radius.xs, color: tb.colour[theme].searchText, outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </React.Fragment>
            ))}
            {/* Clear all — only when filters are active */}
            {Object.values(activeFilterValues).some(v => !!v) && (
              <>
                <MenuDivider theme={theme} />
                <FilterMenuItem
                  label="Clear all filters"
                  theme={theme}
                  onClick={() => { handleClearAllFilters(); setTitleFilterOpen(false) }}
                />
              </>
            )}
          </Menu>
        </div>,
        document.body,
      )}

      {/* ── Filter dropdown (portal, Menu-based) ─────────────────────────── */}
      {openFilterKey && filterDropdownPos && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div id="__table-filter-dropdown" role="dialog" aria-label={`Filter ${openFilterKey}`} style={{ position: 'fixed', top: `${filterDropdownPos.top}px`, marginTop: tb.filterDropdownOffset, left: `${filterDropdownPos.left}px`, width: `${filterDropdownPos.width}px`, zIndex: 9999 }}>
          <Menu theme={theme} style={{ minWidth: 'unset', width: '100%' }}>
            {/* Search input row */}
            <div style={{ padding: `${spacing[100]} ${spacing[300]} ${spacing[50]}` }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: spacing[200], color: col.secondaryText, display: 'flex', pointerEvents: 'none' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  autoFocus
                  aria-label={`Search ${openFilterKey ?? ''}`}
                  value={activeFilterValues[openFilterKey!] ?? ''}
                  onChange={e => handleFilterChange(openFilterKey!, e.target.value)}
                  placeholder="Search..."
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    paddingLeft: '28px', paddingRight: spacing[200], paddingTop: spacing[100], paddingBottom: spacing[100],
                    fontSize: tb.filterInputFontSize, fontFamily: typography.fontFamily.body,
                    background: col.searchBg, border: `1px solid ${col.searchBorder}`,
                    borderRadius: radius.xs, color: col.searchText, outline: 'none',
                  }}
                />
              </div>
            </div>
            {/* Clear filter option — only shown when a filter value is active */}
            {activeFilterValues[openFilterKey!] && (
              <>
                <MenuDivider theme={theme} />
                <FilterMenuItem
                  label="Clear filter"
                  theme={theme}
                  onClick={() => { handleFilterChange(openFilterKey!, ''); setOpenFilterKey(null); setFilterDropdownPos(null) }}
                />
              </>
            )}
          </Menu>
        </div>,
        document.body,
      )}
      </>
    )
  },
)

Table.displayName = 'Table'

// ─── Re-export TrendCell for use in render props ───────────────────────────────
export { TrendCell }

export default Table
