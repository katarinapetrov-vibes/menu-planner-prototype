'use client'

/**
 * Enterprise DS v3 — Wizard
 * Figma nodes:
 *   Wizard in Modal:        5715-119944
 *   Wizard in Page:         5715-121540
 *   Wizard in Page v2:      5715-122027
 *
 * Anatomy
 *   Header       — wizard title + optional description + close button (modal)
 *   Stepper      — reuses the DS Stepper component (horizontal for modal/page, vertical for sidebar)
 *   Step content — per-step heading, subheading, and arbitrary JSX body
 *   Footer       — Cancel (text) · Back (outline) · Next/Finish (fill) navigation buttons
 *
 * Variants
 *   modal        — floats over a scrim overlay; max-width 720px; horizontal stepper below header
 *   page         — inline full-width layout; horizontal stepper beneath a page title band
 *   page-sidebar — inline split layout; vertical stepper in a tinted left sidebar
 *
 * Themes  — light · dark
 */

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { cn } from './utils'
import { typography } from '@/lib/tokens'
import { Stepper } from './stepper'
import type { StepItem } from './stepper'
import { Button } from './button'

// ─── Types ────────────────────────────────────────────────────────────────────

export type WizardVariant = 'modal' | 'page' | 'page-sidebar'
export type WizardTheme   = 'light' | 'dark'

export interface WizardStep {
  /** Short step name used in the stepper indicator (e.g. "Details") */
  title:        string
  /** Tiny supra-label above the title in the stepper (e.g. "Step 1"). Auto-generated when omitted. */
  stepLabel?:   string
  /** Description shown below the title in vertical stepper (page-sidebar only) */
  description?: string
  /** Large heading displayed at the top of the step's content area */
  heading?:     string
  /** Supporting subtext below the heading */
  subheading?:  string
  /** Form fields, choices, confirmations, or any custom JSX */
  content?:     React.ReactNode
}

export interface WizardProps {
  /** Ordered list of step definitions */
  steps:           WizardStep[]
  /** Controlled active step index (0-based). Omit for uncontrolled. */
  activeStep?:     number
  /** Initial step when uncontrolled. Default: 0 */
  defaultStep?:    number
  /** Called whenever the step changes */
  onStepChange?:   (step: number) => void
  /** Layout variant. Default: 'modal' */
  variant?:        WizardVariant
  /** Colour scheme. Default: 'light' */
  theme?:          WizardTheme
  /** Wizard title displayed in the header */
  title?:          string
  /** Subtitle below the main title */
  description?:    string
  /** (modal) Whether the wizard is mounted and visible */
  open?:           boolean
  /** (modal) Called when the wizard should close (Esc, backdrop, close button) */
  onClose?:        () => void
  /** Called when the user advances past the final step */
  onComplete?:     () => void
  /** Label for the Back button. Default: 'Back' */
  backLabel?:      string
  /** Label for the Next button. Default: 'Next' */
  nextLabel?:      string
  /** Label for the final step's forward button. Default: 'Finish' */
  completeLabel?:  string
  /** Label for the Cancel button. Default: 'Cancel' */
  cancelLabel?:    string
  /** Render the Cancel button. Default: true */
  showCancel?:     boolean
  /** Put the Next/Finish button into loading state */
  nextLoading?:    boolean
  /** Disable the Next/Finish button */
  nextDisabled?:   boolean
  /** Extra classes on the outer wrapper */
  className?:      string
  style?:          React.CSSProperties
  /**
   * Render the panel without a scrim overlay — for documentation / preview use only.
   * Modal variant only.
   */
  inline?:         boolean
  /** Allow the step content to scroll independently, keeping the bottom bar sticky at the bottom. Page variants only. */
  scrollable?:     boolean
}

// ─── Design Tokens ────────────────────────────────────────────────────────────

const tokens = {
  light: {
    panelBg:          '#FFFFFF',           // background/page · light
    panelBorder:      '#E4E4E4',           // border/default · light
    shadow:           '0px 16px 16px rgba(36,36,36,0.16)',  // elevation/level3
    titleColor:       '#242424',           // foreground/default/primary · light
    descColor:        '#676767',           // foreground/default/secondary · light
    stepHeadingColor: '#242424',
    stepSubheadColor: '#676767',
    stepperBg:        '#F8F8F8',           // background/surface · light
    stepperBorder:    '#E4E4E4',
    // Modal footer
    footerBg:         '#FFFFFF',
    footerBorder:     '#E4E4E4',
    // Page bottom bar — matches DS BottomBar (node 2524-8668)
    barBg:            '#FFFFFF',           // semantic.background.page.light
    barBorder:        '#BBBBBB',           // semantic.border.strong.light
    barShadow:        '0px 4px 16px rgba(0,0,0,0.20)',
    barRadius:        '3px 3px 0 0',
    sidebarBg:        '#F8F8F8',           // background/surface · light
    sidebarBorder:    '#E4E4E4',
    closeBtnColor:    '#4B4B4B',
    closeBtnHover:    '#F5F5F5',
    scrim:            'rgba(36,36,36,0.48)',
    focusRing:        '#067A46',           // border/focus · light
  },
  dark: {
    panelBg:          '#242424',           // background/container · dark
    panelBorder:      '#4B4B4B',           // border/default · dark
    shadow:           '0px 16px 16px rgba(36,36,36,0.16)',
    titleColor:       '#E4E4E4',           // foreground/default/primary · dark
    descColor:        '#BBBBBB',           // foreground/default/secondary · dark
    stepHeadingColor: '#E4E4E4',
    stepSubheadColor: '#BBBBBB',
    stepperBg:        '#1E1E1E',           // background/page · dark
    stepperBorder:    '#3D3D3D',           // border/strong · dark
    // Modal footer
    footerBg:         '#242424',
    footerBorder:     '#3D3D3D',
    // Page bottom bar — matches DS BottomBar (node 2524-8668)
    barBg:            '#242424',           // semantic.background.container.dark
    barBorder:        '#4B4B4B',           // semantic.border.default.dark
    barShadow:        '0px 4px 16px rgba(0,0,0,0.20)',
    barRadius:        '3px 3px 0 0',
    sidebarBg:        '#1E1E1E',
    sidebarBorder:    '#3D3D3D',
    closeBtnColor:    '#EEEEEE',
    closeBtnHover:    '#242424',
    scrim:            'rgba(36,36,36,0.48)',
    focusRing:        '#96DC14',           // border/focus · dark
  },
} as const

type TokenSet = typeof tokens[WizardTheme]

// ─── Close Icon ───────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  )
}

// ─── Step Content View ────────────────────────────────────────────────────────

interface WizardStepViewProps {
  step: WizardStep
  t:    TokenSet
}

function WizardStepView({ step, t }: WizardStepViewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(step.heading || step.subheading) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {step.heading && (
            <h3 style={{
              margin: 0, fontSize: typography.fontSize.lg, fontFamily: typography.fontFamily.headline, fontWeight: 600,
              lineHeight: '1.3em', color: t.stepHeadingColor,
            }}>
              {step.heading}
            </h3>
          )}
          {step.subheading && (
            <p style={{
              margin: 0, fontSize: typography.fontSize.md, fontWeight: 400,
              lineHeight: '1.5em', color: t.stepSubheadColor,
            }}>
              {step.subheading}
            </p>
          )}
        </div>
      )}
      {step.content && <div>{step.content}</div>}
    </div>
  )
}

// ─── Wizard Footer ────────────────────────────────────────────────────────────

interface WizardFooterProps {
  t:             TokenSet
  theme:         WizardTheme
  currentStep:   number
  totalSteps:    number
  onBack:        () => void
  onNext:        () => void
  onCancel?:     () => void
  backLabel:     string
  nextLabel:     string
  completeLabel: string
  cancelLabel:   string
  showCancel:    boolean
  nextLoading:   boolean
  nextDisabled:  boolean
}

function WizardFooter({
  t, theme, currentStep, totalSteps, onBack, onNext, onCancel,
  backLabel, nextLabel, completeLabel, cancelLabel, showCancel,
  nextLoading, nextDisabled,
}: WizardFooterProps) {
  const isFirst = currentStep === 0
  const isLast  = currentStep === totalSteps - 1
  const fwdLabel = isLast ? completeLabel : nextLabel

  return (
    <div
      style={{
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-between',
        padding:         '16px 24px',
        backgroundColor: t.footerBg,
        borderTop:       `1px solid ${t.footerBorder}`,
        flexShrink:      0,
      }}
    >
      {/* Left: Cancel */}
      <div>
        {showCancel && onCancel && (
          <Button variant="text" color="neutral" size="md" theme={theme} onClick={onCancel}>
            {cancelLabel}
          </Button>
        )}
      </div>

      {/* Right: Back + Next/Finish */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {!isFirst && (
          <Button variant="outline" color="neutral" size="md" theme={theme} onClick={onBack}>
            {backLabel}
          </Button>
        )}
        <Button
          variant="fill"
          color="positive"
          size="md"
          theme={theme}
          onClick={onNext}
          loading={nextLoading}
          disabled={nextDisabled}
        >
          {fwdLabel}
        </Button>
      </div>
    </div>
  )
}

// ─── Wizard Bottom Bar (page variants) ───────────────────────────────────────
// Matches DS BottomBar (node 2524-8668) — height 88px · paddingX 24px · shadow
// Replaces the modal inline footer for page and page-sidebar variants.

interface WizardBottomBarProps {
  t:             TokenSet
  theme:         WizardTheme
  currentStep:   number
  totalSteps:    number
  onBack:        () => void
  onNext:        () => void
  onCancel?:     () => void
  backLabel:     string
  nextLabel:     string
  completeLabel: string
  cancelLabel:   string
  showCancel:    boolean
  nextLoading:   boolean
  nextDisabled:  boolean
}

function WizardBottomBar({
  t, theme, currentStep, totalSteps, onBack, onNext, onCancel,
  backLabel, nextLabel, completeLabel, cancelLabel, showCancel,
  nextLoading, nextDisabled,
}: WizardBottomBarProps) {
  const isFirst  = currentStep === 0
  const isLast   = currentStep === totalSteps - 1
  const fwdLabel = isLast ? completeLabel : nextLabel

  return (
    <div
      role="toolbar"
      aria-label="Wizard navigation"
      style={{
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-between',
        height:          '88px',           // bb.height
        paddingLeft:     '24px',           // bb.paddingX
        paddingRight:    '24px',
        backgroundColor: t.barBg,
        borderTop:       `1px solid ${t.barBorder}`,
        borderRadius:    t.barRadius,
        boxShadow:       t.barShadow,
        flexShrink:      0,
        position:        'sticky',
        bottom:          0,
        zIndex:          10,
      }}
    >
      {/* Left: Cancel */}
      <div>
        {showCancel && onCancel && (
          <Button variant="text" color="neutral" size="md" theme={theme} onClick={onCancel}>
            {cancelLabel}
          </Button>
        )}
      </div>

      {/* Right: Back + Next/Finish */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {!isFirst && (
          <Button variant="outline" color="neutral" size="md" theme={theme} onClick={onBack}>
            {backLabel}
          </Button>
        )}
        <Button
          variant="fill"
          color="positive"
          size="md"
          theme={theme}
          onClick={onNext}
          loading={nextLoading}
          disabled={nextDisabled}
        >
          {fwdLabel}
        </Button>
      </div>
    </div>
  )
}

// ─── Shared layout props ──────────────────────────────────────────────────────

interface WizardLayoutProps {
  t:             TokenSet
  theme:         WizardTheme
  steps:         WizardStep[]
  currentStep:   number
  onStepClick:   (i: number) => void
  title?:        string
  description?:  string
  onClose?:      () => void
  onBack:        () => void
  onNext:        () => void
  backLabel:     string
  nextLabel:     string
  completeLabel: string
  cancelLabel:   string
  showCancel:    boolean
  nextLoading:   boolean
  nextDisabled:  boolean
  titleId:       string
  panelRef:      React.RefObject<HTMLDivElement | null>
  scrollable?:   boolean
}

// ─── Modal Layout ─────────────────────────────────────────────────────────────

function WizardModalLayout({
  t, theme, steps, currentStep, onStepClick, title, description, onClose,
  onBack, onNext, backLabel, nextLabel, completeLabel, cancelLabel,
  showCancel, nextLoading, nextDisabled, titleId, panelRef,
}: WizardLayoutProps) {
  const [closeBtnHovered, setCloseBtnHovered] = useState(false)

  const stepperItems: StepItem[] = steps.map((s, i) => ({
    step:  s.stepLabel ?? `Step ${i + 1}`,
    title: s.title,
  }))

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      style={{
        width:           '100%',
        display:         'flex',
        flexDirection:   'column',
        backgroundColor: t.panelBg,
        borderRadius:    '8px',
        border:          `1px solid ${t.panelBorder}`,
        boxShadow:       t.shadow,
        overflow:        'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        display:        'flex',
        alignItems:     'flex-start',
        justifyContent: 'space-between',
        gap:            '16px',
        padding:        '24px 24px 20px',
        flexShrink:     0,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <h2 id={titleId} style={{
              margin: 0, fontSize: typography.fontSize.lg, fontFamily: typography.fontFamily.headline, fontWeight: 600,
              lineHeight: '1.3em', color: t.titleColor,
            }}>
              {title}
            </h2>
          )}
          {description && (
            <p style={{
              margin: '4px 0 0', fontSize: typography.fontSize.md, fontWeight: 400,
              lineHeight: '1.5em', color: t.descColor,
            }}>
              {description}
            </p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            aria-label="Close wizard"
            onClick={onClose}
            onMouseEnter={() => setCloseBtnHovered(true)}
            onMouseLeave={() => setCloseBtnHovered(false)}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
            style={{
              flexShrink:      0,
              border:          'none',
              background:      closeBtnHovered ? t.closeBtnHover : 'transparent',
              color:           t.closeBtnColor,
              cursor:          'pointer',
              padding:         '4px',
              borderRadius:    '8px',
              display:         'flex',
              alignItems:      'center',
              outlineColor:    t.focusRing,
              transition:      'background-color 150ms ease',
            }}
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Stepper band */}
      <div style={{
        padding:         '16px 24px',
        backgroundColor: t.stepperBg,
        borderTop:       `1px solid ${t.stepperBorder}`,
        borderBottom:    `1px solid ${t.stepperBorder}`,
        flexShrink:      0,
      }}>
        <Stepper
          steps={stepperItems}
          activeStep={currentStep}
          orientation="horizontal"
          position="center"
          size="md"
          theme={theme}
          showStep={true}
          showTitle={true}
          showDescription={false}
          onStepClick={onStepClick}
        />
      </div>

      {/* Step content */}
      <div style={{
        flex:            1,
        padding:         '28px 24px',
        backgroundColor: t.panelBg,
        overflowY:       'auto',
        minHeight:       '180px',
      }}>
        <WizardStepView step={steps[currentStep]} t={t} />
      </div>

      {/* Footer */}
      <WizardFooter
        t={t} theme={theme}
        currentStep={currentStep} totalSteps={steps.length}
        onBack={onBack} onNext={onNext} onCancel={onClose}
        backLabel={backLabel} nextLabel={nextLabel} completeLabel={completeLabel}
        cancelLabel={cancelLabel} showCancel={showCancel}
        nextLoading={nextLoading} nextDisabled={nextDisabled}
      />
    </div>
  )
}

// ─── Page Layout ──────────────────────────────────────────────────────────────

function WizardPageLayout({
  t, theme, steps, currentStep, onStepClick, title, description, onClose,
  onBack, onNext, backLabel, nextLabel, completeLabel, cancelLabel,
  showCancel, nextLoading, nextDisabled, titleId, scrollable,
}: WizardLayoutProps) {
  const stepperItems: StepItem[] = steps.map((s, i) => ({
    step:  s.stepLabel ?? `Step ${i + 1}`,
    title: s.title,
  }))

  return (
    <div style={{
      width:           '100%',
      height:          scrollable ? '100%' : undefined,
      display:         'flex',
      flexDirection:   'column',
      backgroundColor: t.panelBg,
    }}>
      {/* Page header */}
      {(title || description) && (
        <div style={{
          padding:      '28px 32px 24px',
          borderBottom: `1px solid ${t.stepperBorder}`,
          flexShrink:   0,
        }}>
          {title && (
            <h2 id={titleId} style={{
              margin: 0, fontSize: typography.scale['headline/h5'].fontSize, fontFamily: typography.fontFamily.headline, fontWeight: 600,
              lineHeight: '1.3em', color: t.titleColor,
            }}>
              {title}
            </h2>
          )}
          {description && (
            <p style={{
              margin: '6px 0 0', fontSize: typography.fontSize.md, fontWeight: 400,
              lineHeight: '1.5em', color: t.descColor,
            }}>
              {description}
            </p>
          )}
        </div>
      )}

      {/* Scrollable area: stepper + step content scroll together; bottom bar stays pinned */}
      <div style={{ flex: 1, overflowY: scrollable ? 'auto' : undefined, minHeight: scrollable ? 0 : undefined, display: 'flex', flexDirection: 'column' }}>
        {/* Stepper band */}
        <div style={{
          padding:         '20px 32px',
          backgroundColor: t.stepperBg,
          borderBottom:    `1px solid ${t.stepperBorder}`,
          flexShrink:      0,
        }}>
          <Stepper
            steps={stepperItems}
            activeStep={currentStep}
            orientation="horizontal"
            position="center"
            size="md"
            theme={theme}
            showStep={true}
            showTitle={true}
            showDescription={false}
            onStepClick={onStepClick}
          />
        </div>

        {/* Step content */}
        <div style={{ flex: 1, padding: '32px' }}>
          <WizardStepView step={steps[currentStep]} t={t} />
        </div>
      </div>

      {/* Bottom bar — DS BottomBar pattern */}
      <WizardBottomBar
        t={t} theme={theme}
        currentStep={currentStep} totalSteps={steps.length}
        onBack={onBack} onNext={onNext} onCancel={onClose}
        backLabel={backLabel} nextLabel={nextLabel} completeLabel={completeLabel}
        cancelLabel={cancelLabel} showCancel={showCancel}
        nextLoading={nextLoading} nextDisabled={nextDisabled}
      />
    </div>
  )
}

// ─── Page Sidebar Layout ──────────────────────────────────────────────────────

function WizardPageSidebarLayout({
  t, theme, steps, currentStep, onStepClick, title, description, onClose,
  onBack, onNext, backLabel, nextLabel, completeLabel, cancelLabel,
  showCancel, nextLoading, nextDisabled, titleId,
}: WizardLayoutProps) {
  const stepperItems: StepItem[] = steps.map((s, i) => ({
    step:        s.stepLabel ?? `Step ${i + 1}`,
    title:       s.title,
    description: s.description,
  }))

  return (
    <div style={{
      width:           '100%',
      display:         'flex',
      backgroundColor: t.panelBg,
      minHeight:       '480px',
    }}>
      {/* Sidebar */}
      <div style={{
        width:           '260px',
        flexShrink:      0,
        backgroundColor: t.sidebarBg,
        borderRight:     `1px solid ${t.sidebarBorder}`,
        padding:         '32px 24px',
        display:         'flex',
        flexDirection:   'column',
        gap:             '28px',
      }}>
        {(title || description) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {title && (
              <h2 id={titleId} style={{
                margin: 0, fontSize: typography.fontSize.md, fontFamily: typography.fontFamily.headline, fontWeight: 600,
                lineHeight: '1.35em', color: t.titleColor,
              }}>
                {title}
              </h2>
            )}
            {description && (
              <p style={{
                margin: 0, fontSize: typography.fontSize.sm, fontWeight: 400,
                lineHeight: '1.5em', color: t.descColor,
              }}>
                {description}
              </p>
            )}
          </div>
        )}

        <Stepper
          steps={stepperItems}
          activeStep={currentStep}
          orientation="vertical"
          position="left"
          size="md"
          theme={theme}
          showStep={true}
          showTitle={true}
          showDescription={true}
          onStepClick={onStepClick}
        />
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Step content */}
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <WizardStepView step={steps[currentStep]} t={t} />
        </div>

        {/* Bottom bar — DS BottomBar pattern */}
        <WizardBottomBar
          t={t} theme={theme}
          currentStep={currentStep} totalSteps={steps.length}
          onBack={onBack} onNext={onNext} onCancel={onClose}
          backLabel={backLabel} nextLabel={nextLabel} completeLabel={completeLabel}
          cancelLabel={cancelLabel} showCancel={showCancel}
          nextLoading={nextLoading} nextDisabled={nextDisabled}
        />
      </div>
    </div>
  )
}

// ─── Wizard ───────────────────────────────────────────────────────────────────

function Wizard({
  steps,
  activeStep:     controlledStep,
  defaultStep     = 0,
  onStepChange,
  variant         = 'modal',
  theme           = 'light',
  title,
  description,
  open            = true,
  onClose,
  onComplete,
  backLabel       = 'Back',
  nextLabel       = 'Next',
  completeLabel   = 'Finish',
  cancelLabel     = 'Cancel',
  showCancel      = true,
  nextLoading     = false,
  nextDisabled    = false,
  className,
  style,
  inline          = false,
  scrollable      = false,
}: WizardProps) {
  const isControlled = controlledStep !== undefined
  const [internalStep, setInternalStep] = useState(defaultStep)
  const currentStep = isControlled ? controlledStep! : internalStep

  const panelRef = useRef<HTMLDivElement>(null)
  const titleId  = React.useId()
  const t        = tokens[theme]

  const goToStep = useCallback((step: number) => {
    if (!isControlled) setInternalStep(step)
    onStepChange?.(step)
  }, [isControlled, onStepChange])

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1)
    } else {
      onComplete?.()
    }
  }, [currentStep, steps.length, goToStep, onComplete])

  const handleBack = useCallback(() => {
    if (currentStep > 0) goToStep(currentStep - 1)
  }, [currentStep, goToStep])

  // Only allow clicking back to already-visited steps
  const handleStepClick = useCallback((i: number) => {
    if (i < currentStep) goToStep(i)
  }, [currentStep, goToStep])

  // Escape-to-close — modal only
  useEffect(() => {
    if (variant !== 'modal' || inline || !open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [variant, inline, open, onClose])

  // Body scroll lock — modal only
  useEffect(() => {
    if (variant !== 'modal' || inline) return
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [variant, inline, open])

  // Focus first focusable element on open — modal only
  useEffect(() => {
    if (variant !== 'modal' || inline || !open) return
    const panel = panelRef.current
    if (!panel) return
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusable[0]?.focus()
  }, [variant, inline, open])

  if (variant === 'modal' && !inline && !open) return null

  const sharedProps: WizardLayoutProps = {
    t, theme, steps, currentStep,
    onStepClick:   handleStepClick,
    title, description, onClose,
    onBack:        handleBack,
    onNext:        handleNext,
    backLabel, nextLabel, completeLabel, cancelLabel,
    showCancel, nextLoading, nextDisabled,
    titleId, panelRef, scrollable,
  }

  const layoutContent =
    variant === 'page-sidebar' ? <WizardPageSidebarLayout {...sharedProps} /> :
    variant === 'page'         ? <WizardPageLayout        {...sharedProps} /> :
                                 <WizardModalLayout        {...sharedProps} />

  // Page variants — simple bordered wrapper
  if (variant !== 'modal' || inline) {
    return (
      <div
        className={cn(className)}
        style={{
          borderRadius: '8px',
          overflow:     scrollable ? undefined : 'hidden',
          height:       scrollable ? '100%' : undefined,
          border:       `1px solid ${t.panelBorder}`,
          boxShadow:    variant === 'modal' ? t.shadow : undefined,
          ...style,
        }}
      >
        {layoutContent}
      </div>
    )
  }

  // Modal — render inside a scrim overlay
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: t.scrim }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div
        className={cn(className)}
        style={{ width: '100%', maxWidth: '720px', ...style }}
      >
        {layoutContent}
      </div>
    </div>
  )
}

Wizard.displayName = 'Wizard'

export { Wizard }
export default Wizard
