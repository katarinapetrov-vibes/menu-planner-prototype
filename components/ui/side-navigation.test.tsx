/**
 * SideNavigation component — Vitest unit tests
 *
 * Covers:
 *  - Primary use case: renders nav with groups and items
 *  - Edge case 1: active item receives aria-current="page"
 *  - Edge case 2: disabled items do not fire onItemClick
 *  - Edge case 3: collapsed mode — item buttons need accessible names
 *  - Edge case 4: sub-item expand / collapse (aria-expanded toggles)
 *  - Edge case 5: controlled vs. uncontrolled activeId
 *  - Edge case 6: user footer renders when user prop is provided
 *  - Edge case 7: module header renders and opens dropdown on click
 *  - Edge case 8: extremely long label text is truncated (truncate class present)
 *  - Edge case 9: collapse toggle calls onCollapsedChange
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SideNavigation } from './side-navigation'
import type { SideNavGroup } from './side-navigation'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const iconDash = <svg data-testid="icon-dash" />

const baseGroups: SideNavGroup[] = [
  {
    id: 'g1',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: iconDash },
      { id: 'orders',    label: 'Orders' },
      { id: 'disabled',  label: 'Disabled Item', disabled: true },
    ],
  },
  {
    id: 'g2',
    label: 'Settings',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        children: [
          { id: 'profile', label: 'Profile' },
          { id: 'billing', label: 'Billing' },
        ],
      },
    ],
  },
]

function renderNav(props: Partial<React.ComponentProps<typeof SideNavigation>> = {}) {
  return render(
    <SideNavigation
      groups={baseGroups}
      aria-label="Main navigation"
      {...props}
    />
  )
}

// ─── Primary use case ─────────────────────────────────────────────────────────

describe('SideNavigation — primary use case', () => {
  it('renders a <nav> landmark with the provided aria-label', () => {
    renderNav()
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeTruthy()
  })

  it('renders all top-level item labels', () => {
    renderNav()
    expect(screen.getByText('Dashboard')).toBeTruthy()
    expect(screen.getByText('Orders')).toBeTruthy()
  })

  it('renders section labels', () => {
    renderNav()
    expect(screen.getByText('Main')).toBeTruthy()
    // 'Settings' appears in both the section label div and the nav button — use getAllByText
    expect(screen.getAllByText('Settings').length).toBeGreaterThanOrEqual(1)
  })

  it('renders the parent item that has sub-items', () => {
    renderNav()
    expect(screen.getByRole('button', { name: /settings/i })).toBeTruthy()
  })
})

// ─── Edge case 1: active item aria-current ────────────────────────────────────

describe('SideNavigation — active item (edge case 1)', () => {
  it('sets aria-current="page" on the active leaf item', () => {
    renderNav({ activeId: 'dashboard' })
    const btn = screen.getByRole('button', { name: /dashboard/i })
    expect(btn.getAttribute('aria-current')).toBe('page')
  })

  it('does NOT set aria-current on non-active items', () => {
    renderNav({ activeId: 'dashboard' })
    const ordersBtn = screen.getByRole('button', { name: /orders/i })
    expect(ordersBtn.getAttribute('aria-current')).toBeNull()
  })

  it('does NOT set aria-current on a parent item that has children, even if a child is active', () => {
    renderNav({ activeId: 'profile' })
    const settingsBtn = screen.getByRole('button', { name: /settings/i })
    expect(settingsBtn.getAttribute('aria-current')).toBeNull()
  })
})

// ─── Edge case 2: disabled items ─────────────────────────────────────────────

describe('SideNavigation — disabled items (edge case 2)', () => {
  it('renders disabled items with the HTML disabled attribute', () => {
    renderNav()
    const btn = screen.getByRole('button', { name: /disabled item/i })
    expect((btn as HTMLButtonElement).disabled).toBe(true)
  })

  it('does not fire onItemClick when a disabled item is clicked', () => {
    const handler = vi.fn()
    renderNav({ onItemClick: handler })
    const btn = screen.getByRole('button', { name: /disabled item/i })
    fireEvent.click(btn)
    expect(handler).not.toHaveBeenCalled()
  })

  it('applies cursor-not-allowed class to disabled items', () => {
    renderNav()
    const btn = screen.getByRole('button', { name: /disabled item/i })
    expect(btn.className).toContain('cursor-not-allowed')
  })
})

// ─── Edge case 3: collapsed mode accessible names ─────────────────────────────

describe('SideNavigation — collapsed mode (edge case 3)', () => {
  it('renders in collapsed mode without crashing', () => {
    renderNav({ collapsed: true })
    expect(screen.getByRole('navigation')).toBeTruthy()
  })

  it('hides item label text when collapsed', () => {
    renderNav({ collapsed: true })
    // Label spans are not rendered at all when collapsed
    expect(screen.queryByText('Dashboard')).toBeNull()
    expect(screen.queryByText('Orders')).toBeNull()
  })

  it('hides section headings when collapsed', () => {
    renderNav({ collapsed: true })
    expect(screen.queryByText('Main')).toBeNull()
    expect(screen.queryByText('Settings')).toBeNull()
  })

  it('renders initials abbreviation span for items without icons when collapsed', () => {
    renderNav({ collapsed: true })
    // "Orders" has no icon — initials "O" should appear in DOM
    // The span has aria-hidden but the text content exists
    const initialsSpans = document.querySelectorAll('[title="Orders"]')
    expect(initialsSpans.length).toBeGreaterThan(0)
  })
})

// ─── Edge case 4: sub-item expand / collapse ──────────────────────────────────

describe('SideNavigation — sub-item expand/collapse (edge case 4)', () => {
  it('sets aria-expanded="false" on parent item when sub-items are collapsed', () => {
    renderNav({ activeId: 'dashboard' })  // active is not a child of settings
    const btn = screen.getByRole('button', { name: /settings/i })
    expect(btn.getAttribute('aria-expanded')).toBe('false')
  })

  it('toggles aria-expanded when parent item is clicked', () => {
    renderNav({ activeId: 'dashboard' })
    const btn = screen.getByRole('button', { name: /settings/i })
    expect(btn.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-expanded')).toBe('true')
  })

  it('reveals sub-items after expanding parent', () => {
    renderNav({ activeId: 'dashboard' })
    const btn = screen.getByRole('button', { name: /settings/i })
    fireEvent.click(btn)
    // Sub-items are in the DOM after expansion click
    expect(screen.getByText('Profile')).toBeTruthy()
    expect(screen.getByText('Billing')).toBeTruthy()
  })

  it('auto-expands parent when a child id is active', () => {
    renderNav({ activeId: 'profile' })
    const btn = screen.getByRole('button', { name: /settings/i })
    expect(btn.getAttribute('aria-expanded')).toBe('true')
  })

  it('does not set aria-expanded on leaf items (no children)', () => {
    renderNav()
    const dashBtn = screen.getByRole('button', { name: /dashboard/i })
    expect(dashBtn.getAttribute('aria-expanded')).toBeNull()
  })
})

// ─── Edge case 5: controlled vs. uncontrolled activeId ───────────────────────

describe('SideNavigation — controlled activeId (edge case 5)', () => {
  it('calls onItemClick with id and item when a leaf item is clicked', () => {
    const handler = vi.fn()
    renderNav({ onItemClick: handler })
    fireEvent.click(screen.getByRole('button', { name: /orders/i }))
    expect(handler).toHaveBeenCalledWith('orders', expect.objectContaining({ id: 'orders' }))
  })

  it('respects uncontrolled defaultActiveId for initial active state', () => {
    renderNav({ defaultActiveId: 'orders' })
    const btn = screen.getByRole('button', { name: /orders/i })
    expect(btn.getAttribute('aria-current')).toBe('page')
  })

  it('switches active item internally when uncontrolled and item is clicked', () => {
    renderNav({ defaultActiveId: 'dashboard' })
    // Click on Orders to switch active
    fireEvent.click(screen.getByRole('button', { name: /orders/i }))
    expect(screen.getByRole('button', { name: /orders/i }).getAttribute('aria-current')).toBe('page')
  })
})

// ─── Edge case 6: user footer ─────────────────────────────────────────────────

describe('SideNavigation — user footer (edge case 6)', () => {
  const user = { name: 'Jane Doe', role: 'Admin', email: 'jane@example.com' }

  it('renders user name when user prop is provided', () => {
    renderNav({ user })
    expect(screen.getByText('Jane Doe')).toBeTruthy()
  })

  it('renders email (preferred over role) in user footer', () => {
    renderNav({ user })
    expect(screen.getByText('jane@example.com')).toBeTruthy()
  })

  it('renders role when email is absent', () => {
    renderNav({ user: { name: 'Jane Doe', role: 'Admin' } })
    expect(screen.getByText('Admin')).toBeTruthy()
  })

  it('does not render user section when user prop is omitted', () => {
    renderNav()
    expect(screen.queryByText('Jane Doe')).toBeNull()
  })

  it('calls onUserMenuSelect when a user menu item is clicked', () => {
    const handler = vi.fn()
    renderNav({
      user,
      userMenuItems: [{ id: 'logout', label: 'Log out' }],
      onUserMenuSelect: handler,
    })
    // Open dropdown
    const userBtn = screen.getByRole('button', { name: /jane doe/i })
    fireEvent.click(userBtn)
    // Click menu item
    fireEvent.click(screen.getByRole('button', { name: /log out/i }))
    expect(handler).toHaveBeenCalledWith('logout')
  })
})

// ─── Edge case 7: module header dropdown ─────────────────────────────────────

describe('SideNavigation — module header (edge case 7)', () => {
  const moduleHeader = { label: 'Food Alliance' }
  const moduleHeaderItems = [
    { id: 'food', label: 'Food Alliance' },
    { id: 'fulfil', label: 'Fulfilment' },
  ]

  it('renders the module header label', () => {
    renderNav({ moduleHeader })
    expect(screen.getByText('Food Alliance')).toBeTruthy()
  })

  it('opens module dropdown on click when moduleHeaderItems are provided', () => {
    renderNav({ moduleHeader, moduleHeaderItems })
    const btn = screen.getByRole('button', { name: /food alliance/i })
    fireEvent.click(btn)
    expect(screen.getByRole('listbox')).toBeTruthy()
  })

  it('module header button has aria-haspopup="listbox" when items are provided', () => {
    renderNav({ moduleHeader, moduleHeaderItems })
    const btn = screen.getByRole('button', { name: /food alliance/i })
    expect(btn.getAttribute('aria-haspopup')).toBe('listbox')
  })

  it('calls onModuleHeaderSelect when a module option is selected', () => {
    const handler = vi.fn()
    renderNav({ moduleHeader, moduleHeaderItems, onModuleHeaderSelect: handler })
    fireEvent.click(screen.getByRole('button', { name: /food alliance/i }))
    // After ARIA fix: dropdown items have role="option" (not implicit "button")
    fireEvent.click(screen.getByRole('option', { name: /fulfilment/i }))
    expect(handler).toHaveBeenCalledWith('fulfil')
  })
})

// ─── Edge case 8: extremely long label text ───────────────────────────────────

describe('SideNavigation — long text (edge case 8)', () => {
  it('renders without crashing when item labels are very long', () => {
    const longLabel = 'A'.repeat(200)
    const groups: SideNavGroup[] = [
      { id: 'g', items: [{ id: 'long', label: longLabel }] },
    ]
    render(<SideNavigation groups={groups} />)
    // Component should render; label text is in DOM (possibly truncated visually)
    expect(screen.getByText(longLabel)).toBeTruthy()
  })

  it('applies truncate class to item label spans', () => {
    renderNav()
    // Every label has a .truncate span wrapping the text content
    const truncated = document.querySelectorAll('.truncate')
    expect(truncated.length).toBeGreaterThan(0)
  })
})

// ─── Edge case 9: collapse toggle ────────────────────────────────────────────

describe('SideNavigation — collapse toggle (edge case 9)', () => {
  it('renders collapse toggle button with correct aria-label when expanded', () => {
    renderNav({ collapsed: false })
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeTruthy()
  })

  it('renders collapse toggle button with correct aria-label when collapsed', () => {
    renderNav({ collapsed: true })
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeTruthy()
  })

  it('calls onCollapsedChange with toggled value when toggle is clicked (uncontrolled)', () => {
    const handler = vi.fn()
    renderNav({ defaultCollapsed: false, onCollapsedChange: handler })
    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('hides collapse toggle when showCollapseButton=false', () => {
    renderNav({ showCollapseButton: false })
    expect(screen.queryByRole('button', { name: /collapse sidebar/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /expand sidebar/i })).toBeNull()
  })
})
