import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Pagination } from '../pagination'

const noop = () => {}

// ─── Default render ───────────────────────────────────────────────────────────

describe('Pagination — default render', () => {
  it('renders a nav landmark', () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={noop} />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('uses the aria-label prop', () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={noop} aria-label="Table navigation" />)
    expect(screen.getByRole('navigation', { name: 'Table navigation' })).toBeInTheDocument()
  })

  it('renders all four nav buttons', () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={noop} />)
    expect(screen.getByRole('button', { name: 'First page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Last page' })).toBeInTheDocument()
  })
})

// ─── Navigation ───────────────────────────────────────────────────────────────

describe('Pagination — navigation', () => {
  it('calls onPageChange with page 2 when Next is clicked from page 1', () => {
    const handler = vi.fn()
    render(<Pagination currentPage={1} totalPages={10} onPageChange={handler} />)
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(handler).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with totalPages when Skip Last is clicked', () => {
    const handler = vi.fn()
    render(<Pagination currentPage={3} totalPages={10} onPageChange={handler} />)
    fireEvent.click(screen.getByRole('button', { name: 'Last page' }))
    expect(handler).toHaveBeenCalledWith(10)
  })

  it('calls onPageChange with 1 when Skip First is clicked', () => {
    const handler = vi.fn()
    render(<Pagination currentPage={5} totalPages={10} onPageChange={handler} />)
    fireEvent.click(screen.getByRole('button', { name: 'First page' }))
    expect(handler).toHaveBeenCalledWith(1)
  })

  it('does not call onPageChange when disabled', () => {
    const handler = vi.fn()
    render(<Pagination currentPage={3} totalPages={10} onPageChange={handler} disabled />)
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(handler).not.toHaveBeenCalled()
  })
})

// ─── Disabled state at boundaries ─────────────────────────────────────────────

describe('Pagination — boundary disabled states', () => {
  it('disables First and Previous on page 1', () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={noop} />)
    expect(screen.getByRole('button', { name: 'First page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
  })

  it('disables Next and Last on the final page', () => {
    render(<Pagination currentPage={10} totalPages={10} onPageChange={noop} />)
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Last page' })).toBeDisabled()
  })

  it('enables all buttons in the middle', () => {
    render(<Pagination currentPage={5} totalPages={10} onPageChange={noop} />)
    expect(screen.getByRole('button', { name: 'First page' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).not.toBeDisabled()
  })
})

// ─── Range text ───────────────────────────────────────────────────────────────

describe('Pagination — range text', () => {
  it('shows range text when showRangeText=true', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={10}
        onPageChange={noop}
        pageSize={25}
        totalItems={100}
        showRangeText
      />
    )
    expect(screen.getByText('26–50 of 100')).toBeInTheDocument()
  })

  it('does not show range text by default', () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={noop} totalItems={100} />)
    expect(screen.queryByText(/of 100/)).not.toBeInTheDocument()
  })
})

// ─── Rows per page ────────────────────────────────────────────────────────────

describe('Pagination — rows per page', () => {
  it('shows the rows-per-page select when showRowsPerPage=true', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={10}
        onPageChange={noop}
        showRowsPerPage
        pageSize={25}
        pageSizeOptions={[10, 25, 50]}
      />
    )
    expect(screen.getByRole('combobox', { name: 'Rows per page' })).toBeInTheDocument()
  })

  it('calls onPageSizeChange when select changes', () => {
    const handler = vi.fn()
    render(
      <Pagination
        currentPage={1}
        totalPages={10}
        onPageChange={noop}
        showRowsPerPage
        pageSize={25}
        pageSizeOptions={[10, 25, 50]}
        onPageSizeChange={handler}
      />
    )
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '50' } })
    expect(handler).toHaveBeenCalledWith(50)
  })
})

// ─── Edge cases (F-1, F-2, F-3) ──────────────────────────────────────────────

describe('Pagination — edge cases', () => {
  it('F-2: does not call onPageChange when totalPages=0 and Next is clicked', () => {
    const handler = vi.fn()
    render(<Pagination currentPage={1} totalPages={0} onPageChange={handler} />)
    // All buttons should be disabled
    const nextBtn = screen.getByRole('button', { name: 'Next page' })
    expect(nextBtn).toBeDisabled()
    fireEvent.click(nextBtn)
    expect(handler).not.toHaveBeenCalled()
  })

  it('shows "Rows per page" label text', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={noop} showRowsPerPage />)
    expect(screen.getByText('Rows per page')).toBeInTheDocument()
  })
})

// ─── Themes ──────────────────────────────────────────────────────────────────

describe('Pagination — themes', () => {
  it('renders in dark theme without error', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={noop} theme="dark" />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})

// ─── Size variants ────────────────────────────────────────────────────────────

describe('Pagination — size variants', () => {
  it.each(['sm', 'md', 'lg'] as const)('renders size=%s without error', (size) => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={noop} size={size} />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})

// ─── Accessibility (B-5, B-10) ───────────────────────────────────────────────

describe('Pagination — accessibility', () => {
  it('B-5: nav buttons have aria-label attributes', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={noop} />)
    expect(screen.getByRole('button', { name: 'First page' })).toHaveAttribute('aria-label', 'First page')
    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveAttribute('aria-label', 'Previous page')
    expect(screen.getByRole('button', { name: 'Next page' })).toHaveAttribute('aria-label', 'Next page')
    expect(screen.getByRole('button', { name: 'Last page' })).toHaveAttribute('aria-label', 'Last page')
  })

  it('disabled buttons are natively disabled', () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={noop} />)
    expect(screen.getByRole('button', { name: 'First page' })).toBeDisabled()
  })
})
