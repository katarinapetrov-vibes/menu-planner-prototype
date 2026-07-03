'use client'

/**
 * Enterprise DS v3 — Dialog
 * Figma node 47788-11473
 *
 * Properties (mirrors Figma exactly):
 *   Illustration type · Hero | Spot
 *   Show Banner       · show/hide an inline banner inside the body
 *   Show Image        · show/hide the top media area
 *   Show Title        · show/hide the title
 *   Show Description  · show/hide the description paragraph
 *   Show Swapper group · custom content area (swappable content slots)
 *   Show Buttons      · show/hide the entire footer row
 *   Show Right Buttons · right side of footer
 *     Right Filled Button | Right Outline Button | Right Text Button
 *   Show Left Buttons  · left side of footer
 *     Left Filled Button | Left Outline Button | Left Text Button
 *   Show Caption      · caption text below footer buttons
 */

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { cn } from './utils'
import { borderWidth, components, sizing, typography, motion as motionTokens } from '@/lib/tokens'
import { Button } from './button'
import type { ButtonProps } from './button'
import { Banner } from './banner'
import type { BannerColour } from './banner'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DialogIllustrationType = 'hero' | 'spot'
export type DialogSize             = 'sm' | 'md' | 'lg'
export type DialogTheme            = 'light' | 'dark'

export interface DialogButtonConfig {
  /** Button label text */
  label: string
  /** Click handler */
  onClick: () => void
  /** Disabled state */
  disabled?: boolean
  /** Loading state */
  loading?: boolean
  /** Override button color — defaults sensibly per position */
  color?: ButtonProps['color']
}

export interface DialogProps {
  // ── Visibility ──────────────────────────────────────────────────────────────
  /** Controls whether the dialog is mounted and visible */
  open: boolean
  /** Called when the dialog should close (Esc, backdrop click, close button) */
  onClose: () => void

  // ── Media ───────────────────────────────────────────────────────────────────
  /** Show the top image / illustration area */
  showImage?: boolean
  /**
   * hero — large full-bleed area (240px) for impactful imagery
   * spot — smaller centred area (180px) for icons or spot illustrations
   */
  illustrationType?: DialogIllustrationType
  /** Content rendered inside the media slot; falls back to a placeholder */
  mediaContent?: React.ReactNode

  // ── Inline Banner ───────────────────────────────────────────────────────────
  /** Show an inline banner / alert strip inside the dialog body */
  showBanner?: boolean
  /** Content of the inline banner */
  bannerContent?: React.ReactNode
  /** Semantic colour of the inline banner. Default: 'info' */
  bannerColour?: BannerColour

  // ── Header ──────────────────────────────────────────────────────────────────
  /** Show the title heading */
  showTitle?: boolean
  /** Dialog title text */
  title?: string
  /** Show the × close button in the header */
  showCloseButton?: boolean

  // ── Body ────────────────────────────────────────────────────────────────────
  /** Show the description paragraph */
  showDescription?: boolean
  /** Body description — string renders as body/md/regular; ReactNode for custom content */
  description?: React.ReactNode

  // ── Swapper / custom content ─────────────────────────────────────────────────
  /** Show the swapper content area */
  showSwapperGroup?: boolean
  /** Custom content rendered inside the swapper area (tabs, form, etc.) */
  swapperContent?: React.ReactNode

  // ── Footer buttons ───────────────────────────────────────────────────────────
  /** Show the entire footer row */
  showButtons?: boolean

  /** Show right-side buttons (primary actions) */
  showRightButtons?: boolean
  /** Right filled button */
  rightFilledButton?: DialogButtonConfig
  /** Right outline button */
  rightOutlineButton?: DialogButtonConfig
  /** Right text button */
  rightTextButton?: DialogButtonConfig

  /** Show left-side buttons (secondary / destructive actions) */
  showLeftButtons?: boolean
  /** Left filled button */
  leftFilledButton?: DialogButtonConfig
  /** Left outline button */
  leftOutlineButton?: DialogButtonConfig
  /** Left text button */
  leftTextButton?: DialogButtonConfig

  // ── Caption ─────────────────────────────────────────────────────────────────
  /** Show the caption text below the footer */
  showCaption?: boolean
  /** Caption text */
  caption?: React.ReactNode

  // ── Global ──────────────────────────────────────────────────────────────────
  /** Width of the dialog panel */
  size?: DialogSize
  /** Surface theme — match the surrounding canvas */
  theme?: DialogTheme
  /** Extra classes on the dialog panel */
  className?: string
  /** Accessible label for the dialog (falls back to title) */
  'aria-label'?: string
  /**
   * Render the panel inline without the fixed scrim overlay.
   * Use only in documentation / preview contexts — never in production.
   */
  inline?: boolean
}

// G-21 RESOLVED — sizing.dialog.{sm,md,lg} tokens added to sizing export.
// G-22 RESOLVED — sizing.dialog.media.{hero,spot} tokens added to sizing export.
const sizeMaxWidth: Record<DialogSize, string> = {
  sm: sizing.dialog.sm,
  md: sizing.dialog.md,
  lg: sizing.dialog.lg,
}

const mediaMinHeight: Record<DialogIllustrationType, string> = {
  hero: sizing.dialog.media.hero,
  spot: sizing.dialog.media.spot,
}

// ─── Close icon ───────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  )
}

// ─── Media placeholder ────────────────────────────────────────────────────────

function MediaPlaceholder({ illustrationType }: { theme: DialogTheme; illustrationType: DialogIllustrationType }) {
  if (illustrationType === 'spot') {
    return (
      <Image
        src="/illustrations/static/dialog_spot_illustration.svg"
        alt=""
        width={120}
        height={120}
        aria-hidden
        draggable={false}
      />
    )
  }
  return (
    <Image
      src="/illustrations/static/dialog_hero_illustration.svg"
      alt=""
      width={560}
      height={240}
      aria-hidden
      draggable={false}
      className="w-full h-full object-cover"
    />
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Dialog({
  open,
  onClose,
  // media
  showImage = false,
  illustrationType = 'hero',
  mediaContent,
  // banner
  showBanner = false,
  bannerContent,
  bannerColour = 'info',
  // header
  showTitle = true,
  title,
  showCloseButton = true,
  // body
  showDescription = true,
  description,
  // swapper
  showSwapperGroup = false,
  swapperContent,
  // footer buttons
  showButtons = true,
  showRightButtons = true,
  rightFilledButton,
  rightOutlineButton,
  rightTextButton,
  showLeftButtons = false,
  leftFilledButton,
  leftOutlineButton,
  leftTextButton,
  // caption
  showCaption = false,
  caption,
  // global
  size = 'md',
  theme = 'light',
  className,
  'aria-label': ariaLabel,
  inline = false,
}: DialogProps) {
  const dialogRef            = useRef<HTMLDivElement>(null)
  const returnFocusTo        = useRef<HTMLElement | null>(null)
  const titleId              = React.useId()
  const descId               = React.useId()
  const prefersReducedMotion = useReducedMotion()

  const tok        = components.dialog.colour[theme]
  const hasBody    = (showDescription && description != null) || (showBanner && bannerContent != null) || (showSwapperGroup && swapperContent != null)
  const hasFooter  = showButtons && (showRightButtons || showLeftButtons)
  const hasHeader  = showTitle && !!title

  // ── Save trigger element + focus first focusable on open (A-5) ─────────
  useEffect(() => {
    if (!open || inline) return
    returnFocusTo.current = document.activeElement as HTMLElement
    const panel = dialogRef.current
    if (!panel) return
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    focusable[0]?.focus()
    return () => { returnFocusTo.current?.focus() }
  }, [open, inline])

  // ── Escape to close ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || inline) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose, inline])

  // ── Focus trap — Tab / Shift+Tab cycle stays inside the panel (A-6) ────
  useEffect(() => {
    if (!open || inline) return
    const panel = dialogRef.current
    if (!panel) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
      if (focusable.length === 0) { e.preventDefault(); return }
      const first = focusable[0]
      const last  = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, inline])

  // ── Body scroll lock ─────────────────────────────────────────────────────
  useEffect(() => {
    if (inline) return
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open, inline])

  const renderButton = (cfg: DialogButtonConfig, variant: ButtonProps['variant'], defaultColor: ButtonProps['color']) => (
    <Button
      type="button"
      variant={variant}
      color={cfg.color ?? defaultColor}
      size="md"
      theme={theme}
      onClick={cfg.onClick}
      disabled={cfg.disabled}
      loading={cfg.loading}
    >
      {cfg.label}
    </Button>
  )

  // ── Panel ─────────────────────────────────────────────────────────────────
  const panel = (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={showTitle && title ? titleId : undefined}
      aria-label={!(showTitle && title) ? (ariaLabel ?? 'Dialog') : undefined}
      aria-describedby={showDescription && description ? descId : undefined}
      className="relative w-full flex flex-col max-h-[calc(100vh-2rem)]"
      style={{
        maxWidth:        sizeMaxWidth[size],
        backgroundColor: tok.panel,
        border:          `${borderWidth.thin} solid ${tok.panelBorder}`,
        borderRadius:    components.dialog.radius,
        boxShadow:       components.dialog.shadow,
      }}
    >
      {/* ── Media slot ── */}
      {showImage && (
        <div
          aria-hidden
          className="overflow-hidden flex items-center justify-center"
          style={{
            height:          mediaMinHeight[illustrationType],
            borderRadius:    `${components.dialog.radius} ${components.dialog.radius} 0 0`,
            backgroundColor: !mediaContent && illustrationType === 'spot' ? tok.media : undefined,
          }}
        >
          {mediaContent ?? <MediaPlaceholder theme={theme} illustrationType={illustrationType} />}
        </div>
      )}

      {/* ── Close button — absolute top-right ── */}
      {showCloseButton && (
        <div className="absolute top-3 right-3 z-10">
          <Button
            type="button"
            variant="text"
            color="neutral"
            size="sm"
            theme={theme}
            iconOnly
            aria-label="Close dialog"
            showLeadingIcon
            leadingIcon={<CloseIcon />}
            onClick={onClose}
          />
        </div>
      )}

      {/* ── Header ── */}
      {hasHeader && showTitle && title && (
        <div
          className={cn(
            'px-6 pt-6',
            showCloseButton ? 'pr-12' : '',
            hasBody || hasFooter ? 'pb-4' : 'pb-6'
          )}
        >
          <h2
            id={titleId}
            className="font-medium leading-[1.2em]"
            style={{
              color:      tok.title,
              fontSize:   typography.fontSize.lg,
              fontFamily: typography.fontFamily.headline,
            }}
          >
            {title}
          </h2>
        </div>
      )}

      {/* ── Body ── */}
      {hasBody && (
        <div
          className={cn(
            'flex flex-col gap-4 px-6 overflow-y-auto flex-1',
            hasFooter ? 'pb-5' : 'pb-6',
            !hasHeader && 'pt-6'
          )}
        >
          {/* Inline banner */}
          {showBanner && bannerContent && (
            <Banner
              bannerColour={bannerColour}
              description={bannerContent}
              theme={theme}
            />
          )}

          {/* Description */}
          {showDescription && description != null && (
            <div id={descId}>
              {typeof description === 'string' ? (
                <p
                  className="font-normal leading-[1.5em]"
                  style={{ color: tok.body, fontSize: typography.fontSize.md }}
                >
                  {description}
                </p>
              ) : (
                description
              )}
            </div>
          )}

          {/* Swapper / custom content */}
          {showSwapperGroup && swapperContent != null && (
            <div>{swapperContent}</div>
          )}
        </div>
      )}

      {/* ── Footer ── */}
      {hasFooter && (
        <div className="flex flex-col gap-2 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Left buttons */}
            <div className="flex items-center gap-2">
              {showLeftButtons && (
                <>
                  {leftFilledButton  && renderButton(leftFilledButton,  'fill',    leftFilledButton.color  ?? 'neutral')}
                  {leftOutlineButton && renderButton(leftOutlineButton, 'outline', leftOutlineButton.color ?? 'neutral')}
                  {leftTextButton    && renderButton(leftTextButton,    'text',    leftTextButton.color    ?? 'neutral')}
                </>
              )}
            </div>

            {/* Right buttons */}
            <div className="flex items-center gap-2">
              {showRightButtons && (
                <>
                  {rightTextButton    && renderButton(rightTextButton,    'text',    rightTextButton.color    ?? 'positive')}
                  {rightOutlineButton && renderButton(rightOutlineButton, 'outline', rightOutlineButton.color ?? 'positive')}
                  {rightFilledButton  && renderButton(rightFilledButton,  'fill',    rightFilledButton.color  ?? 'positive')}
                </>
              )}
            </div>
          </div>

          {/* Caption */}
          {showCaption && caption != null && (
            <p
              className="font-normal leading-[1.667em] text-center"
              style={{ color: tok.caption, fontSize: typography.fontSize.sm }}
            >
              {caption}
            </p>
          )}
        </div>
      )}
    </div>
  )

  // Inline mode — render panel directly without scrim (documentation only)
  if (inline) return open ? panel : null

  // Modal mode — render panel inside fixed scrim overlay
  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, ...motionTokens.spring.default }
  const scrimDuration = prefersReducedMotion
    ? 0
    : parseFloat(motionTokens.duration.moderate) / 1000

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: components.dialog.scrim[theme] }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: scrimDuration, ease: motionTokens.easing.framer.easeOut }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={panelTransition}
          >
            {panel}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

