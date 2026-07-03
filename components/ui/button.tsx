import React from 'react';
import { cn } from './utils';
import { typography } from '@/lib/tokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'fill' | 'outline' | 'text';
  color?: 'positive' | 'negative' | 'neutral' | 'ai';
  size?: 'sm' | 'md' | 'lg';
  showLeadingIcon?: boolean;
  showTrailingIcon?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  /** Surface theme — adjusts colours for dark or light backgrounds */
  theme?: 'light' | 'dark';
  /** Renders as a square icon-only button — removes horizontal padding and sets width = height */
  iconOnly?: boolean;
}

function DefaultLeadingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M12 4L4 12M4 4L12 12" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DefaultTrailingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M4 6L8 10L12 6" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    // Bug 5 fix: aria-hidden so screen readers don't announce the decorative spinner SVG
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        className="opacity-25"
      />
      <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        className="opacity-75"
      />
    </svg>
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'fill',
      color = 'positive',
      size = 'md',
      showLeadingIcon = false,
      showTrailingIcon = false,
      leadingIcon,
      trailingIcon,
      loading = false,
      fullWidth = false,
      theme = 'light',
      disabled,
      iconOnly = false,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      "inline-flex items-center justify-center font-semibold transition-all duration-base",
      "focus:outline-none",
      "disabled:cursor-not-allowed",
      "rounded",
      // Bug 3 fix: removed duplicate "font-semibold" that was here
      // Bug 7 fix: clip overflowing content so long labels don't break layout
      "overflow-hidden",
    );

    const getButtonStyles = () => {
      // Disabled — tokens differ by surface (Figma node 48212:6356 y=500)
      // Values sourced from globals.css --btn-disabled-* / --btn-dk-disabled-* variables
      if (disabled) {
        if (theme === 'dark') {
          if (variant === 'fill')    return "bg-[var(--btn-dk-disabled-fill-bg)] text-[var(--btn-dk-disabled-text)] border-transparent cursor-not-allowed";
          if (variant === 'outline') return "bg-[var(--btn-dk-disabled-outline-bg)] border-[var(--btn-dk-disabled-text)] text-[var(--btn-dk-disabled-text)] cursor-not-allowed";
          return "bg-transparent text-[var(--btn-dk-disabled-text)] cursor-not-allowed";
        } else {
          if (variant === 'fill')    return "bg-[var(--btn-disabled-fill-bg)] text-white border-transparent cursor-not-allowed";
          if (variant === 'outline') return "bg-transparent border-[var(--btn-disabled-border)] text-[var(--btn-disabled-border)] cursor-not-allowed";
          return "bg-transparent text-[var(--btn-disabled-border)] cursor-not-allowed";
        }
      }

      // Ring offset colour matches the surface the button sits on.
      // --btn-ring-offset-dark = semantic.background.page.dark (#00178C)
      const ringOffset = theme === 'dark'
        ? "focus:ring-offset-2 focus:ring-offset-[var(--btn-ring-offset-dark)]"
        : "focus:ring-offset-2 focus:ring-offset-[var(--btn-ring-offset-light)]";

      // Light-surface tokens — Figma Enterprise-DS-v3 (node 44829:5863)
      // All colour values live in globals.css :root { --btn-* }
      // Focus ring variables are pre-computed rgba so no /opacity modifier is needed.
      const lightStyles = {
        positive: {
          fill:    "bg-[var(--btn-positive-fill)] hover:bg-[var(--btn-positive-fill-hover)] active:bg-[var(--btn-positive-fill-active)] text-white border-transparent focus:ring-[var(--btn-positive-ring)]",
          outline: "bg-transparent border-[var(--btn-positive-fill)] text-[var(--btn-positive-fill)] hover:bg-[var(--btn-positive-subtle)] active:bg-[var(--btn-positive-subtle-deep)] focus:ring-[var(--btn-positive-ring)]",
          text:    "bg-transparent text-[var(--btn-positive-fill)] hover:bg-[var(--btn-positive-subtle)] active:bg-[var(--btn-positive-subtle-deep)] focus:ring-[var(--btn-positive-ring)]",
        },
        negative: {
          fill:    "bg-[var(--btn-negative-fill)] hover:bg-[var(--btn-negative-fill-hover)] active:bg-[var(--btn-negative-fill-active)] text-white border-transparent focus:ring-[var(--btn-negative-ring)]",
          outline: "bg-transparent border-[var(--btn-negative-fill)] text-[var(--btn-negative-fill)] hover:bg-[var(--btn-negative-subtle)] active:bg-[var(--btn-negative-subtle-deep)] focus:ring-[var(--btn-negative-ring)]",
          text:    "bg-transparent text-[var(--btn-negative-fill)] hover:bg-[var(--btn-negative-subtle)] active:bg-[var(--btn-negative-subtle-deep)] focus:ring-[var(--btn-negative-ring)]",
        },
        neutral: {
          fill:    "bg-[var(--btn-neutral-fill)] hover:bg-[var(--btn-neutral-fill-hover)] active:bg-[var(--btn-neutral-fill-active)] text-white border-transparent focus:ring-[var(--btn-neutral-ring)]",
          outline: "bg-transparent border-[var(--btn-neutral-border)] text-[var(--btn-neutral-border)] hover:bg-[var(--btn-neutral-subtle)] active:bg-[var(--btn-neutral-subtle-deep)] focus:ring-[var(--btn-neutral-ring)]",
          text:    "bg-transparent text-[var(--btn-neutral-fill)] hover:bg-[var(--btn-neutral-subtle)] active:bg-[var(--btn-neutral-subtle-deep)] focus:ring-[var(--btn-neutral-ring)]",
        },
        ai: {
          fill:    "bg-[var(--btn-ai-fill)] hover:bg-[var(--btn-ai-fill-hover)] active:bg-[var(--btn-ai-fill-active)] text-white border-transparent focus:ring-[var(--btn-ai-ring)]",
          outline: "bg-transparent border-[var(--btn-ai-fill)] text-[var(--btn-ai-fill)] hover:bg-[var(--btn-ai-subtle)] active:bg-[var(--btn-ai-subtle-deep)] focus:ring-[var(--btn-ai-ring)]",
          text:    "bg-transparent text-[var(--btn-ai-fill)] hover:bg-[var(--btn-ai-subtle)] active:bg-[var(--btn-ai-subtle-deep)] focus:ring-[var(--btn-ai-ring)]",
        },
      };

      // Dark-surface tokens — Figma Enterprise-DS-v3 (node 48212:6356)
      // Outline/text hover: bg fills with a dark contrasting colour; border+text stay unchanged.
      // Note: dark AI fill hover = fill (no background change) — intentional per Figma spec.
      const darkStyles = {
        positive: {
          fill:    "bg-[var(--btn-dk-positive-fill)] hover:bg-[var(--btn-dk-positive-fill-hover)] active:bg-[var(--btn-dk-positive-fill-hover)] text-[var(--btn-dk-positive-text)] border-transparent focus:ring-[var(--btn-dk-positive-ring)]",
          outline: "bg-transparent border-[var(--btn-dk-positive-border)] text-[var(--btn-dk-positive-border)] hover:bg-[var(--btn-dk-positive-subtle)] active:bg-[var(--btn-dk-positive-subtle-deep)] focus:ring-[var(--btn-dk-positive-ring)]",
          text:    "bg-transparent text-[var(--btn-dk-positive-border)] hover:bg-[var(--btn-dk-positive-subtle)] active:bg-[var(--btn-dk-positive-subtle-deep)] focus:ring-[var(--btn-dk-positive-ring)]",
        },
        negative: {
          fill:    "bg-[var(--btn-dk-negative-fill)] hover:bg-[var(--btn-dk-negative-fill-hover)] active:bg-[var(--btn-dk-negative-fill-hover)] text-[var(--btn-dk-negative-text)] border-transparent focus:ring-[var(--btn-dk-negative-ring)]",
          outline: "bg-transparent border-[var(--btn-dk-negative-fill)] text-[var(--btn-dk-negative-fill)] hover:bg-[var(--btn-dk-negative-subtle)] active:bg-[var(--btn-dk-negative-subtle-deep)] focus:ring-[var(--btn-dk-negative-ring)]",
          text:    "bg-transparent text-[var(--btn-dk-negative-fill)] hover:bg-[var(--btn-dk-negative-subtle)] active:bg-[var(--btn-dk-negative-subtle-deep)] focus:ring-[var(--btn-dk-negative-ring)]",
        },
        neutral: {
          fill:    "bg-[var(--btn-dk-neutral-fill)] hover:bg-[var(--btn-dk-neutral-fill-hover)] active:bg-[var(--btn-dk-neutral-fill-active)] text-[var(--btn-dk-neutral-text)] border-transparent focus:ring-[var(--btn-dk-neutral-ring)]",
          outline: "bg-transparent border-[var(--btn-dk-neutral-border)] text-[var(--btn-dk-neutral-text-fg)] hover:bg-[var(--btn-dk-neutral-subtle)] active:bg-[var(--btn-dk-neutral-fill-active)] focus:ring-[var(--btn-dk-neutral-ring)]",
          text:    "bg-transparent text-[var(--btn-dk-neutral-text-fg)] hover:bg-[var(--btn-dk-neutral-subtle)] active:bg-[var(--btn-dk-neutral-fill-active)] focus:ring-[var(--btn-dk-neutral-ring)]",
        },
        ai: {
          fill:    "bg-[var(--btn-dk-ai-fill)] hover:bg-[var(--btn-dk-ai-fill)] active:bg-[var(--btn-dk-ai-fill-active)] text-[var(--btn-dk-ai-text)] border-transparent focus:ring-[var(--btn-dk-ai-ring)]",
          outline: "bg-transparent border-[var(--btn-dk-ai-border)] text-[var(--btn-dk-ai-border)] hover:bg-[var(--btn-dk-ai-subtle)] active:bg-[var(--btn-dk-ai-subtle-deep)] focus:ring-[var(--btn-dk-ai-ring)]",
          text:    "bg-transparent text-[var(--btn-dk-ai-border)] hover:bg-[var(--btn-dk-ai-subtle)] active:bg-[var(--btn-dk-ai-subtle-deep)] focus:ring-[var(--btn-dk-ai-ring)]",
        },
      };

      const colorStyles = theme === 'dark' ? darkStyles : lightStyles;

      return cn(
        colorStyles[color][variant],
        "border",        // 1px per Figma spec (button/label/border)
        "focus:ring-4",
        ringOffset,
      );
    };

    const variantStyles = getButtonStyles();

    const sizeStyles = {
      sm: cn(
        iconOnly ? "p-0 aspect-square" : "px-3 py-1.5 gap-2",
        "leading-5",
        "h-[var(--btn-height-sm)]",
      ),
      md: cn(
        iconOnly ? "p-0 aspect-square" : "px-3 py-2 gap-1",
        "leading-6",
        "h-[var(--btn-height-md)]",
      ),
      lg: cn(
        iconOnly ? "p-0 aspect-square" : "px-4 py-3 gap-2",
        "leading-7",
        "h-[var(--btn-height-lg)]",
      ),
    };

    const fontSizeStyles: Record<'sm' | 'md' | 'lg', React.CSSProperties> = {
      sm: { fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.body },
      md: { fontSize: typography.fontSize.md, fontFamily: typography.fontFamily.body },
      lg: { fontSize: typography.fontSize.lg, fontFamily: typography.fontFamily.body },
    };

    const buttonClasses = cn(
      baseStyles,
      variantStyles,
      sizeStyles[size],
      fullWidth && "w-full",
      className
    );

    // Bug 8 fix: warn in development when an icon-only button has no accessible name.
    if (process.env.NODE_ENV !== 'production') {
      const isIconOnly = !children && (showLeadingIcon || showTrailingIcon || loading);
      if (isIconOnly && !props['aria-label'] && !props['aria-labelledby']) {
        console.warn(
          '[Button] Icon-only button is missing an accessible name. ' +
          'Pass `aria-label` or `aria-labelledby` so screen readers can identify it.'
        );
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        className={buttonClasses}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        style={fontSizeStyles[size]}
        {...props}
      >
        {(showLeadingIcon || loading) && (
          <span className="flex items-center justify-center shrink-0">
            {loading ? (
              <LoadingSpinner />
            ) : (
              leadingIcon || <DefaultLeadingIcon />
            )}
          </span>
        )}
        
        {/* Bug 7 fix: truncate = overflow-hidden + whitespace-nowrap + text-ellipsis */}
        {children && (
          <span className="truncate font-semibold min-w-0">
            {children}
          </span>
        )}
        
        {showTrailingIcon && !loading && (
          <span className="flex items-center justify-center shrink-0">
            {trailingIcon || <DefaultTrailingIcon />}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export default Button;
