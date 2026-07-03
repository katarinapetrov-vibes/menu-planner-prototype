import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Dialog } from '../dialog'

const noop = () => {}

// ─── Default render ───────────────────────────────────────────────────────────

describe('Dialog — default render', () => {
  it('renders nothing when open=false', () => {
    const { container } = render(<Dialog open={false} onClose={noop} title="Test" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the panel when open=true', () => {
    render(<Dialog open onClose={noop} title="Hello" />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders the title when showTitle=true', () => {
    render(<Dialog open onClose={noop} title="My Dialog" />)
    expect(screen.getByText('My Dialog')).toBeInTheDocument()
  })

  it('does not render title when showTitle=false', () => {
    render(<Dialog open onClose={noop} title="My Dialog" showTitle={false} />)
    expect(screen.queryByText('My Dialog')).not.toBeInTheDocument()
  })

  it('renders close button by default', () => {
    render(<Dialog open onClose={noop} title="Test" />)
    expect(screen.getByRole('button', { name: /close dialog/i })).toBeInTheDocument()
  })

  it('hides close button when showCloseButton=false', () => {
    render(<Dialog open onClose={noop} title="Test" showCloseButton={false} />)
    expect(screen.queryByRole('button', { name: /close dialog/i })).not.toBeInTheDocument()
  })
})

// ─── ARIA ─────────────────────────────────────────────────────────────────────

describe('Dialog — ARIA', () => {
  it('sets aria-modal="true"', () => {
    render(<Dialog open onClose={noop} title="Test" />)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('sets aria-labelledby pointing to the title element', () => {
    render(<Dialog open onClose={noop} title="Labelled" />)
    const dialog  = screen.getByRole('dialog')
    const labelId = dialog.getAttribute('aria-labelledby')
    expect(labelId).toBeTruthy()
    expect(document.getElementById(labelId!)).toHaveTextContent('Labelled')
  })

  it('uses aria-label fallback when no title is shown', () => {
    render(<Dialog open onClose={noop} showTitle={false} aria-label="Custom label" />)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Custom label')
  })

  it('defaults aria-label to "Dialog" when no title and no aria-label provided', () => {
    render(<Dialog open onClose={noop} showTitle={false} />)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Dialog')
  })

  it('sets aria-describedby when description is shown', () => {
    render(<Dialog open onClose={noop} title="T" description="Some description" />)
    const dialog = screen.getByRole('dialog')
    const descId = dialog.getAttribute('aria-describedby')
    expect(descId).toBeTruthy()
    expect(document.getElementById(descId!)).toHaveTextContent('Some description')
  })

  it('does not set aria-describedby when description is hidden', () => {
    render(<Dialog open onClose={noop} title="T" description="hidden" showDescription={false} />)
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-describedby')
  })
})

// ─── Focus management — A-5 focus return ─────────────────────────────────────

describe('Dialog — focus management (A-5 return focus)', () => {
  it('returns focus to the trigger element when the dialog closes', () => {
    const trigger = document.createElement('button')
    trigger.textContent = 'Open'
    document.body.appendChild(trigger)
    trigger.focus()
    expect(document.activeElement).toBe(trigger)

    const { rerender } = render(<Dialog open onClose={noop} title="Test" />)
    rerender(<Dialog open={false} onClose={noop} title="Test" />)

    expect(document.activeElement).toBe(trigger)
    document.body.removeChild(trigger)
  })
})

// ─── Focus trap — A-6 ────────────────────────────────────────────────────────

describe('Dialog — focus trap (A-6)', () => {
  it('moves focus to the first focusable element when the dialog opens', () => {
    render(
      <Dialog
        open onClose={noop} title="Test"
        showButtons showRightButtons
        rightFilledButton={{ label: 'Confirm', onClick: noop }}
      />
    )
    // Close button is the first focusable element (absolute top-right)
    expect(document.activeElement).toHaveAttribute('aria-label', 'Close dialog')
  })

  it('wraps focus back to first focusable on Tab from last element', () => {
    render(
      <Dialog
        open onClose={noop} title="Test"
        showButtons showRightButtons
        rightFilledButton={{ label: 'Confirm', onClick: noop }}
      />
    )
    const buttons = screen.getAllByRole('button')
    const last = buttons[buttons.length - 1]
    last.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false })
    expect(document.activeElement).toBe(buttons[0])
  })

  it('wraps focus to last focusable on Shift+Tab from first element', () => {
    render(
      <Dialog
        open onClose={noop} title="Test"
        showButtons showRightButtons
        rightFilledButton={{ label: 'Confirm', onClick: noop }}
      />
    )
    const buttons = screen.getAllByRole('button')
    buttons[0].focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(buttons[buttons.length - 1])
  })
})

// ─── Close behaviour ─────────────────────────────────────────────────────────

describe('Dialog — close behaviour', () => {
  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<Dialog open onClose={onClose} title="Test" />)
    fireEvent.click(screen.getByRole('button', { name: /close dialog/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    render(<Dialog open onClose={onClose} title="Test" />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose on Escape when inline=true', () => {
    const onClose = vi.fn()
    render(<Dialog open onClose={onClose} title="Test" inline />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    const { container } = render(<Dialog open onClose={onClose} title="Test" />)
    const backdrop = container.firstChild as HTMLElement
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose when the panel itself is clicked', () => {
    const onClose = vi.fn()
    render(<Dialog open onClose={onClose} title="Test" />)
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
  })
})

// ─── Content slots ────────────────────────────────────────────────────────────

describe('Dialog — content slots', () => {
  it('renders description text', () => {
    render(<Dialog open onClose={noop} title="T" description="Body copy here" />)
    expect(screen.getByText('Body copy here')).toBeInTheDocument()
  })

  it('hides description when showDescription=false', () => {
    render(<Dialog open onClose={noop} title="T" description="Body" showDescription={false} />)
    expect(screen.queryByText('Body')).not.toBeInTheDocument()
  })

  it('renders ReactNode description without wrapping in <p>', () => {
    render(<Dialog open onClose={noop} title="T" description={<ul><li>Item</li></ul>} />)
    expect(screen.getByRole('list')).toBeInTheDocument()
  })

  it('renders banner content when showBanner=true', () => {
    render(<Dialog open onClose={noop} title="T" showBanner bannerContent={<span>Banner!</span>} />)
    expect(screen.getByText('Banner!')).toBeInTheDocument()
  })

  it('hides banner when showBanner=false', () => {
    render(<Dialog open onClose={noop} title="T" showBanner={false} bannerContent={<span>Banner!</span>} />)
    expect(screen.queryByText('Banner!')).not.toBeInTheDocument()
  })

  it('does not render banner when bannerContent is absent', () => {
    render(<Dialog open onClose={noop} title="T" showBanner />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders swapper content when showSwapperGroup=true', () => {
    render(<Dialog open onClose={noop} title="T" showSwapperGroup swapperContent={<div>Swap me</div>} />)
    expect(screen.getByText('Swap me')).toBeInTheDocument()
  })

  it('hides swapper when showSwapperGroup=false', () => {
    render(<Dialog open onClose={noop} title="T" showSwapperGroup={false} swapperContent={<div>Hidden</div>} />)
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
  })

  it('renders caption when showCaption=true', () => {
    render(<Dialog open onClose={noop} title="T" showButtons showCaption caption="Footer note" />)
    expect(screen.getByText('Footer note')).toBeInTheDocument()
  })

  it('hides caption when showCaption=false', () => {
    render(<Dialog open onClose={noop} title="T" showButtons showCaption={false} caption="Hidden" />)
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
  })
})

// ─── Footer buttons ───────────────────────────────────────────────────────────

describe('Dialog — footer buttons', () => {
  it('renders right filled button and fires onClick', () => {
    const onClick = vi.fn()
    render(
      <Dialog open onClose={noop} title="T" showButtons showRightButtons
        rightFilledButton={{ label: 'Confirm', onClick }}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders right outline button', () => {
    render(
      <Dialog open onClose={noop} title="T" showButtons showRightButtons
        rightOutlineButton={{ label: 'Maybe', onClick: noop }}
      />
    )
    expect(screen.getByRole('button', { name: 'Maybe' })).toBeInTheDocument()
  })

  it('renders right text button', () => {
    render(
      <Dialog open onClose={noop} title="T" showButtons showRightButtons
        rightTextButton={{ label: 'Skip', onClick: noop }}
      />
    )
    expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument()
  })

  it('renders left text button', () => {
    render(
      <Dialog open onClose={noop} title="T" showButtons showLeftButtons
        leftTextButton={{ label: 'Cancel', onClick: noop }}
      />
    )
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('renders left filled button', () => {
    render(
      <Dialog open onClose={noop} title="T" showButtons showLeftButtons
        leftFilledButton={{ label: 'Delete', onClick: noop }}
      />
    )
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('hides footer when showButtons=false', () => {
    render(
      <Dialog open onClose={noop} title="T" showButtons={false}
        rightFilledButton={{ label: 'Hidden', onClick: noop }}
      />
    )
    expect(screen.queryByRole('button', { name: 'Hidden' })).not.toBeInTheDocument()
  })

  it('respects the disabled prop on a footer button', () => {
    render(
      <Dialog open onClose={noop} title="T" showButtons showRightButtons
        rightFilledButton={{ label: 'Confirm', onClick: noop, disabled: true }}
      />
    )
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
  })
})

// ─── Banner colour ────────────────────────────────────────────────────────────

describe('Dialog — banner colour', () => {
  const colours = ['success', 'warning', 'error', 'info', 'ai'] as const

  it.each(colours)('renders bannerColour=%s without error', (colour) => {
    render(
      <Dialog open onClose={noop} title="T" showBanner bannerColour={colour}
        bannerContent="Notice"
      />
    )
    expect(screen.getByText('Notice')).toBeInTheDocument()
  })
})

// ─── Themes ───────────────────────────────────────────────────────────────────

describe('Dialog — themes', () => {
  it('renders without error in light theme', () => {
    render(<Dialog open onClose={noop} title="Light" theme="light" />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders without error in dark theme', () => {
    render(<Dialog open onClose={noop} title="Dark" theme="dark" />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

// ─── Sizes ────────────────────────────────────────────────────────────────────

describe('Dialog — sizes', () => {
  it.each(['sm', 'md', 'lg'] as const)('renders size=%s without error', (size) => {
    render(<Dialog open onClose={noop} title="T" size={size} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

// ─── Inline mode ──────────────────────────────────────────────────────────────

describe('Dialog — inline mode', () => {
  it('renders panel without backdrop overlay when inline=true', () => {
    const { container } = render(<Dialog open onClose={noop} title="Inline" inline />)
    expect(container.firstChild).toHaveAttribute('role', 'dialog')
  })

  it('does not trap focus or listen for Escape when inline=true', () => {
    const onClose = vi.fn()
    render(<Dialog open onClose={onClose} title="Inline" inline />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('Dialog — edge cases', () => {
  it('renders safely with no optional props', () => {
    render(<Dialog open onClose={noop} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render body section when all body slots are empty', () => {
    const { container } = render(
      <Dialog open onClose={noop} title="T"
        showDescription={false} showBanner={false} showSwapperGroup={false}
      />
    )
    expect(container.querySelector('.overflow-y-auto')).toBeNull()
  })

  it('does not render footer when showButtons=false with buttons defined', () => {
    render(
      <Dialog open onClose={noop} title="T" showButtons={false}
        rightFilledButton={{ label: 'Go', onClick: noop }}
      />
    )
    expect(screen.queryByRole('button', { name: 'Go' })).not.toBeInTheDocument()
  })

  it('uses aria-label="Dialog" as accessible name when title is hidden and no aria-label passed', () => {
    render(<Dialog open onClose={noop} showTitle={false} />)
    expect(screen.getByRole('dialog', { name: 'Dialog' })).toBeInTheDocument()
  })
})
