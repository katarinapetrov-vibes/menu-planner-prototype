'use client'

import React, { useState } from 'react'
import { clsx } from 'clsx'
import { components, sizing, typography } from '@/lib/tokens'
import { Avatar } from './avatar'
import { Chip } from './chip'
import { Button } from './button'
import { DropdownField } from './dropdown-field'
import { InputField } from './input-field'
import { Tabs } from './tabs'
import {
  FlagAU, FlagAT, FlagBE, FlagCA, FlagDK,
  FlagFR, FlagDE, FlagIE, FlagIT, FlagLU,
  FlagNL, FlagNZ, FlagNO, FlagES, FlagSE,
  FlagCH, FlagGB, FlagUS,
} from './flags'

/**
 * Enterprise DS v3 — Header
 * Figma node 15042-240527
 *
 * A full-width application header that composes configurable slots:
 * pictogram, title, label chip, avatars, input fields, dropdowns,
 * action buttons, an additional action link, an optional tab bar,
 * and a breadcrumbs / back-button mode.
 *
 * Figma variables:
 *   Tab Bar           True | False
 *   Breadcrumbs       True | False  (Back Button w icon included)
 *   Chips/Squared     True | False  (label chip next to title)
 *   Avatar-Left       True | False
 *   Pictogram         True | False
 *   Input Fields - 1  True | False
 *   Input Fields - 2  True | False
 *   Dropdown          True | False
 *   Secondary Button  True | False
 *   Primary Button    True | False
 *   Avatar - Right    True | False
 *   Additional Action True | False
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type HeaderTheme = 'light' | 'dark'

export interface HeaderTab {
  id: string
  label: string
  disabled?: boolean
}

export interface HeaderAvatar {
  /** 1–2 character initials */
  initials: string
  /** Avatar background colour — defaults to brand green (semantic token resolved value) */
  color?: string
}

export interface HeaderDropdownOption {
  label: string
  value: string
  icon?: React.ReactNode
}

export interface HeaderDropdownConfig {
  /** Floating label rendered above the trigger (Figma label + percent column layout) */
  label?: string
  placeholder?: string
  value?: string
  options?: HeaderDropdownOption[]
  onChange?: (value: string) => void
  /** Leading icon rendered inside the trigger */
  leadingIcon?: React.ReactNode
}

export interface HeaderInputConfig {
  /** Floating label rendered above the input */
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  /** End value for range inputs (e.g. date range) */
  valueEnd?: string
  onChangeEnd?: (value: string) => void
  /** Renders two inputs side-by-side with an arrow separator */
  isRange?: boolean
}

export interface HeaderActionConfig {
  label: string
  onClick: () => void
  icon?: React.ReactNode
}

export interface HeaderBreadcrumbItem {
  label: string
  /** When provided the breadcrumb renders as a clickable chip with chevron */
  onClick?: () => void
}

export interface HeaderProps {
  /** Menu item / page title */
  title?: string
  /** Figma: Chips/Squared — label badge next to the title */
  label?: string
  /** Figma: Pictogram — square icon box on the far left */
  pictogram?: React.ReactNode
  /**
   * Small primary (green) button on the left, before pictogram/title.
   * Use for back-to-overview style actions in the title row.
   */
  leadingAction?: HeaderActionConfig
  /** Figma: Avatar-Left — avatar between pictogram and title */
  avatarLeft?: HeaderAvatar
  /** Figma: Input Fields - 1 */
  inputField1?: HeaderInputConfig
  /** Figma: Input Fields - 2 */
  inputField2?: HeaderInputConfig
  /**
   * Arbitrary React content rendered in the right action rail, before `dropdown`.
   * @temporary — added until Header natively supports a second multi-select dropdown slot.
   * DS ask: add a typed `secondDropdown` slot with multi-select support (see sage-rules.mdc §8 ask #3).
   */
  trailingContent?: React.ReactNode
  /** Figma: Dropdown — additional notes / filter dropdown */
  dropdown?: HeaderDropdownConfig
  /** Figma: Secondary Button */
  secondaryAction?: HeaderActionConfig
  /** Figma: Primary Button */
  primaryAction?: HeaderActionConfig
  /** Figma: Avatar - Right — avatar on the right action rail */
  avatarRight?: HeaderAvatar
  /** Figma: Additional Action (link) — inline text link */
  additionalAction?: HeaderActionConfig
  /** Figma: Tab Bar — rendered below the main row */
  tabs?: HeaderTab[]
  activeTab?: string
  onTabChange?: (id: string) => void
  /**
   * Figma: Breadcrumbs — when provided, renders the breadcrumb row
   * instead of the standard title / action row.
   */
  breadcrumbs?: HeaderBreadcrumbItem[]
  /** Figma: Back Button w icon */
  showBackButton?: boolean
  onBack?: () => void
  /** Country / region selector — shown on the far right */
  countryDropdown?: HeaderDropdownConfig
  theme?: HeaderTheme
  className?: string
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PlaceholderBoxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="2" width="12" height="12" rx="1.5" />
      <path d="M2 6h12" strokeLinecap="round" />
      <path d="M6 6v8" strokeLinecap="round" />
    </svg>
  )
}

export function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="3" width="12" height="11" rx="1.5" />
      <path d="M2 7h12" />
      <path d="M5 1v4M11 1v4" strokeLinecap="round" />
    </svg>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────


// ─── Sub-components ───────────────────────────────────────────────────────────

function PictogramBox({ icon, theme }: { icon: React.ReactNode; theme: HeaderTheme }) {
  const tok = components.header.colour[theme]
  return (
    <span
      className="inline-flex items-center justify-center rounded shrink-0 w-8 h-8"
      style={{
        backgroundColor: tok.chipBg,
        border: `1px solid ${tok.chipBorder}`,
        color: tok.chipText,
      }}
    >
      {icon}
    </span>
  )
}

function InlineDropdown({
  config,
  theme,
}: {
  config: HeaderDropdownConfig
  theme: HeaderTheme
}) {
  const tok = components.header.colour[theme]

  return (
    <DropdownField
      label={config.label}
      aria-label={config.label}
      placeholder={config.placeholder ?? 'Select'}
      options={(config.options ?? []).map((o) => ({ label: o.label, value: o.value }))}
      value={config.value ?? ''}
      onChange={(v) => config.onChange?.(v as string)}
      size="sm"
      theme={theme}
      leadingIcon={config.leadingIcon}
    />
  )
}

// Default country options — all 19 countries from the flags library, each with
// their inline SVG flag component pre-wired as the icon slot.
const DEFAULT_COUNTRY_OPTIONS = [
  { value: 'AU', label: 'Australia',      icon: <FlagAU size={16} /> },
  { value: 'AT', label: 'Austria',        icon: <FlagAT size={16} /> },
  { value: 'BE', label: 'Belgium',        icon: <FlagBE size={16} /> },
  { value: 'CA', label: 'Canada',         icon: <FlagCA size={16} /> },
  { value: 'DK', label: 'Denmark',        icon: <FlagDK size={16} /> },
  { value: 'FR', label: 'France',         icon: <FlagFR size={16} /> },
  { value: 'DE', label: 'Germany',        icon: <FlagDE size={16} /> },
  { value: 'IE', label: 'Ireland',        icon: <FlagIE size={16} /> },
  { value: 'IT', label: 'Italy',          icon: <FlagIT size={16} /> },
  { value: 'LU', label: 'Luxembourg',     icon: <FlagLU size={16} /> },
  { value: 'NL', label: 'Netherlands',    icon: <FlagNL size={16} /> },
  { value: 'NZ', label: 'New Zealand',    icon: <FlagNZ size={16} /> },
  { value: 'NO', label: 'Norway',         icon: <FlagNO size={16} /> },
  { value: 'ES', label: 'Spain',          icon: <FlagES size={16} /> },
  { value: 'SE', label: 'Sweden',         icon: <FlagSE size={16} /> },
  { value: 'CH', label: 'Switzerland',    icon: <FlagCH size={16} /> },
  { value: 'GB', label: 'United Kingdom', icon: <FlagGB size={16} /> },
  { value: 'US', label: 'United States',  icon: <FlagUS size={16} /> },
]

function CountryDropdown({
  config,
  theme,
}: {
  config: HeaderDropdownConfig
  theme: HeaderTheme
}) {
  // Caller-supplied options take precedence; fall back to the full default list.
  const options = config.options && config.options.length > 0
    ? config.options.map((o) => ({ label: o.label, value: o.value, icon: o.icon }))
    : DEFAULT_COUNTRY_OPTIONS

  return (
    <div style={{ width: sizing.header.countryDropdown }}>
      <DropdownField
        placeholder={config.placeholder ?? 'Country'}
        options={options}
        value={config.value ?? ''}
        onChange={(v) => config.onChange?.(v as string)}
        size="sm"
        theme={theme}
      />
    </div>
  )
}

function InlineInput({ config, theme }: { config: HeaderInputConfig; theme: HeaderTheme }) {
  const tok = components.header.colour[theme]

  if (config.isRange) {
    return (
      <div className="inline-flex flex-col items-start">
        <div
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg"
          style={{
            fontSize: typography.fontSize.sm,
            backgroundColor: tok.controlBg,
            border: `1px solid ${tok.controlBorder}`,
          }}
        >
          <input
            type="text"
            value={config.value ?? ''}
            onChange={(e) => config.onChange?.(e.target.value)}
            placeholder={config.placeholder ?? 'WW-YYYY'}
            aria-label={config.label ?? config.placeholder ?? 'Start value'}
            className="w-20 bg-transparent focus:outline-none"
            style={{ color: tok.inputText }}
          />
          <span style={{ color: tok.icon, fontSize: typography.fontSize.sm }} aria-hidden>→</span>
          <input
            type="text"
            value={config.valueEnd ?? ''}
            onChange={(e) => config.onChangeEnd?.(e.target.value)}
            placeholder={config.placeholder ?? 'WW-YYYY'}
            aria-label={config.label ? `${config.label} end` : 'End value'}
            className="w-20 bg-transparent focus:outline-none"
            style={{ color: tok.inputText }}
          />
          {config.trailingIcon && (
            <span className="w-4 h-4 shrink-0" style={{ color: tok.icon }} aria-hidden>
              {config.trailingIcon}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <InputField
      label={config.label}
      placeholder={config.placeholder ?? (config.label ?? '')}
      value={config.value ?? ''}
      onChange={config.onChange}
      leadingIcon={config.leadingIcon}
      trailingIcon={config.trailingIcon}
      size="sm"
      theme={theme}
      variant="stacked"
    />
  )
}

function TabBar({
  tabs,
  activeTab,
  onTabChange,
  theme,
}: {
  tabs: HeaderTab[]
  activeTab?: string
  onTabChange?: (id: string) => void
  theme: HeaderTheme
}) {
  return (
    <Tabs
      tabs={tabs}
      value={activeTab}
      onChange={onTabChange}
      theme={theme}
      size="sm"
      indicatorPosition="bottom"
    />
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Header({
  title,
  label,
  pictogram,
  leadingAction,
  avatarLeft,
  inputField1,
  inputField2,
  dropdown,
  secondaryAction,
  primaryAction,
  avatarRight,
  additionalAction,
  tabs,
  activeTab,
  onTabChange,
  breadcrumbs,
  showBackButton = false,
  onBack,
  countryDropdown,
  trailingContent,
  theme = 'light',
  className,
}: HeaderProps) {
  const tok = components.header.colour[theme]
  const ringColor = tok.focusRing
  const isBreadcrumbMode = showBackButton || (breadcrumbs && breadcrumbs.length > 0)

  return (
    <header
      className={clsx('w-full', className)}
      style={{
        backgroundColor: tok.bg,
        borderBottom: `1px solid ${tok.border}`,
      }}
    >
      {/* ── Main row ── */}
      <div className="flex items-center px-4 gap-2" style={{ height: sizing.componentHeight['3xl'] }}>

        {/* LEFT — back button + breadcrumbs OR pictogram + title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">

          {showBackButton && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2"
              style={{
                color: tok.backArrowText,
                ['--tw-ring-color' as string]: ringColor,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = tok.backArrowHoverBg }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
          )}

          {isBreadcrumbMode ? (
            <div className="flex items-center gap-2 flex-wrap">
              {breadcrumbs?.map((crumb, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <span style={{ color: tok.crumbSeparator, fontSize: typography.fontSize.sm }}>/</span>
                  )}
                  {crumb.onClick ? (
                    <button type="button" onClick={crumb.onClick} className="focus-visible:outline-none">
                      <Chip
                        chipType="display"
                        chipColour="neutral"
                        appearance="light"
                        size="sm"
                        theme={theme}
                        showTrailingIcon
                        trailingIcon={<ChevronDownIcon className="w-3.5 h-3.5" />}
                      >
                        {crumb.label}
                      </Chip>
                    </button>
                  ) : (
                    <span
                      className="font-semibold"
                      style={{ color: tok.crumbText, fontSize: typography.fontSize.sm }}
                    >
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <>
              {leadingAction && (
                <Button
                  variant="fill"
                  color="positive"
                  size="sm"
                  theme={theme}
                  onClick={leadingAction.onClick}
                  showLeadingIcon={!!leadingAction.icon}
                  leadingIcon={leadingAction.icon}
                >
                  {leadingAction.label}
                </Button>
              )}
              {pictogram && <PictogramBox icon={pictogram} theme={theme} />}
              {avatarLeft && (
                <Avatar
                  name={avatarLeft.initials}
                  size="sm"
                  type={theme === 'dark' ? 'dark' : 'light'}
                  theme={theme}
                />
              )}
              {title && (
                <span
                  className="leading-tight truncate"
                  style={{
                    color:      tok.title,
                    fontSize:   typography.fontSize.md,
                    fontWeight: typography.fontWeight.semibold,
                    fontFamily: typography.fontFamily.body,
                  }}
                >
                  {title}
                </span>
              )}
              {label && (
                <Chip chipType="display" chipColour="neutral" appearance="light" size="sm" theme={theme}>
                  {label}
                </Chip>
              )}
            </>
          )}
        </div>

        {/* RIGHT — action rail (hidden in breadcrumb mode) */}
        {!isBreadcrumbMode && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            {avatarRight && (
              <Avatar
                name={avatarRight.initials}
                size="sm"
                type={theme === 'dark' ? 'dark' : 'light'}
                theme={theme}
              />
            )}
            {inputField1 && <InlineInput config={inputField1} theme={theme} />}
            {inputField2 && <InlineInput config={inputField2} theme={theme} />}
            {trailingContent}
            {dropdown    && <InlineDropdown config={dropdown} theme={theme} />}

            {additionalAction && (
              <Button
                variant="text"
                color="positive"
                size="sm"
                theme={theme}
                onClick={additionalAction.onClick}
              >
                {additionalAction.label}
              </Button>
            )}

            {secondaryAction && (
              <Button
                variant="outline"
                color="neutral"
                size="sm"
                theme={theme}
                onClick={secondaryAction.onClick}
                showLeadingIcon={!!secondaryAction.icon}
                leadingIcon={secondaryAction.icon}
              >
                {secondaryAction.label}
              </Button>
            )}

            {primaryAction && (
              <Button
                variant="fill"
                color="positive"
                size="sm"
                theme={theme}
                onClick={primaryAction.onClick}
                showLeadingIcon={!!primaryAction.icon}
                leadingIcon={primaryAction.icon}
              >
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}

        {/* SEPARATOR + Country dropdown */}
        {countryDropdown && (
          <>
            {!isBreadcrumbMode && (
              <div
                className="w-px mx-1 shrink-0"
                style={{ height: sizing.componentHeight.md, backgroundColor: tok.separator }}
              />
            )}
            <CountryDropdown config={countryDropdown} theme={theme} />
          </>
        )}
      </div>

      {/* ── Tab bar (optional, hidden in breadcrumb mode) ── */}
      {tabs && tabs.length > 0 && !isBreadcrumbMode && (
        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          theme={theme}
        />
      )}
    </header>
  )
}
