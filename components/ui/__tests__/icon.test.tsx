import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IconRoot } from '../icons/icon';

describe('IconRoot', () => {
  // ── Primary: renders SVG with correct dimensions ─────────────────────────────
  it('renders an SVG with the correct size attributes', () => {
    const { container } = render(<IconRoot size={24} />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  // ── Default aria-hidden=true ─────────────────────────────────────────────────
  it('is aria-hidden by default (decorative)', () => {
    const { container } = render(<IconRoot />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  // ── aria-hidden=false for meaningful icons ───────────────────────────────────
  it('exposes aria-hidden=false when set explicitly', () => {
    const { container } = render(<IconRoot aria-hidden={false} />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'false');
  });

  // ── Size map: all valid sizes render correct Tailwind classes ────────────────
  it.each([
    [16, 'w-4 h-4'],
    [20, 'w-5 h-5'],
    [24, 'w-6 h-6'],
    [32, 'w-8 h-8'],
  ] as const)('size=%i gets class "%s"', (size, expectedClass) => {
    const { container } = render(<IconRoot size={size} />);
    const svg = container.querySelector('svg')!;
    expectedClass.split(' ').forEach(cls => expect(svg).toHaveClass(cls));
  });

  // ── Custom className is merged ───────────────────────────────────────────────
  it('merges custom className onto the SVG', () => {
    const { container } = render(<IconRoot className="text-red-500" />);
    expect(container.querySelector('svg')).toHaveClass('text-red-500');
  });

  // ── Edge case: viewBox is always 0 0 24 24 regardless of size ────────────────
  // This is a known issue flagged in the QA audit — viewBox should adapt to icon size.
  it('has viewBox 0 0 24 24 (fixed) regardless of size', () => {
    const { container } = render(<IconRoot size={16} />);
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 24 24');
  });

  // ── Children render inside SVG ───────────────────────────────────────────────
  it('renders children inside the SVG', () => {
    const { container } = render(
      <IconRoot>
        <circle cx="12" cy="12" r="5" data-testid="circle" />
      </IconRoot>
    );
    expect(container.querySelector('[data-testid="circle"]')).toBeInTheDocument();
  });

  // ── focusable=false prevents ghost tab stop ──────────────────────────────────
  it('has focusable="false" to prevent keyboard focus in legacy browsers', () => {
    const { container } = render(<IconRoot />);
    expect(container.querySelector('svg')).toHaveAttribute('focusable', 'false');
  });

  // ── role=img set for meaningful icons ────────────────────────────────────────
  it('sets role="img" when aria-hidden is false', () => {
    const { container } = render(<IconRoot aria-hidden={false} aria-label="Close" />);
    expect(container.querySelector('svg')).toHaveAttribute('role', 'img');
  });

  // ── role is absent for decorative icons ──────────────────────────────────────
  it('has no role attribute when decorative (aria-hidden=true)', () => {
    const { container } = render(<IconRoot />);
    expect(container.querySelector('svg')).not.toHaveAttribute('role');
  });

  // ── <title> renders inside SVG for meaningful icons with title prop ──────────
  it('renders <title> element when meaningful and title prop provided', () => {
    const { container } = render(
      <IconRoot aria-hidden={false} title="Settings">
        <circle cx="12" cy="12" r="5" />
      </IconRoot>
    );
    expect(container.querySelector('title')).toHaveTextContent('Settings');
  });

  // ── <title> is absent for decorative icons ───────────────────────────────────
  it('does not render <title> for decorative icons', () => {
    const { container } = render(<IconRoot title="Should be hidden" />);
    expect(container.querySelector('title')).not.toBeInTheDocument();
  });

  // ── dev warning when meaningful icon has no label ────────────────────────────
  it('warns in dev when aria-hidden=false but no aria-label or title', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<IconRoot aria-hidden={false} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no aria-label or title'));
    warn.mockRestore();
  });
});
