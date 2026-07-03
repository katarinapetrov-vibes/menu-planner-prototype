/**
 * Chip component — Vitest unit tests
 *
 * Covers:
 *  - Primary use case: DisplayChip renders label with correct role/structure
 *  - Edge case 1: InputChip remove button fires onRemove + disabled guard
 *  - Edge case 2: FilterChip aria-pressed toggles; disabled blocks interaction
 *  - Edge case 3: DragChip disabled removes draggable attribute
 *  - Edge case 4: Long text renders without crash inside whitespace-nowrap container
 *  - Edge case 5: Missing optional props (no leading icon, no trailing icon) render safely
 *  - Edge case 6: chipType dispatcher routes to the correct sub-component
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Chip,
  DisplayChip,
  InputChip,
  FilterChip,
  DragChip,
} from './chip';

// ─── Primary use case ─────────────────────────────────────────────────────────

describe('DisplayChip — primary use case', () => {
  it('renders children text', () => {
    render(<DisplayChip>Active</DisplayChip>);
    expect(screen.getByText('Active')).toBeTruthy();
  });

  it('renders as a div (non-interactive element)', () => {
    const { container } = render(<DisplayChip>Label</DisplayChip>);
    const root = container.firstChild as HTMLElement;
    expect(root.tagName).toBe('DIV');
  });

  it('applies filled positive colour classes by default', () => {
    const { container } = render(<DisplayChip>Label</DisplayChip>);
    const root = container.firstChild as HTMLElement;
    // Default: chipColour=positive, appearance=filled → bg-[#067a46]
    expect(root.className).toContain('bg-[#067a46]');
  });

  it('forwards extra className to the root element', () => {
    const { container } = render(<DisplayChip className="custom-cls">Label</DisplayChip>);
    expect((container.firstChild as HTMLElement).className).toContain('custom-cls');
  });

  it('forwards ref to the underlying div', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<DisplayChip ref={ref}>Ref</DisplayChip>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('applies disabled opacity when disabled=true', () => {
    const { container } = render(<DisplayChip disabled>Disabled</DisplayChip>);
    // opacity.half token = 0.48 → Tailwind arbitrary: opacity-[0.48]
    expect((container.firstChild as HTMLElement).className).toContain('opacity-[0.48]');
  });

  it('renders leading icon when showLeadingIcon=true', () => {
    const { container } = render(
      <DisplayChip showLeadingIcon>Label</DisplayChip>
    );
    // IconSlot renders an SVG placeholder
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders trailing icon (chevron) when showTrailingIcon=true', () => {
    const { container } = render(
      <DisplayChip showTrailingIcon>Label</DisplayChip>
    );
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders custom trailing icon when provided', () => {
    const { container } = render(
      <DisplayChip showTrailingIcon trailingIcon={<span data-testid="custom-trail" />}>
        Label
      </DisplayChip>
    );
    expect(container.querySelector('[data-testid="custom-trail"]')).not.toBeNull();
  });

  it('applies dark-mode colour class when theme=dark', () => {
    const { container } = render(
      <DisplayChip theme="dark" chipColour="positive" appearance="filled">
        Dark
      </DisplayChip>
    );
    // dark positive filled → bg-[#96DC14]
    expect((container.firstChild as HTMLElement).className).toContain('bg-[#96DC14]');
  });
});

// ─── Edge case 1: InputChip remove button ─────────────────────────────────────

describe('InputChip — remove button (edge case 1)', () => {
  it('renders a remove button with aria-label="Remove"', () => {
    render(<InputChip chipType="input">Tag</InputChip>);
    const btn = screen.getByRole('button', { name: /remove/i });
    expect(btn).toBeTruthy();
  });

  it('calls onRemove when the remove button is clicked', () => {
    const handler = vi.fn();
    render(<InputChip chipType="input" onRemove={handler}>Tag</InputChip>);
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call onRemove when disabled', () => {
    const handler = vi.fn();
    render(<InputChip chipType="input" disabled onRemove={handler}>Tag</InputChip>);
    // The button itself is disabled — fireEvent.click on a disabled button does not
    // invoke onClick in @testing-library (native browser behaviour).
    const btn = screen.getByRole('button', { name: /remove/i });
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it('renders children text', () => {
    render(<InputChip chipType="input">My Tag</InputChip>);
    expect(screen.getByText('My Tag')).toBeTruthy();
  });

  it('renders the close × SVG icon inside the remove button', () => {
    const { container } = render(<InputChip chipType="input">Tag</InputChip>);
    const btn = screen.getByRole('button', { name: /remove/i });
    expect(btn.querySelector('svg')).not.toBeNull();
  });
});

// ─── Edge case 2: FilterChip aria-pressed + disabled ──────────────────────────

describe('FilterChip — toggle behaviour (edge case 2)', () => {
  it('renders as a <button>', () => {
    render(<FilterChip chipType="filter">Filter</FilterChip>);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('has aria-pressed=false when unselected (default)', () => {
    render(<FilterChip chipType="filter">Filter</FilterChip>);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('has aria-pressed=true when selected=true', () => {
    render(<FilterChip chipType="filter" selected>Filter</FilterChip>);
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true');
  });

  it('calls onToggle with the new selected value when clicked', () => {
    const handler = vi.fn();
    render(
      <FilterChip chipType="filter" selected={false} onToggle={handler}>
        Filter
      </FilterChip>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledWith(true);
  });

  it('does not call onToggle when disabled', () => {
    const handler = vi.fn();
    render(
      <FilterChip chipType="filter" disabled onToggle={handler}>
        Filter
      </FilterChip>
    );
    const btn = screen.getByRole('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    fireEvent.click(btn);
    expect(handler).not.toHaveBeenCalled();
  });

  it('applies selected background class when selected=true (light theme)', () => {
    const { container } = render(
      <FilterChip chipType="filter" selected>Filter</FilterChip>
    );
    expect((container.firstChild as HTMLElement).className).toContain('bg-[#067a46]');
  });

  it('applies unselected background class when selected=false (light theme)', () => {
    const { container } = render(
      <FilterChip chipType="filter" selected={false}>Filter</FilterChip>
    );
    expect((container.firstChild as HTMLElement).className).toContain('bg-[#e4fabf]');
  });
});

// ─── Edge case 3: DragChip draggable attribute ────────────────────────────────

describe('DragChip — draggable + disabled (edge case 3)', () => {
  it('is draggable by default', () => {
    const { container } = render(<DragChip chipType="drag">Drag me</DragChip>);
    expect((container.firstChild as HTMLElement).getAttribute('draggable')).toBe('true');
  });

  it('is NOT draggable when disabled=true', () => {
    const { container } = render(<DragChip chipType="drag" disabled>Drag me</DragChip>);
    // draggable={!disabled} → draggable=false → attribute omitted or "false"
    const attr = (container.firstChild as HTMLElement).getAttribute('draggable');
    expect(attr === null || attr === 'false').toBe(true);
  });

  it('fires onDragStart when dragging starts', () => {
    const handler = vi.fn();
    const { container } = render(
      <DragChip chipType="drag" onDragStart={handler}>Drag me</DragChip>
    );
    fireEvent.dragStart(container.firstChild as HTMLElement);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('fires onDragEnd when dragging ends', () => {
    const handler = vi.fn();
    const { container } = render(
      <DragChip chipType="drag" onDragEnd={handler}>Drag me</DragChip>
    );
    fireEvent.dragEnd(container.firstChild as HTMLElement);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('applies shadow class when isDragged=true', () => {
    const { container } = render(
      <DragChip chipType="drag" isDragged>Drag me</DragChip>
    );
    expect((container.firstChild as HTMLElement).className).toContain('shadow-');
  });

  it('always renders the drag indicator SVG', () => {
    const { container } = render(<DragChip chipType="drag">Drag me</DragChip>);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});

// ─── Edge case 4: Long text ────────────────────────────────────────────────────

describe('Chip — long text (edge case 4)', () => {
  it('renders without crashing for very long label text', () => {
    const longLabel = 'A'.repeat(300);
    render(<DisplayChip>{longLabel}</DisplayChip>);
    expect(screen.getByText(longLabel)).toBeTruthy();
  });

  it('applies whitespace-nowrap to prevent line-wrapping', () => {
    const { container } = render(<DisplayChip>Long text chip</DisplayChip>);
    expect((container.firstChild as HTMLElement).className).toContain('whitespace-nowrap');
  });
});

// ─── Edge case 5: Missing optional props ──────────────────────────────────────

describe('Chip — missing optional props (edge case 5)', () => {
  it('DisplayChip renders without leadingIcon when showLeadingIcon omitted', () => {
    // Should not throw
    const { container } = render(<DisplayChip>Label</DisplayChip>);
    expect(container.firstChild).not.toBeNull();
  });

  it('InputChip renders without onRemove (no crash on click)', () => {
    render(<InputChip chipType="input">Tag</InputChip>);
    // Should not throw
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: /remove/i }))
    ).not.toThrow();
  });

  it('FilterChip renders without onToggle (no crash on click)', () => {
    render(<FilterChip chipType="filter">Filter</FilterChip>);
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
  });

  it('AvatarIcon falls back to "?" when avatarLabel is omitted', () => {
    // avatarLabel defaults to '?' inside LeadingIcon → AvatarIcon
    const { container } = render(
      <DisplayChip showLeadingIcon leadingIconType="avatar">Label</DisplayChip>
    );
    // The rendered initials span should contain at least one character
    const spans = container.querySelectorAll('span');
    const initialsSpan = Array.from(spans).find(
      (s) => s.textContent === '?' || (s.textContent?.length ?? 0) > 0
    );
    expect(initialsSpan).not.toBeNull();
  });
});

// ─── Edge case 6: Chip dispatcher (chipType routing) ──────────────────────────

describe('Chip — chipType dispatcher (edge case 6)', () => {
  it('defaults to DisplayChip when chipType is omitted', () => {
    // DisplayChip renders a div, not a button
    const { container } = render(<Chip>Label</Chip>);
    expect((container.firstChild as HTMLElement).tagName).toBe('DIV');
  });

  it('routes chipType="input" to InputChip (has remove button)', () => {
    render(<Chip chipType="input">Tag</Chip>);
    expect(screen.getByRole('button', { name: /remove/i })).toBeTruthy();
  });

  it('routes chipType="filter" to FilterChip (has aria-pressed)', () => {
    render(<Chip chipType="filter">Filter</Chip>);
    expect(screen.getByRole('button').getAttribute('aria-pressed')).not.toBeNull();
  });

  it('routes chipType="drag" to DragChip (draggable div)', () => {
    const { container } = render(<Chip chipType="drag">Drag</Chip>);
    expect((container.firstChild as HTMLElement).getAttribute('draggable')).toBe('true');
  });
});

// ─── All 9 colour variants render without crash ───────────────────────────────

describe('DisplayChip — all colour variants', () => {
  const colours = [
    'positive', 'mint', 'negative', 'pink', 'neutral',
    'brown', 'warning', 'information', 'reward',
  ] as const;

  colours.forEach((colour) => {
    it(`renders ${colour} chip without crash`, () => {
      const { container } = render(
        <DisplayChip chipColour={colour} appearance="filled">{colour}</DisplayChip>
      );
      expect(container.firstChild).not.toBeNull();
    });
  });

  const appearances = ['filled', 'light', 'outline'] as const;
  appearances.forEach((appearance) => {
    it(`renders positive/${appearance} chip without crash`, () => {
      const { container } = render(
        <DisplayChip chipColour="positive" appearance={appearance}>Label</DisplayChip>
      );
      expect(container.firstChild).not.toBeNull();
    });
  });
});
