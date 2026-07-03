'use client'

import { cn } from '../utils'
import { components } from '../../../lib/tokens'
import { createContext, useContext } from 'react'
export type IconSize = 16 | 20 | 24 | 32

export interface IconProps {
  size?: IconSize
  /** Override the SVG viewBox. Defaults to "0 0 24 24". Pass the native grid of the icon artwork. */
  viewBox?: string
  className?: string
  'aria-hidden'?: boolean
  /** Accessible label — required when aria-hidden is false (meaningful icon). */
  'aria-label'?: string
  /** SVG <title> text — alternative to aria-label for inline SVG accessibility. */
  title?: string
}

const sizeMap: Record<IconSize, string> = {
  16: 'w-4 h-4',
  20: 'w-5 h-5',
  24: 'w-6 h-6',
  32: 'w-8 h-8',
}

export function IconRoot({
  size = 24,
  viewBox = components.icon.defaultViewBox,
  className,
  children,
  'aria-hidden': ariaHidden = true,
  'aria-label': ariaLabel,
  title,
}: IconProps & { children?: React.ReactNode }) {
  const isMeaningful = ariaHidden === false

  if (process.env.NODE_ENV !== 'production' && isMeaningful && !ariaLabel && !title) {
    console.warn('[IconRoot] Meaningful icon (aria-hidden=false) has no aria-label or title. Screen readers will announce it without a name.')
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill={components.icon.defaultFill}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizeMap[size as IconSize] || components.icon.fallbackSizeClass, className)}
      aria-hidden={ariaHidden}
      aria-label={isMeaningful ? ariaLabel : undefined}
      role={isMeaningful ? 'img' : undefined}
    >
      {isMeaningful && title && <title>{title}</title>}
      {children}
    </svg>
  )
}

/** Variant type: 'outline' for light backgrounds, 'filled' for dark backgrounds. */
export type IconVariant = 'outline' | 'filled'

/**
 * Context allowing a parent to override the icon variant for a subtree.
 * Useful when a component has a dark background inside a light-theme page.
 */
export const IconVariantContext = createContext<IconVariant | null>(null)

/**
 * Wrap a subtree to pin all icons within it to a specific variant,
 * regardless of the global theme.
 *
 * @example
 * // Dark card inside a light page — icons should be filled
 * <IconVariantProvider variant="filled">
 *   <HomeFilled ... />
 * </IconVariantProvider>
 */
export function IconVariantProvider({
  variant,
  children,
}: {
  variant: IconVariant
  children: React.ReactNode
}) {
  return <IconVariantContext.Provider value={variant}>{children}</IconVariantContext.Provider>
}

/**
 * Returns the correct icon variant for the active background.
 *
 * Resolution order:
 *  1. Nearest `<IconVariantProvider>` in the tree (local override)
 *  2. Default viewport is light — icons use 'outline'
 *
 * @example
 * const variant = useIconVariant()
 * const Icon = variant === 'filled' ? HomeFilled : HomeOutline
 * return <Icon size={24} />
 */
export function useIconVariant(): IconVariant {
  const ctx = useContext(IconVariantContext)
  if (ctx !== null) return ctx
  return 'outline'
}
