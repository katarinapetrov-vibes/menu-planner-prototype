'use client'

/**
 * Enterprise DS v3 — Side Navigation
 * Figma node 15070-249668
 *
 * Properties (mirrors Figma exactly):
 *   Collapsed          · icon-only compact mode
 *   Groups             · labelled sections of nav items
 *   Items              · icon + label + optional badge + optional sub-items
 *   Sub-items          · nested children with animated expand/collapse
 *   User footer        · Avatar + name + role
 *   Size               · sm (36 px) · md (44 px) · lg (52 px)
 *   Theme              · light / dark
 *
 * Token mapping
 *   Panel bg           colour/background/page            light: #FFFFFF  dark: #242424
 *   Panel border       colour/border/default              light: #E4E4E4  dark: #4B4B4B
 *   Active item bg     colour/background/positive/defaultSubtle  light: #F6FDE9  dark: #035624
 *   Active indicator   colour/border/positive             light: #067A46  dark: #96DC14
 *   Active text        colour/foreground/positive/default  light: #067A46  dark: #96DC14
 *   Item text          colour/foreground/default/primary   light: #242424  dark: #E4E4E4
 *   Section label      colour/foreground/default/disabled  light: #BBBBBB  dark: #676767
 *   Hover bg           state/hover                        light: #F5F5F5  dark: #242424
 *   Focus ring         colour/border/focus                light: #067A46  dark: #96DC14
 *   Radius             radius/sm                           8px
 */

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from './utils'
import { Avatar } from './avatar'
import { DisplayChip } from './chip'
import { semantic, primitives, spacing, radius, borderWidth, sizing, opacity, elevation, components, typography, motion as motionTokens } from '@/lib/tokens'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SideNavTheme   = 'light' | 'dark'
export type SideNavSize    = 'sm' | 'md' | 'lg'

export interface SideNavItem {
  /** Unique identifier */
  id:        string
  /** Display label */
  label:     string
  /** Leading icon — 16/20/24 px depending on size */
  icon?:     React.ReactNode
  /** Trailing badge — count or short label */
  badge?:    string | number
  /** Disable interaction */
  disabled?: boolean
  /** Optional href — when provided renders a link instead of button */
  href?:     string
  /** Nested sub-items — renders an animated expandable list */
  children?: SideNavItem[]
}

export interface SideNavGroup {
  /** Unique group identifier */
  id:     string
  /** Optional section heading — hidden in collapsed mode */
  label?: string
  /** Items belonging to this group */
  items:  SideNavItem[]
}

export interface SideNavUser {
  /** Display name */
  name:   string
  /** Role or subtitle text */
  role?:  string
  /** Email shown beneath name in footer */
  email?: string
  /** Avatar image URL */
  src?:   string
}

export interface SideNavProps {
  /** Navigation groups containing items */
  groups:              SideNavGroup[]
  /** Controlled active item id */
  activeId?:           string
  /** Uncontrolled default active item id */
  defaultActiveId?:    string
  /** Callback when an item is clicked */
  onItemClick?:        (id: string, item: SideNavItem) => void
  /** Controlled collapsed state */
  collapsed?:          boolean
  /** Uncontrolled default collapsed state */
  defaultCollapsed?:   boolean
  /** Callback when collapsed state changes */
  onCollapsedChange?:  (collapsed: boolean) => void
  /** Size variant — sm 36 px · md 44 px · lg 52 px */
  size?:               SideNavSize
  /** Canvas theme */
  theme?:              SideNavTheme
  /** Logo/brand slot — rendered in the header area */
  logo?:               React.ReactNode
  /** Module header row — rendered at the top of the nav body with icon + label + chevron */
  moduleHeader?:       { label: string; icon?: React.ReactNode }
  /** Selectable modules shown in the module header dropdown */
  moduleHeaderItems?:  { id: string; label: string; icon?: React.ReactNode }[]
  /** Callback when a module is selected from the dropdown */
  onModuleHeaderSelect?: (id: string) => void
  /** User profile displayed in the footer */
  user?:               SideNavUser
  /** Items shown in the user footer dropdown */
  userMenuItems?:      { id: string; label: string; icon?: React.ReactNode; muted?: boolean; dividerBefore?: boolean }[]
  /** Callback when a user menu item is selected */
  onUserMenuSelect?:   (id: string) => void
  /** Show the collapse toggle at the bottom */
  showCollapseButton?: boolean
  /**
   * Leaf item visuals for in-content section nav (e.g. recipe editor).
   * Square rows, left green bar for active, no bullet; active row keeps subtle bg on hover (no grey hover).
   * Omit or `default` for the main app sidebar — unchanged.
   */
  navItemVariant?:     'default' | 'sectionEditor'
  className?:          string
  style?:              React.CSSProperties
  'aria-label'?:       string
}

// ─── Design Tokens ────────────────────────────────────────────────────────────
// All values sourced from semantic / primitive token objects — no hardcoded arbitrary values.

const tokens = {
  light: {
    panelBg:             semantic.background.page.light,                         // #FFFFFF
    headerBg:            semantic.background.page.light,                         // #FFFFFF
    panelBorder:         semantic.border.default.light,                          // #E4E4E4
    expandedSectionBg:   semantic.background.container.light,                    // #F8F8F8
    activeBg:            semantic.background.positive.defaultSubtle.light,       // #F6FDE9
    activeIndicator:     semantic.border.positive.light,                         // #067A46
    activeText:          semantic.foreground.positive.default.light,             // #067A46
    activeIcon:          semantic.foreground.positive.default.light,             // #067A46
    itemText:            semantic.foreground.default.primary.light,              // #242424
    itemIcon:            semantic.foreground.default.secondary.light,            // #4B4B4B
    hoverBg:             semantic.background.container.light,                    // #F8F8F8
    pressedBg:           primitives.grey[300],                                   // #EEEEEE
    disabledText:        semantic.foreground.default.disabled.light,             // #BBBBBB
    sectionLabel:        semantic.foreground.default.disabled.light,             // #BBBBBB
    separator:           semantic.border.default.light,                          // #E4E4E4
    focusOutline:        semantic.border.focus.light,                            // #067A46
    chevronColor:        semantic.foreground.default.secondary.light,            // #4B4B4B
    activeChevron:       semantic.foreground.positive.default.light,             // #067A46
    userNameColor:       semantic.foreground.default.primary.light,              // #242424
    userRoleColor:       semantic.foreground.default.secondary.light,            // #4B4B4B
    collapseIcon:        semantic.foreground.default.secondary.light,            // #4B4B4B
    collapseHoverBg:     semantic.background.container.light,                    // #F8F8F8
  },
  dark: {
    // Structural backgrounds — brand nav palette (Figma node 3416-892)
    panelBg:             semantic.background.positive.defaultStrong.light,         // #067A46
    headerBg:            semantic.background.positive.defaultStrong.light,         // #067A46
    panelBorder:         semantic.background.positive.defaultStrong.light,         // #067A46
    expandedSectionBg:   semantic.background.positive.defaultStrongDeep.light,     // #056835
    separator:           semantic.background.positive.defaultStrongDeep.light,     // #056835
    // Active states — lime green DS tokens
    activeBg:        semantic.state.hover,                                         // rgba(0,0,0,0.08)
    activeIndicator: semantic.border.positive.dark,                                // #96DC14
    activeText:      semantic.foreground.positive.default.dark,                    // #96DC14
    activeIcon:      semantic.foreground.positive.default.dark,                    // #96DC14
    activeChevron:   semantic.foreground.positive.default.dark,                    // #96DC14
    // Item text — white (inverse tokens — text on coloured surface)
    itemText:        semantic.foreground.default.inverse.light,                    // #FFFFFF
    itemIcon:        semantic.foreground.default.inverse.light,                    // #FFFFFF
    userNameColor:   semantic.foreground.default.inverse.light,                    // #FFFFFF
    collapseIcon:    semantic.foreground.default.inverse.light,                    // #FFFFFF
    // Secondary / muted — light disabled token reads as muted white on dark bg
    chevronColor:    semantic.foreground.default.disabled.light,                   // #BBBBBB
    sectionLabel:    semantic.foreground.default.disabled.light,                   // #BBBBBB
    disabledText:    semantic.foreground.default.disabled.light,                   // #BBBBBB
    userRoleColor:   semantic.foreground.default.disabled.light,                   // #BBBBBB
    // Interaction — hover uses the deeper token, pressed adds a further overlay
    hoverBg:         semantic.background.positive.defaultStrongDeep.light,         // #056835
    pressedBg:       semantic.state.pressed,                                       // rgba(0,0,0,0.16)
    collapseHoverBg: semantic.background.positive.defaultStrongDeep.light,         // #056835
    // Focus
    focusOutline:    semantic.border.focus.dark,                                   // #96DC14
  },
} as const

// ─── Size Tokens ──────────────────────────────────────────────────────────────

const sizeTokens: Record<
  SideNavSize,
  {
    itemHeight:      string
    px:              string
    iconCls:         string
    labelCls:           string
    labelFontSize:      string
    badgeCls:           string
    subIndent:          string
    gap:                string
    sectionPy:          string
    sectionLabelCls:    string
    sectionLabelFontSize: string
    expandedW:       string
    collapsedW:      string
    logoH:           string
    footerUserH:     string
  }
> = {
  sm: {
    itemHeight:      sizing.componentHeight.navSm,          // 36px
    px:              spacing[200],    // 8px
    iconCls:         'w-4 h-4 shrink-0',
    labelCls:             'font-semibold leading-none',
    labelFontSize:        typography.fontSize.sm,
    badgeCls:             'font-semibold leading-none px-1.5 py-0.5',
    subIndent:            spacing[600],    // 24px
    gap:                  spacing[200],    // 8px
    sectionPy:            spacing[100],    // 4px
    sectionLabelCls:      'font-semibold uppercase tracking-widest',
    sectionLabelFontSize: typography.fontSize.sm,
    expandedW:       components.sideNav.expandedWidth.sm,   // 220px
    collapsedW:      components.sideNav.collapsedWidth.sm,  // 52px
    logoH:           sizing.componentHeight.navLg,          // 52px
    footerUserH:     sizing.componentHeight.navLg,          // 52px
  },
  md: {
    itemHeight:      sizing.componentHeight.lg,             // 44px
    px:              spacing[300],    // 12px
    iconCls:         'w-5 h-5 shrink-0',
    labelCls:             'font-medium leading-none',
    labelFontSize:        typography.fontSize.md,
    badgeCls:             'font-semibold leading-none px-2 py-0.5',
    subIndent:            spacing[800],    // 32px
    gap:                  spacing[200],    // 8px (+ 2px implicit)
    sectionPy:            spacing[200],    // 8px (a bit of breathing room)
    sectionLabelCls:      'font-semibold uppercase tracking-widest',
    sectionLabelFontSize: typography.fontSize.sm,
    expandedW:       components.sideNav.expandedWidth.md,   // 260px
    collapsedW:      components.sideNav.collapsedWidth.md,  // 64px
    logoH:           sizing.componentHeight['2xl'],         // 64px
    footerUserH:     sizing.componentHeight['2xl'],         // 64px
  },
  lg: {
    itemHeight:      sizing.componentHeight.navLg,          // 52px
    px:              spacing[400],    // 16px
    iconCls:         'w-6 h-6 shrink-0',
    labelCls:             'font-medium leading-none',
    labelFontSize:        typography.fontSize.md,
    badgeCls:             'font-semibold leading-none px-2 py-1',
    subIndent:            spacing[1000],   // 40px
    gap:                  spacing[300],    // 12px
    sectionPy:            spacing[200],    // 8px
    sectionLabelCls:      'font-semibold uppercase tracking-widest',
    sectionLabelFontSize: typography.fontSize.sm,
    expandedW:       components.sideNav.expandedWidth.lg,   // 280px
    collapsedW:      components.sideNav.collapsedWidth.lg,  // 72px
    logoH:           sizing.componentHeight['3xl'],         // 72px
    footerUserH:     sizing.componentHeight['3xl'],         // 72px
  },
}

// ─── Icons ────────────────────────────────────────────────────────────────────

/** Hamburger ≡ + directional arrow — matches the collapse toggle in the screenshots */
function HamburgerToggleIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="w-5 h-5 shrink-0">
      {/* Three lines */}
      <line x1="3" y1="6"  x2="16" y2="6"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="18" x2="16" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Arrow: points right when collapsed (expand), left when expanded (collapse) */}
      {collapsed ? (
        <polyline points="18,9 21,12 18,15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <polyline points="21,9 18,12 21,15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}


function ChevronDown() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="w-4 h-4 shrink-0">
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── NavItemRow ───────────────────────────────────────────────────────────────

type TokenSet = typeof tokens['light'] | typeof tokens['dark']
type SizeSet  = typeof sizeTokens['md']

interface NavItemRowProps {
  item:             SideNavItem
  isActive:         boolean
  isAnyChildActive: boolean
  activeId:         string
  collapsed:        boolean
  depth:            number
  theme:            SideNavTheme
  t:                TokenSet
  sz:               SizeSet
  onSelect:         (id: string, item: SideNavItem) => void
  navItemVariant:   'default' | 'sectionEditor'
}

function itemIsActiveDeep(items: SideNavItem[], id: string): boolean {
  return items.some((i) => i.id === id || (i.children ? itemIsActiveDeep(i.children, id) : false))
}

function NavItemRow({
  item,
  isActive,
  isAnyChildActive,
  activeId,
  collapsed,
  depth,
  theme,
  t,
  sz,
  onSelect,
  navItemVariant,
}: NavItemRowProps) {
  const [isHovered,  setIsHovered]  = useState(false)
  const [isPressed,  setIsPressed]  = useState(false)
  const [isExpanded, setIsExpanded] = useState(isActive || isAnyChildActive)

  const hasChildren = !!item.children?.length

  // Auto-expand parent when a child becomes active
  useEffect(() => {
    if (isActive || isAnyChildActive) setIsExpanded(true)
  }, [isActive, isAnyChildActive])

  const isHighlighted = isActive || isAnyChildActive
  const textColor = item.disabled ? t.disabledText : isHighlighted ? t.activeText   : t.itemText
  const iconColor = item.disabled ? t.disabledText : isHighlighted ? t.activeIcon   : t.itemIcon

  const isSectionEditor = navItemVariant === 'sectionEditor'
  const bg = (() => {
    if (item.disabled) return 'transparent'
    if (isSectionEditor && isActive) {
      return isPressed ? t.pressedBg : t.activeBg
    }
    if (isPressed) return t.pressedBg
    if (isHovered) return t.hoverBg
    if (isActive) return t.activeBg
    return 'transparent'
  })()

  const itemBorderRadius = isSectionEditor ? 0 : radius.sm
  const activeLeftBar =
    isSectionEditor && isActive && !hasChildren && !collapsed
      ? `${borderWidth.thick} solid ${t.activeIndicator}`
      : undefined

  // Indentation: depth 0 = base px, depth 1 = subIndent, depth 2+ = further indented
  const paddingLeft = depth === 0
    ? sz.px
    : `calc(${sz.subIndent} * ${depth} + ${sz.px})`

  const handleClick = () => {
    if (item.disabled) return
    if (hasChildren) {
      setIsExpanded((x) => !x)
    } else {
      onSelect(item.id, item)
    }
  }

  // Expanded top-level section gets the darker well background
  const liStyle: React.CSSProperties = (hasChildren && isExpanded && depth === 0)
    ? { backgroundColor: t.expandedSectionBg }
    : {}

  const sharedClassName = cn(
    'relative w-full flex items-center transition-colors duration-quick',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]',
    item.disabled && 'cursor-not-allowed',
    collapsed && 'justify-center',
  )
  const sharedStyle: React.CSSProperties = {
    height:          sz.itemHeight,
    paddingLeft:     collapsed ? undefined : paddingLeft,
    paddingRight:    collapsed ? undefined : sz.px,
    gap:             sz.gap,
    backgroundColor: bg,
    borderRadius:    itemBorderRadius,
    borderLeft:      activeLeftBar,
    outlineColor:    t.focusOutline,
    opacity:         item.disabled ? opacity.half : opacity.full,
    textDecoration:  'none',
    display:         'flex',
    boxSizing:       'border-box',
  }
  const sharedEventHandlers = {
    onMouseEnter: () => !item.disabled && setIsHovered(true),
    onMouseLeave: () => { setIsHovered(false); setIsPressed(false) },
    onMouseDown:  () => !item.disabled && setIsPressed(true),
    onMouseUp:    () => setIsPressed(false),
  }

  const itemContent = (
    <>
      {/* Leading icon — or initials abbreviation when collapsed and no icon */}
      {item.icon ? (
        <span className={sz.iconCls} style={{ color: iconColor }} aria-hidden>
          {item.icon}
        </span>
      ) : collapsed ? (
        <span
          className="shrink-0 flex items-center justify-center font-semibold"
          style={{
            fontSize:      typography.fontSize.sm,
            lineHeight:    1,
            color:         iconColor,
            width:         sizing.initialsContainer,
            letterSpacing: '-0.02em',
          }}
          aria-hidden
          title={item.label}
        >
          {item.label.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 4)}
        </span>
      ) : null}

      {/* Label — hidden when sidebar is collapsed */}
      {!collapsed && (
        <span
          className={cn('flex-1 min-w-0 flex items-center gap-1.5 text-left', sz.labelCls)}
          style={{ color: textColor, fontSize: sz.labelFontSize }}
        >
          {/* Bullet active indicator — only for leaf items (default variant) */}
          {isActive && !hasChildren && !isSectionEditor && (
            <span style={{ color: t.activeIndicator, lineHeight: 1, flexShrink: 0, fontSize: '1em' }}>
              •
            </span>
          )}
          <span className="truncate">{item.label}</span>
        </span>
      )}

      {/* Trailing badge */}
      {!collapsed && item.badge !== undefined && (
        <DisplayChip
          chipColour={isActive ? 'positive' : 'neutral'}
          appearance="light"
          size="md"
          theme={theme}
        >
          {String(item.badge)}
        </DisplayChip>
      )}

      {/* Expand chevron for items with children */}
      {!collapsed && hasChildren && (
        <span
          className={cn('transition-transform duration-base', isExpanded && 'rotate-180')}
          style={{ color: isHighlighted ? t.activeChevron : t.chevronColor }}
        >
          <ChevronDown />
        </span>
      )}
    </>
  )

  return (
    <li style={liStyle}>
      {item.href && !item.disabled && !hasChildren ? (
        <Link
          href={item.href}
          aria-label={collapsed ? item.label : undefined}
          aria-current={isActive ? 'page' : undefined}
          className={sharedClassName}
          style={sharedStyle}
          onClick={() => onSelect(item.id, item)}
          {...sharedEventHandlers}
        >
          {itemContent}
        </Link>
      ) : (
      <button
        type="button"
        disabled={item.disabled}
        onClick={handleClick}
        aria-label={collapsed ? item.label : undefined}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-current={isActive && !hasChildren ? 'page' : undefined}
        className={sharedClassName}
        style={sharedStyle}
        {...sharedEventHandlers}
      >
        {itemContent}
      </button>
      )}

      {/* Sub-items — animated via CSS grid-rows trick */}
      {hasChildren && !collapsed && (
        <ul
          role="list"
          className="overflow-hidden"
          style={{
            display:          'grid',
            gridTemplateRows: isExpanded ? '1fr' : '0fr',
            transition:       `grid-template-rows ${motionTokens.duration.base} ${motionTokens.easing.easeOut}`,
          }}
        >
          <div className="min-h-0">
            {item.children!.map((child) => (
              <NavItemRow
                key={child.id}
                item={child}
                isActive={child.id === activeId}
                isAnyChildActive={child.children ? itemIsActiveDeep(child.children, activeId) : false}
                activeId={activeId}
                collapsed={false}
                depth={depth + 1}
                theme={theme}
                t={t}
                sz={sz}
                onSelect={onSelect}
                navItemVariant={navItemVariant}
              />
            ))}
          </div>
        </ul>
      )}
    </li>
  )
}

// ─── SideNavigation ───────────────────────────────────────────────────────────

export function SideNavigation({
  groups,
  activeId:          controlledActiveId,
  defaultActiveId,
  onItemClick,
  collapsed:         controlledCollapsed,
  defaultCollapsed   = false,
  onCollapsedChange,
  size               = 'md',
  theme              = 'light',
  logo,
  moduleHeader,
  moduleHeaderItems,
  onModuleHeaderSelect,
  user,
  userMenuItems,
  onUserMenuSelect,
  showCollapseButton = true,
  navItemVariant     = 'default',
  className,
  style,
  'aria-label':      ariaLabel = 'Main navigation',
}: SideNavProps) {
  const [internalActiveId,    setInternalActiveId]    = useState(defaultActiveId ?? '')
  const [internalCollapsed,   setInternalCollapsed]   = useState(defaultCollapsed)
  const [collapseHovered,     setCollapseHovered]     = useState(false)
  const [moduleDropdownOpen,  setModuleDropdownOpen]  = useState(false)
  const [userDropdownOpen,    setUserDropdownOpen]    = useState(false)

  const activeId  = controlledActiveId  ?? internalActiveId
  const collapsed = controlledCollapsed ?? internalCollapsed

  const handleSelect = (id: string, item: SideNavItem) => {
    if (controlledActiveId === undefined) setInternalActiveId(id)
    onItemClick?.(id, item)
  }

  const handleCollapse = () => {
    const next = !collapsed
    if (controlledCollapsed === undefined) setInternalCollapsed(next)
    onCollapsedChange?.(next)
  }

  const t  = tokens[theme]
  const sz = sizeTokens[size]

  // Check if any item in a subtree contains the active id
  const hasActiveChild = (items: SideNavItem[]): boolean =>
    items.some((i) => i.id === activeId || (i.children ? hasActiveChild(i.children) : false))

  const avatarSize = size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        'flex flex-col h-full shrink-0 overflow-hidden',
        className,
      )}
      style={{
        width:           collapsed ? sz.collapsedW : sz.expandedW,
        transition:      `width ${motionTokens.duration.base} ${motionTokens.easing.easeInOut}`,
        backgroundColor: t.panelBg,
        borderRight:     `${borderWidth.thin} solid ${t.panelBorder}`,
        ...style,
      }}
    >
      {/* ── Header / Logo area ── */}
      <div
        className="flex items-center shrink-0 overflow-hidden"
        style={{
          height:          sz.logoH,
          padding:         `0 ${sz.px}`,
          borderBottom:    `${borderWidth.thin} solid ${t.panelBorder}`,
          gap:             sz.gap,
          backgroundColor: t.headerBg,
          flexShrink:      0,
        }}
      >
        {/* Brand logo — hidden when collapsed */}
        {!collapsed && (
          <div className="flex items-center min-w-0 flex-1">
            {logo ?? (
              <img
                src="/visual-assets/logos/hf-logo.svg"
                alt="HelloFresh"
                style={{
                  height:  sizing.icon.md,
                  width:   'auto',
                  display: 'block',
                  // Light theme: use brightness(0) to render as solid dark silhouette
                  filter:  theme === 'light' ? 'brightness(0)' : 'none',
                }}
              />
            )}
          </div>
        )}

        {/* Hamburger collapse / expand toggle */}
        {showCollapseButton && (
          <button
            type="button"
            onClick={handleCollapse}
            onMouseEnter={() => setCollapseHovered(true)}
            onMouseLeave={() => setCollapseHovered(false)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'shrink-0 flex items-center justify-center transition-colors duration-quick',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]',
              collapsed && 'mx-auto',
            )}
            style={{
              width:           sizing.iconButton,
              height:          sizing.iconButton,
              color:           t.collapseIcon,
              outlineColor:    t.focusOutline,
              backgroundColor: collapseHovered ? t.collapseHoverBg : 'transparent',
              borderRadius:    radius.sm,
            }}
          >
            <HamburgerToggleIcon collapsed={collapsed} />
          </button>
        )}
      </div>

      {/* ── Scrollable nav body ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        {/* Module header — e.g. "Food Alliance" / "Fulfilment" */}
        {moduleHeader && (
          <div className="relative" style={{ flexShrink: 0 }} onKeyDown={(e) => { if (e.key === 'Escape') setModuleDropdownOpen(false) }}>
            <button
              type="button"
              onClick={() => moduleHeaderItems?.length && setModuleDropdownOpen((x) => !x)}
              aria-haspopup={moduleHeaderItems?.length ? 'listbox' : undefined}
              aria-expanded={moduleHeaderItems?.length ? moduleDropdownOpen : undefined}
              aria-controls={moduleHeaderItems?.length ? 'sidenav-module-listbox' : undefined}
              className={cn(
                'w-full flex items-center transition-colors duration-quick',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]',
                !moduleHeaderItems?.length && 'cursor-default',
              )}
              style={{
                height:          sz.itemHeight,
                paddingLeft:     collapsed ? undefined : sz.px,
                paddingRight:    collapsed ? undefined : sz.px,
                justifyContent:  collapsed ? 'center' : undefined,
                gap:             sz.gap,
                borderBottom:    `${borderWidth.thin} solid ${t.separator}`,
                backgroundColor: t.headerBg,
                outlineColor:    t.focusOutline,
              }}
            >
              {moduleHeader.icon && (
                <span className={sz.iconCls} style={{ color: t.itemIcon }} aria-hidden>
                  {moduleHeader.icon}
                </span>
              )}
              {!collapsed && (
                <>
                  <span
                    className={cn('flex-1 min-w-0 truncate text-left', sz.labelCls)}
                    style={{ color: t.itemText, fontSize: sz.labelFontSize }}
                  >
                    {moduleHeader.label}
                  </span>
                  {moduleHeaderItems?.length && (
                    <span
                      className={cn('transition-transform duration-base', moduleDropdownOpen && 'rotate-180')}
                      style={{ color: t.chevronColor }}
                    >
                      <ChevronDown />
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Dropdown */}
            {moduleDropdownOpen && moduleHeaderItems?.length && !collapsed && (
              <>
                {/* Click-outside overlay */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setModuleDropdownOpen(false)}
                  aria-hidden
                />
                <ul
                  id="sidenav-module-listbox"
                  role="listbox"
                  className="absolute left-0 right-0 z-20 py-1 overflow-hidden"
                  style={{
                    top:             sz.itemHeight,
                    backgroundColor: t.panelBg,
                    borderBottom:    `${borderWidth.thin} solid ${t.panelBorder}`,
                    boxShadow:       elevation.dropdown,
                  }}
                >
                  {moduleHeaderItems.map((mod) => (
                    <li key={mod.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={mod.label === moduleHeader.label}
                        onClick={() => {
                          onModuleHeaderSelect?.(mod.id)
                          setModuleDropdownOpen(false)
                        }}
                        className={cn(
                          'w-full flex items-center transition-colors duration-quick',
                          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]',
                        )}
                        style={{
                          height:          sz.itemHeight,
                          paddingLeft:     spacing[400],
                          paddingRight:    spacing[400],
                          gap:             sz.gap,
                          outlineColor:    t.focusOutline,
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = t.hoverBg }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                      >
                        {mod.icon && (
                          <span className={sz.iconCls} style={{ color: t.itemIcon }} aria-hidden>
                            {mod.icon}
                          </span>
                        )}
                        <span
                          className={cn('flex-1 min-w-0 truncate text-left', sz.labelCls)}
                          style={{
                            color: mod.label === moduleHeader.label ? t.activeText : t.itemText,
                          }}
                        >
                          {mod.label}
                        </span>
                        {mod.label === moduleHeader.label && (
                          <span style={{ color: t.activeIndicator, lineHeight: 1, fontSize: '1em' }}>•</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {groups.map((group, gi) => (
          <div
            key={group.id}
            style={{
              borderBottom: gi < groups.length - 1
                ? `${borderWidth.thin} solid ${t.separator}`
                : undefined,
              paddingTop:    spacing[100],
              paddingBottom: spacing[100],
            }}
          >
            {/* Section heading — hidden in collapsed mode */}
            {group.label && !collapsed && (
              <div
                id={`${group.id}-label`}
                className={sz.sectionLabelCls}
                style={{
                  color:        t.sectionLabel,
                  fontSize:     sz.sectionLabelFontSize,
                  padding:      `${sz.sectionPy} ${sz.px}`,
                  marginBottom: spacing[100],
                }}
              >
                {group.label}
              </div>
            )}

            <ul role="list" aria-labelledby={group.label && !collapsed ? `${group.id}-label` : undefined}>
              {group.items.map((item) => (
                <NavItemRow
                  key={item.id}
                  item={item}
                  isActive={activeId === item.id}
                  isAnyChildActive={item.children ? hasActiveChild(item.children) : false}
                  activeId={activeId}
                  collapsed={collapsed}
                  depth={0}
                  theme={theme}
                  t={t}
                  sz={sz}
                  onSelect={handleSelect}
                  navItemVariant={navItemVariant}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Footer — user profile with optional dropdown ── */}
      {user && (
        <div
          className="relative shrink-0"
          style={{ borderTop: `${borderWidth.thin} solid ${t.panelBorder}` }}
          onKeyDown={(e) => { if (e.key === 'Escape') setUserDropdownOpen(false) }}
        >
          {/* Dropdown — opens upward */}
          {userDropdownOpen && userMenuItems?.length && !collapsed && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setUserDropdownOpen(false)}
                aria-hidden
              />
              <div
                className="absolute left-0 right-0 z-20 py-1"
                style={{
                  bottom:          sz.footerUserH,
                  backgroundColor: t.panelBg,
                  borderTop:       `${borderWidth.thin} solid ${t.panelBorder}`,
                  borderBottom:    `${borderWidth.thin} solid ${t.panelBorder}`,
                  boxShadow:       elevation.dropdown,
                }}
              >
                {userMenuItems.map((item) => (
                  <div key={item.id}>
                    {item.dividerBefore && (
                      <div
                        style={{
                          borderTop: `${borderWidth.thin} solid ${t.separator}`,
                          margin:    `${spacing[100]} 0`,
                        }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        onUserMenuSelect?.(item.id)
                        setUserDropdownOpen(false)
                      }}
                      className={cn(
                        'w-full flex items-center transition-colors duration-quick',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]',
                      )}
                      style={{
                        height:       sz.itemHeight,
                        paddingLeft:  spacing[400],   // 16px — consistent dropdown padding
                        paddingRight: spacing[400],
                        gap:          sz.gap,
                        outlineColor: t.focusOutline,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = t.hoverBg }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                    >
                      {item.icon && (
                        <span className={sz.iconCls} style={{ color: t.itemIcon }} aria-hidden>
                          {item.icon}
                        </span>
                      )}
                      <span
                        className={cn('flex-1 min-w-0 truncate text-left', sz.labelCls)}
                        style={{ color: t.itemText }}
                      >
                        {item.label}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* User row button */}
          <button
            type="button"
            aria-label={collapsed ? user.name : undefined}
            onClick={() => userMenuItems?.length && setUserDropdownOpen((x) => !x)}
            className={cn(
              'w-full flex items-center overflow-hidden transition-colors duration-quick',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]',
              collapsed && 'justify-center',
              !userMenuItems?.length && 'cursor-default',
            )}
            style={{
              height:       sz.footerUserH,
              paddingLeft:  collapsed ? undefined : sz.px,
              paddingRight: collapsed ? undefined : sz.px,
              gap:          sz.gap,
              outlineColor: t.focusOutline,
            }}
          >
            <Avatar
              name={user.name}
              src={user.src}
              size={avatarSize}
              type={theme === 'dark' ? 'dark' : 'light'}
              theme={theme}
              className="shrink-0"
            />
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p
                    className="truncate font-semibold leading-none text-left"
                    style={{ color: t.userNameColor, fontSize: typography.fontSize.md }}
                  >
                    {user.name}
                  </p>
                  {(user.email ?? user.role) && (
                    <p
                      className="truncate leading-none mt-1 text-left"
                      style={{ color: t.userRoleColor, fontSize: typography.fontSize.sm }}
                    >
                      {user.email ?? user.role}
                    </p>
                  )}
                </div>
                {userMenuItems?.length && (
                  <span
                    className={cn('transition-transform duration-base shrink-0', userDropdownOpen && 'rotate-180')}
                    style={{ color: t.chevronColor }}
                  >
                    <ChevronDown />
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      )}
    </nav>
  )
}

SideNavigation.displayName = 'SideNavigation'

export default SideNavigation
