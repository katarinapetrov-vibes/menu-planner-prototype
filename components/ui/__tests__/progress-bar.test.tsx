import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressBar } from '../progress-bar';

describe('ProgressBar', () => {
  // ── Primary: linear determinate ─────────────────────────────────────────────
  it('renders with correct aria attributes for a determinate linear bar', () => {
    render(<ProgressBar value={60} aria-label="Upload progress" />);
    const bar = screen.getByRole('progressbar', { name: 'Upload progress' });
    expect(bar).toHaveAttribute('aria-valuenow', '60');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  // ── Shows label and percentage ───────────────────────────────────────────────
  it('renders label and percentage text', () => {
    render(<ProgressBar value={42} label="Uploading" showPercentage />);
    expect(screen.getByText('Uploading')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  // ── Edge case: value clamped at 0 ───────────────────────────────────────────
  it('clamps value below 0 to 0', () => {
    render(<ProgressBar value={-10} aria-label="test" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  // ── Edge case: value clamped at 100 ─────────────────────────────────────────
  it('clamps value above 100 to 100', () => {
    render(<ProgressBar value={150} aria-label="test" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  // ── Indeterminate: no aria-valuenow, aria-busy=true ─────────────────────────
  it('renders indeterminate state correctly', () => {
    render(<ProgressBar indeterminate aria-label="Loading" />);
    const bar = screen.getByRole('progressbar', { name: 'Loading' });
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveAttribute('aria-busy', 'true');
  });

  // ── Indeterminate: percentage hidden ────────────────────────────────────────
  it('hides percentage in indeterminate mode', () => {
    render(<ProgressBar indeterminate showPercentage label="Loading" />);
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });

  // ── Circular type ───────────────────────────────────────────────────────────
  it('renders circular progressbar with correct aria', () => {
    render(<ProgressBar type="circular" value={75} aria-label="Circular progress" />);
    const bar = screen.getByRole('progressbar', { name: 'Circular progress' });
    expect(bar).toHaveAttribute('aria-valuenow', '75');
  });

  // ── Circular shows center percentage ────────────────────────────────────────
  it('shows percentage inside circular progress', () => {
    render(<ProgressBar type="circular" value={33} showPercentage aria-label="test" />);
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  // ── Default aria-label fallback ─────────────────────────────────────────────
  it('falls back to label prop for aria-label', () => {
    render(<ProgressBar value={50} label="Saving" />);
    expect(screen.getByRole('progressbar', { name: 'Saving' })).toBeInTheDocument();
  });

  // ── Dark theme ───────────────────────────────────────────────────────────────
  it('renders without error with dark theme', () => {
    render(<ProgressBar value={50} theme="dark" aria-label="Dark progress" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  // ── Size variants ─────────────────────────────────────────────────────────────
  it('renders all size variants without error', () => {
    const { rerender } = render(<ProgressBar value={50} size="sm" aria-label="test" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    rerender(<ProgressBar value={50} size="md" aria-label="test" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    rerender(<ProgressBar value={50} size="lg" aria-label="test" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  // ── Circular indeterminate ────────────────────────────────────────────────────
  it('circular indeterminate has no aria-valuenow and has aria-busy', () => {
    render(<ProgressBar type="circular" indeterminate aria-label="Loading" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveAttribute('aria-busy', 'true');
  });

  // ── Explicit aria-label takes precedence over label ──────────────────────────
  it('aria-label prop takes precedence over label for ARIA name', () => {
    render(<ProgressBar value={50} label="Visible label" aria-label="Accessible name" />);
    expect(screen.getByRole('progressbar', { name: 'Accessible name' })).toBeInTheDocument();
  });

  // ── No label or aria-label fallback ──────────────────────────────────────────
  it('falls back to "Progress" when no label or aria-label provided', () => {
    render(<ProgressBar value={50} />);
    expect(screen.getByRole('progressbar', { name: 'Progress' })).toBeInTheDocument();
  });
});
