'use client'

import React from 'react'
import { semantic, spacing, typography } from '@/lib/tokens'
import { Button } from './button'
import { WarningOutline } from './icons/material-warning-outline'
import { CancelOutline } from './icons/material-cancel-outline'
import { NotificationsOutline } from './icons/material-notifications-outline'
import { OpenInNewOutline } from './icons/material-open-in-new-outline'
import { CheckOutline } from './icons/material-check-outline'

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS — _log-types (node 38761:86622)
//
// Variants: Type = Warning | Error | Update  ×  State = Default | Read | Resolved
//
// Accent colour tokens (light / dark):
//   Warning  → semantic.foreground.warning.default   (#CE4500 / #FF941A)
//   Error    → semantic.foreground.negative.default  (#B30000 / #FE8680)
//   Update   → semantic.foreground.positive.default  (#067A46 / #96DC14)
//
// State rules:
//   Default  → title Body/Medium/Bold (700)  + 2 px left border in accent colour
//   Read     → title Body/Medium/Semi (600), no left border
//   Resolved → title secondary grey, semi; action button disabled ("Resolved")

export type LogType      = 'warning' | 'error' | 'update'
export type LogState     = 'default' | 'read' | 'resolved'
export type LogItemTheme = 'light' | 'dark'

export interface LogItemDetails {
  /** Section name, e.g. "Poultry" */
  section?: string
  /** Market code, e.g. "DE" */
  market?: string
  /** Date string, e.g. "24 Mar. 2025" */
  date?: string
}

export interface LogItemProps {
  /** Log type — sets the icon and accent colour */
  type?: LogType
  /** Log state — affects title weight, left border, and action button */
  state?: LogState
  /** Title text */
  title: string
  /** Formatted display timestamp, e.g. "24 Mar. 2025 10:00" */
  timestamp: string
  /** Optional main description */
  description?: string
  /** Optional SKU / item reference label */
  skuDetails?: string
  /** Optional bullet-separated metadata row (Section • Market • Date) */
  details?: LogItemDetails
  /** Optional secondary description line */
  others?: string
  /** Show the action button — default true */
  showActionButton?: boolean
  /** Show the open-in-new-tab icon — default true */
  showOpenInNew?: boolean
  /** Called when the user clicks "Mark as resolved" */
  onMarkResolved?: () => void
  /** Called when the user clicks the open-in-new icon */
  onOpenInNew?: () => void
  theme?: LogItemTheme
}

// ─── Token helpers ─────────────────────────────────────────────────────────────

type Mode = 'light' | 'dark'

function accentColor(type: LogType, mode: Mode): string {
  switch (type) {
    case 'warning': return semantic.foreground.warning.default[mode]
    case 'error':   return semantic.foreground.negative.default[mode]
    case 'update':  return semantic.foreground.positive.default[mode]
  }
}

const ICON_MAP: Record<LogType, React.ComponentType<{ size?: 16 | 20 | 24 | 32; 'aria-hidden'?: boolean }>> = {
  warning: WarningOutline,
  error:   CancelOutline,
  update:  NotificationsOutline,
}

// ─── LogItem ──────────────────────────────────────────────────────────────────

export function LogItem({
  type             = 'update',
  state            = 'default',
  title,
  timestamp,
  description,
  skuDetails,
  details,
  others,
  showActionButton = true,
  showOpenInNew    = true,
  onMarkResolved,
  onOpenInNew,
  theme            = 'light',
}: LogItemProps) {
  const [localState, setLocalState] = React.useState<LogState>(state)
  // Sync if the external state prop changes (e.g. parent marks resolved)
  React.useEffect(() => { setLocalState(state) }, [state])

  const handleMarkResolved = () => {
    setLocalState('resolved')
    onMarkResolved?.()
  }

  const mode      = theme === 'dark' ? 'dark' : 'light'
  const accent    = accentColor(type, mode)
  const Icon      = ICON_MAP[type]
  const fontFamily = typography.fontFamily.body

  // Text colours
  const primaryText   = semantic.foreground.neutral.default[mode]
  const secondaryText = semantic.foreground.default.secondary[mode]
  const disabledText  = semantic.foreground.default.disabled[mode]

  // Divider
  const dividerColor = semantic.border.default[mode]

  // Title — Default = bold + type accent colour; Read = semi + accent; Resolved = semi + secondary
  const titleColor  = localState === 'resolved' ? secondaryText : accent
  const titleWeight = localState === 'default' ? typography.fontWeight.bold : typography.fontWeight.semibold

  // Left indicator border — visible only on Default state
  const leftBorderColor = localState === 'default' ? accent : 'transparent'

  // Small text styles — description uses accent colour in default state; rest is always secondary
  const descriptionText: React.CSSProperties = {
    fontFamily,
    fontSize:   typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    lineHeight: '1.4285714em',
    color:      localState === 'default' ? accent : secondaryText,
  }
  const smallText: React.CSSProperties = {
    fontFamily,
    fontSize:   typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    lineHeight: '1.4285714em',
    color:      secondaryText,
  }

  return (
    <div
      style={{
        display:       'flex',
        flexDirection: 'column',
        gap:           spacing[200],
        borderLeft:    `2px solid ${leftBorderColor}`,
        padding:       `0 ${spacing[600]}`,   // 0 24 px — layout_G4TYTY
      }}
    >
      {/* ── Main row: icon + text content + open-in-new ──────────────────── */}
      <div
        style={{
          display:       'flex',
          flexDirection: 'row',
          alignItems:    'flex-start',
          gap:            spacing[400],   // 16 px — layout_AKZTWR
        }}
      >
        {/* Left icon — 24 × 24, coloured in accent */}
        <div style={{ color: accent, flexShrink: 0, paddingTop: '2px' }}>
          <Icon size={24} aria-hidden />
        </div>

        {/* Text content — column, gap 8 px — layout_4OL4TX */}
        <div
          style={{
            flex:          1,
            display:       'flex',
            flexDirection: 'column',
            gap:           spacing[200],
            minWidth:      0,
          }}
        >
          {/* Header: Title (left) + Timestamp (right) */}
          <div
            style={{
              display:        'flex',
              flexDirection:  'row',
              alignItems:     'flex-start',
              justifyContent: 'space-between',
              gap:             spacing[200],
            }}
          >
            <span
              style={{
                fontFamily,
                fontSize:     typography.fontSize.md,
                fontWeight:   titleWeight,
                lineHeight:   '1.5em',
                color:        titleColor,
                flex:         1,
                minWidth:     0,
              }}
            >
              {title}
            </span>
            <span
              style={{
                fontFamily,
                fontSize:   typography.fontSize.md,
                fontWeight: typography.fontWeight.regular,
                lineHeight: '1.5em',
                color:      secondaryText,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {timestamp}
            </span>
          </div>

          {/* Description */}
          {description && (
            <span style={descriptionText}>{description}</span>
          )}

          {/* SKU details */}
          {skuDetails && (
            <span style={smallText}>{skuDetails}</span>
          )}

          {/* Details: Section • Market • Date */}
          {details && (details.section || details.market || details.date) && (
            <div
              style={{
                display:       'flex',
                flexDirection: 'row',
                flexWrap:      'wrap',
                alignItems:    'center',
                gap:            spacing[200],   // 8 px — layout_26YART
              }}
            >
              {[details.section, details.market, details.date]
                .filter(Boolean)
                .map((item, idx, arr) => (
                  <React.Fragment key={idx}>
                    <span style={smallText}>{item}</span>
                    {idx < arr.length - 1 && (
                      <span style={smallText} aria-hidden>•</span>
                    )}
                  </React.Fragment>
                ))}
            </div>
          )}

          {/* Others */}
          {others && (
            <span style={smallText}>{others}</span>
          )}

          {/* Action row — centred, full width */}
          {showActionButton && (
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              {localState === 'resolved' ? (
                <Button
                  variant="text"
                  color="neutral"
                  size="sm"
                  theme={theme}
                  disabled
                  showLeadingIcon
                  leadingIcon={<CheckOutline size={16} aria-hidden />}
                >
                  Resolved
                </Button>
              ) : (
                <Button
                  variant="text"
                  color="neutral"
                  size="sm"
                  theme={theme}
                  onClick={handleMarkResolved}
                  style={{ textDecoration: 'underline' }}
                >
                  Mark as resolved
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Right: open-in-new icon button */}
        {showOpenInNew && (
          <Button
            variant="text"
            color="neutral"
            size="sm"
            theme={theme}
            aria-label="Open in new tab"
            onClick={onOpenInNew}
            style={{ flexShrink: 0, padding: '4px' }}
          >
            <OpenInNewOutline size={16} aria-hidden />
          </Button>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          height:          '1px',
          backgroundColor: dividerColor,
          alignSelf:       'stretch',
        }}
      />
    </div>
  )
}

LogItem.displayName = 'LogItem'

export default LogItem
