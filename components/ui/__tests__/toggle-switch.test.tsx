import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toggle } from '../toggle-switch';

describe('Toggle', () => {
  // ── Primary use case ────────────────────────────────────────────────────────
  it('renders unchecked by default and toggles on click', () => {
    const onChange = vi.fn();
    render(<Toggle label="Notifications" onChange={onChange} />);

    const btn = screen.getByRole('switch', { name: 'Notifications' });
    expect(btn).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(btn);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  // ── Controlled mode ──────────────────────────────────────────────────────────
  it('respects controlled checked prop', () => {
    const onChange = vi.fn();
    const { rerender } = render(<Toggle checked={false} onChange={onChange} />);

    const btn = screen.getByRole('switch');
    expect(btn).toHaveAttribute('aria-checked', 'false');

    rerender(<Toggle checked={true} onChange={onChange} />);
    expect(btn).toHaveAttribute('aria-checked', 'true');
  });

  // ── Disabled state ───────────────────────────────────────────────────────────
  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    render(<Toggle label="Muted" disabled onChange={onChange} />);

    const btn = screen.getByRole('switch', { name: 'Muted' });
    expect(btn).toBeDisabled();

    fireEvent.click(btn);
    expect(onChange).not.toHaveBeenCalled();
  });

  // ── Keyboard: Space toggles ──────────────────────────────────────────────────
  it('toggles on Space key press', () => {
    const onChange = vi.fn();
    render(<Toggle label="Email alerts" onChange={onChange} />);

    const btn = screen.getByRole('switch', { name: 'Email alerts' });
    fireEvent.keyDown(btn, { key: ' ' });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  // ── Keyboard: Enter toggles ──────────────────────────────────────────────────
  it('toggles on Enter key press', () => {
    const onChange = vi.fn();
    render(<Toggle label="Push alerts" onChange={onChange} />);

    const btn = screen.getByRole('switch', { name: 'Push alerts' });
    fireEvent.keyDown(btn, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  // ── Error state ──────────────────────────────────────────────────────────────
  it('renders aria-invalid when error=true', () => {
    render(<Toggle error label="Broken" />);
    const btn = screen.getByRole('switch', { name: 'Broken' });
    expect(btn).toHaveAttribute('aria-invalid', 'true');
  });

  // ── No label: aria-label required ───────────────────────────────────────────
  it('uses aria-label when no visible label', () => {
    render(<Toggle aria-label="Dark mode" />);
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeInTheDocument();
  });

  // ── defaultChecked uncontrolled ──────────────────────────────────────────────
  it('starts checked when defaultChecked=true', () => {
    render(<Toggle defaultChecked label="Start on" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  // ── Label position left ──────────────────────────────────────────────────────
  it('renders label on the left when labelPosition=left', () => {
    render(<Toggle label="Power" labelPosition="left" />);
    const label = screen.getByText('Power');
    expect(label).toBeInTheDocument();
  });

  // ── Density variants ─────────────────────────────────────────────────────────
  it('renders all density variants without error', () => {
    const { rerender } = render(<Toggle label="A" density="compact" />);
    expect(screen.getByRole('switch')).toBeInTheDocument();

    rerender(<Toggle label="A" density="default" />);
    expect(screen.getByRole('switch')).toBeInTheDocument();

    rerender(<Toggle label="A" density="comfortable" />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  // ── showLabel=false ───────────────────────────────────────────────────────────
  it('hides label text and uses aria-label when showLabel=false', () => {
    render(<Toggle label="Hidden label" showLabel={false} aria-label="Dark mode" />);
    expect(screen.queryByText('Hidden label')).not.toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeInTheDocument();
  });

  // ── Dark theme ───────────────────────────────────────────────────────────────
  it('renders without error with theme="dark"', () => {
    render(<Toggle label="Dark" theme="dark" />);
    expect(screen.getByRole('switch', { name: 'Dark' })).toBeInTheDocument();
  });

  // ── Label without id (implicit association) ──────────────────────────────────
  it('provides accessible name via implicit label when no id is given', () => {
    render(<Toggle label="Wi-Fi" />);
    // button is inside the <label>, so the label text becomes its accessible name
    expect(screen.getByRole('switch', { name: 'Wi-Fi' })).toBeInTheDocument();
  });
});
