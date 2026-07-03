'use client'

import React from 'react'
import { clsx } from 'clsx'
import { typography } from '@/lib/tokens'

/**
 * Enterprise DS v3 — Footer
 * Figma node 5458-105962
 *
 * A persistent full-width strip anchored to the bottom of every page.
 * Holds copyright text (left), navigation links (centre), and a version
 * string (right).
 *
 * Layout (Figma tokens):
 *   padding:       var(--spacing-400, 16px) var(--spacing-600, 24px)
 *   display:       flex
 *   align-items:   center
 *   justify-content: space-between
 *   border-top:    1px solid colour/border/default
 *
 * Figma variables:
 *   theme      — Light | Dark
 *   background — none (transparent) | white
 *
 * Three content slots:
 *   copyright  — left-aligned text, e.g. "© 2021 - HelloFresh GmbH."
 *   links      — centre, array of { label, href?, onClick? }
 *   version    — right-aligned build string, e.g. "version scm-order-planning-fragment-1.0"
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type FooterTheme      = 'light' | 'dark'
export type FooterBackground = 'none' | 'white'

export interface FooterLink {
  /** Visible label for the link */
  label: string
  /** Navigate to URL — renders an <a> tag */
  href?: string
  /** Inline click handler — renders a <button> */
  onClick?: () => void
}

export interface FooterProps {
  /** Copyright line on the left (Figma: copyright slot) */
  copyright?: string
  /** Centred navigation links (Figma: links slot) */
  links?: FooterLink[]
  /** Build / version string on the right (Figma: version slot) */
  version?: string
  /** Canvas theme — drives text, border, and (when background="white") surface colour */
  theme?: FooterTheme
  /**
   * Background variant
   *   none  — transparent; inherits the page surface (Figma: "Footer without background")
   *   white — opaque surface colour    (Figma: "Footer with white background")
   */
  background?: FooterBackground
  className?: string
}

// ─── Per-theme style maps ───────────────────────────────────────────────────────
// All class strings are static so Tailwind JIT can extract them at build time.

type ThemeTokens = {
  root:      string                        // border-top — colour/border/default
  bg:        Record<FooterBackground, string>
  text:      string                        // colour/foreground/default/secondary
  link:      string                        // colour/foreground/positive/default
  linkHover: string                        // colour/foreground/positive/defaultDeep
}

const themeMap: Record<FooterTheme, ThemeTokens> = {
  light: {
    root:      'border-t border-[#E4E4E4]',      // colour/border/default — light
    bg: {
      none:  'bg-transparent',
      white: 'bg-[#FFFFFF]',                     // colour/background/page — light
    },
    text:      'text-[#4B4B4B]',                 // colour/foreground/default/secondary — light
    link:      'text-[#067A46]',                 // colour/foreground/positive/default — light
    linkHover: 'hover:text-[#056835]',           // colour/foreground/positive/defaultDeep — light
  },
  dark: {
    root:      'border-t border-[#4B4B4B]',      // colour/border/default — dark
    bg: {
      none:  'bg-transparent',
      white: 'bg-[#00178C]',                     // colour/background/page — dark
    },
    text:      'text-[#EEEEEE]',                 // colour/foreground/default/secondary — dark
    link:      'text-[#96DC14]',                 // colour/foreground/positive/default — dark
    linkHover: 'hover:text-[#D2F895]',           // colour/foreground/positive/defaultDeep — dark
  },
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function Footer({
  copyright = '© 2026 - HelloFresh.',
  links,
  version,
  theme = 'light',
  background = 'white',
  className,
}: FooterProps) {
  const tk = themeMap[theme]

  return (
    <footer
      role="contentinfo"
      className={clsx(
        // Figma layout — px: spacing-600 (24 px), py: spacing-400 (16 px)
        'w-full flex items-center justify-between gap-4',
        'px-6 py-4',
        // Border + background tokens
        tk.root,
        tk.bg[background],
        // Typography — body/sm/regular (12 px / Source Sans Pro)
        'font-normal leading-[1.667em]',
        tk.text,
        className
      )}
      style={{ fontSize: typography.fontSize.sm }}
    >
      {/* Left — copyright */}
      <span className="shrink-0 whitespace-nowrap">
        {copyright}
      </span>

      {/* Centre — navigation links */}
      {links && links.length > 0 && (
        <nav aria-label="Footer navigation" className="flex items-center gap-6 flex-wrap justify-center">
          {links.map((link, i) => {
            const baseCls = clsx(
              'underline underline-offset-2 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              'focus-visible:ring-[#067A46]/40 rounded-sm',
              tk.link,
              tk.linkHover
            )

            if (link.href) {
              return (
                <a
                  key={i}
                  href={link.href}
                  className={baseCls}
                >
                  {link.label}
                </a>
              )
            }

            return (
              <button
                key={i}
                type="button"
                onClick={link.onClick}
                className={clsx(baseCls, 'bg-transparent border-0 p-0 cursor-pointer')}
              >
                {link.label}
              </button>
            )
          })}
        </nav>
      )}

      {/* Right — version */}
      {version && (
        <span className="shrink-0 whitespace-nowrap">
          {version}
        </span>
      )}
    </footer>
  )
}
