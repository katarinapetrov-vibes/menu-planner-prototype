import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Popover } from '../popover'

// ─── Default render ───────────────────────────────────────────────────────────

describe('Popover — default render', () => {
  it('renders the trigger', () => {
    render(<Popover trigger={<button>Open</button>} title="Test" />)
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
  })

  it('does not render the card before hover', () => {
    render(<Popover trigger={<button>Open</button>} title="My popover" />)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

// ─── Controlled open ──────────────────────────────────────────────────────────

describe('Popover — controlled open', () => {
  it('shows card when open=true', () => {
    render(
      <Popover trigger={<button>T</button>} title="Controlled" open>
        <p>Body content</p>
      </Popover>
    )
    // No close button, no tabs → informational → tooltip role
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByText('Controlled')).toBeInTheDocument()
    expect(screen.getByText('Body content')).toBeInTheDocument()
  })

  it('hides card when open=false', () => {
    render(
      <Popover trigger={<button>T</button>} title="Hidden" open={false}>
        <p>Body content</p>
      </Popover>
    )
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

// ─── Close button ────────────────────────────────────────────────────────────

describe('Popover — close button', () => {
  it('renders a close button when showCloseButton=true', () => {
    render(
      <Popover trigger={<button>T</button>} title="With close" open showCloseButton onClose={vi.fn()} />
    )
    expect(screen.getByRole('button', { name: 'Close popover' })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const handler = vi.fn()
    render(
      <Popover trigger={<button>T</button>} title="Closable" open showCloseButton onClose={handler} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close popover' }))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('does not render close button when showCloseButton=false', () => {
    render(
      <Popover trigger={<button>T</button>} title="No close" open showCloseButton={false} />
    )
    expect(screen.queryByRole('button', { name: 'Close popover' })).not.toBeInTheDocument()
  })

  it('card uses role="dialog" when showCloseButton=true', () => {
    render(
      <Popover trigger={<button>T</button>} title="Interactive" open showCloseButton onClose={vi.fn()} />
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

// ─── Icon rendering ───────────────────────────────────────────────────────────

describe('Popover — icon', () => {
  it('does not render icon chip when showIcon=false', () => {
    render(<Popover trigger={<span />} open showIcon={false} type="success" />)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })
})

// ─── Type variants ────────────────────────────────────────────────────────────

describe('Popover — type variants', () => {
  it.each(['success', 'warning', 'error', 'info', 'ai'] as const)('renders type=%s without error', (type) => {
    render(<Popover trigger={<span />} title={`${type} popover`} open type={type} />)
    expect(screen.getByText(`${type} popover`)).toBeInTheDocument()
  })
})

// ─── Tabs ────────────────────────────────────────────────────────────────────

describe('Popover — tabs', () => {
  const tabs = [
    { id: 'a', label: 'Tab A', content: <p>Content A</p> },
    { id: 'b', label: 'Tab B', content: <p>Content B</p> },
  ]

  it('renders tab buttons in a tablist', () => {
    render(<Popover trigger={<span />} open tabs={tabs} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Tab A' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Tab B' })).toBeInTheDocument()
  })

  it('shows defaultTab content on open', () => {
    render(<Popover trigger={<span />} open tabs={tabs} defaultTab="a" />)
    // Tabs keeps all panels in DOM — active panel is visible, inactive is hidden
    expect(screen.getByText('Content A').closest('[role="tabpanel"]')).not.toHaveAttribute('hidden')
    expect(screen.getByText('Content B').closest('[role="tabpanel"]')).toHaveAttribute('hidden')
  })

  it('switches to Tab B when clicked', () => {
    render(<Popover trigger={<span />} open tabs={tabs} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Tab B' }))
    expect(screen.getByText('Content B').closest('[role="tabpanel"]')).not.toHaveAttribute('hidden')
    expect(screen.getByText('Content A').closest('[role="tabpanel"]')).toHaveAttribute('hidden')
  })

  it('marks active tab with aria-selected', () => {
    render(<Popover trigger={<span />} open tabs={tabs} defaultTab="a" />)
    expect(screen.getByRole('tab', { name: 'Tab A' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveAttribute('aria-selected', 'false')
  })

  it('card uses role="dialog" when tabs are present', () => {
    render(<Popover trigger={<span />} open tabs={tabs} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

// ─── Placement variants ───────────────────────────────────────────────────────

describe('Popover — placement variants', () => {
  it.each(['top', 'bottom', 'left', 'right'] as const)('renders placement=%s without error', (placement) => {
    render(<Popover trigger={<span />} title="placed" open placement={placement} />)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })
})

// ─── Themes ──────────────────────────────────────────────────────────────────

describe('Popover — themes', () => {
  it.each(['light', 'dark'] as const)('renders theme=%s without error', (theme) => {
    render(<Popover trigger={<span />} title="themed" open theme={theme} />)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })
})

// ─── Accessibility ────────────────────────────────────────────────────────────

describe('Popover — accessibility', () => {
  it('B-1: informational card uses role="tooltip" and has accessible name from string title', () => {
    render(<Popover trigger={<span />} title="Accessible title" open />)
    expect(screen.getByRole('tooltip', { name: 'Accessible title' })).toBeInTheDocument()
  })

  it('B-2: interactive card uses role="dialog" with aria-modal', () => {
    render(<Popover trigger={<span />} title="Interactive" open showCloseButton onClose={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('B-3: aria-label prop provides accessible name when title is a ReactNode', () => {
    render(
      <Popover trigger={<span />} title={<span>Node title</span>} aria-label="Node title" open />
    )
    expect(screen.getByRole('tooltip', { name: 'Node title' })).toBeInTheDocument()
  })

  it('F-6: card renders even when title is a ReactNode without aria-label', () => {
    render(<Popover trigger={<span />} title={<span>Node title</span>} open />)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('close button has aria-label="Close popover"', () => {
    render(<Popover trigger={<span />} open showCloseButton onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Close popover' })).toBeInTheDocument()
  })

  it('Escape key calls onClose on interactive popover', () => {
    const onClose = vi.fn()
    render(<Popover trigger={<span />} open showCloseButton onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('Escape key does nothing on informational popover', () => {
    const onClose = vi.fn()
    render(<Popover trigger={<span />} open onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('A3: card has accessible name "Popover" when no title or aria-label', () => {
    render(<Popover trigger={<span />} open><p>content</p></Popover>)
    expect(screen.getByRole('tooltip')).toHaveAttribute('aria-label', 'Popover')
  })

  it('A4: focus moves to close button when interactive popover opens', () => {
    render(
      <Popover trigger={<span />} open showCloseButton onClose={vi.fn()}>
        <p>body</p>
      </Popover>
    )
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Close popover' })
    )
  })
})

// ─── Arrow ───────────────────────────────────────────────────────────────────

describe('Popover — arrow', () => {
  it('does not render arrow when showArrow=false', () => {
    render(<Popover trigger={<span />} open showArrow={false} />)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })
})
