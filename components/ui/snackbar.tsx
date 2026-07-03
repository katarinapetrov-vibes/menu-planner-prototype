'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { typography } from '@/lib/tokens'
// Colour values in the tokens object below reference primitives/semantic entries from @/lib/tokens

/**
 * Enterprise DS v3 — Figma node 45558-14166
 *
 * Dark theme  (dark canvas)  → light pastel surface, dark text
 *   success: green-200   warning: orange-200   info: sky-200   error: red-200   ai: purple-200
 *
 * Light theme (light canvas) → rich saturated surface, white text
 *   success: green-800   warning: orange-800   info: blue-800  error: red-800   ai: purple-800
 *
 * Layout: [icon]  [bold title ···················] [close]
 *                 [description body text          ]
 */
export type SnackbarTheme = 'light' | 'dark'
export type SnackbarType  = 'success' | 'warning' | 'error' | 'info' | 'ai'

export interface SnackbarAction {
  label: string
  onClick: () => void
}

export interface SnackbarProps {
  /** Bold title label */
  message: React.ReactNode
  /** Optional body text rendered below the title */
  description?: React.ReactNode
  /** Type: Success | Warning | Error | Info | AI (Figma variable) */
  type?: SnackbarType
  /** Show close button (Figma: Close Button True/False) */
  showCloseButton?: boolean
  /** Optional action button (Figma: Action True/False) */
  action?: SnackbarAction
  /** Show the leading status icon. Default: true */
  showIcon?: boolean
  /** Called when snackbar is dismissed */
  onDismiss?: () => void
  /** Pass the container theme — dark container → theme="dark", light container → theme="light" */
  theme?: SnackbarTheme
  /** Whether the snackbar is visible (controlled) */
  open: boolean
  /** Called when snackbar should close */
  onClose?: () => void
  /** Auto-hide after this many ms (0 = no auto-hide) */
  autoHideDuration?: number
  className?: string
}

// ─── Icons — Google Material Icons (filled, 24 × 24 viewBox) ─────────────────

function SuccessIcon({ className }: { className?: string }) {
  // check_circle (filled)
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  )
}

function WarningIcon({ className }: { className?: string }) {
  // warning (filled)
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  )
}

function ErrorIcon({ className }: { className?: string }) {
  // cancel (filled — circle with ×)
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
    </svg>
  )
}

function InfoIcon({ className }: { className?: string }) {
  // info (filled)
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  )
}

function AIIcon({ className }: { className?: string }) {
  // auto_awesome (filled)
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
    </svg>
  )
}

const typeIcons: Record<SnackbarType, React.ComponentType<{ className?: string }>> = {
  success: SuccessIcon,
  warning: WarningIcon,
  error:   ErrorIcon,
  info:    InfoIcon,
  ai:      AIIcon,
}

// ─── DS v3 Color Tokens ───────────────────────────────────────────────────────

type TokenSet = {
  container: string  // bg + border + shadow
  title:     string  // bold label text
  body:      string  // description text
  icon:      string
  action:    string
  close:     string
}

// Dark-canvas tokens use DS primitive colours for text on pastel backgrounds:
//   title  → grey[800]  #242424  (semantic.foreground.default.primary.light)
//   body   → grey[700]  #4B4B4B  (semantic.foreground.neutral.defaultDeep.light)
//   close  → grey[600]  #676767  (primitives.grey[600])
//   icon   → deep variant of the type's semantic foreground (e.g. green[700] = #056835)
//   action → deepest variant of the type's semantic foreground
const tokens: Record<SnackbarType, Record<SnackbarTheme, TokenSet>> = {
  success: {
    // Dark canvas → light green pastel (green[300] = #D2F895)
    dark: {
      container: 'bg-[#D2F895] shadow-xl shadow-black/25',
      title:     'text-[#242424]',
      body:      'text-[#4B4B4B]',
      icon:      'text-[#056835]',
      action:    'text-[#035624] font-semibold hover:text-[#035624] hover:bg-black/10',
      close:     'text-[#676767] hover:text-[#242424] hover:bg-black/10',
    },
    // Light canvas → deep forest green (green[700] = #056835)
    light: {
      container: 'bg-[#056835] shadow-lg shadow-black/20',
      title:     'text-white',
      body:      'text-white/85',
      icon:      'text-white',
      action:    'text-white font-semibold hover:bg-white/15',
      close:     'text-white/75 hover:text-white hover:bg-white/15',
    },
  },
  warning: {
    // Dark canvas → light amber pastel (orange[300] = #FFBF74)
    dark: {
      container: 'bg-[#FFBF74] shadow-xl shadow-black/25',
      title:     'text-[#242424]',
      body:      'text-[#4B4B4B]',
      icon:      'text-[#A43700]',
      action:    'text-[#7B2900] font-semibold hover:text-[#7B2900] hover:bg-black/10',
      close:     'text-[#676767] hover:text-[#242424] hover:bg-black/10',
    },
    // Light canvas → deep burnt orange (orange[700] = #A43700)
    light: {
      container: 'bg-[#A43700] shadow-lg shadow-black/20',
      title:     'text-white',
      body:      'text-white/85',
      icon:      'text-white',
      action:    'text-white font-semibold hover:bg-white/15',
      close:     'text-white/75 hover:text-white hover:bg-white/15',
    },
  },
  error: {
    // Dark canvas → light coral pastel (red[300] = #FCAD9A)
    dark: {
      container: 'bg-[#FCAD9A] shadow-xl shadow-black/25',
      title:     'text-[#242424]',
      body:      'text-[#4B4B4B]',
      icon:      'text-[#970000]',
      action:    'text-[#7C0000] font-semibold hover:text-[#7C0000] hover:bg-black/10',
      close:     'text-[#676767] hover:text-[#242424] hover:bg-black/10',
    },
    // Light canvas → deep crimson (red[700] = #970000)
    light: {
      container: 'bg-[#970000] shadow-lg shadow-black/20',
      title:     'text-white',
      body:      'text-white/85',
      icon:      'text-white',
      action:    'text-white font-semibold hover:bg-white/15',
      close:     'text-white/75 hover:text-white hover:bg-white/15',
    },
  },
  info: {
    // Dark canvas → light sky blue pastel (blue[300] = #92EAFF)
    dark: {
      container: 'bg-[#92EAFF] shadow-xl shadow-black/25',
      title:     'text-[#242424]',
      body:      'text-[#4B4B4B]',
      icon:      'text-[#001DB2]',
      action:    'text-[#00178C] font-semibold hover:text-[#00178C] hover:bg-black/10',
      close:     'text-[#676767] hover:text-[#242424] hover:bg-black/10',
    },
    // Light canvas → deep navy blue (blue[700] = #001DB2)
    light: {
      container: 'bg-[#001DB2] shadow-lg shadow-black/20',
      title:     'text-white',
      body:      'text-white/85',
      icon:      'text-white',
      action:    'text-white font-semibold hover:bg-white/15',
      close:     'text-white/75 hover:text-white hover:bg-white/15',
    },
  },
  ai: {
    // Dark canvas → light purple pastel (purple[300] = #B7ABFF)
    dark: {
      container: 'bg-[#B7ABFF] shadow-xl shadow-black/25',
      title:     'text-[#242424]',
      body:      'text-[#4B4B4B]',
      icon:      'text-[#5236B8]',
      action:    'text-[#2B1E66] font-semibold hover:text-[#2B1E66] hover:bg-black/10',
      close:     'text-[#676767] hover:text-[#242424] hover:bg-black/10',
    },
    // Light canvas → deep violet (purple[700] = #5236B8)
    light: {
      container: 'bg-[#5236B8] shadow-lg shadow-black/20',
      title:     'text-white',
      body:      'text-white/85',
      icon:      'text-white',
      action:    'text-white font-semibold hover:bg-white/15',
      close:     'text-white/75 hover:text-white hover:bg-white/15',
    },
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Snackbar({
  message,
  description,
  type = 'info',
  showCloseButton = false,
  action,
  showIcon = true,
  onDismiss,
  theme = 'dark',
  open,
  onClose,
  autoHideDuration = 0,
  className,
}: SnackbarProps) {
  const [visible, setVisible] = useState(open)
  const [exiting, setExiting] = useState(false)

  const handleClose = useCallback(() => {
    onDismiss?.()
    onClose?.()
  }, [onDismiss, onClose])

  useEffect(() => {
    if (open) {
      setVisible(true)
      setExiting(false)
    } else {
      setExiting(true)
      const t = setTimeout(() => {
        setVisible(false)
        setExiting(false)
      }, 200)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (!open || autoHideDuration <= 0) return
    const t = setTimeout(handleClose, autoHideDuration)
    return () => clearTimeout(t)
  }, [open, autoHideDuration, handleClose])

  if (!visible) return null

  const Icon = typeIcons[type]
  const t = tokens[type][theme]

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={clsx(
        // Layout — full-width block card
        'flex items-start gap-3 w-full rounded-sm p-4',
        // Transition
        'transition-all duration-base ease-out',
        exiting ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0',
        // Type + theme tokens
        t.container,
        className
      )}
    >
      {/* Leading status icon */}
      {showIcon && <Icon className={clsx('shrink-0 w-5 h-5 mt-0.5', t.icon)} />}

      {/* Content column */}
      <div className="flex-1 min-w-0">

        {/*
          Single flex row: text on the left, action + close on the right.
          When title is present → items-start so multi-line text aligns to top.
          When title is absent  → items-center so description sits on the same
          baseline as the close button.
        */}
        <div className={clsx('flex gap-3', message ? 'items-start' : 'items-center')}>

          {/* Left: title and/or description */}
          <div className="flex-1 min-w-0">
            {message && (
              <span className={clsx('block font-bold leading-snug', t.title)} style={{ fontSize: typography.fontSize.md }}>
                {message}
              </span>
            )}
            {description && (
              <p className={clsx('leading-relaxed', message && 'mt-1', t.body)} style={{ fontSize: typography.fontSize.sm }}>
                {description}
              </p>
            )}
          </div>

          {/* Right: action button + close — always right-aligned */}
          <div className={clsx('flex items-center gap-1 shrink-0', message && '-mt-0.5')}>
            {action && (
              <button
                type="button"
                onClick={() => { action.onClick(); handleClose() }}
                className={clsx('rounded-lg px-2 py-0.5 transition-colors', t.action)} style={{ fontSize: typography.fontSize.sm }}
              >
                {action.label}
              </button>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={handleClose}
                aria-label="Dismiss"
                className={clsx('rounded-lg p-1 transition-colors', t.close)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
