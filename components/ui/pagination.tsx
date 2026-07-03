'use client'

/**
 * Enterprise DS v3 — Pagination
 * Figma node 5264-100345
 *
 * Table-style pagination — no numbered page buttons.
 * Layout: [Rows per page label + select?] [range text?] [|◄] [‹] [›] [►|]
 *
 * Token mapping
 *   Nav icon (enabled)   colour/foreground/neutral/default        light: #242424  dark: #E4E4E4
 *   Nav icon (disabled)  colour/foreground/default/disabled       light: #BBBBBB  dark: #676767
 *   Label text           colour/foreground/default/secondary      light: #676767  dark: #BBBBBB
 *   Select border        colour/border/default                    light: #E0E0E0  dark: #3D3D3D
 *   Select text          colour/foreground/neutral/default        light: #242424  dark: #E4E4E4
 *   Select bg            colour/background/page                   light: #FFFFFF  dark: #1E1E1E
 *   Focus ring           colour/border/focus                      light: #067A46  dark: #96DC14
 */

import React from 'react'
import { cn } from './utils'
import { semantic, radius, borderWidth, typography, spacing, opacity } from '@/lib/tokens'
import { Button } from './button'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaginationSize  = 'sm' | 'md' | 'lg'
export type PaginationTheme = 'light' | 'dark'

export interface PaginationProps {
  /** Current active page — 1-indexed */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Called when the user navigates to a new page */
  onPageChange: (page: number) => void
  /** Total number of items (used for range text "X–Y of Z") */
  totalItems?: number
  /** Current page-size selection */
  pageSize?: number
  /** Options shown in the rows-per-page selector */
  pageSizeOptions?: number[]
  /** Called when the user picks a new rows-per-page value */
  onPageSizeChange?: (size: number) => void
  /** Show the "Rows per page" selector */
  showRowsPerPage?: boolean
  /** Show the "X–Y of Z" range text */
  showRangeText?: boolean
  /** Size variant */
  size?: PaginationSize
  /** Surface theme */
  theme?: PaginationTheme
  /** Disable all controls */
  disabled?: boolean
  /** Additional class names */
  className?: string
  /** Accessible label for the nav landmark */
  'aria-label'?: string
}

// ─── Design Tokens ────────────────────────────────────────────────────────────

const tokens = {
  light: {
    iconEnabled:  semantic.foreground.neutral.default.light,         // #242424
    iconDisabled: semantic.foreground.default.disabled.light,        // #BBBBBB
    labelText:    semantic.foreground.default.secondary.light,       // #4B4B4B
    rangeText:    semantic.foreground.neutral.default.light,         // #242424
    selectBorder: semantic.border.default.light,                     // #E4E4E4
    selectText:   semantic.foreground.neutral.default.light,         // #242424
    selectBg:     semantic.background.page.light,                    // #FFFFFF
    focusOutline: semantic.border.focus.light,                       // #067A46
  },
  dark: {
    iconEnabled:  semantic.foreground.neutral.default.dark,          // #E4E4E4
    iconDisabled: semantic.foreground.default.disabled.dark,         // #676767
    labelText:    semantic.foreground.default.secondary.dark,        // #EEEEEE
    rangeText:    semantic.foreground.neutral.default.dark,          // #E4E4E4
    selectBorder: semantic.border.default.dark,                      // #4B4B4B
    selectText:   semantic.foreground.neutral.default.dark,          // #E4E4E4
    selectBg:     semantic.background.container.dark,               // #242424
    focusOutline: semantic.border.focus.dark,                        // #96DC14
  },
} as const

// ─── Size Tokens ──────────────────────────────────────────────────────────────

const sizeTokens: Record<
  PaginationSize,
  { fontSize: string; iconSize: number; gap: string; selectPadding: string }
> = {
  // selectPadding: top right bottom left — right clears the chevron overlay
  sm: { fontSize: typography.fontSize.sm, iconSize: 16, gap: spacing[100], selectPadding: `${spacing[50]}  ${spacing[600]} ${spacing[50]}  ${spacing[200]}` },
  md: { fontSize: typography.fontSize.md, iconSize: 20, gap: spacing[100], selectPadding: `${spacing[100]} ${spacing[800]} ${spacing[100]} ${spacing[200]}` },
  lg: { fontSize: typography.fontSize.md, iconSize: 22, gap: spacing[100], selectPadding: `${spacing[100]} ${spacing[800]} ${spacing[100]} ${spacing[300]}` },
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SkipFirstIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <line x1="5" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 5L11 12L19 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PrevIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function NextIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SkipLastIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 5L13 12L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronDownIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}


// ─── Pagination ───────────────────────────────────────────────────────────────

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
      totalItems,
      pageSize        = 25,
      pageSizeOptions = [10, 25, 50, 100],
      onPageSizeChange,
      showRowsPerPage = false,
      showRangeText   = false,
      size            = 'md',
      theme           = 'light',
      disabled        = false,
      className,
      'aria-label': ariaLabel = 'Pagination',
    },
    ref,
  ) => {
    const tk = tokens[theme]
    const sz = sizeTokens[size]

    const isFirst = currentPage <= 1
    const isLast  = currentPage >= totalPages

    const handlePage = (page: number) => {
      if (!disabled && page >= 1 && page <= totalPages) {
        onPageChange(page)
      }
    }

    // Compute range text: "1–25 of 100" or "1–25 of 8" (pages) fallback
    const rangeStart = (currentPage - 1) * pageSize + 1
    const rangeEnd   = totalItems
      ? Math.min(currentPage * pageSize, totalItems)
      : Math.min(currentPage * pageSize, totalPages * pageSize)
    const rangeTotal = totalItems ?? totalPages * pageSize
    const rangeLabel = `${rangeStart}–${rangeEnd} of ${rangeTotal}`

    const sharedTextStyle: React.CSSProperties = {
      fontSize:   sz.fontSize,
      fontFamily: typography.fontFamily.body,
      lineHeight: '1.5',
      whiteSpace: 'nowrap',
    }

    return (
      <nav
        ref={ref as React.Ref<HTMLElement>}
        aria-label={ariaLabel}
        className={cn('inline-flex items-center', className)}
        style={{ gap: sz.gap, opacity: disabled ? opacity.half : opacity.full }}
      >
        {/* Rows per page */}
        {showRowsPerPage && (
          <div className="inline-flex items-center" style={{ gap: spacing[200] }}>
            <span
              style={{
                ...sharedTextStyle,
                color: tk.labelText,
              }}
            >
              Rows per page
            </span>

            {/* Styled select */}
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <select
                value={pageSize}
                disabled={disabled}
                aria-label="Rows per page"
                onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  ...sharedTextStyle,
                  padding:          sz.selectPadding,
                  border:           `${borderWidth.thin} solid ${tk.selectBorder}`,
                  borderRadius:     radius.sm,
                  backgroundColor:  tk.selectBg,
                  color:            tk.selectText,
                  cursor:           disabled ? 'not-allowed' : 'pointer',
                  appearance:       'none',
                  WebkitAppearance: 'none',
                  MozAppearance:    'none',
                  outlineColor:     tk.focusOutline,
                  lineHeight:       '1.5',
                }}
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              {/* Custom chevron overlay */}
              <span
                style={{
                  position:       'absolute',
                  right:          8,
                  top:            '50%',
                  transform:      'translateY(-50%)',
                  pointerEvents:  'none',
                  color:          tk.iconEnabled,
                  display:        'flex',
                  alignItems:     'center',
                }}
              >
                <ChevronDownIcon size={sz.iconSize - 4} />
              </span>
            </div>
          </div>
        )}

        {/* Range text */}
        {showRangeText && (
          <span
            style={{
              ...sharedTextStyle,
              color:       tk.rangeText,
              paddingLeft: showRowsPerPage ? spacing[200] : undefined,
            }}
          >
            {rangeLabel}
          </span>
        )}

        {/* Spacer between text and nav arrows */}
        {(showRowsPerPage || showRangeText) && (
          <span style={{ display: 'inline-block', width: spacing[200] }} aria-hidden="true" />
        )}

        {/* Skip First */}
        <Button
          variant="text" color="neutral" size={size} theme={theme}
          iconOnly showLeadingIcon leadingIcon={<SkipFirstIcon size={sz.iconSize} />}
          aria-label="First page"
          disabled={disabled || isFirst}
          onClick={() => handlePage(1)}
        />

        {/* Previous */}
        <Button
          variant="text" color="neutral" size={size} theme={theme}
          iconOnly showLeadingIcon leadingIcon={<PrevIcon size={sz.iconSize} />}
          aria-label="Previous page"
          disabled={disabled || isFirst}
          onClick={() => handlePage(currentPage - 1)}
        />

        {/* Next */}
        <Button
          variant="text" color="neutral" size={size} theme={theme}
          iconOnly showLeadingIcon leadingIcon={<NextIcon size={sz.iconSize} />}
          aria-label="Next page"
          disabled={disabled || isLast}
          onClick={() => handlePage(currentPage + 1)}
        />

        {/* Skip Last */}
        <Button
          variant="text" color="neutral" size={size} theme={theme}
          iconOnly showLeadingIcon leadingIcon={<SkipLastIcon size={sz.iconSize} />}
          aria-label="Last page"
          disabled={disabled || isLast}
          onClick={() => handlePage(totalPages)}
        />
      </nav>
    )
  },
)

Pagination.displayName = 'Pagination'

export { Pagination }
export default Pagination
