import React from 'react';
import { cn } from './utils';
import { components } from '@/lib/tokens';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  style?: 'solid' | 'dashed';
  /** Background context — dark surface or light surface */
  shade?: 'light' | 'dark';
  /** Line/dot prominence: subtle → default → deep */
  weight?: 'subtle' | 'default' | 'deep';
  /** Size of dot or label text — sm=4px dot, md=8px dot, lg=12px dot (Figma ref) */
  size?: 'sm' | 'md' | 'lg';
  /** Text label centered in the divider (divider/text variant) */
  label?: string;
  /** Dot separator variant from divider/text (Figma: Ellipse #EEEEEE, 4–12px) */
  dot?: boolean;
  className?: string;
}

// All colour and size values sourced from components.divider in @/lib/tokens.
// Line and dot share the same colour map (components.divider.colour).
const { colour: lineColorMap, label: labelColorMap, dotSize: dotSizeMap, labelFontSize: labelFontSizeMap } = components.divider;

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      orientation = 'horizontal',
      style = 'solid',
      shade = 'light',
      weight = 'default',
      size = 'md',
      label,
      dot = false,
      className,
    },
    ref
  ) => {
    const isHorizontal = orientation === 'horizontal';
    const isDashed = style === 'dashed';

    const lineColor = lineColorMap[shade][weight];
    const dotColor = lineColorMap[shade][weight];
    const labelColor = labelColorMap[shade][weight];
    const dotSize = dotSizeMap[size];

    const lineStyle: React.CSSProperties = {
      borderColor: lineColor,
      borderStyle: isDashed ? 'dashed' : 'solid',
    };

    const hasCenterContent = label || dot;

    if (isHorizontal && hasCenterContent) {
      return (
        <div
          ref={ref}
          className={cn('flex items-center gap-3', className)}
          role="separator"
          aria-orientation="horizontal"
          aria-label={label}
        >
          <div className="flex-1 border-t" style={lineStyle} />

          {label ? (
            <span
              className="shrink-0 px-1 leading-none"
              style={{ color: labelColor, fontSize: labelFontSizeMap[size] }}
            >
              {label}
            </span>
          ) : (
            <span
              className="shrink-0 rounded-full"
              style={{ width: dotSize, height: dotSize, backgroundColor: dotColor, flexShrink: 0 }}
              aria-hidden
            />
          )}

          <div className="flex-1 border-t" style={lineStyle} />
        </div>
      );
    }

    if (isHorizontal) {
      return (
        <div
          ref={ref}
          className={cn('w-full border-t', className)}
          style={lineStyle}
          role="separator"
          aria-orientation="horizontal"
        />
      );
    }

    // Vertical
    return (
      <div
        ref={ref}
        className={cn('self-stretch border-l', className)}
        style={{ ...lineStyle, borderLeftStyle: isDashed ? 'dashed' : 'solid' }}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }
);

Divider.displayName = 'Divider';

export { Divider };
export default Divider;
