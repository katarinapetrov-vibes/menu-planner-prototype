'use client'

/**
 * Enterprise DS v3 — List
 * Figma node 2519-35998
 *
 * Anatomy
 *   List container  — wrapper with 1 px border + radius/sm (8 px)
 *   ListSection     — optional group header separating item clusters
 *   ListItem        — [selection control] · [leading slot] · content · [trailing slot]
 *
 * Selection variants
 *   none     — no control; selected row shows a 3 px left-edge accent + bg tint
 *   radio    — inline radio circle (single-select). Driven by `selectedId` + `onItemClick`.
 *   checkbox — inline checkbox (multi-select). Driven by `selectedIds` + `onSelectionChange`.
 *
 * Leading slot  — icon (sm 16 px · md 20 px · lg 24 px)  OR  avatar bubble
 * Trailing slot — icon · text value  (optional, composable)
 * States        — default · hover · pressed · selected · disabled · focused
 * Sizes         — sm · md · lg
 * Themes        — light · dark
 */

import React, { useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from './utils'
import { Chip, ChipTheme } from './chip'
import { RadioButton, RadioSize } from './radio-button'
import { Checkbox, CheckboxSize, CheckboxTheme } from './checkbox'
import {
  semantic, translucent, spacing, sizing, radius, borderWidth,
  typography, opacity as opacityTokens, motion as motionTokens,
} from '@/lib/tokens'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ListSize      = 'sm' | 'md' | 'lg'
export type ListTheme     = 'light' | 'dark'
export type ListSelection = 'none' | 'radio' | 'checkbox'

export interface ListItemData {
  /** Unique key */
  id:             string
  /** Primary row label */
  title:          string
  /** Optional secondary line beneath the title */
  description?:   string
  /** Tag chips displayed below description — plain text in default, pill chips on hover/selected */
  tags?:          string[]
  /** Short value label aligned to the trailing edge */
  trailingText?:  string
  /** Fully custom trailing slot — overrides trailingText / trailingIcon / badge when provided */
  trailingContent?: React.ReactNode
  /** Icon in the leading slot (overridden by `avatar`) */
  icon?:          React.ReactNode
  /** Icon in the trailing slot */
  trailingIcon?:  React.ReactNode
  /** Round badge appended after the title */
  badge?:         string | number
  /** Force this item into a selected state independent of selectedId/selectedIds */
  selected?:      boolean
  /** Dims the row and removes interaction */
  disabled?:      boolean
  /** Renders as <a href> */
  href?:          string
  /** Avatar bubble in the leading slot — takes priority over `icon` */
  avatar?: {
    src?:      string
    name?:     string
    initials?: string
  }
  /** Documentation-only: force a specific visual interaction state */
  forcedState?:   'hover' | 'pressed' | 'focused'
}

export interface ListSection {
  id:     string
  label?: string
  items:  ListItemData[]
}

export interface ListProps {
  items?:             ListItemData[]
  sections?:          ListSection[]
  /** Size variant. Default: 'md' */
  size?:              ListSize
  /** Canvas theme. Default: 'light' */
  theme?:             ListTheme
  /** 1 px dividers between items within each group. Default: false */
  dividers?:          boolean
  /** Selection control type. Default: 'none' */
  selection?:         ListSelection
  /** Controlled selected id — used for `selection='none'` accent or `selection='radio'` */
  selectedId?:        string
  /** Controlled selected ids — used for `selection='checkbox'` multi-select */
  selectedIds?:       Set<string>
  /** Called when a non-disabled item is activated (radio / none) */
  onItemClick?:       (id: string, item: ListItemData) => void
  /** Called when a checkbox is toggled — receives the updated full Set */
  onSelectionChange?: (ids: Set<string>) => void
  className?:         string
  style?:             React.CSSProperties
}

// ─── Design Tokens ────────────────────────────────────────────────────────────

const listTokens = {
  light: {
    containerBg:     semantic.background.page.light,
    containerBorder: semantic.border.default.light,
    itemHoverBg:     semantic.background.containerSecondary.light,    // was #F5F5F5 (off-spec); nearest valid token
    itemPressedBg:   semantic.background.neutral.defaultSubtleDeep.light,
    itemSelectedBg:  semantic.background.positive.defaultSubtle.light,
    selectedAccent:  semantic.border.positive.light,
    divider:         semantic.border.default.light,
    titleText:       semantic.foreground.default.primary.light,
    descText:        semantic.foreground.neutral.mid.light,
    trailingText:    semantic.foreground.default.secondary.light,
    iconColor:       semantic.foreground.default.secondary.light,
    badgeBg:         semantic.border.default.light,                   // grey[400] subtle badge fill
    badgeText:       semantic.foreground.default.primary.light,
    disabledText:    semantic.foreground.default.disabled.light,
    focusRing:       semantic.border.focus.light,
    sectionLabelFg:  semantic.foreground.default.disabled.light,
    sectionLabelBg:  semantic.background.container.light,
    sectionDivider:  semantic.border.default.light,
    avatarBg:        semantic.background.positive.defaultStrong.light,
    avatarFg:        semantic.foreground.default.inverse.light,
    // Radio / checkbox control tokens
    controlBorder:        semantic.border.positive.light,
    controlBorderHover:   semantic.background.positive.defaultStrongDeep.light,
    controlCheckedBg:     semantic.background.positive.defaultStrong.light,
    controlCheckedBgHov:  semantic.background.positive.defaultStrongDeep.light,
    controlUncheckedBg:   translucent.transparent,
    controlHoverBg:       semantic.background.positive.defaultSubtle.light,
    controlPressedBg:     semantic.background.positive.defaultSubtleDeep.light,
    controlDotFg:         semantic.foreground.default.inverse.light,
    controlDisabledBg:    semantic.border.default.light,
    controlDisabledChkBg: semantic.foreground.default.disabled.light,
  },
  dark: {
    containerBg:     semantic.background.container.dark,              // was #1E1E1E (off-spec); nearest valid token
    containerBorder: semantic.border.default.dark,
    itemHoverBg:     semantic.background.container.dark,
    itemPressedBg:   semantic.background.neutral.defaultSubtleDeep.dark, // was #333333 (off-spec); nearest valid token
    itemSelectedBg:  semantic.background.positive.defaultSubtleDeep.dark,
    selectedAccent:  semantic.border.focus.dark,
    divider:         semantic.border.default.dark,                    // was #3D3D3D (off-spec); nearest valid token
    titleText:       semantic.foreground.default.primary.dark,
    descText:        semantic.foreground.neutral.mid.dark,
    trailingText:    semantic.foreground.neutral.mid.dark,
    iconColor:       semantic.foreground.neutral.mid.dark,
    badgeBg:         semantic.border.default.dark,
    badgeText:       semantic.foreground.default.primary.dark,
    disabledText:    semantic.foreground.default.disabled.dark,
    focusRing:       semantic.border.focus.dark,
    sectionLabelFg:  semantic.foreground.default.disabled.dark,
    sectionLabelBg:  semantic.background.container.dark,
    sectionDivider:  semantic.border.default.dark,
    avatarBg:        semantic.background.positive.defaultStrong.dark,
    avatarFg:        semantic.foreground.positive.onColour.dark,
    // Radio / checkbox control tokens — dark mode
    controlBorder:        semantic.border.focus.dark,
    controlBorderHover:   semantic.foreground.positive.defaultDeep.dark,
    controlCheckedBg:     semantic.background.positive.defaultStrong.dark,
    controlCheckedBgHov:  semantic.foreground.positive.defaultDeep.dark,
    controlUncheckedBg:   translucent.transparent,
    controlHoverBg:       translucent.green10,
    controlPressedBg:     translucent.green20,
    controlDotFg:         semantic.foreground.positive.onColour.dark,
    controlDisabledBg:    translucent.white10,
    controlDisabledChkBg: semantic.foreground.neutral.mid.dark,
  },
} as const

type TokenSet  = typeof listTokens[ListTheme]

// ─── Size Configuration ───────────────────────────────────────────────────────

const sizeConfig = {
  sm: {
    px:           spacing[300],                       // 12px
    py:           spacing[200],                       // 8px
    gap:          spacing[200],                       // 8px
    titleFs:      typography.fontSize.sm,             // 14px
    titleFw:      typography.fontWeight.regular,
    titleLh:      typography.lineHeight.comfortable,  // 1.43em — 14px→20px
    descFs:       typography.fontSize.xs,             // 12px
    descFw:       typography.fontWeight.regular,
    descLh:       typography.lineHeight.loose,        // 1.667em
    iconSz:       sizing.icon.sm,                     // 16px
    avatarSz:     sizing.componentHeight.sm,          // 24px
    avatarFs:     typography.fontSize.xs,             // 12px
    badgeFs:      typography.fontSize.xxxs,           // 11px
    badgePx:      spacing[100],                       // 4px
    badgeMinW:    spacing[400],                       // 16px
    trailingFs:   typography.fontSize.xs,             // 12px
    controlSz:    sizing.icon.sm,                     // 16px
    radioSz:      spacing[100],                       // 4px
    checkSz:      sizing.checkmark.sm,                // 9px
    sectionPx:    spacing[300],                       // 12px
    sectionPy:    spacing[100],                       // 4px
    sectionFs:    typography.fontSize.xxxs,           // 11px
    sectionFw:    typography.fontWeight.semibold,
    sectionLh:    typography.lineHeight.compact,      // 1.273em
  },
  md: {
    px:           spacing[400],                       // 16px
    py:           spacing[200],                       // 8px
    gap:          spacing[300],                       // 12px
    titleFs:      typography.fontSize.md,             // 16px
    titleFw:      typography.fontWeight.regular,
    titleLh:      typography.lineHeight.relaxed,      // 1.5em
    descFs:       typography.fontSize.xs,             // 12px
    descFw:       typography.fontWeight.regular,
    descLh:       typography.lineHeight.loose,        // 1.667em
    iconSz:       spacing[500],                       // 20px — sizing.icon has no 20px tier; spacing[500] is nearest
    avatarSz:     sizing.iconButton,                  // 32px
    avatarFs:     typography.fontSize.sm,             // 14px
    badgeFs:      typography.fontSize.xs,             // 12px
    badgePx:      spacing[100],                       // 4px
    badgeMinW:    spacing[500],                       // 20px
    trailingFs:   typography.fontSize.sm,             // 14px
    controlSz:    spacing[500],                       // 20px
    radioSz:      spacing[200],                       // 8px
    checkSz:      sizing.checkmark.md,                // 11px
    sectionPx:    spacing[400],                       // 16px
    sectionPy:    spacing[100],                       // 4px
    sectionFs:    typography.fontSize.xs,             // 12px
    sectionFw:    typography.fontWeight.semibold,
    sectionLh:    typography.lineHeight.loose,        // 1.667em
  },
  lg: {
    px:           spacing[400],                       // 16px
    py:           spacing[300],                       // 12px
    gap:          spacing[300],                       // 12px
    titleFs:      typography.fontSize.md,             // 16px
    titleFw:      typography.fontWeight.regular,
    titleLh:      typography.lineHeight.relaxed,      // 1.5em
    descFs:       typography.fontSize.sm,             // 14px
    descFw:       typography.fontWeight.regular,
    descLh:       typography.lineHeight.comfortable,  // 1.43em — 14px→20px
    iconSz:       sizing.icon.md,                     // 24px
    avatarSz:     sizing.componentHeight.md,          // 40px
    avatarFs:     typography.fontSize.md,             // 16px
    badgeFs:      typography.fontSize.xs,             // 12px
    badgePx:      spacing[200],                       // 8px
    badgeMinW:    spacing[500],                       // 20px
    trailingFs:   typography.fontSize.sm,             // 14px
    controlSz:    sizing.icon.md,                     // 24px
    radioSz:      spacing[200],                       // 8px
    checkSz:      sizing.checkmark.lg,                // 13px
    sectionPx:    spacing[400],                       // 16px
    sectionPy:    spacing[200],                       // 8px
    sectionFs:    typography.fontSize.xs,             // 12px
    sectionFw:    typography.fontWeight.semibold,
    sectionLh:    typography.lineHeight.loose,        // 1.667em
  },
} as const

type SizeConfig = typeof sizeConfig[ListSize]

// ─── Avatar Bubble ────────────────────────────────────────────────────────────

interface AvatarBubbleProps {
  avatar:   ListItemData['avatar']
  sz:       string
  fontSize: string
  bg:       string
  fg:       string
}

function AvatarBubble({ avatar, sz, fontSize, bg, fg }: AvatarBubbleProps) {
  const initials =
    avatar?.initials ??
    avatar?.name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('') ??
    '?'

  return (
    <span
      aria-hidden={true}
      style={{
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        width:           sz,
        height:          sz,
        borderRadius:    radius.circle,
        backgroundColor: bg,
        color:           fg,
        fontSize,
        fontWeight:      typography.fontWeight.semibold,
        lineHeight:      typography.lineHeight.none,
        flexShrink:      0,
        overflow:        'hidden',
      }}
    >
      {avatar?.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials
      )}
    </span>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ label, t, sz }: { label: string; t: TokenSet; sz: SizeConfig }) {
  return (
    <div
      style={{
        paddingLeft:     sz.sectionPx,
        paddingRight:    sz.sectionPx,
        paddingTop:      sz.sectionPy,
        paddingBottom:   sz.sectionPy,
        backgroundColor: t.sectionLabelBg,
        borderBottom:    `${borderWidth.thin} solid ${t.sectionDivider}`,
      }}
    >
      <span
        style={{
          display:       'block',
          fontSize:      sz.sectionFs,
          fontWeight:    sz.sectionFw,
          lineHeight:    sz.sectionLh,
          color:         t.sectionLabelFg,
          letterSpacing: typography.letterSpacing.wide,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  )
}

// ─── ListItemRow ──────────────────────────────────────────────────────────────

interface ListItemRowProps {
  item:         ListItemData
  t:            TokenSet
  sz:           SizeConfig
  size:         ListSize
  theme:        ListTheme
  selection:    ListSelection
  isSelected:   boolean
  showDivider:  boolean
  onClickItem?: (id: string, item: ListItemData) => void
  onToggleCheckbox?: (id: string) => void
}

function ListItemRow({
  item,
  t,
  sz,
  size,
  theme,
  selection,
  isSelected,
  showDivider,
  onClickItem,
  onToggleCheckbox,
}: ListItemRowProps) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const selected    = isSelected || Boolean(item.selected)

  // forcedState allows the DS canvas to pin a specific visual state
  const effectiveHovered = hovered || item.forcedState === 'hover'
  const effectivePressed = pressed || item.forcedState === 'pressed'

  const hasLeading  = Boolean(item.icon || item.avatar)
  const hasTrailing = Boolean(item.trailingContent || item.trailingIcon || item.trailingText !== undefined || item.badge !== undefined)
  const hasControl  = selection !== 'none'

  // Interactive when there's a click handler / href AND item isn't disabled.
  // onToggleCheckbox is always a function (passed unconditionally from the parent), so it must be
  // gated on selection='checkbox' — otherwise every non-disabled item renders as role="button".
  const interactive = (Boolean(onClickItem) || (selection === 'checkbox' && Boolean(onToggleCheckbox)) || Boolean(item.href)) && !item.disabled

  // Background:
  // — checkbox/radio: always green-tinted when selected
  // — none: green tint + accent bar when selected
  const bg =
    item.disabled      ? 'transparent' :
    selected           ? t.itemSelectedBg :
    effectivePressed   ? t.itemPressedBg :
    effectiveHovered   ? t.itemHoverBg :
    'transparent'

  const handlers = interactive
    ? {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => { setHovered(false); setPressed(false) },
        onMouseDown:  () => setPressed(true),
        onMouseUp:    () => setPressed(false),
      }
    : {}

  const handleActivate = () => {
    if (item.disabled) return
    if (selection === 'checkbox') {
      onToggleCheckbox?.(item.id)
    } else {
      onClickItem?.(item.id, item)
    }
  }

  const rowStyle: React.CSSProperties = {
    position:        'relative',
    display:         'flex',
    alignItems:      'center',
    gap:             sz.gap,
    paddingLeft:     sz.px,
    paddingRight:    sz.px,
    paddingTop:      sz.py,
    paddingBottom:   sz.py,
    backgroundColor: bg,
    borderBottom:    showDivider ? `${borderWidth.thin} solid ${t.divider}` : 'none',
    cursor:          item.disabled ? 'not-allowed' : interactive ? 'pointer' : 'default',
    opacity:         item.disabled ? opacityTokens.half : 1,
    transition:      prefersReducedMotion ? undefined : `background-color ${motionTokens.duration.quick} ${motionTokens.easing.easeOut}`,
    outlineStyle:    item.forcedState === 'focused' ? 'solid'              : undefined,
    outlineWidth:    item.forcedState === 'focused' ? borderWidth.default  : undefined,
    outlineOffset:   item.forcedState === 'focused' ? `-${borderWidth.default}` : undefined,
    outlineColor:    t.focusRing,
  }

  const innerContent = (
    <>
      {/* 'none' variant: left accent bar on selected */}
      {selection === 'none' && selected && (
        <span
          aria-hidden={true}
          style={{
            position:        'absolute',
            left:            0,
            top:             0,
            bottom:          0,
            width:           spacing[50], // DS gap: needs scale[75]=3 for precise 3px accent bar; using spacing[50]=2px until scale step is added
            backgroundColor: t.selectedAccent,
            borderRadius:    `0 ${spacing[50]} ${spacing[50]} 0`,
          }}
        />
      )}

      {/* Selection control — radio or checkbox (DS components) */}
      {hasControl && (
        <span
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}
          onClick={(e) => e.stopPropagation()}
        >
          {selection === 'radio' ? (
            <RadioButton
              value={item.id}
              checked={selected}
              onChange={() => handleActivate()}
              disabled={Boolean(item.disabled)}
              size={size as RadioSize}
              theme={theme as 'light' | 'dark'}
            />
          ) : (
            // aria-label gives the checkbox its accessible name independent of the row wrapper
            <Checkbox
              checked={selected}
              onChange={() => handleActivate()}
              disabled={item.disabled}
              size={size as CheckboxSize}
              theme={theme as CheckboxTheme}
              aria-label={item.title}
            />
          )}
        </span>
      )}

      {/* Leading icon / avatar */}
      {hasLeading && (
        <span
          aria-hidden={true}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
            width:          item.avatar ? sz.avatarSz : sz.iconSz,
            height:         item.avatar ? sz.avatarSz : sz.iconSz,
            color:          item.disabled ? t.disabledText : t.iconColor,
          }}
        >
          {item.avatar ? (
            <AvatarBubble
              avatar={item.avatar}
              sz={sz.avatarSz}
              fontSize={sz.avatarFs}
              bg={t.avatarBg}
              fg={t.avatarFg}
            />
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: sz.iconSz, height: sz.iconSz }}>
              {item.icon}
            </span>
          )}
        </span>
      )}

      {/* Content — natural width so trailing content can breathe on the right */}
      <span style={{ flex: '0 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing[50] }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: spacing[200] }}>
          <span
            style={{
              flex:         '1 1 0',
              minWidth:     0,
              fontSize:     sz.titleFs,
              fontWeight:   sz.titleFw,
              lineHeight:   sz.titleLh,
              color:        item.disabled ? t.disabledText : t.titleText,
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
            }}
          >
            {item.title}
          </span>

          {item.badge !== undefined && (
            <span
              style={{
                flexShrink:      0,
                display:         'inline-flex',
                alignItems:      'center',
                justifyContent:  'center',
                fontSize:        sz.badgeFs,
                fontWeight:      typography.fontWeight.semibold,
                lineHeight:      spacing[500],
                color:           item.disabled ? t.disabledText : t.badgeText,
                backgroundColor: item.disabled ? 'transparent' : t.badgeBg,
                paddingLeft:     sz.badgePx,
                paddingRight:    sz.badgePx,
                borderRadius:    radius.round,
                minWidth:        sz.badgeMinW,
              }}
            >
              {item.badge}
            </span>
          )}
        </span>

        {item.description && (
          <span
            style={{
              fontSize:     sz.descFs,
              fontWeight:   sz.descFw,
              lineHeight:   sz.descLh,
              color:        item.disabled ? t.disabledText : t.descText,
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
            }}
          >
            {item.description}
          </span>
        )}

        {item.tags && item.tags.length > 0 && (
          <span style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[100], marginTop: spacing[50] }}>
            {item.tags.map((tag, i) => (
              <Chip
                key={i}
                chipType="display"
                size="md"
                appearance="outline"
                chipColour="neutral"
                theme={theme as ChipTheme}
                disabled={item.disabled}
              >
                {tag}
              </Chip>
            ))}
          </span>
        )}
      </span>

      {/* Spacer — pushes trailing content to the far right */}
      <span style={{ flex: 1 }} aria-hidden />

      {/* Trailing */}
      {hasTrailing && (
        <span style={{ display: 'flex', alignItems: 'center', gap: spacing[100], flexShrink: 0 }}>
          {item.trailingContent !== undefined ? item.trailingContent : (
            <>
              {item.trailingText !== undefined && (
                <span style={{ fontSize: sz.trailingFs, fontWeight: 400, lineHeight: sz.titleLh, color: item.disabled ? t.disabledText : t.trailingText }}>
                  {item.trailingText}
                </span>
              )}
              {item.trailingIcon && (
                <span
                  aria-hidden
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    flexShrink:     0,
                    width:          sz.iconSz,
                    height:         sz.iconSz,
                    color:          item.disabled ? t.disabledText : t.iconColor,
                  }}
                >
                  {item.trailingIcon}
                </span>
              )}
            </>
          )}
        </span>
      )}
    </>
  )

  // href — render as anchor wrapped in a listitem div so the <a> retains its implicit link role
  // while the parent role="list" has correctly-typed listitem children.
  if (item.href && !item.disabled) {
    return (
      <div role="listitem" style={rowStyle} {...handlers}>
        <a
          href={item.href}
          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
          style={{ display: 'flex', width: '100%', textDecoration: 'none', color: 'inherit', alignItems: 'center', gap: sz.gap }}
        >
          {innerContent}
        </a>
      </div>
    )
  }

  // Checkbox rows: plain div — the inner <input type="checkbox"> is the sole interactive element.
  // role="button" wrapping a native checkbox creates invalid ARIA nesting (interactive in interactive).
  if (interactive && selection === 'checkbox') {
    return (
      <div
        role="listitem"
        className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        style={{ ...rowStyle, width: '100%', userSelect: 'none' }}
        onClick={handleActivate}
        {...handlers}
      >
        {innerContent}
      </div>
    )
  }

  // Click / radio rows: role="button" with aria-pressed to announce selected state for selection="none".
  if (interactive) {
    return (
      <div
        role="button"
        tabIndex={item.disabled ? -1 : 0}
        aria-pressed={selection === 'none' ? selected : undefined}
        className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        style={{ ...rowStyle, width: '100%', userSelect: 'none' }}
        onClick={handleActivate}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleActivate() } }}
        {...handlers}
      >
        {innerContent}
      </div>
    )
  }

  // Static
  return <div role="listitem" style={rowStyle}>{innerContent}</div>
}

// ─── List ─────────────────────────────────────────────────────────────────────

function List({
  items     = [],
  sections,
  size      = 'md',
  theme     = 'light',
  dividers  = false,
  selection = 'none',
  selectedId,
  selectedIds,
  onItemClick,
  onSelectionChange,
  className,
  style,
}: ListProps) {
  const t      = listTokens[theme]
  const sz     = sizeConfig[size]
  const groups = sections ?? [{ id: '_root', items }]

  const handleToggleCheckbox = (id: string) => {
    if (!onSelectionChange) return
    const next = new Set(selectedIds ?? [])
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(next)
  }

  return (
    <div
      role="list"
      className={cn('overflow-hidden', className)}
      style={{
        backgroundColor: t.containerBg,
        border:          `${borderWidth.thin} solid ${t.containerBorder}`,
        borderRadius:    radius.sm,
        ...style,
      }}
    >
      {groups.map((group, gi) => (
        <div key={group.id} {...(group.label ? { role: 'group', 'aria-label': group.label } : {})}>
          {group.label && <SectionHeader label={group.label} t={t} sz={sz} />}

          {group.items.map((item, ii) => {
            const isLast      = ii === group.items.length - 1
            const showDivider = dividers && !isLast
            const isSelected  =
              selection === 'checkbox'
                ? (selectedIds?.has(item.id) || Boolean(item.selected))
                : item.id === selectedId || Boolean(item.selected)

            return (
              <ListItemRow
                key={item.id}
                item={item}
                t={t}
                sz={sz}
                size={size}
                theme={theme}
                selection={selection}
                isSelected={isSelected}
                showDivider={showDivider}
                onClickItem={onItemClick}
                onToggleCheckbox={handleToggleCheckbox}
              />
            )
          })}

          {sections && gi < sections.length - 1 && (
            <div aria-hidden={true} style={{ height: `${borderWidth.thin}`, backgroundColor: t.sectionDivider }} />
          )}
        </div>
      ))}
    </div>
  )
}

List.displayName = 'List'

export { List }
export default List
