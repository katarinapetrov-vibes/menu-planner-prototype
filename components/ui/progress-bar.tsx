'use client';

import React, { useId } from 'react';
import { cn } from './utils';
import { components, spacing, typography, motion as motionTokens } from '@/lib/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProgressType  = 'linear' | 'circular';
export type ProgressSize  = 'sm' | 'md' | 'lg';
export type ProgressTheme = 'light' | 'dark';

// ─── Color helpers — sourced from components.progressBar tokens ───────────────

const indicatorColor = (theme: ProgressTheme) => components.progressBar.colour[theme].indicator;
const trackColor     = (theme: ProgressTheme) => components.progressBar.colour[theme].track;
const labelColor     = (theme: ProgressTheme) => components.progressBar.colour[theme].label;

// ─── Size Tokens — Linear ─────────────────────────────────────────────────────
// Heights: sm=spacing[100]=4px, md=spacing[200]=8px, lg=spacing[300]=12px

const linearSizes: Record<ProgressSize, { trackHeight: string; labelFontSize: string }> = {
  sm: { trackHeight: components.progressBar.size.sm.trackHeight, labelFontSize: typography.fontSize.sm },
  md: { trackHeight: components.progressBar.size.md.trackHeight, labelFontSize: typography.fontSize.sm },
  lg: { trackHeight: components.progressBar.size.lg.trackHeight, labelFontSize: typography.fontSize.sm },
};

// ─── Size Tokens — Circular ───────────────────────────────────────────────────
// Diameters: sm=32 px, md=48 px, lg=64 px

const circularSizes: Record<ProgressSize, {
  size:           number;
  strokeWidth:    number;
  labelFontSize:  string;
  centerFontSize: string;
}> = {
  sm: { size: 32, strokeWidth: 3, labelFontSize: typography.fontSize.sm, centerFontSize: components.progressBar.size.sm.centerFontSize },
  md: { size: 48, strokeWidth: 4, labelFontSize: typography.fontSize.sm, centerFontSize: components.progressBar.size.md.centerFontSize },
  lg: { size: 64, strokeWidth: 5, labelFontSize: typography.fontSize.sm, centerFontSize: components.progressBar.size.lg.centerFontSize },
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ProgressBarProps {
  /** 'linear' (horizontal bar) or 'circular' (ring). Default: 'linear' */
  type?: ProgressType;
  /** Current progress 0–100. Ignored when indeterminate=true. Default: 0 */
  value?: number;
  /** Continuous animation — use when duration is unknown. Default: false */
  indeterminate?: boolean;
  /** Size variant. Default: 'md' */
  size?: ProgressSize;
  /** Theme — passed through for canvas context. Default: 'light' */
  theme?: ProgressTheme;
  /** Optional text label. Shown above (linear) or below (circular). */
  label?: string;
  /** Display the numeric percentage. Hidden in indeterminate mode. Default: false */
  showPercentage?: boolean;
  className?: string;
  /** Accessible label for screen readers when no visible label is provided */
  'aria-label'?: string;
}

// ─── Linear Progress ──────────────────────────────────────────────────────────

function LinearProgress({
  value          = 0,
  indeterminate  = false,
  size           = 'md',
  theme          = 'light',
  label,
  showPercentage = false,
  className,
  'aria-label': ariaLabel,
}: ProgressBarProps) {
  const labelId   = useId();
  const sz        = linearSizes[size];
  const textColor = labelColor(theme);
  const bgColor   = trackColor(theme);
  const pct       = Math.min(100, Math.max(0, value ?? 0));

  // Prefer explicit aria-label → then aria-labelledby linked to visible label → then generic fallback
  const ariaProps = ariaLabel
    ? { 'aria-label': ariaLabel }
    : label
      ? { 'aria-labelledby': labelId }
      : { 'aria-label': 'Progress' };

  return (
    <div className={cn('w-full', className)}>
      {/* Label row — labelGap token (6px) between this row and the track */}
      {(label || (showPercentage && !indeterminate)) && (
        <div
          className="flex justify-between items-center"
          style={{ marginBottom: components.progressBar.labelGap }}
        >
          {label && (
            <span id={labelId} className="font-medium" style={{ color: textColor, fontSize: sz.labelFontSize }}>
              {label}
            </span>
          )}
          {showPercentage && !indeterminate && (
            <span className="tabular-nums" style={{ color: textColor, fontSize: sz.labelFontSize }}>
              {pct}%
            </span>
          )}
        </div>
      )}

      {/* Track — height from components.progressBar.size token */}
      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={indeterminate ? undefined : `${pct}%`}
        {...ariaProps}
        aria-busy={indeterminate || undefined}
        className="relative w-full rounded-full overflow-hidden"
        style={{ height: sz.trackHeight, backgroundColor: bgColor }}
      >
        {indeterminate ? (
          <div
            className="absolute top-0 h-full rounded-full"
            style={{
              width: '30%',  // intentional magic number — no percentage token in scale
              backgroundColor: indicatorColor(theme),
              animation: `progress-indeterminate ${motionTokens.duration.loop.progress} ease-in-out infinite`,
            }}
          />
        ) : (
          <div
            className="h-full rounded-full transition-[width] duration-deliberate ease-out"
            style={{ width: `${pct}%`, backgroundColor: indicatorColor(theme) }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Circular Progress ────────────────────────────────────────────────────────

function CircularProgress({
  value          = 0,
  indeterminate  = false,
  size           = 'md',
  theme          = 'light',
  label,
  showPercentage = false,
  className,
  'aria-label': ariaLabel,
}: ProgressBarProps) {
  const labelId   = useId();
  const sz        = circularSizes[size];
  const textColor = labelColor(theme);
  const bgColor   = trackColor(theme);
  const pct       = Math.min(100, Math.max(0, value ?? 0));

  const r             = (sz.size - sz.strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset    = circumference - (pct / 100) * circumference;

  // Prefer explicit aria-label → then aria-labelledby linked to visible label → then generic fallback
  const ariaProps = ariaLabel
    ? { 'aria-label': ariaLabel }
    : label
      ? { 'aria-labelledby': labelId }
      : { 'aria-label': 'Progress' };

  return (
    // gap from spacing[200] token (8px)
    <div className={cn('inline-flex flex-col items-center', className)} style={{ gap: spacing[200] }}>
      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={indeterminate ? undefined : `${pct}%`}
        {...ariaProps}
        aria-busy={indeterminate || undefined}
        className="relative inline-flex items-center justify-center"
        style={{ width: sz.size, height: sz.size }}
      >
        <svg
          width={sz.size}
          height={sz.size}
          viewBox={`0 0 ${sz.size} ${sz.size}`}
          className={indeterminate ? 'animate-spin' : undefined}
          style={indeterminate ? undefined : { transform: 'rotate(-90deg)' }}
        >
          {/* Track ring */}
          <circle
            cx={sz.size / 2}
            cy={sz.size / 2}
            r={r}
            fill="none"
            stroke={bgColor}
            strokeWidth={sz.strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={sz.size / 2}
            cy={sz.size / 2}
            r={r}
            fill="none"
            stroke={indicatorColor(theme)}
            strokeWidth={sz.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={indeterminate ? circumference * 0.75 : dashOffset}
            style={indeterminate ? undefined : { transition: `stroke-dashoffset ${motionTokens.duration.deliberate} ease-out` }}
          />
        </svg>

        {/* Center percentage (determinate only) — font size from components.progressBar.size token */}
        {showPercentage && !indeterminate && (
          <span
            className="absolute font-semibold tabular-nums"
            style={{ color: indicatorColor(theme), fontSize: sz.centerFontSize }}
          >
            {pct}%
          </span>
        )}
      </div>

      {/* Below label */}
      {label && (
        <span
          id={labelId}
          className="font-medium text-center"
          style={{ color: textColor, fontSize: sz.labelFontSize }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

// ─── ProgressBar (main export) ────────────────────────────────────────────────

function ProgressBar({ type = 'linear', ...props }: ProgressBarProps) {
  if (type === 'circular') return <CircularProgress {...props} />;
  return <LinearProgress {...props} />;
}

ProgressBar.displayName = 'ProgressBar';

export { ProgressBar, LinearProgress, CircularProgress };
export default ProgressBar;
