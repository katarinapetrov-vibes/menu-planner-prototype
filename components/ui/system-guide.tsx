'use client'

import React from 'react'
import { cn } from './utils'
import { typography } from '@/lib/tokens'

/**
 * Enterprise DS — System Guide
 *
 * Presents system-level guidance: design principles, tokens, patterns,
 * and usage standards for the design system. Shown on the design system
 * stage when "System Guides" is selected in the sidebar.
 */

export type SystemGuideTheme = 'light' | 'dark'

export interface SystemGuideSection {
  /** Section heading */
  title: string
  /** Section body content */
  content: React.ReactNode
}

export interface SystemGuideProps {
  /** Optional sections to render (defaults to placeholder content) */
  sections?: SystemGuideSection[]
  /** Canvas theme */
  theme?: SystemGuideTheme
  className?: string
}

const defaultSections: SystemGuideSection[] = [
  {
    title: 'Design principles',
    content: (
      <p className="text-slate-600 leading-relaxed" style={{ fontSize: typography.fontSize.md }}>
        Use the design system to keep interfaces consistent, accessible, and aligned with
        enterprise supply chain workflows. Prefer components from <code className="px-1 py-0.5 rounded bg-slate-200 text-emerald-600">components/ui</code> before
        building custom UI.
      </p>
    ),
  },
  {
    title: 'Tokens & theming',
    content: (
      <p className="text-slate-600 leading-relaxed" style={{ fontSize: typography.fontSize.md }}>
        Backgrounds use <code className="px-1 py-0.5 rounded bg-slate-200">bg-slate-950</code> / <code className="px-1 py-0.5 rounded bg-slate-200">bg-slate-900</code> for dark mode.
        Primary accents: <span className="text-emerald-500">emerald</span>, <span className="text-purple-500">purple</span>, <span className="text-blue-500">blue</span>.
        Status: amber (warnings), red (errors). See <code className="px-1 py-0.5 rounded bg-slate-200">lib/tokens.ts</code> and design-system specs.
      </p>
    ),
  },
  {
    title: 'System guides',
    content: (
      <p className="text-slate-600 leading-relaxed" style={{ fontSize: typography.fontSize.md }}>
        System guides document patterns, page layouts, and cross-component behaviour.
        They complement individual component specs and help the team apply the system correctly.
      </p>
    ),
  },
]

export function SystemGuide({ sections = defaultSections, theme = 'dark', className }: SystemGuideProps) {
  const isDark = theme === 'dark'
  const rootCls = cn(
    'rounded-xl border transition-colors',
    isDark
      ? 'bg-slate-900/60 border-white/10 text-slate-200'
      : 'bg-white border-slate-200 text-slate-800'
  )
  const headingCls = isDark ? 'text-slate-100' : 'text-slate-900'
  const borderCls = isDark ? 'border-white/10' : 'border-slate-200'

  return (
    <div className={cn(rootCls, className)}>
      <div className="px-6 py-5 border-b border-slate-200">
        <h2 className={cn('font-semibold', headingCls)} style={{ fontSize: typography.fontSize.lg, fontFamily: typography.fontFamily.headline }}>System Guide</h2>
        <p className={cn('mt-1', isDark ? 'text-slate-400' : 'text-slate-500')} style={{ fontSize: typography.fontSize.sm }}>
          Design system principles, tokens, and usage guidance.
        </p>
      </div>
      <div className="px-6 py-5 space-y-6">
        {sections.map((section, i) => (
          <section key={i} className={cn('pb-6', i < sections.length - 1 && `border-b ${borderCls}`)}>
            <h3 className={cn('font-semibold mb-2', headingCls)} style={{ fontSize: typography.fontSize.md }}>{section.title}</h3>
            <div className={isDark ? 'text-slate-300' : 'text-slate-600'}>{section.content}</div>
          </section>
        ))}
      </div>
    </div>
  )
}
