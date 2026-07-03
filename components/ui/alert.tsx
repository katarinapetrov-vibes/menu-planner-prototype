'use client'

import React, { useState } from 'react'
import { components, typography } from '@/lib/tokens'
import { Button } from '@/components/ui/button'

/**
 * Enterprise DS v3 — Alert Message
 * Figma node 45544-13147
 *
 * Inline, persistent contextual message with:
 *   - 5 semantic types: success | warning | error | info | ai
 *   - Optional title, date/timestamp, description, action buttons, close button
 *   - Light and dark canvas variants
 *
 * Layout:
 *   [Icon]  [Title]                        [×]
 *           [Date / Timestamp]
 *           [Description body text]
 *                               [Action 1] [Action 2]
 *
 * Tokens (Figma):
 *   border-radius: var(--radius-xs, 4px)
 *   padding:       var(--alert-paddingY, 12px) var(--alert-paddingX, 12px)
 *   gap:           var(--alert-gapX, 12px)
 *   border:        1px solid
 */

export type AlertType  = 'success' | 'warning' | 'error' | 'info' | 'ai'
export type AlertTheme = 'light' | 'dark'

export interface AlertAction {
  label: string
  onClick: () => void
  icon?: React.ReactNode
}

export interface AlertProps {
  /** Semantic type — controls colour palette */
  alertColour?: AlertType
  /** Show / hide the bold title row */
  showTitle?: boolean
  /** Title text */
  title?: React.ReactNode
  /** Show / hide the date / timestamp row */
  showDate?: boolean
  /** Date / timestamp string */
  date?: string
  /** Show / hide the description body */
  showDescription?: boolean
  /** Description body text */
  description?: React.ReactNode
  /** Show / hide action buttons */
  showActions?: boolean
  /** Array of action buttons (max 2 recommended) */
  actions?: AlertAction[]
  /** Pass a handler to show the × close button */
  onClose?: () => void
  /** Canvas theme — light (light page bg) or dark (dark page bg) */
  theme?: AlertTheme
  className?: string
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SuccessIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  )
}

function AIIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
    </svg>
  )
}

function PlaceholderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  )
}

const typeIcons: Record<AlertType, React.ComponentType> = {
  success: SuccessIcon,
  warning: WarningIcon,
  error:   ErrorIcon,
  info:    InfoIcon,
  ai:      AIIcon,
}

// ─── Sub-components with hover state ──────────────────────────────────────────

// Unified color interface that accepts any string values
interface AlertColourSet {
  bg: string
  border: string
  icon: string
  title: string
  date: string
  body: string
  action: string
  actionHoverBg: string
  close: string
  closeHoverText: string
  closeHoverBg: string
}

function AlertCloseButton({ colours, onClose }: { colours: AlertColourSet; onClose: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close alert"
      style={{
        flexShrink:      0,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '2px',
        borderRadius:    '4px',
        border:          'none',
        cursor:          'pointer',
        color:           hovered ? colours.closeHoverText : colours.close,
        backgroundColor: hovered ? colours.closeHoverBg   : 'transparent',
        transition:      'color 150ms, background-color 150ms',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      </svg>
    </button>
  )
}

const alertTypeToButtonColor: Record<AlertType, 'positive' | 'negative' | 'neutral' | 'ai'> = {
  success: 'positive',
  error:   'negative',
  warning: 'neutral',
  info:    'neutral',
  ai:      'ai',
}

function AlertActionButton({ alertColour, theme, action }: { alertColour: AlertType; theme: AlertTheme; action: AlertAction }) {
  return (
    <Button
      variant="outline"
      color={alertTypeToButtonColor[alertColour]}
      theme={theme}
      size="sm"
      onClick={action.onClick}
      showLeadingIcon={!!action.icon}
      leadingIcon={action.icon}
    >
      {action.label}
    </Button>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Alert({
  alertColour = 'success',
  showTitle = true,
  title = 'Title of Message',
  showDate = false,
  date = 'MM-DD-YYYY, TT:MM',
  showDescription = true,
  description = 'Lorem ipsum dolor sit amet consectetur. Adipiscing ultricies tellus justo mollis feugiat. Enim duis sapien euismod vitae viverra auctor elementum. Sed tellus nisl tellus in.',
  showActions = false,
  actions,
  onClose,
  theme = 'light',
  className,
}: AlertProps) {
  const colours = components.alert.colour[alertColour][theme]
  const Icon = typeIcons[alertColour]

  const defaultActions: AlertAction[] = actions ?? [
    { label: 'Label', onClick: () => {}, icon: <PlaceholderIcon /> },
    { label: 'Label', onClick: () => {}, icon: <PlaceholderIcon /> },
  ]

  return (
    <div
      role="alert"
      className={className}
      style={{
        display:         'flex',
        width:           '100%',
        maxWidth:        '664px',
        alignItems:      'flex-start',
        gap:             '12px',
        padding:         '12px',
        borderRadius:    '4px',
        border:          `1px solid ${colours.border}`,
        backgroundColor: colours.bg,
      }}
    >
      {/* Leading type icon */}
      <span
        style={{
          display:    'flex',
          flexShrink: 0,
          marginTop:  '2px',
          color:      colours.icon,
          width:      '20px',
          height:     '20px',
        }}
      >
        <Icon />
      </span>

      {/* Content column */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Has title or date: stacked layout */}
        {((showTitle && title) || (showDate && date)) ? (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {showTitle && title && (
                  <p style={{ margin: 0, fontSize: typography.fontSize.md, fontWeight: 600, lineHeight: '1.333em', color: colours.title }}>
                    {title}
                  </p>
                )}
                {showDate && date && (
                  <p style={{ margin: 0, fontSize: typography.fontSize.sm, lineHeight: '1.333em', marginTop: '2px', color: colours.date }}>
                    {date}
                  </p>
                )}
                {showDescription && description && (
                  <p style={{ margin: 0, fontSize: typography.fontSize.md, lineHeight: '1.4em', color: colours.body, marginTop: ((showTitle && title) || (showDate && date)) ? '8px' : 0 }}>
                    {description}
                  </p>
                )}
              </div>
              {onClose && <AlertCloseButton colours={colours} onClose={onClose} />}
            </div>
          </>
        ) : (
          /* No title, no date: description on same row as close button */
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            {showDescription && description && (
              <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: typography.fontSize.md, lineHeight: '1.4em', color: colours.body }}>
                {description}
              </p>
            )}
            {onClose && <AlertCloseButton colours={colours} onClose={onClose} />}
          </div>
        )}

        {/* Actions row */}
        {showActions && defaultActions.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
            {defaultActions.map((action, i) => (
              <AlertActionButton key={i} alertColour={alertColour} theme={theme} action={action} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
