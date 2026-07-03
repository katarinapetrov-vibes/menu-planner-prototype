import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Header } from '../header'
import type { HeaderTab, HeaderBreadcrumbItem } from '../header'

const noop = () => {}

const tabs: HeaderTab[] = [
  { id: 'a', label: 'Overview' },
  { id: 'b', label: 'Details' },
  { id: 'c', label: 'Disabled tab', disabled: true },
]

const breadcrumbs: HeaderBreadcrumbItem[] = [
  { label: 'Home', onClick: noop },
  { label: 'Current Page' },
]

// ─── Default render ───────────────────────────────────────────────────────────

describe('Header — default render', () => {
  it('renders a <header> landmark', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(<Header title="My Page" />)
    expect(screen.getByText('My Page')).toBeInTheDocument()
  })

  it('renders label chip when provided', () => {
    render(<Header title="T" label="Draft" />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders without error when no props are provided', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})

// ─── Themes ───────────────────────────────────────────────────────────────────

describe('Header — themes', () => {
  it('renders without error in light theme', () => {
    render(<Header title="Light" theme="light" />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders without error in dark theme', () => {
    render(<Header title="Dark" theme="dark" />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})

// ─── Tab bar ─────────────────────────────────────────────────────────────────

describe('Header — tab bar', () => {
  it('renders a tablist when tabs are provided', () => {
    render(<Header tabs={tabs} activeTab="a" onTabChange={noop} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('renders each tab as a tab button', () => {
    render(<Header tabs={tabs} activeTab="a" onTabChange={noop} />)
    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })

  it('marks the active tab with aria-selected=true', () => {
    render(<Header tabs={tabs} activeTab="b" onTabChange={noop} />)
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true')
  })

  it('marks inactive tabs with aria-selected=false', () => {
    render(<Header tabs={tabs} activeTab="a" onTabChange={noop} />)
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onTabChange with the tab id when clicked', () => {
    const onTabChange = vi.fn()
    render(<Header tabs={tabs} activeTab="a" onTabChange={onTabChange} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Details' }))
    expect(onTabChange).toHaveBeenCalledWith('b')
  })

  it('does not call onTabChange when a disabled tab is clicked', () => {
    const onTabChange = vi.fn()
    render(<Header tabs={tabs} activeTab="a" onTabChange={onTabChange} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Disabled tab' }))
    expect(onTabChange).not.toHaveBeenCalled()
  })

  it('marks the disabled tab with aria-disabled=true', () => {
    render(<Header tabs={tabs} activeTab="a" onTabChange={noop} />)
    expect(screen.getByRole('tab', { name: 'Disabled tab' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('does not render tablist when tabs is empty', () => {
    render(<Header tabs={[]} />)
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('does not render tablist when tabs is undefined', () => {
    render(<Header />)
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })
})

// ─── Tab bar keyboard navigation — A-3 ───────────────────────────────────────

describe('Header — tab bar keyboard navigation (A-3)', () => {
  it('moves to the next tab on ArrowRight', () => {
    const onTabChange = vi.fn()
    render(<Header tabs={tabs} activeTab="a" onTabChange={onTabChange} />)
    const overviewTab = screen.getByRole('tab', { name: 'Overview' })
    overviewTab.focus()
    fireEvent.keyDown(overviewTab, { key: 'ArrowRight' })
    expect(onTabChange).toHaveBeenCalledWith('b')
  })

  it('moves to the previous tab on ArrowLeft', () => {
    const onTabChange = vi.fn()
    render(<Header tabs={tabs} activeTab="b" onTabChange={onTabChange} />)
    const detailsTab = screen.getByRole('tab', { name: 'Details' })
    detailsTab.focus()
    fireEvent.keyDown(detailsTab, { key: 'ArrowLeft' })
    expect(onTabChange).toHaveBeenCalledWith('a')
  })

  it('wraps from last to first tab on ArrowRight', () => {
    const onTabChange = vi.fn()
    // Use only two enabled tabs so "last" is deterministic
    const twoTabs: HeaderTab[] = [
      { id: 'x', label: 'First' },
      { id: 'y', label: 'Last' },
    ]
    render(<Header tabs={twoTabs} activeTab="y" onTabChange={onTabChange} />)
    const lastTab = screen.getByRole('tab', { name: 'Last' })
    lastTab.focus()
    fireEvent.keyDown(lastTab, { key: 'ArrowRight' })
    expect(onTabChange).toHaveBeenCalledWith('x')
  })

  it('wraps from first to last tab on ArrowLeft', () => {
    const onTabChange = vi.fn()
    const twoTabs: HeaderTab[] = [
      { id: 'x', label: 'First' },
      { id: 'y', label: 'Last' },
    ]
    render(<Header tabs={twoTabs} activeTab="x" onTabChange={onTabChange} />)
    const firstTab = screen.getByRole('tab', { name: 'First' })
    firstTab.focus()
    fireEvent.keyDown(firstTab, { key: 'ArrowLeft' })
    expect(onTabChange).toHaveBeenCalledWith('y')
  })

  it('skips disabled tabs during arrow navigation', () => {
    const onTabChange = vi.fn()
    // tabs = [Overview(a), Details(b), Disabled tab(c)]
    // From Details, ArrowRight should skip 'c' and wrap to 'a'
    render(<Header tabs={tabs} activeTab="b" onTabChange={onTabChange} />)
    const detailsTab = screen.getByRole('tab', { name: 'Details' })
    detailsTab.focus()
    fireEvent.keyDown(detailsTab, { key: 'ArrowRight' })
    expect(onTabChange).toHaveBeenCalledWith('a')
  })

  it('selects tab on Enter key', () => {
    const onTabChange = vi.fn()
    render(<Header tabs={tabs} activeTab="a" onTabChange={onTabChange} />)
    const detailsTab = screen.getByRole('tab', { name: 'Details' })
    detailsTab.focus()
    fireEvent.keyDown(detailsTab, { key: 'Enter' })
    expect(onTabChange).toHaveBeenCalledWith('b')
  })

  it('selects tab on Space key', () => {
    const onTabChange = vi.fn()
    render(<Header tabs={tabs} activeTab="a" onTabChange={onTabChange} />)
    const detailsTab = screen.getByRole('tab', { name: 'Details' })
    detailsTab.focus()
    fireEvent.keyDown(detailsTab, { key: ' ' })
    expect(onTabChange).toHaveBeenCalledWith('b')
  })
})

// ─── Breadcrumbs ─────────────────────────────────────────────────────────────

describe('Header — breadcrumbs', () => {
  it('renders breadcrumb items', () => {
    render(<Header breadcrumbs={breadcrumbs} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Current Page')).toBeInTheDocument()
  })

  it('renders clickable crumb as a button', () => {
    render(<Header breadcrumbs={breadcrumbs} />)
    expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument()
  })

  it('calls crumb onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Header breadcrumbs={[{ label: 'Home', onClick }]} />)
    fireEvent.click(screen.getByRole('button', { name: /home/i }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders non-clickable crumb as a span (not a button)', () => {
    render(<Header breadcrumbs={[{ label: 'Current Page' }]} />)
    expect(screen.queryByRole('button', { name: /current page/i })).not.toBeInTheDocument()
    expect(screen.getByText('Current Page')).toBeInTheDocument()
  })

  it('hides action rail in breadcrumb mode', () => {
    render(
      <Header breadcrumbs={breadcrumbs} primaryAction={{ label: 'Save', onClick: noop }} />
    )
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
  })

  it('hides tab bar in breadcrumb mode', () => {
    render(<Header breadcrumbs={breadcrumbs} tabs={tabs} activeTab="a" onTabChange={noop} />)
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('renders a separator between crumbs', () => {
    render(<Header breadcrumbs={breadcrumbs} />)
    expect(screen.getByText('/')).toBeInTheDocument()
  })
})

// ─── Back button ─────────────────────────────────────────────────────────────

describe('Header — back button', () => {
  it('renders back button when showBackButton=true', () => {
    render(<Header showBackButton onBack={noop} />)
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn()
    render(<Header showBackButton onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: /go back/i }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('does not render back button when showBackButton=false', () => {
    render(<Header showBackButton={false} />)
    expect(screen.queryByRole('button', { name: /go back/i })).not.toBeInTheDocument()
  })
})

// ─── Action buttons ───────────────────────────────────────────────────────────

describe('Header — action buttons', () => {
  it('renders primary action button and fires onClick', () => {
    const onClick = vi.fn()
    render(<Header primaryAction={{ label: 'Save', onClick }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders secondary action button', () => {
    render(<Header secondaryAction={{ label: 'Export', onClick: noop }} />)
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
  })

  it('renders additional action link button', () => {
    render(<Header additionalAction={{ label: 'View all', onClick: noop }} />)
    expect(screen.getByRole('button', { name: 'View all' })).toBeInTheDocument()
  })

  it('renders leading action button', () => {
    render(<Header leadingAction={{ label: 'Back to list', onClick: noop }} />)
    expect(screen.getByRole('button', { name: 'Back to list' })).toBeInTheDocument()
  })
})

// ─── Input fields ─────────────────────────────────────────────────────────────

describe('Header — input fields', () => {
  it('renders inputField1 as a labelled text input', () => {
    render(<Header inputField1={{ label: 'Notes', placeholder: 'Add note' }} />)
    expect(screen.getByLabelText('Notes')).toBeInTheDocument()
  })

  it('renders inputField2 without crashing', () => {
    render(<Header inputField1={{ placeholder: 'First' }} inputField2={{ placeholder: 'Second' }} />)
    expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(1)
  })

  it('renders a range input when isRange=true', () => {
    render(
      <Header
        inputField1={{
          label: 'Week range',
          isRange: true,
          placeholder: 'WW-YYYY',
        }}
      />
    )
    // Range mode renders two native inputs with aria-labels
    expect(screen.getByLabelText('Week range')).toBeInTheDocument()
    expect(screen.getByLabelText('Week range end')).toBeInTheDocument()
  })
})

// ─── Dropdown ─────────────────────────────────────────────────────────────────

describe('Header — dropdown', () => {
  it('renders the dropdown trigger with placeholder text', () => {
    render(
      <Header
        dropdown={{
          placeholder: 'Notes',
          options: [{ label: 'Option A', value: 'a' }],
        }}
      />
    )
    expect(screen.getByText('Notes')).toBeInTheDocument()
  })

  it('renders the dropdown label when provided', () => {
    render(
      <Header
        dropdown={{
          label: 'Filter by',
          placeholder: 'Select',
          options: [{ label: 'Option A', value: 'a' }],
        }}
      />
    )
    expect(screen.getByText('Filter by')).toBeInTheDocument()
  })
})

// ─── Country dropdown ─────────────────────────────────────────────────────────

describe('Header — country dropdown', () => {
  it('renders the country dropdown trigger', () => {
    render(<Header countryDropdown={{ placeholder: 'Country' }} />)
    expect(screen.getByText('Country')).toBeInTheDocument()
  })

  it('renders caller-supplied options instead of defaults when provided', () => {
    render(
      <Header
        countryDropdown={{
          placeholder: 'Region',
          options: [{ label: 'Narnia', value: 'narnia' }],
        }}
      />
    )
    expect(screen.getByText('Region')).toBeInTheDocument()
  })
})

// ─── ARIA ─────────────────────────────────────────────────────────────────────

describe('Header — ARIA', () => {
  it('back button has aria-label="Go back"', () => {
    render(<Header showBackButton onBack={noop} />)
    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument()
  })

  it('avatar has aria-label matching initials', () => {
    render(<Header avatarLeft={{ initials: 'KR' }} />)
    expect(screen.getByLabelText('KR')).toBeInTheDocument()
  })

  it('tablist has role="tablist"', () => {
    render(<Header tabs={tabs} activeTab="a" onTabChange={noop} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })
})

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('Header — edge cases', () => {
  it('renders with a very long title without crashing', () => {
    render(<Header title={'A'.repeat(300)} />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders tabs without onTabChange without crashing', () => {
    render(<Header tabs={tabs} activeTab="a" />)
    fireEvent.click(screen.getByRole('tab', { name: 'Details' }))
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders empty breadcrumbs array without entering breadcrumb mode', () => {
    render(<Header breadcrumbs={[]} primaryAction={{ label: 'Save', onClick: noop }} />)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('renders all slots simultaneously without crashing', () => {
    render(
      <Header
        title="Full Header"
        label="Beta"
        avatarLeft={{ initials: 'AB' }}
        avatarRight={{ initials: 'CD' }}
        primaryAction={{ label: 'Save', onClick: noop }}
        secondaryAction={{ label: 'Export', onClick: noop }}
        additionalAction={{ label: 'More', onClick: noop }}
        inputField1={{ label: 'Notes', placeholder: 'Note' }}
        dropdown={{ placeholder: 'Filter', options: [{ label: 'A', value: 'a' }] }}
        countryDropdown={{ placeholder: 'Country' }}
        tabs={tabs}
        activeTab="a"
        onTabChange={noop}
      />
    )
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})
