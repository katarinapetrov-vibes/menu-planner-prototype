import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Tooltip } from '../tooltip';
import type { TooltipPlacement, TooltipArrowPosition } from '../tooltip';
import { components } from '@/lib/tokens';

describe('Tooltip', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  // ── Primary: shows on hover after delay ─────────────────────────────────────
  it('shows tooltip content after default delay on mouseenter', async () => {
    render(
      <Tooltip content="Helpful hint">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByText('Hover me').closest('span')!);
    act(() => vi.advanceTimersByTime(200));

    expect(screen.getByRole('tooltip')).toHaveTextContent('Helpful hint');
  });

  // ── Hides on mouseleave ──────────────────────────────────────────────────────
  it('hides tooltip on mouseleave', async () => {
    render(
      <Tooltip content="Bye">
        <button>Trigger</button>
      </Tooltip>
    );
    const wrapper = screen.getByText('Trigger').closest('span')!;

    fireEvent.mouseEnter(wrapper);
    act(() => vi.advanceTimersByTime(200));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.mouseLeave(wrapper);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  // ── Shows on focus ───────────────────────────────────────────────────────────
  it('shows tooltip on focus', () => {
    render(
      <Tooltip content="Focus tip" delay={0}>
        <button>Focus me</button>
      </Tooltip>
    );
    const wrapper = screen.getByText('Focus me').closest('span')!;
    fireEvent.focus(wrapper);
    act(() => vi.advanceTimersByTime(10));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  // ── Hides on blur ────────────────────────────────────────────────────────────
  it('hides tooltip on blur', () => {
    render(
      <Tooltip content="Focus tip" delay={0}>
        <button>Focus me</button>
      </Tooltip>
    );
    const wrapper = screen.getByText('Focus me').closest('span')!;
    fireEvent.focus(wrapper);
    act(() => vi.advanceTimersByTime(10));
    fireEvent.blur(wrapper);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  // ── Does not show before delay ───────────────────────────────────────────────
  it('does not show before the delay elapses', () => {
    render(
      <Tooltip content="Late tip" delay={500}>
        <button>Slow</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(screen.getByText('Slow').closest('span')!);
    act(() => vi.advanceTimersByTime(100));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  // ── aria-describedby set when visible ───────────────────────────────────────
  it('sets aria-describedby on wrapper when tooltip is visible', () => {
    render(
      <Tooltip content="Described" delay={0}>
        <button>Target</button>
      </Tooltip>
    );
    const wrapper = screen.getByText('Target').closest('span')!;
    fireEvent.mouseEnter(wrapper);
    act(() => vi.advanceTimersByTime(10));

    const tooltipId = screen.getByRole('tooltip').getAttribute('id');
    expect(wrapper).toHaveAttribute('aria-describedby', tooltipId);
  });

  // ── Edge case: React node content ───────────────────────────────────────────
  it('renders React node as tooltip content', () => {
    render(
      <Tooltip content={<strong>Bold hint</strong>} delay={0}>
        <button>Rich</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(screen.getByText('Rich').closest('span')!);
    act(() => vi.advanceTimersByTime(10));
    expect(screen.getByRole('tooltip').querySelector('strong')).toBeInTheDocument();
  });

  // ── disabled — does not show tooltip ────────────────────────────────────────
  it('does not show tooltip when disabled', () => {
    render(
      <Tooltip content="Hidden" disabled>
        <button>T</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(screen.getByText('T').closest('span')!);
    act(() => vi.advanceTimersByTime(200));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  // ── disabled flips true while visible — hides tooltip ───────────────────────
  it('hides tooltip when disabled prop flips true while visible', () => {
    const { rerender } = render(
      <Tooltip content="Flip" delay={0} disabled={false}>
        <button>T</button>
      </Tooltip>
    );
    const wrapper = screen.getByText('T').closest('span')!;
    fireEvent.mouseEnter(wrapper);
    act(() => vi.advanceTimersByTime(10));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    rerender(
      <Tooltip content="Flip" delay={0} disabled={true}>
        <button>T</button>
      </Tooltip>
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  // ── Portal — tooltip renders in document.body, not inside trigger ────────────
  it('renders tooltip in document.body via portal, not inside trigger', () => {
    render(
      <Tooltip content="Portal tip" delay={0}>
        <button>Anchor</button>
      </Tooltip>
    );
    const wrapper = screen.getByText('Anchor').closest('span')!;
    fireEvent.mouseEnter(wrapper);
    act(() => vi.advanceTimersByTime(10));

    const tooltip = screen.getByRole('tooltip');
    expect(document.body.contains(tooltip)).toBe(true);
    expect(wrapper.contains(tooltip)).toBe(false);
  });

  // ── Light theme — applies light colour tokens ────────────────────────────────
  it('applies light colour tokens when theme="light"', () => {
    render(
      <Tooltip content="Light tip" theme="light" delay={0}>
        <button>Light</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(screen.getByText('Light').closest('span')!);
    act(() => vi.advanceTimersByTime(10));

    expect(screen.getByRole('tooltip')).toHaveStyle({
      backgroundColor: components.tooltip.colour.light.bg,
    });
  });

  // ── className forwarded to trigger wrapper ───────────────────────────────────
  it('forwards className to trigger wrapper span', () => {
    render(
      <Tooltip content="Class tip" className="my-custom-class">
        <button>Btn</button>
      </Tooltip>
    );
    expect(screen.getByText('Btn').closest('span')).toHaveClass('my-custom-class');
  });

  // ── Timer cancelled on early mouseleave ──────────────────────────────────────
  it('cancels show timer on early mouseleave', () => {
    render(
      <Tooltip content="Cancelled" delay={400}>
        <button>Slow</button>
      </Tooltip>
    );
    const wrapper = screen.getByText('Slow').closest('span')!;
    fireEvent.mouseEnter(wrapper);
    act(() => vi.advanceTimersByTime(200));
    fireEvent.mouseLeave(wrapper);
    act(() => vi.advanceTimersByTime(300));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  // ── Placement variants smoke test ────────────────────────────────────────────
  const placements: Array<[TooltipPlacement, TooltipArrowPosition]> = [
    ['top', 'start'],    ['top', 'center'],    ['top', 'end'],
    ['bottom', 'start'], ['bottom', 'center'], ['bottom', 'end'],
    ['left', 'start'],   ['left', 'center'],   ['left', 'end'],
    ['right', 'start'],  ['right', 'center'],  ['right', 'end'],
  ];

  it.each(placements)(
    'renders without error for placement=%s arrowPosition=%s',
    (placement, arrowPosition) => {
      render(
        <Tooltip content="Smoke" placement={placement} arrowPosition={arrowPosition} delay={0}>
          <button>T</button>
        </Tooltip>
      );
      fireEvent.mouseEnter(screen.getByText('T').closest('span')!);
      act(() => vi.advanceTimersByTime(10));
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    }
  );
});
