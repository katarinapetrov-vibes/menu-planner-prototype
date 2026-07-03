import React from 'react';
import { cn } from './utils';
import { semantic } from '@/lib/tokens';

export interface ScrimProps {
  visible?: boolean;
  /**
   * Controls the token-resolved fill colour.
   * light → colour/foreground/default/primary (#242424) @ 48%  — Enterprise DS v3
   * dark  → colour/background/page/default     (#FFFFFF) @ 48%  — Enterprise DS v3
   */
  theme?: 'light' | 'dark';
  onClick?: () => void;
  className?: string;
}

const Scrim = React.forwardRef<HTMLDivElement, ScrimProps>(
  ({ visible = true, theme = 'light', onClick, className }, ref) => {
    if (!visible) return null;

    return (
      <div
        ref={ref}
        className={cn(
          // Full-screen fixed overlay — matches Figma 1440×1024 full-bleed spec
          'fixed inset-0 z-40',
          onClick && 'cursor-pointer',
          className
        )}
        style={{ backgroundColor: semantic.background.overlay[theme] }}
        aria-hidden="true"
        onClick={onClick}
      />
    );
  }
);

Scrim.displayName = 'Scrim';

export { Scrim };
export default Scrim;
