import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for merging Tailwind CSS classes
 * Combines clsx for conditional classes and twMerge for Tailwind conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Variant helper for creating component variants
 */
export function createVariants<T extends Record<string, Record<string, string>>>(
  variants: T
) {
  return variants;
}

/**
 * Size variants commonly used across components
 */
export const sizeVariants = {
  sm: "text-sm px-3 py-1.5",
  md: "text-base px-4 py-2",
  lg: "text-lg px-6 py-3",
};

/**
 * Common glassmorphism styles used in the design system
 */
export const glassmorphismStyles = "bg-slate-900/50 backdrop-blur-xl border border-white/5";

/**
 * Common hover animations
 */
export const hoverAnimations = "transition-all hover:-translate-y-0.5";