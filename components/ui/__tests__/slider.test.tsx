import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Slider } from '../slider'
import { components } from '@/lib/tokens'

describe('Slider', () => {
  // ── Primary: renders a range input with correct ARIA attributes ───────────────
  it('renders a range input with default ARIA attributes', () => {
    render(<Slider aria-label="Volume" />)
    const input = screen.getByRole('slider')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'range')
    expect(input).toHaveAttribute('aria-valuemin', '0')
    expect(input).toHaveAttribute('aria-valuemax', '100')
    expect(input).toHaveAttribute('aria-valuenow', '40')  // defaultValue
  })

  // ── defaultValue drives initial aria-valuenow ─────────────────────────────────
  it('reflects defaultValue in aria-valuenow', () => {
    render(<Slider aria-label="Test" defaultValue={75} />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '75')
  })

  // ── Controlled value overrides internal state ─────────────────────────────────
  it('uses value prop in controlled mode', () => {
    render(<Slider aria-label="Test" value={60} min={0} max={100} />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '60')
  })

  // ── onChange fires with numeric value ─────────────────────────────────────────
  it('calls onChange with the new numeric value', () => {
    const handleChange = vi.fn()
    render(<Slider aria-label="Test" onChange={handleChange} />)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '55' } })
    expect(handleChange).toHaveBeenCalledWith(55)
  })

  // ── Label rendering ───────────────────────────────────────────────────────────
  it('renders the label element when label prop is provided', () => {
    render(<Slider label="Brightness" />)
    expect(screen.getByText('Brightness')).toBeInTheDocument()
  })

  it('does not render a label element when label is omitted', () => {
    render(<Slider aria-label="Test" />)
    expect(screen.queryByText('Brightness')).not.toBeInTheDocument()
  })

  // ── showPercent ───────────────────────────────────────────────────────────────
  it('shows the percent display when showPercent=true', () => {
    render(<Slider aria-label="Test" defaultValue={40} showPercent />)
    expect(screen.getByText('40%')).toBeInTheDocument()
  })

  it('does not render percent text when showPercent=false (default)', () => {
    render(<Slider aria-label="Test" defaultValue={40} />)
    expect(screen.queryByText('40%')).not.toBeInTheDocument()
  })

  // ── Disabled state ────────────────────────────────────────────────────────────
  it('renders input as disabled and sets aria-disabled when disabled=true', () => {
    render(<Slider aria-label="Test" disabled />)
    const input = screen.getByRole('slider')
    expect(input).toBeDisabled()
    expect(input).toHaveAttribute('aria-disabled', 'true')
  })

  it('does not set aria-disabled when disabled=false', () => {
    render(<Slider aria-label="Test" />)
    expect(screen.getByRole('slider')).not.toHaveAttribute('aria-disabled')
  })

  // ── Edge case: value clamped when above max ───────────────────────────────────
  it('clamps aria-valuenow to max when value exceeds max', () => {
    render(<Slider aria-label="Test" value={150} min={0} max={100} />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '100')
  })

  // ── Edge case: value clamped when below min ───────────────────────────────────
  it('clamps aria-valuenow to min when value is below min', () => {
    render(<Slider aria-label="Test" value={-10} min={0} max={100} />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '0')
  })

  // ── Edge case: min === max avoids NaN display ─────────────────────────────────
  it('renders without crashing when min equals max', () => {
    expect(() =>
      render(<Slider aria-label="Test" value={50} min={50} max={50} showPercent />)
    ).not.toThrow()
  })

  // ── className forwarding ──────────────────────────────────────────────────────
  it('forwards className to the root element', () => {
    const { container } = render(<Slider aria-label="Test" className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  // ── Token: label colour uses dark token in dark theme ─────────────────────────
  it('applies dark-theme label colour from tokens', () => {
    render(<Slider label="Dark label" theme="dark" />)
    const labelEl = screen.getByText('Dark label')
    expect(labelEl).toHaveStyle({ color: components.slider.colour.dark.labelColor })
  })

  // ── Token: label colour uses light token in light theme ──────────────────────
  it('applies light-theme label colour from tokens', () => {
    render(<Slider label="Light label" theme="light" />)
    const labelEl = screen.getByText('Light label')
    expect(labelEl).toHaveStyle({ color: components.slider.colour.light.labelColor })
  })

  // ── Token: dark-mode trackFilled is lime, not forest green ───────────────────
  // Verifies the dark-mode fix — CSS var must carry green[400] not green[600]
  it('sets --slider-thumb-border CSS var to lime (green[400]) in dark theme', () => {
    render(<Slider aria-label="Test" theme="dark" />)
    const input = screen.getByRole('slider')
    expect(input.style.getPropertyValue('--slider-thumb-border')).toBe(
      components.slider.colour.dark.thumbBorder
    )
  })

  it('sets --slider-thumb-border CSS var to forest green (green[600]) in light theme', () => {
    render(<Slider aria-label="Test" theme="light" />)
    const input = screen.getByRole('slider')
    expect(input.style.getPropertyValue('--slider-thumb-border')).toBe(
      components.slider.colour.light.thumbBorder
    )
  })
})

describe('marks', () => {
  it('renders no tick labels when marks is omitted', () => {
    render(<Slider aria-label="Test" step={25} />)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
    expect(screen.queryByText('25')).not.toBeInTheDocument()
  })

  it('renders a tick label for each step when marks=true', () => {
    render(<Slider aria-label="Test" step={25} marks />)
    ;['0', '25', '50', '75', '100'].forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('renders correct tick labels for a custom range', () => {
    render(<Slider aria-label="Test" min={0} max={50} step={25} marks />)
    ;['0', '25', '50'].forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
    expect(screen.queryByText('75')).not.toBeInTheDocument()
  })

  it('always includes max as a tick even when step does not divide evenly', () => {
    render(<Slider aria-label="Test" min={0} max={100} step={30} marks />)
    // 0, 30, 60, 90 → last < 100 → also push 100
    expect(screen.getByText('100')).toBeInTheDocument()
  })
})
