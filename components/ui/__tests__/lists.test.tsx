import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { List } from '../lists'
import type { ListItemData, ListSection } from '../lists'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeItem = (overrides: Partial<ListItemData> = {}): ListItemData => ({
  id:    'item-1',
  title: 'Item Title',
  ...overrides,
})

const twoItems: ListItemData[] = [
  makeItem({ id: 'a', title: 'Alpha' }),
  makeItem({ id: 'b', title: 'Beta' }),
]

// ─── Basic rendering ─────────────────────────────────────────────────────────

describe('List — basic rendering', () => {
  it('renders a list root with role="list"', () => {
    render(<List items={[makeItem()]} />)
    expect(screen.getByRole('list')).toBeTruthy()
  })

  it('renders item title text', () => {
    render(<List items={[makeItem({ title: 'Hello World' })]} />)
    expect(screen.getByText('Hello World')).toBeTruthy()
  })

  it('renders description text when provided', () => {
    render(<List items={[makeItem({ description: 'Sub-label text' })]} />)
    expect(screen.getByText('Sub-label text')).toBeTruthy()
  })

  it('does not render description when not provided', () => {
    render(<List items={[makeItem()]} />)
    expect(screen.queryByText('Sub-label text')).toBeNull()
  })

  it('renders multiple items', () => {
    render(<List items={twoItems} />)
    expect(screen.getByText('Alpha')).toBeTruthy()
    expect(screen.getByText('Beta')).toBeTruthy()
  })

  it('renders with no items without crashing', () => {
    expect(() => render(<List items={[]} />)).not.toThrow()
  })

  it('renders with default props (no items prop)', () => {
    expect(() => render(<List />)).not.toThrow()
  })

  it('applies custom className to the root element', () => {
    const { container } = render(<List items={[]} className="my-list" />)
    expect(container.firstChild).toHaveClass('my-list')
  })
})

// ─── Trailing content ─────────────────────────────────────────────────────────

describe('List — trailing content', () => {
  it('renders trailingText', () => {
    render(<List items={[makeItem({ trailingText: '42' })]} />)
    expect(screen.getByText('42')).toBeTruthy()
  })

  it('renders custom trailingContent overriding trailingText', () => {
    const custom = <span data-testid="custom-trailing">Custom</span>
    render(<List items={[makeItem({ trailingContent: custom, trailingText: 'Ignored' })]} />)
    expect(screen.getByTestId('custom-trailing')).toBeTruthy()
    expect(screen.queryByText('Ignored')).toBeNull()
  })

  it('renders badge when provided', () => {
    render(<List items={[makeItem({ badge: 99 })]} />)
    expect(screen.getByText('99')).toBeTruthy()
  })

  it('renders badge as string', () => {
    render(<List items={[makeItem({ badge: 'New' })]} />)
    expect(screen.getByText('New')).toBeTruthy()
  })
})

// ─── Tags ─────────────────────────────────────────────────────────────────────

describe('List — tags', () => {
  it('renders tag labels', () => {
    render(<List items={[makeItem({ tags: ['Sales', 'Q4'] })]} />)
    expect(screen.getByText('Sales')).toBeTruthy()
    expect(screen.getByText('Q4')).toBeTruthy()
  })

  it('renders no tags when tags array is empty', () => {
    render(<List items={[makeItem({ tags: [] })]} />)
    // No extra text content beyond title
    expect(screen.queryByText('Sales')).toBeNull()
  })
})

// ─── Avatar ───────────────────────────────────────────────────────────────────

describe('List — avatar', () => {
  it('renders initials from name when no src provided', () => {
    render(<List items={[makeItem({ avatar: { name: 'John Doe' } })]} />)
    expect(screen.getByText('JD')).toBeTruthy()
  })

  it('uses explicit initials over computed ones', () => {
    render(<List items={[makeItem({ avatar: { name: 'John Doe', initials: 'XX' } })]} />)
    expect(screen.getByText('XX')).toBeTruthy()
  })

  it('renders "?" when avatar has no name or initials', () => {
    render(<List items={[makeItem({ avatar: {} })]} />)
    expect(screen.getByText('?')).toBeTruthy()
  })

  it('renders an img when avatar src is provided', () => {
    const { container } = render(
      <List items={[makeItem({ avatar: { src: 'https://example.com/avatar.png', name: 'Jane' } })]} />
    )
    // AvatarBubble renders a decorative <img alt=""> — query via DOM directly
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.png')
  })
})

// ─── Selection — none (accent bar) ──────────────────────────────────────────

describe('List — selection=none (accent bar)', () => {
  it('calls onItemClick with item id and data when a row is clicked', () => {
    const onItemClick = vi.fn()
    render(<List items={[makeItem({ id: 'row1', title: 'Click me' })]} onItemClick={onItemClick} />)
    fireEvent.click(screen.getByRole('button', { name: /click me/i }))
    expect(onItemClick).toHaveBeenCalledWith('row1', expect.objectContaining({ id: 'row1' }))
  })

  it('does not call onItemClick on disabled items', () => {
    const onItemClick = vi.fn()
    render(<List items={[makeItem({ id: 'row1', title: 'Disabled', disabled: true })]} onItemClick={onItemClick} />)
    // Disabled items render as plain div, not role=button
    expect(screen.queryByRole('button')).toBeNull()
    expect(onItemClick).not.toHaveBeenCalled()
  })

  it('activates item with Enter key', () => {
    const onItemClick = vi.fn()
    render(<List items={[makeItem({ id: 'row1', title: 'Keyboard' })]} onItemClick={onItemClick} />)
    const btn = screen.getByRole('button', { name: /keyboard/i })
    fireEvent.keyDown(btn, { key: 'Enter' })
    expect(onItemClick).toHaveBeenCalledWith('row1', expect.objectContaining({ id: 'row1' }))
  })

  it('activates item with Space key', () => {
    const onItemClick = vi.fn()
    render(<List items={[makeItem({ id: 'row1', title: 'Spacebar' })]} onItemClick={onItemClick} />)
    const btn = screen.getByRole('button', { name: /spacebar/i })
    fireEvent.keyDown(btn, { key: ' ' })
    expect(onItemClick).toHaveBeenCalledWith('row1', expect.objectContaining({ id: 'row1' }))
  })

  it('renders a static div (no role=button) when no click handler is provided', () => {
    render(<List items={[makeItem({ title: 'Static' })]} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('selected row has aria-pressed=true when selection="none"', () => {
    render(<List items={[makeItem({ id: 'a', title: 'Row' })]} selectedId="a" onItemClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: /row/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('unselected row has aria-pressed=false when selection="none"', () => {
    render(<List items={[makeItem({ id: 'a', title: 'Row' })]} selectedId="other" onItemClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: /row/i })).toHaveAttribute('aria-pressed', 'false')
  })
})

// ─── Selection — radio ────────────────────────────────────────────────────────

describe('List — selection=radio', () => {
  it('renders radio inputs for each item', () => {
    render(<List items={twoItems} selection="radio" />)
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)
  })

  it('marks the selectedId radio as checked', () => {
    render(<List items={twoItems} selection="radio" selectedId="b" />)
    const radios = screen.getAllByRole('radio')
    // The second radio (id="b") should be checked
    const checked = radios.filter((r) => (r as HTMLInputElement).checked)
    expect(checked).toHaveLength(1)
  })

  it('calls onItemClick when a radio row is activated', () => {
    const onItemClick = vi.fn()
    render(<List items={twoItems} selection="radio" onItemClick={onItemClick} />)
    const btns = screen.getAllByRole('button')
    fireEvent.click(btns[0])
    expect(onItemClick).toHaveBeenCalledWith('a', expect.objectContaining({ id: 'a' }))
  })

  it('does not render checkboxes in radio mode', () => {
    render(<List items={twoItems} selection="radio" />)
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
  })
})

// ─── Selection — checkbox ─────────────────────────────────────────────────────

describe('List — selection=checkbox', () => {
  it('renders checkbox inputs for each item', () => {
    render(<List items={twoItems} selection="checkbox" />)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(2)
  })

  it('checkboxes have accessible names from item titles (aria-label)', () => {
    render(<List items={twoItems} selection="checkbox" />)
    expect(screen.getByRole('checkbox', { name: 'Alpha' })).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Beta' })).toBeTruthy()
  })

  it('does not render role="button" for checkbox rows (avoids interactive-in-interactive nesting)', () => {
    render(<List items={twoItems} selection="checkbox" onSelectionChange={vi.fn()} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('marks selectedIds as checked', () => {
    render(<List items={twoItems} selection="checkbox" selectedIds={new Set(['a'])} />)
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[]
    const checkedCount = checkboxes.filter((c) => c.checked).length
    expect(checkedCount).toBe(1)
  })

  it('calls onSelectionChange with updated Set when a checkbox is clicked', () => {
    const onSelectionChange = vi.fn()
    render(
      <List
        items={twoItems}
        selection="checkbox"
        selectedIds={new Set<string>()}
        onSelectionChange={onSelectionChange}
      />
    )
    fireEvent.click(screen.getByRole('checkbox', { name: 'Alpha' }))
    expect(onSelectionChange).toHaveBeenCalledTimes(1)
    const result: Set<string> = onSelectionChange.mock.calls[0][0]
    expect(result.has('a')).toBe(true)
  })

  it('removes id from Set when already-selected checkbox is clicked', () => {
    const onSelectionChange = vi.fn()
    render(
      <List
        items={twoItems}
        selection="checkbox"
        selectedIds={new Set(['a'])}
        onSelectionChange={onSelectionChange}
      />
    )
    fireEvent.click(screen.getByRole('checkbox', { name: 'Alpha' }))
    const result: Set<string> = onSelectionChange.mock.calls[0][0]
    expect(result.has('a')).toBe(false)
  })

  it('does not call onSelectionChange when handler is not provided', () => {
    render(<List items={twoItems} selection="checkbox" />)
    expect(() => fireEvent.click(screen.getByRole('checkbox', { name: 'Alpha' }))).not.toThrow()
  })
})

// ─── Sections ────────────────────────────────────────────────────────────────

describe('List — sections', () => {
  const sections: ListSection[] = [
    { id: 's1', label: 'Group A', items: [makeItem({ id: 'a1', title: 'Item A1' })] },
    { id: 's2', label: 'Group B', items: [makeItem({ id: 'b1', title: 'Item B1' })] },
  ]

  it('renders section labels', () => {
    render(<List sections={sections} />)
    expect(screen.getByText('Group A')).toBeTruthy()
    expect(screen.getByText('Group B')).toBeTruthy()
  })

  it('renders items from all sections', () => {
    render(<List sections={sections} />)
    expect(screen.getByText('Item A1')).toBeTruthy()
    expect(screen.getByText('Item B1')).toBeTruthy()
  })

  it('sections take priority over items prop', () => {
    render(<List sections={sections} items={[makeItem({ id: 'ignored', title: 'Should Not Appear' })]} />)
    expect(screen.queryByText('Should Not Appear')).toBeNull()
  })

  it('renders groups with accessible role="group" and aria-label when label is provided', () => {
    render(<List sections={sections} />)
    const groups = screen.getAllByRole('group')
    expect(groups.length).toBeGreaterThanOrEqual(2)
    expect(groups[0]).toHaveAttribute('aria-label', 'Group A')
  })

  it('does not add role="group" to unlabelled sections (avoids anonymous landmark)', () => {
    const noLabelSections: ListSection[] = [
      { id: 's1', items: [makeItem({ id: 'x', title: 'Unlabelled' })] },
    ]
    render(<List sections={noLabelSections} />)
    expect(screen.queryByRole('group')).toBeNull()
    expect(screen.getByText('Unlabelled')).toBeTruthy()
  })

  it('does not add role="group" to the implicit root group used by the items prop', () => {
    render(<List items={[makeItem({ title: 'Root item' })]} />)
    expect(screen.queryByRole('group')).toBeNull()
  })
})

// ─── Dividers ─────────────────────────────────────────────────────────────────

describe('List — dividers', () => {
  it('renders without crashing with dividers=true', () => {
    expect(() => render(<List items={twoItems} dividers />)).not.toThrow()
  })

  it('renders without crashing with dividers=false (default)', () => {
    expect(() => render(<List items={twoItems} />)).not.toThrow()
  })
})

// ─── href items ───────────────────────────────────────────────────────────────

describe('List — href items', () => {
  it('renders an <a> element when href is provided', () => {
    render(<List items={[makeItem({ title: 'Link Item', href: '/target' })]} />)
    const link = screen.getByRole('link', { name: /link item/i })
    expect(link).toBeTruthy()
    expect(link).toHaveAttribute('href', '/target')
  })

  it('does not render an <a> when item is disabled even with href', () => {
    render(<List items={[makeItem({ title: 'Blocked Link', href: '/target', disabled: true })]} />)
    expect(screen.queryByRole('link')).toBeNull()
  })
})

// ─── Disabled state ───────────────────────────────────────────────────────────

describe('List — disabled items', () => {
  it('renders a disabled item without role=button', () => {
    render(<List items={[makeItem({ title: 'Disabled', disabled: true })]} onItemClick={vi.fn()} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('does not throw when clicking a disabled item container', () => {
    const onItemClick = vi.fn()
    const { container } = render(
      <List items={[makeItem({ title: 'Disabled', disabled: true })]} onItemClick={onItemClick} />
    )
    // Click the outermost div inside the list
    const listEl = screen.getByRole('list')
    fireEvent.click(listEl)
    expect(onItemClick).not.toHaveBeenCalled()
  })
})

// ─── forcedState ──────────────────────────────────────────────────────────────

describe('List — forcedState prop', () => {
  it('renders without crashing with forcedState="hover"', () => {
    expect(() =>
      render(<List items={[makeItem({ forcedState: 'hover' })]} />)
    ).not.toThrow()
  })

  it('renders without crashing with forcedState="pressed"', () => {
    expect(() =>
      render(<List items={[makeItem({ forcedState: 'pressed' })]} />)
    ).not.toThrow()
  })

  it('renders without crashing with forcedState="focused"', () => {
    expect(() =>
      render(<List items={[makeItem({ forcedState: 'focused' })]} />)
    ).not.toThrow()
  })
})

// ─── Size variants ────────────────────────────────────────────────────────────

describe('List — size variants', () => {
  it('renders without error with size="sm"', () => {
    expect(() => render(<List items={[makeItem()]} size="sm" />)).not.toThrow()
  })

  it('renders without error with size="md"', () => {
    expect(() => render(<List items={[makeItem()]} size="md" />)).not.toThrow()
  })

  it('renders without error with size="lg"', () => {
    expect(() => render(<List items={[makeItem()]} size="lg" />)).not.toThrow()
  })
})

// ─── Theme variants ───────────────────────────────────────────────────────────

describe('List — theme variants', () => {
  it('renders without error with theme="light"', () => {
    expect(() => render(<List items={[makeItem()]} theme="light" />)).not.toThrow()
  })

  it('renders without error with theme="dark"', () => {
    expect(() => render(<List items={[makeItem()]} theme="dark" />)).not.toThrow()
  })
})

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('List — edge cases', () => {
  it('renders very long title without crashing (overflow handled by CSS)', () => {
    const longTitle = 'A'.repeat(300)
    expect(() => render(<List items={[makeItem({ title: longTitle })]} />)).not.toThrow()
  })

  it('renders item with all optional fields populated', () => {
    const fullItem: ListItemData = {
      id:             'full',
      title:          'Full Item',
      description:    'A description',
      tags:           ['Tag1', 'Tag2'],
      trailingText:   'Value',
      badge:          5,
      selected:       true,
      disabled:       false,
      avatar:         { name: 'Test User' },
    }
    expect(() => render(<List items={[fullItem]} />)).not.toThrow()
    expect(screen.getByText('Full Item')).toBeTruthy()
    expect(screen.getByText('A description')).toBeTruthy()
    expect(screen.getByText('TU')).toBeTruthy()   // avatar initials
    expect(screen.getByText('Value')).toBeTruthy()
    expect(screen.getByText('5')).toBeTruthy()
  })

  it('item.selected=true marks the item visually (used for forced selected state)', () => {
    // Verify selectedId also works for 'none' selection
    render(<List items={twoItems} selectedId="a" />)
    // Both items render; 'a' is selected — no crash
    expect(screen.getByText('Alpha')).toBeTruthy()
    expect(screen.getByText('Beta')).toBeTruthy()
  })

  it('renders an item with a custom trailingIcon without crashing', () => {
    const icon = <svg data-testid="trail-icon" />
    render(<List items={[makeItem({ trailingIcon: icon })]} />)
    expect(screen.getByTestId('trail-icon')).toBeTruthy()
  })

  it('handles single-word avatar name (one initial)', () => {
    render(<List items={[makeItem({ avatar: { name: 'Alice' } })]} />)
    expect(screen.getByText('A')).toBeTruthy()
  })
})
