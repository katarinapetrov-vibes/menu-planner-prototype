/**
 * Snackbar component — Vitest unit tests
 *
 * Covers:
 *  - Primary use case: renders with message, correct role, and live region
 *  - Edge case 1: `open={false}` hides the snackbar entirely
 *  - Edge case 2: empty content (neither message nor description) renders without crash
 *  - Edge case 3: extremely long message text is contained without breaking layout
 *  - Edge case 4: autoHideDuration triggers onClose after the specified delay
 *  - Edge case 5: action button calls action.onClick then onClose
 *  - Edge case 6: close button calls onDismiss and onClose
 *  - Edge case 7: showIcon=false hides the leading icon
 *  - Edge case 8: all five type variants render without crash
 *  - Edge case 9: open→close transition sets exiting state, then unmounts after 200 ms
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Snackbar } from './snackbar'

// ─── helpers ──────────────────────────────────────────────────────────────────

function renderSnackbar(props: Partial<React.ComponentProps<typeof Snackbar>> = {}) {
  return render(
    <Snackbar
      open={true}
      message="File saved successfully"
      {...props}
    />
  )
}

// ─── Primary use case ─────────────────────────────────────────────────────────

describe('Snackbar — primary use case', () => {
  it('renders the message text when open=true', () => {
    renderSnackbar()
    expect(screen.getByText('File saved successfully')).toBeTruthy()
  })

  it('has role="status" for live-region announcement (non-error types)', () => {
    const { container } = renderSnackbar({ type: 'info' })
    const el = container.querySelector('[role="status"]')
    expect(el).not.toBeNull()
  })

  it('has aria-live="polite" on the live region for non-error types', () => {
    const { container } = renderSnackbar({ type: 'info' })
    const el = container.querySelector('[aria-live="polite"]')
    expect(el).not.toBeNull()
  })

  it('has role="alert" for error type', () => {
    const { container } = renderSnackbar({ type: 'error' })
    const el = container.querySelector('[role="alert"]')
    expect(el).not.toBeNull()
  })

  it('has aria-live="assertive" for error type', () => {
    const { container } = renderSnackbar({ type: 'error' })
    const el = container.querySelector('[aria-live="assertive"]')
    expect(el).not.toBeNull()
  })

  it('has aria-atomic="true" on the live region', () => {
    const { container } = renderSnackbar()
    const el = container.querySelector('[aria-atomic="true"]')
    expect(el).not.toBeNull()
  })

  it('renders the description when provided', () => {
    renderSnackbar({ description: 'Your changes have been stored.' })
    expect(screen.getByText('Your changes have been stored.')).toBeTruthy()
  })
})

// ─── Edge case 1: open=false ──────────────────────────────────────────────────

describe('Snackbar — open=false (edge case 1)', () => {
  it('renders nothing when open is initially false', () => {
    const { container } = render(
      <Snackbar open={false} message="Should not appear" />
    )
    expect(container.firstChild).toBeNull()
  })
})

// ─── Edge case 2: empty content ───────────────────────────────────────────────

describe('Snackbar — empty content (edge case 2)', () => {
  it('renders without crash when neither message nor description is provided', () => {
    // message is required by types, but verify runtime safety with empty string
    const { container } = renderSnackbar({ message: '', description: undefined })
    // The live region wrapper should still be present
    expect(container.querySelector('[role="status"]')).not.toBeNull()
  })

  it('renders without crash when showIcon=false and no action/close', () => {
    const { container } = renderSnackbar({
      showIcon: false,
      showCloseButton: false,
      action: undefined,
    })
    expect(container.querySelector('[role="status"]')).not.toBeNull()
  })
})

// ─── Edge case 3: long message text ───────────────────────────────────────────

describe('Snackbar — long message text (edge case 3)', () => {
  it('renders extremely long message without crashing', () => {
    const longMessage = 'A'.repeat(500)
    renderSnackbar({ message: longMessage })
    expect(screen.getByText(longMessage)).toBeTruthy()
  })

  it('renders extremely long description without crashing', () => {
    const longDesc = 'B'.repeat(500)
    renderSnackbar({ description: longDesc })
    expect(screen.getByText(longDesc)).toBeTruthy()
  })
})

// ─── Edge case 4: autoHideDuration ────────────────────────────────────────────

describe('Snackbar — autoHideDuration (edge case 4)', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('calls onClose after autoHideDuration ms', () => {
    const onClose = vi.fn()
    renderSnackbar({ autoHideDuration: 3000, onClose })
    expect(onClose).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(3000) })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose before the duration expires', () => {
    const onClose = vi.fn()
    renderSnackbar({ autoHideDuration: 3000, onClose })
    act(() => { vi.advanceTimersByTime(2999) })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not auto-close when autoHideDuration=0 (default)', () => {
    const onClose = vi.fn()
    renderSnackbar({ autoHideDuration: 0, onClose })
    act(() => { vi.advanceTimersByTime(60000) })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls the updated onClose when the prop changes mid-timer (stale closure fix)', () => {
    const staleOnClose = vi.fn()
    const freshOnClose = vi.fn()

    const { rerender } = render(
      <Snackbar open={true} message="Hello" autoHideDuration={3000} onClose={staleOnClose} />
    )

    // 1 s elapsed — original timer still running (2 s remaining)
    act(() => { vi.advanceTimersByTime(1000) })
    expect(staleOnClose).not.toHaveBeenCalled()
    expect(freshOnClose).not.toHaveBeenCalled()

    // Swap in a new onClose. Because handleClose is memoised with useCallback,
    // its reference changes, the autoHideDuration effect re-runs, clears the
    // old timer, and starts a fresh 3000 ms timer bound to freshOnClose.
    rerender(
      <Snackbar open={true} message="Hello" autoHideDuration={3000} onClose={freshOnClose} />
    )

    // Without the fix the stale timer would fire here (2 s after rerender = 3 s
    // from mount). With the fix the new timer has only run for 2 s — nothing fires.
    act(() => { vi.advanceTimersByTime(2000) })
    expect(staleOnClose).not.toHaveBeenCalled()  // stale closure was discarded
    expect(freshOnClose).not.toHaveBeenCalled()  // new timer still has 1 s left

    // Complete the new 3 s timer — only the fresh callback fires
    act(() => { vi.advanceTimersByTime(1000) })
    expect(freshOnClose).toHaveBeenCalledTimes(1)
    expect(staleOnClose).not.toHaveBeenCalled()
  })
})

// ─── Edge case 5: action button ───────────────────────────────────────────────

describe('Snackbar — action button (edge case 5)', () => {
  it('renders action button with the provided label', () => {
    renderSnackbar({ action: { label: 'Undo', onClick: vi.fn() } })
    expect(screen.getByRole('button', { name: /undo/i })).toBeTruthy()
  })

  it('calls action.onClick when action button is clicked', () => {
    const onClick = vi.fn()
    renderSnackbar({ action: { label: 'Undo', onClick } })
    fireEvent.click(screen.getByRole('button', { name: /undo/i }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when action button is clicked', () => {
    const onClose = vi.fn()
    renderSnackbar({
      action: { label: 'Undo', onClick: vi.fn() },
      onClose,
    })
    fireEvent.click(screen.getByRole('button', { name: /undo/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

// ─── Edge case 6: close button ────────────────────────────────────────────────

describe('Snackbar — close button (edge case 6)', () => {
  it('renders dismiss button when showCloseButton=true', () => {
    renderSnackbar({ showCloseButton: true })
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeTruthy()
  })

  it('does not render dismiss button by default (showCloseButton=false)', () => {
    renderSnackbar({ showCloseButton: false })
    expect(screen.queryByRole('button', { name: /dismiss/i })).toBeNull()
  })

  it('calls onDismiss when close button is clicked', () => {
    const onDismiss = vi.fn()
    renderSnackbar({ showCloseButton: true, onDismiss })
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    renderSnackbar({ showCloseButton: true, onClose })
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('close button has accessible aria-label="Dismiss"', () => {
    renderSnackbar({ showCloseButton: true })
    const btn = screen.getByRole('button', { name: /dismiss/i })
    expect(btn.getAttribute('aria-label')).toBe('Dismiss')
  })
})

// ─── Edge case 7: showIcon ────────────────────────────────────────────────────

describe('Snackbar — showIcon prop (edge case 7)', () => {
  it('renders an SVG icon by default (showIcon=true)', () => {
    const { container } = renderSnackbar({ showIcon: true })
    // The status icon is the first SVG inside the live region
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('does not render the leading SVG icon when showIcon=false', () => {
    const { container } = renderSnackbar({ showIcon: false, showCloseButton: false })
    // No SVGs at all when icon hidden and no close button
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBe(0)
  })
})

// ─── Edge case 8: all type variants ───────────────────────────────────────────

describe('Snackbar — type variants (edge case 8)', () => {
  const nonErrorTypes = ['success', 'warning', 'info', 'ai'] as const
  for (const type of nonErrorTypes) {
    it(`renders with role="status" for type="${type}"`, () => {
      const { container } = renderSnackbar({ type })
      expect(container.querySelector('[role="status"]')).not.toBeNull()
    })
  }

  it('renders with role="alert" for type="error"', () => {
    const { container } = renderSnackbar({ type: 'error' })
    expect(container.querySelector('[role="alert"]')).not.toBeNull()
  })
})

// ─── Edge case 9: open→close transition ───────────────────────────────────────

describe('Snackbar — open/close transition (edge case 9)', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('remains in the DOM during the 200 ms exit animation', () => {
    const { rerender, container } = renderSnackbar()
    expect(container.querySelector('[role="status"]')).not.toBeNull()

    rerender(<Snackbar open={false} message="File saved" />)

    // Immediately after close: still visible (exit animation running)
    act(() => { vi.advanceTimersByTime(100) })
    expect(container.querySelector('[role="status"]')).not.toBeNull()
  })

  it('unmounts from the DOM after the 200 ms exit animation completes', () => {
    const { rerender, container } = renderSnackbar()
    rerender(<Snackbar open={false} message="File saved" />)
    act(() => { vi.advanceTimersByTime(200) })
    expect(container.querySelector('[role="status"]')).toBeNull()
  })

  it('re-opens correctly after being closed', () => {
    const { rerender, container } = renderSnackbar()

    rerender(<Snackbar open={false} message="File saved" />)
    act(() => { vi.advanceTimersByTime(200) })
    expect(container.querySelector('[role="status"]')).toBeNull()

    rerender(<Snackbar open={true} message="File saved" />)
    expect(container.querySelector('[role="status"]')).not.toBeNull()
  })
})
