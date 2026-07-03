'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from './utils';
import { components, motion as motionTokens, spacing, borderWidth } from '@/lib/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export type StepperSize        = 'sm' | 'md' | 'lg';
export type StepperTheme       = 'light' | 'dark';
export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperPosition    = 'left' | 'center' | 'right';
export type StepState          = 'pending' | 'active' | 'completed' | 'error';

export interface StepItem {
  /** Small secondary label above the title — e.g. "Step 1". Shown when showStep=true. */
  step?:        string;
  /** Primary step title rendered in semibold. */
  title:        string;
  /** Supporting description below the title. Shown when showDescription=true. */
  description?: string;
  /** Explicit state override — derived from activeStep index when omitted. */
  state?:       StepState;
  /** Custom icon shown when variant='icon' and state is pending/active. */
  icon?:        React.ReactNode;
}

export interface StepperProps {
  /** Ordered list of step definitions. */
  steps:            StepItem[];
  /** Zero-indexed active step position. Default: 0 */
  activeStep?:      number;
  /** Layout direction. Default: 'horizontal' */
  orientation?:     StepperOrientation;
  /**
   * Position of the indicator circle relative to the step content.
   * horizontal — left: circle left of text | center: circle above text | right: circle right of text
   * vertical   — left: circle left of text | right: circle right of text
   * Default: 'center'
   */
  position?:        StepperPosition;
  /** Show the small step label (step.step). Default: true */
  showStep?:        boolean;
  /** Show the step title (step.title). Default: true */
  showTitle?:       boolean;
  /** Show the step description (step.description). Default: true */
  showDescription?: boolean;
  /** Controls circle size and type scale. Default: 'md' */
  size?:            StepperSize;
  /** Token mode. Default: 'light' */
  theme?:           StepperTheme;
  /**
   * Called with the clicked step index.
   * When provided, completed and active steps become interactive buttons.
   */
  onStepClick?:     (index: number) => void;
  /** Extra class applied to the outer wrapper. */
  className?:       string;
  /** Accessible label for the stepper nav. Default: 'Progress steps' */
  'aria-label'?:    string;
  /** Indicator display mode. 'number' shows the step index; 'icon' shows step.icon. Default: 'number' */
  variant?:         'number' | 'icon';
}

// ─── Token Types ──────────────────────────────────────────────────────────────

type TokenSet  = typeof components.stepper.colour[StepperTheme];
type SizeToken = typeof components.stepper.size[StepperSize];

// ─── Token Helpers ────────────────────────────────────────────────────────────

function getCircleTokens(state: StepState, tk: TokenSet) {
  switch (state) {
    case 'completed': return tk.circleCompleted;
    case 'active':    return tk.circleActive;
    case 'error':     return tk.circleError;
    case 'pending':   return tk.circlePending;
  }
}

function getTitleColor(state: StepState, tk: TokenSet): string {
  switch (state) {
    case 'completed': return tk.titleCompleted;
    case 'active':    return tk.titleActive;
    case 'error':     return tk.titleError;
    case 'pending':   return tk.titlePending;
  }
}

function resolveState(index: number, activeStep: number, steps: StepItem[]): StepState {
  if (steps[index].state) return steps[index].state!;
  const clamped = Math.max(0, Math.min(activeStep, steps.length - 1));
  if (index < clamped)  return 'completed';
  if (index === clamped) return 'active';
  return 'pending';
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckIcon({ px }: { px: number }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width={px} height={px} aria-hidden>
      <polyline points="3,9 6.5,13 13,3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon({ px }: { px: number }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width={px} height={px} aria-hidden>
      <line x1="4" y1="4" x2="12" y2="12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="12" y1="4" x2="4"  y2="12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Step Circle ──────────────────────────────────────────────────────────────

interface StepCircleProps {
  stepNumber: number;
  state:      StepState;
  size:       StepperSize;
  theme:      StepperTheme;
  clickable:  boolean;
  onClick?:   () => void;
  title:      string;
  variant:    'number' | 'icon';
  icon?:      React.ReactNode;
}

function StepCircle({ stepNumber, state, size, theme, clickable, onClick, title, variant, icon }: StepCircleProps) {
  const tk: TokenSet  = components.stepper.colour[theme];
  const sz: SizeToken = components.stepper.size[size];
  const cir    = sz.circleSize;
  const ctok   = getCircleTokens(state, tk);
  const iconPx = Math.round(cir * sz.iconScale);

  const inner = (
    <>
      {state === 'completed' ? (
        <CheckIcon px={iconPx} />
      ) : state === 'error' ? (
        <XIcon px={iconPx} />
      ) : variant === 'icon' && icon ? (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: iconPx, height: iconPx }}>{icon}</span>
      ) : (
        <span style={{ fontSize: `${Math.round(cir * 0.4)}px`, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {stepNumber}
        </span>
      )}
    </>
  );

  const ring = state === 'active' ? (
    <span
      aria-hidden
      className="absolute rounded-full pointer-events-none"
      style={{ inset: `-${spacing[100]}`, border: `${borderWidth.default} solid ${ctok.bg}` }}
    />
  ) : null;

  const style: React.CSSProperties = {
    width: cir, height: cir, minWidth: cir, minHeight: cir,
    backgroundColor: ctok.bg,
    borderColor:     ctok.border,
    borderWidth:     sz.circleBorder,
    borderStyle:     'solid',
    color:           ctok.text,
  };

  const cls = cn(
    'relative flex items-center justify-center rounded-full transition-all duration-base select-none shrink-0',
    clickable
      ? 'cursor-pointer hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
      : 'cursor-default',
  );

  if (clickable) {
    return (
      <button type="button" className={cls} style={{ ...style, outlineColor: tk.focusColor }}
        onClick={onClick} aria-label={`Go to step ${stepNumber}: ${title}`}
        aria-current={state === 'active' ? 'step' : undefined}>
        {ring}{inner}
      </button>
    );
  }
  return <div className={cls} style={style} aria-hidden>{ring}{inner}</div>;
}

// ─── Step Content ─────────────────────────────────────────────────────────────

interface StepContentProps {
  item:            StepItem;
  showStep:        boolean;
  showTitle:       boolean;
  showDescription: boolean;
  state:           StepState;
  tk:              TokenSet;
  sz:              SizeToken;
  textAlign:       React.CSSProperties['textAlign'];
}

function StepContent({ item, showStep, showTitle, showDescription, state, tk, sz, textAlign }: StepContentProps) {
  const titleColor = getTitleColor(state, tk);
  const stepColor  = state === 'pending' ? tk.stepPending  : tk.stepDefault;
  const descColor  = state === 'pending' ? tk.descPending  : tk.descDefault;

  return (
    <div style={{ textAlign }}>
      {showStep && item.step && (
        <span style={{ display: 'block', fontSize: sz.stepFontSize, color: stepColor, lineHeight: '1.3' }}>
          {item.step}
        </span>
      )}
      {showTitle && (
        <span style={{ display: 'block', fontSize: sz.titleFontSize, fontWeight: 600, color: titleColor, lineHeight: '1.4' }}>
          {item.title}
        </span>
      )}
      {showDescription && item.description && (
        <span style={{ display: 'block', fontSize: sz.descFontSize, color: descColor, lineHeight: '1.5', marginTop: sz.contentGap }}>
          {item.description}
        </span>
      )}
    </div>
  );
}

// ─── Shared connector helper ──────────────────────────────────────────────────

function HConnector({ sz, tk, filled }: { sz: SizeToken; tk: TokenSet; filled: boolean }) {
  return (
    <div
      aria-hidden
      className="flex-1 shrink"
      style={{
        position:    'relative',
        height:      sz.connectorThick,
        marginTop:   sz.circleSize / 2 - sz.connectorThick / 2,
        marginLeft:  sz.hGap,
        marginRight: sz.hGap,
        minWidth:    16,
        backgroundColor: tk.connectorDefault,
        borderRadius:    sz.connectorThick,
        overflow:    'hidden',
      }}
    >
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: filled ? '100%' : '0%' }}
        transition={{ duration: parseFloat(motionTokens.duration.deliberate) / 1000, ease: motionTokens.easing.framer.easeOut }}
        style={{ position: 'absolute', inset: 0, backgroundColor: tk.connectorCompleted, borderRadius: sz.connectorThick }}
      />
    </div>
  );
}

// ─── Horizontal Stepper ───────────────────────────────────────────────────────

function HorizontalStepper({
  steps, activeStep = 0, position = 'center',
  showStep = true, showTitle = true, showDescription = true,
  size = 'md', theme = 'light', onStepClick, ariaLabel, variant = 'number',
}: Omit<StepperProps, 'orientation' | 'className' | 'aria-label'> & { ariaLabel?: string }) {
  const tk = components.stepper.colour[theme];
  const sz = components.stepper.size[size];

  return (
    <nav aria-label={ariaLabel ?? 'Progress steps'}>
      <ol className="flex items-start w-full" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {steps.map((step, i) => {
          const state       = resolveState(i, activeStep, steps);
          const isLast      = i === steps.length - 1;
          const isCompleted = state === 'completed';
          const clickable   = Boolean(onStepClick) && (state === 'completed' || state === 'active');
          const nextState   = !isLast ? resolveState(i + 1, activeStep, steps) : null;
          const connFilled  = isCompleted || nextState === 'completed' || nextState === 'active';

          const circle = (
            <StepCircle stepNumber={i + 1} state={state} size={size} theme={theme}
              clickable={clickable} onClick={() => onStepClick?.(i)} title={step.title}
              variant={variant} icon={step.icon} />
          );
          const contentAlign = position === 'center' ? 'center' : position === 'right' ? 'right' : 'left';
          const content = (
            <StepContent item={step} showStep={showStep} showTitle={showTitle} showDescription={showDescription}
              state={state} tk={tk} sz={sz} textAlign={contentAlign} />
          );

          return (
            <React.Fragment key={i}>
              <li className="shrink-0" aria-current={state === 'active' ? 'step' : undefined}>
                <span className="sr-only">Step {i + 1} of {steps.length}: {step.title} ({state})</span>

                {/* Position: center — circle above text */}
                {position === 'center' && (
                  <div className="flex flex-col items-center">
                    {circle}
                    <div className="mt-2">{content}</div>
                  </div>
                )}

                {/* Position: left — circle left of text */}
                {position === 'left' && (
                  <div className="flex flex-row items-start" style={{ gap: sz.labelGap }}>
                    {circle}
                    <div>{content}</div>
                  </div>
                )}

                {/* Position: right — circle right of text */}
                {position === 'right' && (
                  <div className="flex flex-row items-start" style={{ gap: sz.labelGap }}>
                    <div>{content}</div>
                    {circle}
                  </div>
                )}
              </li>

              {!isLast && <HConnector sz={sz} tk={tk} filled={connFilled} />}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

// ─── Vertical Stepper ─────────────────────────────────────────────────────────

function VerticalStepper({
  steps, activeStep = 0, position = 'left',
  showStep = true, showTitle = true, showDescription = true,
  size = 'md', theme = 'light', onStepClick, ariaLabel, variant = 'number',
}: Omit<StepperProps, 'orientation' | 'className' | 'aria-label'> & { ariaLabel?: string }) {
  const tk          = components.stepper.colour[theme];
  const sz          = components.stepper.size[size];
  const circleHalf  = sz.circleSize / 2;
  const vPadding    = sz.vGap + circleHalf;

  return (
    <nav aria-label={ariaLabel ?? 'Progress steps'}>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {steps.map((step, i) => {
          const state       = resolveState(i, activeStep, steps);
          const isLast      = i === steps.length - 1;
          const isCompleted = state === 'completed';
          const clickable   = Boolean(onStepClick) && (state === 'completed' || state === 'active');
          const nextState   = !isLast ? resolveState(i + 1, activeStep, steps) : null;
          const connFilled  = isCompleted || nextState === 'completed' || nextState === 'active';

          // Connector: absolute, centered under the circle
          const connStyle: React.CSSProperties = {
            position:        'absolute',
            top:             sz.circleSize + 4,
            bottom:          0,
            width:           sz.connectorThick,
            backgroundColor: connFilled ? tk.connectorCompleted : tk.connectorDefault,
            borderRadius:    sz.connectorThick,
          };
          if (position === 'right') {
            connStyle.right = circleHalf - sz.connectorThick / 2;
          } else {
            // left or center — both place indicator on the left side
            connStyle.left = circleHalf - sz.connectorThick / 2;
          }

          const circle = (
            <StepCircle stepNumber={i + 1} state={state} size={size} theme={theme}
              clickable={clickable} onClick={() => onStepClick?.(i)} title={step.title}
              variant={variant} icon={step.icon} />
          );
          const contentAlign: React.CSSProperties['textAlign'] = position === 'right' ? 'right' : 'left';
          const content = (
            <StepContent item={step} showStep={showStep} showTitle={showTitle} showDescription={showDescription}
              state={state} tk={tk} sz={sz} textAlign={contentAlign} />
          );

          return (
            <li key={i} className="relative flex items-start" style={{ paddingBottom: isLast ? 0 : vPadding }}
                aria-current={state === 'active' ? 'step' : undefined}>
              <span className="sr-only">Step {i + 1} of {steps.length}: {step.title} ({state})</span>

              {/* Vertical connector */}
              {!isLast && <div aria-hidden className="transition-colors duration-moderate" style={connStyle} />}

              {/* Position: left (default) — circle on left, content on right */}
              {position !== 'right' && (
                <>
                  <div className="shrink-0">{circle}</div>
                  <div className="min-w-0" style={{ paddingLeft: sz.labelGap }}>{content}</div>
                </>
              )}

              {/* Position: right — content on left, circle on right */}
              {position === 'right' && (
                <>
                  <div className="min-w-0 flex-1" style={{ paddingRight: sz.labelGap }}>{content}</div>
                  <div className="shrink-0">{circle}</div>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ─── Stepper (main export) ────────────────────────────────────────────────────

function Stepper({
  steps,
  activeStep = 0,
  orientation = 'horizontal',
  position = 'center',
  showStep = true,
  showTitle = true,
  showDescription = true,
  size = 'md',
  theme = 'light',
  onStepClick,
  className,
  'aria-label': ariaLabel,
  variant = 'number',
}: StepperProps) {
  const shared = { steps, activeStep, position, showStep, showTitle, showDescription, size, theme, onStepClick, ariaLabel, variant };

  return (
    <div className={cn('w-full', className)}>
      {orientation === 'vertical'
        ? <VerticalStepper   {...shared} />
        : <HorizontalStepper {...shared} />
      }
    </div>
  );
}

Stepper.displayName = 'Stepper';

export { Stepper };
export default Stepper;
