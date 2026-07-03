'use client'

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { components, typography, motion as motionTokens } from '@/lib/tokens'
import { Button } from './button'
import { DisplayChip } from './chip'
import { MenuItem, MenuDivider } from './menu'
import { FilterListOutline, SearchOutline } from './icons'
import type { MenuItemState } from './menu'

const mn = components.menu

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS — Filter component (node 4588-77413 + 44371-159729)
//
// Filter Item (collapsed section) structure:
//   ┌─ _item list (bold label + chevron right icon)
//   ├─ Chips row (padding 0 16px 12px) — Neutral/light chips per selected item
//   └─ Divider
//
// Filter Item (expanded section) structure:
//   ┌─ _item list (bold label + chevron down icon)
//   ├─ MenuItem × n (checkbox items)
//   └─ Divider

export type FilterTheme = 'light' | 'dark'

export interface FilterOption {
  /** Unique identifier for this option */
  key: string
  /** Display label shown in the menu and as chip text when section is collapsed */
  label: string
  /** Optional secondary text shown below the label */
  description?: string
}

export interface FilterSection {
  /** Unique identifier for this section */
  key: string
  /** Heading label rendered in the collapsible section row */
  label: string
  /** Options listed inside this section */
  options: FilterOption[]
}

export interface FilterProps {
  /** Multi-section mode — each section gets a collapsible header */
  sections?: FilterSection[]
  /** Flat single-section mode (no section header rendered) */
  options?: FilterOption[]
  /** Controlled: currently selected option keys */
  selectedKeys?: Set<string>
  /** Uncontrolled default selection (ignored when selectedKeys is provided) */
  defaultSelectedKeys?: Set<string>
  /** Called whenever the selection changes */
  onSelectionChange?: (keys: Set<string>) => void
  /** Called when the dropdown opens or closes */
  onOpenChange?: (open: boolean) => void
  /** Trigger button label shown when no filters are active — defaults to "Filter" */
  label?: string
  /** Renders a search input at the top of the dropdown to filter options client-side */
  searchable?: boolean
  size?: 'sm' | 'md' | 'lg'
  theme?: FilterTheme
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
}

// ─── Menu colour tokens (mirrors lib/tokens menu.colour) ─────────────────────
const COL = {
  light: {
    label:    '#242424',
    icon:     '#676767',
    bgHover:  '#F5F5F5',
    bgPressed:'#E4E4E4',
    divider:  '#E4E4E4',
  },
  dark: {
    label:    '#E4E4E4',
    icon:     '#BBBBBB',
    bgHover:  '#3C3C3C',
    bgPressed:'#4B4B4B',
    divider:  '#4B4B4B',
  },
}

// ─── InteractiveMenuItem ──────────────────────────────────────────────────────

function InteractiveMenuItem({
  label, description, checked, theme, onClick,
}: {
  label: string; description?: string; checked: boolean; theme: FilterTheme; onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const state: MenuItemState = pressed ? 'pressed' : checked ? 'selected' : hovered ? 'hover' : 'default'
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
        theme={theme}
        onClick={onClick}
      />
    </div>
  )
}

// ─── ClearMenuItem ────────────────────────────────────────────────────────────

function ClearMenuItem({ theme, onClick }: { theme: FilterTheme; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <MenuItem label="Clear all" state={hovered ? 'hover' : 'default'} theme={theme} onClick={onClick} />
    </div>
  )
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
// Matches Figma _item list / Section title=True + right chevron icon.
// Uses Menu padding (16px) and sectionTitle typography (16px bold).

function SectionHeader({
  label, isOpen, theme, onClick,
}: {
  label: string; isOpen: boolean; theme: FilterTheme; onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const col = COL[theme]

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px',
        paddingLeft: '16px', paddingRight: '16px',
        minHeight: '48px', cursor: 'pointer', userSelect: 'none',
        backgroundColor: pressed ? col.bgPressed : hovered ? col.bgHover : 'transparent',
        transition: `background-color ${motionTokens.duration.quick} ${motionTokens.easing.easeOut}`,
      }}
    >
      {/* Bold section label — matches Figma Body/Medium/Bold (16px/700) */}
      <span style={{
        flex: 1,
        fontSize: typography.fontSize.md, fontWeight: 700, lineHeight: 1.5,
        color: col.label,
        fontFamily: typography.fontFamily.body,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>

      {/* Chevron — points down when expanded, right when collapsed */}
      <span style={{
        width: '20px', height: '20px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: col.icon,
        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: `transform ${motionTokens.duration.quick} ${motionTokens.easing.easeOut}`,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  )
}

// ─── SectionChips ─────────────────────────────────────────────────────────────
// Rendered below the section header when the section is collapsed and has
// selected items. Matches Figma layout_QCX20V: padding 0 16px 12px, gap 8px.

function SectionChips({
  selectedLabels, theme,
}: {
  selectedLabels: string[]; theme: FilterTheme
}) {
  if (selectedLabels.length === 0) return null
  return (
    <div style={{ padding: '0 16px 12px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%' }}>
        {selectedLabels.map(lbl => (
          <DisplayChip
            key={lbl}
            chipColour="positive"
            appearance="light"
            size="sm"
            theme={theme}
          >
            {lbl}
          </DisplayChip>
        ))}
      </div>
    </div>
  )
}

// ─── Filter ───────────────────────────────────────────────────────────────────

export const Filter = React.forwardRef<HTMLButtonElement, FilterProps>(
  (
    {
      sections: sectionsProp,
      options,
      selectedKeys: selectedKeysProp,
      defaultSelectedKeys,
      onSelectionChange,
      onOpenChange,
      label = 'Filter',
      searchable = false,
      size = 'md',
      theme = 'light',
      disabled = false,
      className,
      style,
    },
    ref,
  ) => {
    // Normalise: sections takes priority; options falls back to a single unnamed section
    const sections: FilterSection[] = sectionsProp
      ?? (options ? [{ key: '__single__', label: '', options }] : [])

    const isSingleUnnamed = sections.length === 1 && sections[0].key === '__single__'

    const isControlled = selectedKeysProp !== undefined
    const [internalSelected, setInternalSelected] = useState<Set<string>>(
      defaultSelectedKeys ?? new Set(),
    )
    const activeSelected = isControlled ? selectedKeysProp! : internalSelected

    const [open, setOpen]       = useState(false)
    const [menuPos, setMenuPos] = useState<{
      top: number
      right: number
      triggerWidth: number
      maxPanelWidth: number
    } | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    /** All sections start collapsed; keys in this set are collapsed */
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
      () => new Set((sections ?? []).map(s => s.key))
    )

    const btnRef = useRef<HTMLButtonElement>(null)
    const dropdownPanelRef = useRef<HTMLDivElement>(null)

    // Merge external ref with internal btnRef
    const setRef = (node: HTMLButtonElement | null) => {
      (btnRef as React.MutableRefObject<HTMLButtonElement | null>).current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
    }

    const closeDropdown = useCallback(() => {
      setOpen(false)
      setSearchQuery('')
      setMenuPos(null)
      onOpenChange?.(false)
    }, [onOpenChange])

    /** Anchor panel trailing edge to the trigger (toolbar filters sit right; left-align was overlapping neighbours) */
    const repositionFilterPanel = useCallback(() => {
      const rect = btnRef.current?.getBoundingClientRect()
      if (!rect || typeof window === 'undefined') return
      const vw = window.innerWidth
      setMenuPos({
        top: rect.bottom + 4,
        right: vw - rect.right,
        triggerWidth: rect.width,
        maxPanelWidth: Math.min(400, Math.max(240, rect.right - 16)),
      })
    }, [])

    // Close on outside click
    useEffect(() => {
      if (!open) return
      const handleClickOutside = (e: MouseEvent) => {
        const target   = e.target as Node
        const dropdown = document.getElementById('__filter-menu-dropdown')
        const btn      = btnRef.current
        if (dropdown?.contains(target)) return
        if (btn?.contains(target)) return
        closeDropdown()
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open, closeDropdown])

    useLayoutEffect(() => {
      if (!open) return
      const onReflow = () => repositionFilterPanel()
      window.addEventListener('scroll', onReflow, true)
      window.addEventListener('resize', onReflow)
      return () => {
        window.removeEventListener('scroll', onReflow, true)
        window.removeEventListener('resize', onReflow)
      }
    }, [open, repositionFilterPanel])



    const toggleOpen = () => {
      if (open) {
        closeDropdown()
        return
      }
      repositionFilterPanel()
      setOpen(true)
      onOpenChange?.(true)
    }

    const toggleOption = (key: string) => {
      const next = new Set(activeSelected)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      if (!isControlled) setInternalSelected(next)
      onSelectionChange?.(next)
    }

    const clearAll = () => {
      const next = new Set<string>()
      if (!isControlled) setInternalSelected(next)
      onSelectionChange?.(next)
    }

    const toggleSection = (key: string) => {
      setCollapsedSections(prev => {
        const next = new Set(prev)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        return next
      })
    }

    const activeCount = activeSelected.size
    const hasActive   = activeCount > 0

    const menuCol = mn.colour[theme]

    const iconSize = size === 'lg' ? 20 : 16
    const chipSize = size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'

    // Apply search query across all sections
    const visibleSections = sections.map(section => ({
      ...section,
      options: searchable && searchQuery
        ? section.options.filter(o =>
            o.label.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : section.options,
    })).filter(section => section.options.length > 0)

    return (
      <>
        {/* Trigger button — tertiary text button, positive when active */}
        <Button
          ref={setRef}
          variant="text"
          color={hasActive ? 'positive' : 'neutral'}
          size={size}
          theme={theme}
          disabled={disabled}
          showLeadingIcon
          leadingIcon={<FilterListOutline size={iconSize} />}
          onClick={toggleOpen}
          aria-expanded={open}
          aria-haspopup="menu"
          className={className}
          style={style}
        >
          {hasActive ? (
            <DisplayChip chipColour="positive" appearance="light" size={chipSize} theme={theme}>
              {activeCount}
            </DisplayChip>
          ) : label}
        </Button>

        {/* ── Dropdown (portal) ──────────────────────────────────────────────── */}
        {typeof document !== 'undefined' && ReactDOM.createPortal(
          <AnimatePresence>
          {open && menuPos && (
          <motion.div
            ref={dropdownPanelRef}
            id="__filter-menu-dropdown"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ type: 'spring', ...motionTokens.spring.panel }}
            style={{
              position: 'fixed',
              top: menuPos.top,
              right: menuPos.right,
              left: 'auto',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'min(72vh, 520px)',
              minWidth: Math.max(260, menuPos.triggerWidth),
              maxWidth: menuPos.maxPanelWidth,
              backgroundColor: menuCol.container,
              borderRadius: mn.containerRadius,
              border: `1px solid ${menuCol.border}`,
              boxShadow: mn.containerShadow,
              overflow: 'hidden',
              transformOrigin: 'top right',
            }}
          >
            {/* Search stays fixed above the scrolling facet list */}
            {searchable && (
              <div style={{ flexShrink: 0, padding: '12px 16px 6px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  border: `1px solid ${COL[theme].divider}`,
                  borderRadius: '4px', padding: '6px 8px',
                  background: theme === 'dark' ? '#2C2C2C' : '#FFFFFF',
                }}>
                  <SearchOutline size={16} className="shrink-0 text-[#676767]" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Quick search"
                    style={{
                      flex: 1, border: 'none', outline: 'none', background: 'transparent',
                      fontSize: typography.fontSize.md, color: COL[theme].label,
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>
            )}

            <div
              role="presentation"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                overscrollBehavior: 'contain',
                paddingTop: mn.containerPaddingY,
                paddingBottom: mn.containerPaddingY,
              }}
            >
              {visibleSections.length === 0 && searchQuery.trim() !== '' && (
                <div
                  style={{
                    padding: '8px 16px 12px',
                    fontSize: typography.fontSize.md,
                    color: COL[theme].icon,
                    fontFamily: typography.fontFamily.body,
                  }}
                >
                  No matching options
                </div>
              )}

              {isSingleUnnamed ? (
                visibleSections[0]?.options.map(option => (
                  <InteractiveMenuItem
                    key={option.key}
                    label={option.label}
                    description={option.description}
                    checked={activeSelected.has(option.key)}
                    theme={theme}
                    onClick={() => toggleOption(option.key)}
                  />
                ))
              ) : (
                visibleSections.map((section, i) => {
                  const sectionOpen = !collapsedSections.has(section.key)
                  const selectedLabels = section.options
                    .filter(o => activeSelected.has(o.key))
                    .map(o => o.label)

                  return (
                    <React.Fragment key={section.key}>
                      {i > 0 && <MenuDivider theme={theme} />}

                      <SectionHeader
                        label={section.label}
                        isOpen={sectionOpen}
                        theme={theme}
                        onClick={() => toggleSection(section.key)}
                      />

                      {sectionOpen ? (
                        section.options.map(option => (
                          <InteractiveMenuItem
                            key={option.key}
                            label={option.label}
                            description={option.description}
                            checked={activeSelected.has(option.key)}
                            theme={theme}
                            onClick={() => toggleOption(option.key)}
                          />
                        ))
                      ) : (
                        <SectionChips selectedLabels={selectedLabels} theme={theme} />
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </div>

            {hasActive && (
              <div style={{ flexShrink: 0, backgroundColor: menuCol.container }}>
                <MenuDivider theme={theme} />
                <ClearMenuItem theme={theme} onClick={() => { clearAll(); closeDropdown() }} />
              </div>
            )}
          </motion.div>
          )}
          </AnimatePresence>,
          document.body,
        )}
      </>
    )
  },
)

Filter.displayName = 'Filter'

export default Filter
