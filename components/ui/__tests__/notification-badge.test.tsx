import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { NotificationBadge, BadgeWrapper } from '../notification-badge'

// ─── Default render ───────────────────────────────────────────────────────────

describe('NotificationBadge — default render', () => {
  it('renders a status element', () => {
    render(<NotificationBadge count={5} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('displays the count', () => {
    render(<NotificationBadge count={7} />)
    expect(screen.getByRole('status')).toHaveTextContent('7')
  })

  it('renders with no props without crashing', () => {
    render(<NotificationBadge />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})

// ─── Count display ────────────────────────────────────────────────────────────

describe('NotificationBadge — count display', () => {
  it('displays the count when within max', () => {
    render(<NotificationBadge count={42} max={99} />)
    expect(screen.getByRole('status')).toHaveTextContent('42')
  })

  it('displays "max+" when count exceeds max', () => {
    render(<NotificationBadge count={100} max={99} />)
    expect(screen.getByRole('status')).toHaveTextContent('99+')
  })

  it('displays "max+" when count equals max+1', () => {
    render(<NotificationBadge count={10} max={9} />)
    expect(screen.getByRole('status')).toHaveTextContent('9+')
  })

  it('renders nothing when count is 0 (no badge for zero)', () => {
    render(<NotificationBadge count={0} />)
    expect(screen.getByRole('status')).toHaveTextContent('')
  })

  it('clamps negative count to zero — renders no label', () => {
    render(<NotificationBadge count={-5} />)
    expect(screen.getByRole('status')).toHaveTextContent('')
  })

  it('renders nothing when count is undefined', () => {
    render(<NotificationBadge />)
    expect(screen.getByRole('status')).toHaveTextContent('')
  })
})

// ─── Dot mode ─────────────────────────────────────────────────────────────────

describe('NotificationBadge — dot mode', () => {
  it('renders no label text when dot=true', () => {
    render(<NotificationBadge dot count={5} />)
    expect(screen.getByRole('status')).toHaveTextContent('')
  })

  it('dot takes precedence over count', () => {
    render(<NotificationBadge dot count={99} />)
    expect(screen.getByRole('status')).toHaveTextContent('')
  })
})

// ─── ARIA ─────────────────────────────────────────────────────────────────────

describe('NotificationBadge — ARIA', () => {
  it('announces plural notifications for count > 1', () => {
    render(<NotificationBadge count={3} />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '3 notifications')
  })

  it('announces singular notification for count = 1', () => {
    render(<NotificationBadge count={1} />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '1 notification')
  })

  it('uses "notification badge" as fallback label when no count', () => {
    render(<NotificationBadge />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'notification badge')
  })

  it('uses "notification badge" as fallback label for dot mode', () => {
    render(<NotificationBadge dot />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'notification badge')
  })

  it('uses custom aria-label when provided', () => {
    render(<NotificationBadge count={5} aria-label="5 unread messages" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '5 unread messages')
  })
})

// ─── Types ────────────────────────────────────────────────────────────────────

describe('NotificationBadge — types', () => {
  const types = ['success', 'warning', 'error', 'info', 'ai'] as const

  it.each(types)('renders type=%s without error', (type) => {
    render(<NotificationBadge count={1} type={type} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})

// ─── Themes ───────────────────────────────────────────────────────────────────

describe('NotificationBadge — themes', () => {
  it('renders light theme without error', () => {
    render(<NotificationBadge count={1} theme="light" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders dark theme without error', () => {
    render(<NotificationBadge count={1} theme="dark" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})

// ─── Sizes ────────────────────────────────────────────────────────────────────

describe('NotificationBadge — sizes', () => {
  it.each(['sm', 'md', 'lg'] as const)('renders size=%s without error', (size) => {
    render(<NotificationBadge count={1} size={size} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})

// ─── BadgeWrapper ─────────────────────────────────────────────────────────────

describe('BadgeWrapper', () => {
  it('renders children', () => {
    render(
      <BadgeWrapper count={3}>
        <button>Notifications</button>
      </BadgeWrapper>
    )
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('renders the badge alongside children', () => {
    render(
      <BadgeWrapper count={3}>
        <button>Notifications</button>
      </BadgeWrapper>
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('passes badge props through to NotificationBadge', () => {
    render(
      <BadgeWrapper count={5} type="success" aria-label="5 new items">
        <span>Icon</span>
      </BadgeWrapper>
    )
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '5 new items')
  })
})

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('NotificationBadge — edge cases', () => {
  it('handles very large count gracefully', () => {
    render(<NotificationBadge count={999999} max={99} />)
    expect(screen.getByRole('status')).toHaveTextContent('99+')
  })

  it('handles count === max without showing "+"', () => {
    render(<NotificationBadge count={99} max={99} />)
    expect(screen.getByRole('status')).toHaveTextContent('99')
  })

  it('accepts a custom className', () => {
    render(<NotificationBadge count={1} className="custom-class" />)
    expect(screen.getByRole('status')).toHaveClass('custom-class')
  })
})
