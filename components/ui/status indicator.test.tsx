import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusIndicator } from './status-indicator'

// ─── Primary use case ────────────────────────────────────────────────────────

describe('StatusIndicator — primary use case', () => {
  it('renders label text', () => {
    render(<StatusIndicator label="Live" />)
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('exposes role="status" for screen readers', () => {
    render(<StatusIndicator label="Live" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('hides the dot from the accessibility tree', () => {
    const { container } = render(<StatusIndicator label="Live" />)
    const dot = container.querySelector('[aria-hidden]')
    expect(dot).toBeInTheDocument()
  })
})

// ─── Value display ────────────────────────────────────────────────────────────

describe('StatusIndicator — showValue prop', () => {
  it('hides value text when showValue=false (default)', () => {
    render(<StatusIndicator label="Score" value="42" />)
    expect(screen.queryByText('42')).not.toBeInTheDocument()
  })

  it('renders value text when showValue=true', () => {
    render(<StatusIndicator label="Score" showValue value="42" />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders default placeholder "Value" when showValue=true and no value given', () => {
    render(<StatusIndicator label="Score" showValue />)
    expect(screen.getByText('Value')).toBeInTheDocument()
  })
})

// ─── Status variants ──────────────────────────────────────────────────────────

describe('StatusIndicator — status variants', () => {
  const variants = ['success', 'warning', 'error', 'info', 'ai'] as const

  variants.forEach((status) => {
    it(`renders without crashing for status="${status}"`, () => {
      render(<StatusIndicator status={status} label={status} />)
      expect(screen.getByText(status)).toBeInTheDocument()
    })
  })
})

// ─── Theme variants ───────────────────────────────────────────────────────────

describe('StatusIndicator — theme variants', () => {
  it('applies dark label colour via inline style in dark theme', () => {
    render(<StatusIndicator label="Dark" theme="dark" />)
    // dark label token = primitives.grey[100] = #FFFFFF
    expect(screen.getByText('Dark')).toHaveStyle({ color: 'rgb(255, 255, 255)' })
  })

  it('applies light label colour via inline style in light theme', () => {
    render(<StatusIndicator label="Light" theme="light" />)
    // light label token = semantic.foreground.default.primary.light = grey[800] = #242424
    expect(screen.getByText('Light')).toHaveStyle({ color: 'rgb(36, 36, 36)' })
  })
})

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('StatusIndicator — edge cases', () => {
  it('renders with an empty label without crashing', () => {
    const { container } = render(<StatusIndicator label="" />)
    // Container should still contain the dot and the (empty) label span
    expect(container.querySelector('[aria-hidden]')).toBeInTheDocument()
  })

  it('renders a very long label without crashing', () => {
    const longLabel = 'A'.repeat(300)
    render(<StatusIndicator label={longLabel} />)
    expect(screen.getByText(longLabel)).toBeInTheDocument()
  })

  it('passes extra className to the root element', () => {
    const { container } = render(
      <StatusIndicator label="Extra" className="my-custom-class" />,
    )
    expect(container.firstChild).toHaveClass('my-custom-class')
  })

  it('defaults to success status when no status prop is given', () => {
    const { container } = render(<StatusIndicator label="Default" />)
    const dot = container.querySelector('[aria-hidden]') as HTMLElement
    // success light token = statusIndicator.colour.positive.light.background = green[500] = #00A846
    expect(dot.style.backgroundColor).toBe('rgb(0, 168, 70)')
  })

  it('renders value with empty string without crashing', () => {
    render(<StatusIndicator label="Test" showValue value="" />)
    // The span is rendered but empty — no crash, no text
    expect(screen.queryByText('Value')).not.toBeInTheDocument()
  })
})
