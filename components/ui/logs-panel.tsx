'use client'

import React from 'react'
import { semantic, spacing, typography } from '@/lib/tokens'
import { Button } from './button'
import { SideSheet } from './side-sheet'
import { LogItem } from './log-item'
import type { LogItemProps } from './log-item'
import { UnfoldMoreOutline } from './icons/material-unfold-more-outline'

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS — Logs-side-modal (node 38780:30885)
//
// A side sheet panel presenting a chronological list of log entries.
// Uses SideSheet (node 5394-101750) as the outer container.
//
// Header (provided by SideSheet):
//   Title       "Logs"  — Headline/H6 (Agrandir Digital 20 px/500)
//   Subtitle    optional description text + unread count ("5 new · <desc>")
//   Close button
//
// Children rendered in the SideSheet content area:
//   Sort bar    "Sort by latest first / oldest first" — text button + unfold_more icon
//   Log list    scrollable column, gap 24 px, padding-top 24 px
//
// Token mapping:
//   Sort button label   → semantic.foreground.neutral.default
//   Log list gap        → spacing[600] = 24 px  (layout_96D8TV)
//   Sort bar padding    → spacing[200] = 8 px   (layout_IB518S)

export type SortOrder      = 'newest' | 'oldest'
export type LogsPanelTheme = 'light' | 'dark'

/** A single log entry — extends LogItemProps with a required unique id */
export interface LogEntry extends Omit<LogItemProps, 'theme' | 'onMarkResolved' | 'onOpenInNew'> {
  /** Unique identifier used as the React key and callback argument */
  id: string
}

export interface LogsPanelProps {
  /** Log entries to display — rendered in the order provided */
  logs?: LogEntry[]
  /** Number of unread entries — shown as "N new" in the header subtitle */
  unreadCount?: number
  /** Optional description text shown in the header subtitle */
  description?: string
  /** Whether the panel is visible — default true */
  open?: boolean
  /** Called when the close button is pressed */
  onClose?: () => void
  /**
   * Current sort direction — controls the button label only.
   * The consumer is responsible for passing logs in the desired order.
   * Default 'newest'.
   */
  sortOrder?: SortOrder
  /** Called when the user clicks the sort button — toggle the sort order upstream */
  onSortToggle?: () => void
  /** Called when the user clicks "Mark as resolved" — receives the log entry id */
  onMarkResolved?: (id: string) => void
  /** Called when the user clicks the open-in-new-tab icon — receives the log entry id */
  onOpenInNew?: (id: string) => void
  theme?: LogsPanelTheme
  className?: string
  style?: React.CSSProperties
}

// ─── LogsPanel ────────────────────────────────────────────────────────────────

export function LogsPanel({
  logs          = [],
  unreadCount,
  description,
  open          = true,
  onClose,
  sortOrder     = 'newest',
  onSortToggle,
  onMarkResolved,
  onOpenInNew,
  theme         = 'light',
  className,
  style,
}: LogsPanelProps) {
  const mode       = theme === 'dark' ? 'dark' : 'light'
  const fontFamily = typography.fontFamily.body

  // Build the SideSheet subtitle as structured ReactNode:
  //   "N new"  — semantic.foreground.positive.default (accent green)
  //   description — semantic.foreground.default.secondary (grey)
  const hasUnread = unreadCount !== undefined && unreadCount > 0
  const subtitle: React.ReactNode | undefined = (hasUnread || description) ? (
    <>
      {hasUnread && (
        <span style={{ display: 'block', color: semantic.foreground.positive.default[mode] }}>
          {unreadCount} new
        </span>
      )}
      {description && (
        <span style={{ display: 'block', color: semantic.foreground.default.secondary[mode] }}>
          {description}
        </span>
      )}
    </>
  ) : undefined

  return (
    <SideSheet
      open={open}
      title="Logs"
      subtitle={subtitle}
      showActions={false}
      showCloseButton
      onClose={onClose}
      theme={theme}
      className={className}
      style={style}
      showHeaderDivider={false}
      contentStyle={{ padding: 0 }}
    >
      {/* ── Sort bar (layout_NFOTY7: padding 0 8px + 24px top gap from header) */}
      <div
        style={{
          padding:    `${spacing[600]} ${spacing[200]} 0`,   // 24px top, 8px sides — layout_NFOTY7 + RJC3H8 gap
          flexShrink: 0,
        }}
      >
        <Button
          variant="text"
          color="neutral"
          size="sm"
          theme={theme}
          onClick={onSortToggle}
          showLeadingIcon
          leadingIcon={<UnfoldMoreOutline size={16} aria-hidden />}
          style={{ textDecoration: 'underline' }}
        >
          {sortOrder === 'newest' ? 'Sort by latest first' : 'Sort by oldest first'}
        </Button>
      </div>

      {/* ── Log list (layout_Y7AGEH: column, gap 24px, padding 24px 0) ──── */}
      {/* SideSheet content area already provides overflow-y scrolling      */}
      <div
        style={{
          display:       'flex',
          flexDirection: 'column',
          gap:           spacing[600],          // 24 px — layout_Y7AGEH
          padding:       `${spacing[600]} 0`,   // 24 px top/bottom
        }}
      >
        {logs.length === 0 ? (
          <p
            style={{
              fontFamily,
              fontSize:   typography.fontSize.md,
              fontWeight: typography.fontWeight.regular,
              lineHeight: '1.4285714em',
              color:      semantic.foreground.default.secondary[mode],
              textAlign:  'center',
              padding:    `${spacing[800]} ${spacing[600]}`,
              margin:     0,
            }}
          >
            No log entries
          </p>
        ) : (
          logs.map(({ id, ...itemProps }) => (
            <LogItem
              key={id}
              {...itemProps}
              theme={theme}
              onMarkResolved={() => onMarkResolved?.(id)}
              onOpenInNew={() => onOpenInNew?.(id)}
            />
          ))
        )}
      </div>
    </SideSheet>
  )
}

LogsPanel.displayName = 'LogsPanel'

export default LogsPanel
