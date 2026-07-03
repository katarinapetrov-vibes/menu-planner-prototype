'use client';

import React from 'react';
import { cn } from './utils';
import { typography, spacing } from '@/lib/tokens';

// ─── Color & Appearance Types ─────────────────────────────────────────────────
// 9 chipColour values + 3 appearance variants — exact from Figma node 47939:9999

export type ChipColour =
  | 'positive'
  | 'mint'
  | 'negative'
  | 'pink'
  | 'neutral'
  | 'brown'
  | 'warning'
  | 'information'
  | 'reward';

export type ChipAppearance = 'filled' | 'light' | 'outline';

export type ChipSize = 'sm' | 'md' | 'lg';

export type LeadingIconType = 'icon' | 'drag' | 'avatar';

// Exact hex values extracted from Figma API (node 47939:10168–10193) — light mode
const colourStyles: Record<ChipColour, Record<ChipAppearance, string>> = {
  positive: {
    filled:  'bg-[#067a46] text-white border-transparent',
    light:   'bg-[#e4fabf] text-[#067a46] border-transparent',
    outline: 'bg-transparent text-[#067a46] border-[#067a46]',
  },
  mint: {
    filled:  'bg-[#118c74] text-white border-transparent',
    light:   'bg-[#cbf5e6] text-[#118c74] border-transparent',
    outline: 'bg-transparent text-[#118c74] border-[#118c74]',
  },
  negative: {
    filled:  'bg-[#b30000] text-white border-transparent',
    light:   'bg-[#ffccca] text-[#b30000] border-transparent',
    outline: 'bg-transparent text-[#b30000] border-[#b30000]',
  },
  pink: {
    filled:  'bg-[#aa097d] text-white border-transparent',
    light:   'bg-[#efd1e0] text-[#aa097d] border-transparent',
    outline: 'bg-transparent text-[#aa097d] border-[#aa097d]',
  },
  neutral: {
    filled:  'bg-[#4b4b4b] text-white border-transparent',
    light:   'bg-[#e4e4e4] text-[#242424] border-transparent',
    outline: 'bg-transparent text-[#242424] border-[#4b4b4b]',
  },
  brown: {
    filled:  'bg-[#a97739] text-white border-transparent',
    light:   'bg-[#f5e4b5] text-[#a97739] border-transparent',
    outline: 'bg-transparent text-[#a97739] border-[#a97739]',
  },
  warning: {
    filled:  'bg-[#ce4500] text-white border-transparent',
    light:   'bg-[#ffdbac] text-[#ce4500] border-transparent',
    outline: 'bg-transparent text-[#ce4500] border-[#ce4500]',
  },
  information: {
    filled:  'bg-[#002aff] text-white border-transparent',
    light:   'bg-[#d3f6ff] text-[#002aff] border-transparent',
    outline: 'bg-transparent text-[#002aff] border-[#002aff]',
  },
  reward: {
    filled:  'bg-[#c6ae00] text-white border-transparent',
    light:   'bg-[#fffab2] text-[#c6ae00] border-transparent',
    outline: 'bg-transparent text-[#c6ae00] border-[#c6ae00]',
  },
};

// Dark mode tokens — exact values from Figma theme variable collection
// filled: colour/background/{colour}/defaultStrong (dark) + colour/foreground/{colour}/onColour (dark)
// light:  colour/background/{colour}/defaultSubtleDeep (dark) + colour/foreground/{colour}/default (dark)
// outline: colour/foreground/{colour}/default (dark) + colour/border/{colour}/default (dark)
const darkColourStyles: Record<ChipColour, Record<ChipAppearance, string>> = {
  positive: {
    filled:  'bg-[#96DC14] text-[#035624] border-transparent',
    light:   'bg-[#056835] text-[#96DC14] border-transparent',
    outline: 'bg-transparent text-[#96DC14] border-[#96DC14]',
  },
  mint: {
    filled:  'bg-[#54E1AC] text-[#006060] border-transparent',
    light:   'bg-[#09766A] text-[#54E1AC] border-transparent',
    outline: 'bg-transparent text-[#54E1AC] border-[#54E1AC]',
  },
  negative: {
    filled:  'bg-[#FE8680] text-[#7C0000] border-transparent',
    light:   'bg-[#970000] text-[#FE8680] border-transparent',
    outline: 'bg-transparent text-[#FE8680] border-[#FE8680]',
  },
  pink: {
    filled:  'bg-[#FF63AA] text-[#691069] border-transparent',
    light:   'bg-[#841484] text-[#FF63AA] border-transparent',
    outline: 'bg-transparent text-[#FF63AA] border-[#FF63AA]',
  },
  neutral: {
    filled:  'bg-[#BBBBBB] text-[#242424] border-transparent',
    light:   'bg-[#4B4B4B] text-[#E4E4E4] border-transparent',
    outline: 'bg-transparent text-[#E4E4E4] border-[#BBBBBB]',
  },
  brown: {
    filled:  'bg-[#E6C16A] text-[#5D3714] border-transparent',
    light:   'bg-[#75451A] text-[#E6C16A] border-transparent',
    outline: 'bg-transparent text-[#E6C16A] border-[#E6C16A]',
  },
  warning: {
    filled:  'bg-[#FF941A] text-[#7B2900] border-transparent',
    light:   'bg-[#A43700] text-[#FF941A] border-transparent',
    outline: 'bg-transparent text-[#FF941A] border-[#FF941A]',
  },
  information: {
    filled:  'bg-[#40BDF0] text-[#00178C] border-transparent',
    light:   'bg-[#001DB2] text-[#40BDF0] border-transparent',
    outline: 'bg-transparent text-[#40BDF0] border-[#40BDF0]',
  },
  reward: {
    filled:  'bg-[#FFE900] text-[#726100] border-transparent',
    light:   'bg-[#A48B00] text-[#FFE900] border-transparent',
    outline: 'bg-transparent text-[#FFE900] border-[#FFE900]',
  },
};

// ─── Base Styles ──────────────────────────────────────────────────────────────
// Figma: radius=40px, border=1px (transparent), Source Sans Pro 600
const chipBase =
  'inline-flex items-center rounded-[40px] border font-semibold whitespace-nowrap transition-colors duration-quick';

// ─── Size Tokens ──────────────────────────────────────────────────────────────
// Derived from Figma size variable collection (chip group in [StyleGuide] size Card)
// sm/md: same gap (gap/xs=4px) and icon (icon/sm=16px); differ in horizontal padding
// lg: larger gap (gap/sm=8px), icon (icon/md=20px), more horizontal padding
const sizeStyles: Record<ChipSize, { chip: string; fontSize: string; content: string; contentStyle: React.CSSProperties; icon: string }> = {
  sm: { chip: 'h-4 leading-4', fontSize: typography.fontSize.sm, content: 'flex items-center h-4', contentStyle: { paddingLeft: spacing[100], paddingRight: spacing[100], gap: spacing[100] }, icon: 'w-4 h-4' },
  md: { chip: 'h-5 leading-5', fontSize: typography.fontSize.sm, content: 'flex items-center h-5', contentStyle: { paddingLeft: spacing[200], paddingRight: spacing[200], gap: spacing[100] }, icon: 'w-4 h-4' },
  lg: { chip: 'h-6 leading-6', fontSize: typography.fontSize.sm, content: 'flex items-center h-6', contentStyle: { paddingLeft: spacing[300], paddingRight: spacing[300], gap: spacing[200] }, icon: 'w-5 h-5' },
};

// ─── Icons ────────────────────────────────────────────────────────────────────

// Action=Dropdown (Material/chevron_arrow_down) — default trailing icon
function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Action=Close (Material/close) — trailing icon for inputChip
function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Content=Drag (Material/drag_indicator) — leading icon for dragChip
function DragIndicatorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}

// Content=Avatar — 16×16 circle with initials
// bg: colour/background/positive/defaultStrong (light #067a46 / dark #96DC14)
// text: colour/foreground/positive/onColour (light white / dark #035624)
function AvatarIcon({ label, theme = 'light' }: { label: string; theme?: ChipTheme }) {
  const bg  = theme === 'dark' ? '#96DC14' : '#067a46';
  const txt = theme === 'dark' ? '#035624' : '#FFFFFF';
  return (
    <span
      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
      style={{ backgroundColor: bg }}
      aria-hidden
    >
      <span
        className="font-bold leading-none"
        style={{ fontSize: typography.fontSize.sm, fontFamily: typography.fontFamily.body, color: txt }}
      >
        {label.slice(0, 2).toUpperCase()}
      </span>
    </span>
  );
}

// Content=Icon — generic icon slot; renders custom icon or a placeholder
function IconSlot({ icon }: { icon?: React.ReactNode }) {
  if (icon) return <>{icon}</>;
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="12" height="12" rx="2" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

// ─── Prop Interfaces ──────────────────────────────────────────────────────────

export type ChipTheme = 'light' | 'dark';

interface SharedProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  theme?: ChipTheme;
  size?: ChipSize;
}

// displayChip — base read-only chip
export interface DisplayChipProps extends SharedProps {
  chipType?: 'display';
  chipColour?: ChipColour;
  appearance?: ChipAppearance;
  showLeadingIcon?: boolean;
  leadingIconType?: LeadingIconType;
  leadingIcon?: React.ReactNode;
  avatarLabel?: string;
  showTrailingIcon?: boolean;
  trailingIcon?: React.ReactNode;
}

// inputChip — always shows close (×) button; used for removable tags
export interface InputChipProps extends SharedProps {
  chipType: 'input';
  chipColour?: ChipColour;
  appearance?: ChipAppearance;
  showLeadingIcon?: boolean;
  leadingIconType?: LeadingIconType;
  leadingIcon?: React.ReactNode;
  avatarLabel?: string;
  onRemove?: () => void;
}

// filterChip — toggle chip; Selected=True (#067a46 filled), Selected=False (#e4fabf light)
export interface FilterChipProps extends SharedProps {
  chipType: 'filter';
  selected?: boolean;
  onToggle?: (selected: boolean) => void;
  showLeadingIcon?: boolean;
  leadingIconType?: LeadingIconType;
  leadingIcon?: React.ReactNode;
  avatarLabel?: string;
}

// dragChip — always neutral (#e4e4e4 / #242424); isDragged for active-drag visual state
export interface DragChipProps extends SharedProps {
  chipType: 'drag';
  isDragged?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export type ChipProps =
  | DisplayChipProps
  | InputChipProps
  | FilterChipProps
  | DragChipProps;

// ─── Leading Icon Renderer ────────────────────────────────────────────────────

function LeadingIcon({
  type = 'icon',
  icon,
  avatarLabel,
  iconClass = 'w-4 h-4',
  theme = 'light',
}: {
  type?: LeadingIconType;
  icon?: React.ReactNode;
  avatarLabel?: string;
  iconClass?: string;
  theme?: ChipTheme;
}) {
  return (
    <span className={cn('flex items-center shrink-0', iconClass)}>
      {type === 'avatar' ? (
        <AvatarIcon label={avatarLabel ?? '?'} theme={theme} />
      ) : type === 'drag' ? (
        <DragIndicatorIcon />
      ) : (
        <IconSlot icon={icon} />
      )}
    </span>
  );
}

// ─── DisplayChip ──────────────────────────────────────────────────────────────

const DisplayChip = React.forwardRef<HTMLDivElement, DisplayChipProps>(
  (
    {
      chipColour = 'positive',
      appearance = 'filled',
      showLeadingIcon = false,
      leadingIconType = 'icon',
      leadingIcon,
      avatarLabel,
      showTrailingIcon = false,
      trailingIcon,
      disabled = false,
      theme = 'light',
      size = 'md',
      children,
      className,
    },
    ref
  ) => {
    const styles = theme === 'dark' ? darkColourStyles : colourStyles;
    const sz = sizeStyles[size];
    return (
    <div
      ref={ref}
      className={cn(
        chipBase,
        sz.chip,
        styles[chipColour][appearance],
        disabled && 'opacity-[0.48] cursor-not-allowed',
        className
      )}
      style={{ fontSize: sz.fontSize, fontFamily: typography.fontFamily.body }}
    >
      <div className={sz.content} style={sz.contentStyle}>
        {showLeadingIcon && (
          <LeadingIcon type={leadingIconType} icon={leadingIcon} avatarLabel={avatarLabel} iconClass={sz.icon} theme={theme} />
        )}
        <span>{children}</span>
        {showTrailingIcon && (
          <span className={cn('flex items-center shrink-0', sz.icon)}>
            {trailingIcon ?? <ChevronDownIcon />}
          </span>
        )}
      </div>
    </div>
    );
  }
);
DisplayChip.displayName = 'DisplayChip';

// ─── InputChip ────────────────────────────────────────────────────────────────

const InputChip = React.forwardRef<HTMLDivElement, InputChipProps>(
  (
    {
      chipColour = 'positive',
      appearance = 'filled',
      showLeadingIcon = false,
      leadingIconType = 'icon',
      leadingIcon,
      avatarLabel,
      onRemove,
      disabled = false,
      theme = 'light',
      size = 'md',
      children,
      className,
    },
    ref
  ) => {
    const styles = theme === 'dark' ? darkColourStyles : colourStyles;
    const sz = sizeStyles[size];
    return (
    <div
      ref={ref}
      className={cn(
        chipBase,
        sz.chip,
        styles[chipColour][appearance],
        disabled && 'opacity-[0.48] cursor-not-allowed',
        className
      )}
      style={{ fontSize: sz.fontSize, fontFamily: typography.fontFamily.body }}
    >
      <div className={sz.content} style={sz.contentStyle}>
        {showLeadingIcon && (
          <LeadingIcon type={leadingIconType} icon={leadingIcon} avatarLabel={avatarLabel} iconClass={sz.icon} theme={theme} />
        )}
        <span>{children}</span>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className={cn('flex items-center shrink-0 hover:opacity-80 transition-opacity focus:outline-none', sz.icon)}
          aria-label="Remove"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
    );
  }
);
InputChip.displayName = 'InputChip';

// ─── FilterChip ───────────────────────────────────────────────────────────────
// Selected=True:  bg=#067a46 text=#ffffff (Figma node 47939:10215)
// Selected=False: bg=#e4fabf text=#067a46 (Figma node 47939:10217)

const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  (
    {
      selected = false,
      onToggle,
      showLeadingIcon = false,
      leadingIconType = 'icon',
      leadingIcon,
      avatarLabel,
      disabled = false,
      theme = 'light',
      size = 'md',
      children,
      className,
    },
    ref
  ) => {
    const selectedCls = theme === 'dark'
      ? 'bg-[#96DC14] text-[#035624] border-transparent'
      : 'bg-[#067a46] text-white border-transparent';
    const unselectedCls = theme === 'dark'
      ? 'bg-[#056835] text-[#96DC14] border-transparent'
      : 'bg-[#e4fabf] text-[#067a46] border-transparent';
    const sz = sizeStyles[size];
    return (
    <button
      ref={ref}
      type="button"
      onClick={() => !disabled && onToggle?.(!selected)}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        chipBase,
        sz.chip,
        selected ? selectedCls : unselectedCls,
        'cursor-pointer hover:opacity-85',
        disabled && 'opacity-[0.48] cursor-not-allowed',
        className
      )}
      style={{ fontSize: sz.fontSize, fontFamily: typography.fontFamily.body }}
    >
      <div className={sz.content} style={sz.contentStyle}>
        {showLeadingIcon && (
          <LeadingIcon type={leadingIconType} icon={leadingIcon} avatarLabel={avatarLabel} iconClass={sz.icon} theme={theme} />
        )}
        <span>{children}</span>
      </div>
    </button>
    );
  }
);
FilterChip.displayName = 'FilterChip';

// ─── DragChip ─────────────────────────────────────────────────────────────────
// Always neutral: bg=#e4e4e4, text=#242424 (Figma nodes 47939:10220, 47939:10222)
// Always shows drag indicator as leading icon (Show Leading Icon = true in Figma)

const DragChip = React.forwardRef<HTMLDivElement, DragChipProps>(
  (
    {
      isDragged = false,
      onDragStart,
      onDragEnd,
      disabled = false,
      theme = 'light',
      size = 'md',
      children,
      className,
    },
    ref
  ) => {
    const dragCls = theme === 'dark'
      ? 'bg-[#4B4B4B] text-[#E4E4E4] border-transparent'
      : 'bg-[#e4e4e4] text-[#242424] border-transparent';
    const sz = sizeStyles[size];
    return (
    <div
      ref={ref}
      draggable={!disabled}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        chipBase,
        sz.chip,
        dragCls,
        'cursor-grab active:cursor-grabbing',
        isDragged && 'shadow-[0px_8px_8px_rgba(36,36,36,0.16)] opacity-90',
        disabled && 'opacity-[0.48] cursor-not-allowed',
        className
      )}
      style={{ fontSize: sz.fontSize, fontFamily: typography.fontFamily.body }}
    >
      <div className={sz.content} style={sz.contentStyle}>
        <span className={cn('flex items-center shrink-0', sz.icon)}>
          <DragIndicatorIcon />
        </span>
        <span>{children}</span>
      </div>
    </div>
    );
  }
);
DragChip.displayName = 'DragChip';

// ─── Chip (main export) ───────────────────────────────────────────────────────

function Chip(props: ChipProps) {
  switch (props.chipType) {
    case 'input':
      return <InputChip {...props} />;
    case 'filter':
      return <FilterChip {...props} />;
    case 'drag':
      return <DragChip {...props} />;
    default:
      return <DisplayChip {...(props as DisplayChipProps)} />;
  }
}

Chip.displayName = 'Chip';

export { Chip, DisplayChip, InputChip, FilterChip, DragChip };
export default Chip;
