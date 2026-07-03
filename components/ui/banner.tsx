'use client'

import React from 'react'
import { components, typography } from '@/lib/tokens'
import { Button } from './button'

/**
 * Enterprise DS v3 — Banner
 * Figma node 45836-5436
 *
 * A persistent inline notification strip that communicates important states
 * (success, warning, error, info, AI) without interrupting workflow.
 * Lighter-weight than Alert — single description line, no title or date row.
 *
 * Layout (Figma tokens):
 *   display:       flex
 *   width:         800px; max-width: 1440px
 *   padding:       var(--banners-paddingY, 8px) var(--banners-paddingX, 16px)
 *   align-items:   center
 *   gap:           var(--banners-gapX, 16px)
 *   border-radius: var(--radius-xs, 4px)
 *
 * Figma variables:
 *   bannerColour — Success | Warning | Error | Info | AI
 *   Show Actions — True | False
 *   On Close     — True | False  (pass onClose handler)
 */

export type BannerColour = 'success' | 'warning' | 'error' | 'info' | 'ai'
export type BannerTheme  = 'light' | 'dark'

export interface BannerAction {
  label: string
  onClick: () => void
  icon?: React.ReactNode
}

export interface BannerProps {
  /** Semantic type — drives colour palette (Figma: bannerColour) */
  bannerColour?: BannerColour
  /** Body text shown next to the icon */
  description?: React.ReactNode
  /** Show the action button (Figma: Show Actions True/False) */
  showActions?: boolean
  /** Action button config — defaults to a labelled placeholder when showActions is true */
  action?: BannerAction
  /** Pass a handler to render the × close button (Figma: On Close True/False) */
  onClose?: () => void
  /** Canvas theme — light or dark background */
  theme?: BannerTheme
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

const typeIcons: Record<BannerColour, React.ComponentType> = {
  success: SuccessIcon,
  warning: WarningIcon,
  error:   ErrorIcon,
  info:    InfoIcon,
  ai:      AIIcon,
}

// ─── Close icon ───────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

const defaultAction: BannerAction = { label: 'Label', onClick: () => {} }

export function Banner({
  bannerColour = 'success',
  description = 'Lorem ipsum dolor sit amet consectetur. Adipiscing ultricies tellus justo mollis feugiat.',
  showActions = false,
  action,
  onClose,
  theme = 'light',
  className,
}: BannerProps) {
  const colours = components.banner.colour[bannerColour][theme]
  const Icon = typeIcons[bannerColour]
  const resolvedAction = action ?? defaultAction

  return (
    <div
      role="status"
      aria-live="polite"
      className={className}
      style={{
        display:         'flex',
        width:           '100%',
        maxWidth:        '1440px',
        alignItems:      'center',
        gap:             '16px',
        padding:         '8px 16px',
        borderRadius:    '4px',
        backgroundColor: colours.bg,
      }}
    >
      {/* Leading status icon */}
      <span style={{ flexShrink: 0, display: 'flex', width: '20px', height: '20px', color: colours.icon }}>
        <Icon />
      </span>

      {/* Description — grows to fill available space */}
      <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: typography.fontSize.md, lineHeight: '1.4285714em', color: colours.body }}>
        {description}
      </p>

      {/* Optional action button (Figma: Show Actions True) */}
      {showActions && (
        <Button
          variant="fill"
          color="neutral"
          size="sm"
          theme={theme}
          showLeadingIcon={!!resolvedAction.icon}
          leadingIcon={resolvedAction.icon as React.ReactNode}
          onClick={resolvedAction.onClick}
        >
          {resolvedAction.label}
        </Button>
      )}

      {/* Optional close button (Figma: On Close True) */}
      {onClose && (
        <Button
          variant="text"
          color="neutral"
          size="sm"
          theme={theme}
          iconOnly
          showLeadingIcon
          leadingIcon={<CloseIcon />}
          aria-label="Dismiss banner"
          onClick={onClose}
        />
      )}
    </div>
  )
}
