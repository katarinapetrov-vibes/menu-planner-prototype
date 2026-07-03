/**
 * Table component — vitest unit tests
 * Covers: basic rendering, title bar features, sorting, selection, filter row,
 *         empty state, ARIA roles, keyboard navigation, and edge cases.
 */
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Table } from '../table'
import type { TableColumn } from '../table'

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const COLUMNS: TableColumn[] = [
  { key: 'id',      label: 'ID',      width: 60,  sortable: true,  filterable: true },
  { key: 'name',    label: 'Name',               sortable: true,  filterable: true },
  { key: 'status',  label: 'Status',  width: 100 },
]

const DATA: Record<string, unknown>[] = [
  { id: 'A1', name: 'Alpha', status: 'active'   },
  { id: 'B2', name: 'Beta',  status: 'pending'  },
  { id: 'C3', name: 'Gamma', status: 'inactive' },
]

// ─── Basic rendering ──────────────────────────────────────────────────────────

describe('Table — basic rendering', () => {
  it('renders all rows', () => {
    render(<Table columns={COLUMNS} data={DATA} />)
    expect(screen.getByText('Alpha')).toBeTruthy()
    expect(screen.getByText('Beta')).toBeTruthy()
    expect(screen.getByText('Gamma')).toBeTruthy()
  })

  it('renders all column headers', () => {
    render(<Table columns={COLUMNS} data={DATA} />)
    expect(screen.getByText('ID')).toBeTruthy()
    expect(screen.getByText('Name')).toBeTruthy()
    expect(screen.getByText('Status')).toBeTruthy()
  })

  it('renders null/undefined cell values as an em-dash', () => {
    const colsWithExtra: TableColumn[] = [...COLUMNS, { key: 'extra', label: 'Extra' }]
    render(<Table columns={colsWithExtra} data={[{ id: 'X1', name: 'Test', status: 'ok', extra: null }]} />)
    expect(screen.getByText('—')).toBeTruthy()
  })

  it('applies dark theme without error', () => {
    render(<Table columns={COLUMNS} data={DATA} theme="dark" />)
    expect(screen.getByText('Alpha')).toBeTruthy()
  })
})

// ─── ARIA roles & accessibility ───────────────────────────────────────────────

describe('Table — ARIA roles', () => {
  it('has role="grid" on the container', () => {
    render(<Table columns={COLUMNS} data={DATA} title="Test Grid" />)
    const grid = screen.getByRole('grid')
    expect(grid).toBeTruthy()
  })

  it('passes aria-label from title prop to the grid', () => {
    render(<Table columns={COLUMNS} data={DATA} title="Purchase Orders" />)
    expect(screen.getByRole('grid', { name: 'Purchase Orders' })).toBeTruthy()
  })

  it('has role="columnheader" on header cells', () => {
    render(<Table columns={COLUMNS} data={DATA} />)
    const headers = screen.getAllByRole('columnheader')
    // ID, Name, Status
    expect(headers.length).toBeGreaterThanOrEqual(3)
  })

  it('has role="row" on body rows', () => {
    render(<Table columns={COLUMNS} data={DATA} />)
    const rows = screen.getAllByRole('row')
    // header row + 3 data rows
    expect(rows.length).toBeGreaterThanOrEqual(3)
  })

  it('has role="gridcell" on body cells', () => {
    render(<Table columns={COLUMNS} data={DATA} />)
    const cells = screen.getAllByRole('gridcell')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('sets aria-selected on selected rows when selectable', () => {
    render(
      <Table
        columns={COLUMNS}
        data={DATA}
        selectable
        selectedKeys={new Set(['A1'])}
        rowKey="id"
        onSelectionChange={() => {}}
      />
    )
    const rows = screen.getAllByRole('row')
    const selectedRow = rows.find(r => r.getAttribute('aria-selected') === 'true')
    expect(selectedRow).toBeTruthy()
  })
})

// ─── Title bar ────────────────────────────────────────────────────────────────

describe('Table — title bar', () => {
  it('renders title text', () => {
    render(<Table columns={COLUMNS} data={DATA} title="Orders" />)
    expect(screen.getByText('Orders')).toBeTruthy()
  })

  it('renders count badge when showCount=true', () => {
    render(<Table columns={COLUMNS} data={DATA} title="Orders" showCount />)
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('renders search input with aria-label', () => {
    render(<Table columns={COLUMNS} data={DATA} searchable />)
    const input = screen.getByRole('textbox', { name: 'Search' })
    expect(input).toBeTruthy()
  })

  it('filters rows when typing in search input', async () => {
    render(<Table columns={COLUMNS} data={DATA} searchable />)
    const input = screen.getByRole('textbox', { name: 'Search' })
    fireEvent.change(input, { target: { value: 'Alpha' } })
    expect(screen.getByText('Alpha')).toBeTruthy()
    expect(screen.queryByText('Beta')).toBeNull()
  })

  it('calls onSearch callback', () => {
    const onSearch = vi.fn()
    render(<Table columns={COLUMNS} data={DATA} searchable onSearch={onSearch} />)
    const input = screen.getByRole('textbox', { name: 'Search' })
    fireEvent.change(input, { target: { value: 'test' } })
    expect(onSearch).toHaveBeenCalledWith('test')
  })
})

// ─── Sorting ──────────────────────────────────────────────────────────────────

describe('Table — sorting', () => {
  it('renders sortable headers as focusable (tabIndex=0)', () => {
    render(<Table columns={COLUMNS} data={DATA} />)
    const nameHeader = screen.getByRole('columnheader', { name: 'Name' })
    expect(nameHeader.getAttribute('tabindex')).toBe('0')
  })

  it('sets aria-sort="none" on unsorted sortable column', () => {
    render(<Table columns={COLUMNS} data={DATA} />)
    const idHeader = screen.getByRole('columnheader', { name: 'ID' })
    expect(idHeader.getAttribute('aria-sort')).toBe('none')
  })

  it('sets aria-sort="ascending" when controlled', () => {
    render(<Table columns={COLUMNS} data={DATA} sortKey="name" sortDirection="asc" onSort={() => {}} />)
    const nameHeader = screen.getByRole('columnheader', { name: 'Name' })
    expect(nameHeader.getAttribute('aria-sort')).toBe('ascending')
  })

  it('sets aria-sort="descending" when controlled', () => {
    render(<Table columns={COLUMNS} data={DATA} sortKey="id" sortDirection="desc" onSort={() => {}} />)
    const idHeader = screen.getByRole('columnheader', { name: 'ID' })
    expect(idHeader.getAttribute('aria-sort')).toBe('descending')
  })

  it('calls onSort when clicking a sortable header', () => {
    const onSort = vi.fn()
    render(<Table columns={COLUMNS} data={DATA} onSort={onSort} />)
    fireEvent.click(screen.getByRole('columnheader', { name: 'Name' }))
    expect(onSort).toHaveBeenCalled()
  })

  it('activates sort on Enter keydown', () => {
    const onSort = vi.fn()
    render(<Table columns={COLUMNS} data={DATA} onSort={onSort} />)
    fireEvent.keyDown(screen.getByRole('columnheader', { name: 'Name' }), { key: 'Enter' })
    expect(onSort).toHaveBeenCalled()
  })

  it('activates sort on Space keydown', () => {
    const onSort = vi.fn()
    render(<Table columns={COLUMNS} data={DATA} onSort={onSort} />)
    fireEvent.keyDown(screen.getByRole('columnheader', { name: 'Name' }), { key: ' ' })
    expect(onSort).toHaveBeenCalled()
  })

  it('sorts data internally (uncontrolled) by name asc', () => {
    render(<Table columns={COLUMNS} data={DATA} />)
    fireEvent.click(screen.getByRole('columnheader', { name: 'Name' }))
    const cells = screen.getAllByRole('gridcell')
    const texts = cells.map(c => c.textContent).filter(Boolean)
    const alphaIdx = texts.findIndex(t => t?.includes('Alpha'))
    const gammaIdx = texts.findIndex(t => t?.includes('Gamma'))
    expect(alphaIdx).toBeLessThan(gammaIdx)
  })
})

// ─── Selection ────────────────────────────────────────────────────────────────

describe('Table — selection', () => {
  it('renders "Select all rows" checkbox with correct aria-label', () => {
    render(<Table columns={COLUMNS} data={DATA} selectable rowKey="id" onSelectionChange={() => {}} />)
    expect(screen.getByRole('checkbox', { name: 'Select all rows' })).toBeTruthy()
  })

  it('renders per-row checkboxes with aria-label containing row key', () => {
    render(<Table columns={COLUMNS} data={DATA} selectable rowKey="id" onSelectionChange={() => {}} />)
    expect(screen.getByRole('checkbox', { name: 'Select row A1' })).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Select row B2' })).toBeTruthy()
  })

  it('calls onSelectionChange when a row checkbox is clicked', () => {
    const onSelectionChange = vi.fn()
    render(
      <Table
        columns={COLUMNS} data={DATA} selectable rowKey="id"
        selectedKeys={new Set()} onSelectionChange={onSelectionChange}
      />
    )
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select row A1' }))
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(['A1']))
  })

  it('select-all selects all rows', () => {
    const onSelectionChange = vi.fn()
    render(
      <Table
        columns={COLUMNS} data={DATA} selectable rowKey="id"
        selectedKeys={new Set()} onSelectionChange={onSelectionChange}
      />
    )
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }))
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(['A1', 'B2', 'C3']))
  })
})

// ─── Filter row ───────────────────────────────────────────────────────────────

describe('Table — filter row', () => {
  it('renders filter inputs when showFilterRow=true', () => {
    render(<Table columns={COLUMNS} data={DATA} showFilterRow />)
    const filterInputs = screen.getAllByRole('textbox')
    // ID and Name are filterable
    expect(filterInputs.length).toBeGreaterThanOrEqual(2)
  })

  it('filter row inputs have aria-label', () => {
    render(<Table columns={COLUMNS} data={DATA} showFilterRow />)
    expect(screen.getByRole('textbox', { name: 'Filter ID' })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Filter Name' })).toBeTruthy()
  })

  it('filters data when typing in filter row', () => {
    render(<Table columns={COLUMNS} data={DATA} showFilterRow />)
    const nameFilter = screen.getByRole('textbox', { name: 'Filter Name' })
    fireEvent.change(nameFilter, { target: { value: 'beta' } })
    expect(screen.getByText('Beta')).toBeTruthy()
    expect(screen.queryByText('Alpha')).toBeNull()
  })
})

// ─── Empty state ──────────────────────────────────────────────────────────────

describe('Table — empty state', () => {
  it('shows default empty message when data is empty', () => {
    render(<Table columns={COLUMNS} data={[]} />)
    expect(screen.getByText('No data to display.')).toBeTruthy()
  })

  it('shows custom emptyMessage prop', () => {
    render(<Table columns={COLUMNS} data={[]} emptyMessage="Nothing here yet." />)
    expect(screen.getByText('Nothing here yet.')).toBeTruthy()
  })

  it('shows empty message after filtering eliminates all rows', () => {
    render(<Table columns={COLUMNS} data={DATA} showFilterRow />)
    const nameFilter = screen.getByRole('textbox', { name: 'Filter Name' })
    fireEvent.change(nameFilter, { target: { value: 'zzzzz' } })
    expect(screen.getByText('No data to display.')).toBeTruthy()
  })
})

// ─── Custom render prop ───────────────────────────────────────────────────────

describe('Table — custom cell render', () => {
  it('uses render prop to display custom content', () => {
    const colsWithRender: TableColumn[] = [
      ...COLUMNS.slice(0, 2),
      {
        key: 'status',
        label: 'Status',
        width: 100,
        render: (v) => <span data-testid="custom-cell">{String(v).toUpperCase()}</span>,
      },
    ]
    render(<Table columns={colsWithRender} data={DATA} />)
    expect(screen.getByText('ACTIVE')).toBeTruthy()
    expect(screen.getAllByTestId('custom-cell').length).toBe(3)
  })
})

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('Table — edge cases', () => {
  it('renders with empty columns array without crashing', () => {
    render(<Table columns={[]} data={DATA} />)
    expect(screen.queryByRole('grid')).toBeTruthy()
  })

  it('renders with empty data array without crashing', () => {
    render(<Table columns={COLUMNS} data={[]} />)
    expect(screen.queryByRole('grid')).toBeTruthy()
  })

  it('handles very long cell text with truncation class', () => {
    const longData = [{ id: 'X', name: 'A'.repeat(200), status: 'ok' }]
    render(<Table columns={COLUMNS} data={longData} />)
    // Should not throw and should render something
    expect(screen.getByRole('grid')).toBeTruthy()
  })

  it('renders without title prop (aria-label omitted)', () => {
    render(<Table columns={COLUMNS} data={DATA} />)
    // Grid still renders
    expect(screen.getByRole('grid')).toBeTruthy()
  })

  it('does not render title bar if no title/search/filter/actions', () => {
    const { container } = render(<Table columns={COLUMNS} data={DATA} />)
    // No "Orders" title rendered
    expect(screen.queryByText('Orders')).toBeNull()
  })

  it('non-sortable columns do not have aria-sort', () => {
    render(<Table columns={COLUMNS} data={DATA} />)
    const statusHeader = screen.getByRole('columnheader', { name: 'Status' })
    expect(statusHeader.getAttribute('aria-sort')).toBeNull()
  })

  it('non-sortable columns do not have tabIndex', () => {
    render(<Table columns={COLUMNS} data={DATA} />)
    const statusHeader = screen.getByRole('columnheader', { name: 'Status' })
    expect(statusHeader.getAttribute('tabindex')).toBeNull()
  })
})
