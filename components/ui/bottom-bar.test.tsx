/**
 * BottomBar component — Vitest unit tests
 *
 * Covers:
 *  - Primary use case: renders toolbar with correct role, aria-label, and default selection label
 *  - Edge case 1: selectionLabel prop overrides the auto-generated "N Option(s) selected" string
 *  - Edge case 2: singular count ("1 Option selected") vs plural ("2 Options selected")
 *  - Edge case 3: selectedCount=0 renders "0 Options selected"
 *  - Edge case 4: secondary actions render and fire onClick
 *  - Edge case 5: primary actions render with default outlined variant
 *  - Edge case 6: disabled actions have the disabled attribute and do not fire onClick
 *  - Edge case 7: divider is only rendered when both secondary AND primary actions are present
 *  - Edge case 8: no actions — no buttons rendered at all
 *  - Edge case 9: extremely long selectionLabel does not crash the component
 *  - Edge case 10: dark theme renders without crash
 *  - Edge case 11: ref is forwarded to the root div
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BottomBar } from './bottom-bar'

// ─── helper ───────────────────────────────────────────────────────────────────

function renderBar(props: Partial<React.ComponentProps<typeof BottomBar>> = {}) {
  return render(<BottomBar {...props} />)
}

// ─── Primary use case ─────────────────────────────────────────────────────────

describe('BottomBar — primary use case', () => {
  it('renders a toolbar landmark with correct aria-label', () => {
    renderBar({ selectedCount: 3 })
    const toolbar = screen.getByRole('toolbar', { name: /bulk actions/i })
    expect(toolbar).toBeTruthy()
  })

  it('auto-generates plural selection label', () => {
    renderBar({ selectedCount: 5 })
    expect(screen.getByText('5 Options selected')).toBeTruthy()
  })

  it('forwards a ref to the root div element', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<BottomBar ref={ref} selectedCount={1} />)
    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe('DIV')
  })
})

// ─── Edge case 1: selectionLabel override ─────────────────────────────────────

describe('BottomBar — selectionLabel override (edge case 1)', () => {
  it('renders the supplied selectionLabel instead of the auto string', () => {
    renderBar({ selectionLabel: 'All rows selected' })
    expect(screen.getByText('All rows selected')).toBeTruthy()
  })

  it('does not render the default "N Options selected" text when overridden', () => {
    renderBar({ selectedCount: 99, selectionLabel: 'Custom label' })
    expect(screen.queryByText(/99 Options selected/i)).toBeNull()
    expect(screen.getByText('Custom label')).toBeTruthy()
  })
})

// ─── Edge case 2: singular / plural label ─────────────────────────────────────

describe('BottomBar — singular vs plural label (edge case 2)', () => {
  it('uses singular "Option" when selectedCount is 1', () => {
    renderBar({ selectedCount: 1 })
    expect(screen.getByText('1 Option selected')).toBeTruthy()
  })

  it('uses plural "Options" when selectedCount is 2', () => {
    renderBar({ selectedCount: 2 })
    expect(screen.getByText('2 Options selected')).toBeTruthy()
  })
})

// ─── Edge case 3: zero count ──────────────────────────────────────────────────

describe('BottomBar — zero selectedCount (edge case 3)', () => {
  it('renders "0 Options selected" when count is 0 (default)', () => {
    renderBar()
    expect(screen.getByText('0 Options selected')).toBeTruthy()
  })
})

// ─── Edge case 4: secondary actions ───────────────────────────────────────────

describe('BottomBar — secondary actions (edge case 4)', () => {
  it('renders secondary action buttons by label', () => {
    renderBar({
      secondaryActions: [
        { label: 'Export', onClick: vi.fn() },
        { label: 'Archive', onClick: vi.fn() },
      ],
    })
    expect(screen.getByRole('button', { name: /export/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /archive/i })).toBeTruthy()
  })

  it('fires the onClick handler when a secondary action is clicked', () => {
    const handler = vi.fn()
    renderBar({
      secondaryActions: [{ label: 'Export', onClick: handler }],
    })
    fireEvent.click(screen.getByRole('button', { name: /export/i }))
    expect(handler).toHaveBeenCalledTimes(1)
  })
})

// ─── Edge case 5: primary actions ────────────────────────────────────────────

describe('BottomBar — primary actions (edge case 5)', () => {
  it('renders primary action buttons by label', () => {
    renderBar({
      primaryActions: [
        { label: 'Delete', variant: 'outlined' },
        { label: 'Confirm', variant: 'filled' },
      ],
    })
    expect(screen.getByRole('button', { name: /delete/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /confirm/i })).toBeTruthy()
  })

  it('fires the onClick handler when a primary action is clicked', () => {
    const handler = vi.fn()
    renderBar({
      primaryActions: [{ label: 'Confirm', variant: 'filled', onClick: handler }],
    })
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))
    expect(handler).toHaveBeenCalledTimes(1)
  })
})

// ─── Edge case 6: disabled actions ───────────────────────────────────────────

describe('BottomBar — disabled actions (edge case 6)', () => {
  it('renders a disabled secondary action with the disabled attribute', () => {
    renderBar({
      secondaryActions: [{ label: 'Export', disabled: true }],
    })
    const btn = screen.getByRole('button', { name: /export/i }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('does not fire onClick for a disabled primary action', () => {
    const handler = vi.fn()
    renderBar({
      primaryActions: [{ label: 'Delete', disabled: true, onClick: handler }],
    })
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(handler).not.toHaveBeenCalled()
  })
})

// ─── Edge case 7: divider visibility ─────────────────────────────────────────

describe('BottomBar — vertical divider visibility (edge case 7)', () => {
  it('renders a separator when both secondary and primary actions are present', () => {
    const { container } = renderBar({
      secondaryActions: [{ label: 'Export' }],
      primaryActions:   [{ label: 'Delete' }],
    })
    // Divider renders as role="separator"
    const sep = container.querySelector('[role="separator"]')
    expect(sep).not.toBeNull()
  })

  it('does not render a separator when only secondary actions are present', () => {
    const { container } = renderBar({
      secondaryActions: [{ label: 'Export' }],
    })
    const sep = container.querySelector('[role="separator"]')
    expect(sep).toBeNull()
  })

  it('does not render a separator when only primary actions are present', () => {
    const { container } = renderBar({
      primaryActions: [{ label: 'Delete' }],
    })
    const sep = container.querySelector('[role="separator"]')
    expect(sep).toBeNull()
  })
})

// ─── Edge case 8: no actions ──────────────────────────────────────────────────

describe('BottomBar — no actions (edge case 8)', () => {
  it('renders no buttons when both action arrays are empty', () => {
    renderBar({ secondaryActions: [], primaryActions: [] })
    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(0)
  })
})

// ─── Edge case 9: extremely long selectionLabel ───────────────────────────────

describe('BottomBar — extremely long selectionLabel (edge case 9)', () => {
  it('renders without crashing when selectionLabel is very long', () => {
    const longLabel = 'A'.repeat(500)
    expect(() => renderBar({ selectionLabel: longLabel })).not.toThrow()
    expect(screen.getByText(longLabel)).toBeTruthy()
  })
})

// ─── Edge case 10: dark theme ─────────────────────────────────────────────────

describe('BottomBar — dark theme (edge case 10)', () => {
  it('renders without crashing in dark theme', () => {
    expect(() =>
      renderBar({
        theme: 'dark',
        selectedCount: 2,
        secondaryActions: [{ label: 'Export' }],
        primaryActions:   [{ label: 'Delete' }],
      })
    ).not.toThrow()
  })

  it('toolbar landmark is still present in dark theme', () => {
    renderBar({ theme: 'dark' })
    expect(screen.getByRole('toolbar', { name: /bulk actions/i })).toBeTruthy()
  })
})

// ─── Edge case 11: ref forwarding ─────────────────────────────────────────────

describe('BottomBar — ref forwarding (edge case 11)', () => {
  it('exposes the root div via the forwarded ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<BottomBar ref={ref} />)
    expect(ref.current).not.toBeNull()
    expect(ref.current?.getAttribute('role')).toBe('toolbar')
  })
})
