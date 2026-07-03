import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StatusIndicator } from '../status-indicator';
import { components } from '@/lib/tokens';

describe('StatusIndicator', () => {
  // ── Primary: role="status" present and default label visible ─────────────────
  it('renders with default props — role="status" present, default label visible', () => {
    render(<StatusIndicator />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  // ── All five status types render without throwing ─────────────────────────────
  it.each(['success', 'warning', 'error', 'info', 'ai'] as const)(
    'renders status="%s" without throwing',
    (status) => {
      expect(() => render(<StatusIndicator status={status} label={status} />)).not.toThrow();
    }
  );

  // ── Renders value span when showValue=true ────────────────────────────────────
  it('renders value span when showValue=true containing value text', () => {
    render(<StatusIndicator showValue={true} value="42 active" />);
    expect(screen.getByText('42 active')).toBeInTheDocument();
  });

  // ── Does NOT render value span when showValue=false (default) ─────────────────
  it('does not render value span when showValue=false (default)', () => {
    render(<StatusIndicator value="should not appear" />);
    expect(screen.queryByText('should not appear')).not.toBeInTheDocument();
  });

  // ── Dot is aria-hidden={true} (decorative) ────────────────────────────────────
  it('dot span is aria-hidden={true}', () => {
    const { container } = render(<StatusIndicator />);
    const dot = container.querySelector('.rounded-full');
    expect(dot).toHaveAttribute('aria-hidden', 'true');
  });

  // ── Dark theme: label and value receive dark token colours ────────────────────
  it('applies dark theme label colour from tokens', () => {
    render(<StatusIndicator theme="dark" label="Dark label" />);
    const labelEl = screen.getByText('Dark label');
    expect(labelEl).toHaveStyle({ color: components.statusIndicator.label.dark });
  });

  it('applies dark theme value colour from tokens when showValue=true', () => {
    render(<StatusIndicator theme="dark" showValue={true} value="dark value" />);
    const valueEl = screen.getByText('dark value');
    expect(valueEl).toHaveStyle({ color: components.statusIndicator.value.dark });
  });

  // ── Renders gracefully when label is empty string ─────────────────────────────
  it('renders gracefully when label is empty string (falls back to status)', () => {
    render(<StatusIndicator status="info" label="" />);
    // Falls back to status name in both label span and aria-label
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'info');
  });

  // ── Forwards className to root element ───────────────────────────────────────
  it('forwards className to the root element', () => {
    const { container } = render(<StatusIndicator className="my-custom-class" />);
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  // ── A-2: aria-live + aria-atomic on root element ─────────────────────────────
  it('root element has aria-live="polite" and aria-atomic="true"', () => {
    const { container } = render(<StatusIndicator />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('aria-live', 'polite');
    expect(root).toHaveAttribute('aria-atomic', 'true');
  });

  // ── F-2: Truncation classes on label and value spans ──────────────────────────
  it('applies truncate class to label span', () => {
    render(<StatusIndicator label="A very long label text" />);
    expect(screen.getByText('A very long label text')).toHaveClass('truncate');
  });

  it('applies truncate class to value span when showValue=true', () => {
    render(<StatusIndicator showValue={true} value="A very long value text" />);
    expect(screen.getByText('A very long value text')).toHaveClass('truncate');
  });

  // ── F-1: Close button ─────────────────────────────────────────────────────────
  it('renders close button with aria-label="Dismiss" when closeButton=true', () => {
    render(<StatusIndicator closeButton />);
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('does not render close button when closeButton=false (default)', () => {
    render(<StatusIndicator />);
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<StatusIndicator closeButton onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── F-1: Action button ────────────────────────────────────────────────────────
  it('renders action button with provided actionLabel when action=true', () => {
    render(<StatusIndicator action actionLabel="View details" />);
    expect(screen.getByRole('button', { name: 'View details' })).toBeInTheDocument();
  });

  it('uses default actionLabel "Action" when none is provided', () => {
    render(<StatusIndicator action />);
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('does not render action button when action=false (default)', () => {
    render(<StatusIndicator />);
    expect(screen.queryByRole('button', { name: 'Action' })).not.toBeInTheDocument();
  });

  it('calls onAction when action button is clicked', () => {
    const onAction = vi.fn();
    render(<StatusIndicator action actionLabel="Retry" onAction={onAction} />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  // ── Token smoke-test: dot backgroundColor matches positive.background token ──
  // JSDOM normalises hex to rgb(), so we convert for comparison.
  it('dot backgroundColor matches componentTokens.statusIndicator.colour.positive.background', () => {
    const { container } = render(<StatusIndicator status="success" theme="light" />);
    const dot = container.querySelector('.rounded-full') as HTMLElement;
    // Parse the token hex (#RRGGBB) into the rgb(...) form JSDOM produces
    const hex = components.statusIndicator.colour.positive.light.background;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    expect(dot.style.backgroundColor).toBe(`rgb(${r}, ${g}, ${b})`);
  });
});
