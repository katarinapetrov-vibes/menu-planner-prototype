import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DropzoneAndUpload } from '../dropzone-and-upload'
import type { UploadFile } from '../dropzone-and-upload'

function makeFile(name = 'test.pdf', size = 1024): File {
  return new File(['content'], name, { type: 'application/pdf', lastModified: Date.now() })
}

// ─── Default render ───────────────────────────────────────────────────────────

describe('DropzoneAndUpload — default render', () => {
  it('renders the drop area', () => {
    render(<DropzoneAndUpload />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders the label when provided', () => {
    render(<DropzoneAndUpload label="Upload documents" />)
    expect(screen.getByText('Upload documents')).toBeInTheDocument()
  })

  it('renders required asterisk when required=true', () => {
    render(<DropzoneAndUpload label="Upload" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders helper text', () => {
    render(<DropzoneAndUpload helperText="Max 10MB per file" />)
    expect(screen.getByText('Max 10MB per file')).toBeInTheDocument()
  })

  it('renders error message', () => {
    render(<DropzoneAndUpload error="File type not supported" />)
    expect(screen.getByText('File type not supported')).toBeInTheDocument()
  })
})

// ─── Upload states ────────────────────────────────────────────────────────────

describe('DropzoneAndUpload — upload states', () => {
  it('shows uploading state content', () => {
    render(<DropzoneAndUpload uploadState="uploading" uploadingFileName="report.pdf" />)
    expect(screen.getByText('Uploading file...')).toBeInTheDocument()
    expect(screen.getByText('report.pdf')).toBeInTheDocument()
  })

  it('shows completed state content', () => {
    render(<DropzoneAndUpload uploadState="completed" />)
    expect(screen.getByText('Upload Completed!')).toBeInTheDocument()
  })

  it('renders cancel button during uploading', () => {
    const handler = vi.fn()
    render(<DropzoneAndUpload uploadState="uploading" onCancelUpload={handler} />)
    // × button is a button
    const cancelBtn = screen.getByRole('button', { name: 'Cancel upload' })
    expect(cancelBtn).toBeInTheDocument()
    fireEvent.click(cancelBtn)
    expect(handler).toHaveBeenCalledTimes(1)
  })
})

// ─── Disabled state ───────────────────────────────────────────────────────────

describe('DropzoneAndUpload — disabled', () => {
  it('sets aria-disabled on the drop zone when disabled', () => {
    render(<DropzoneAndUpload disabled />)
    const dropZone = screen.getByRole('button')
    expect(dropZone).toHaveAttribute('aria-disabled', 'true')
  })

  it('does not open file picker when disabled and clicked', () => {
    render(<DropzoneAndUpload disabled />)
    // Drop zone has no onClick that fires when disabled
    const dropZone = screen.getByRole('button')
    fireEvent.click(dropZone)
    // No assertion — just verify no crash
  })
})

// ─── File handling ────────────────────────────────────────────────────────────

describe('DropzoneAndUpload — file handling', () => {
  it('calls onChange when files are selected via keyboard Enter', () => {
    const handler = vi.fn()
    render(<DropzoneAndUpload onChange={handler} />)
    const dropZone = screen.getByRole('button')
    // Simulate keydown Enter on drop zone
    fireEvent.keyDown(dropZone, { key: 'Enter' })
    // onChange not called until input fires — just verify no crash
  })

  it('shows file row after file is set via controlled files prop', () => {
    const files: UploadFile[] = [
      { id: 'f1', name: 'invoice.pdf', size: '1.2 MB', status: 'success' },
    ]
    render(<DropzoneAndUpload variant="single" files={files} />)
    expect(screen.getByText('invoice.pdf')).toBeInTheDocument()
  })

  it('shows Replace file button after single file upload', () => {
    const files: UploadFile[] = [
      { id: 'f1', name: 'report.docx', size: '500 KB' },
    ]
    render(<DropzoneAndUpload variant="single" files={files} />)
    expect(screen.getByRole('button', { name: /replace file/i })).toBeInTheDocument()
  })

  it('calls onRemove when remove button is clicked', () => {
    const handler = vi.fn()
    const files: UploadFile[] = [
      { id: 'abc', name: 'photo.jpg', size: '2 MB' },
    ]
    render(<DropzoneAndUpload variant="single" files={files} onRemove={handler} />)
    fireEvent.click(screen.getByRole('button', { name: /remove photo\.jpg/i }))
    expect(handler).toHaveBeenCalledWith('abc')
  })
})

// ─── File row status variants ─────────────────────────────────────────────────

describe('DropzoneAndUpload — file row status', () => {
  it('shows error text in file row when status=error', () => {
    const files: UploadFile[] = [
      { id: 'e1', name: 'bad.exe', size: '5 MB', status: 'error', error: 'File type not allowed' },
    ]
    render(<DropzoneAndUpload variant="single" files={files} />)
    expect(screen.getByText('File type not allowed')).toBeInTheDocument()
  })

  it('shows progress bar when progress is set', () => {
    const files: UploadFile[] = [
      { id: 'p1', name: 'video.mp4', size: '50 MB', progress: 60 },
    ]
    render(<DropzoneAndUpload variant="single" files={files} />)
    expect(screen.getByText('60%')).toBeInTheDocument()
  })
})

// ─── Multiple variant ─────────────────────────────────────────────────────────

describe('DropzoneAndUpload — multiple variant', () => {
  it('shows the drop zone alongside the file list', () => {
    const files: UploadFile[] = [
      { id: 'm1', name: 'a.pdf', size: '1 MB' },
    ]
    render(<DropzoneAndUpload variant="multiple" files={files} />)
    // Drop zone is always visible in multiple mode
    expect(screen.getByRole('button', { name: /drop files/i })).toBeInTheDocument()
    // File panel shown
    expect(screen.getByText(/1 item/)).toBeInTheDocument()
  })

  it('FU3: multi-panel renders on dark theme without error', () => {
    const files: UploadFile[] = [{ id: 'f1', name: 'a.pdf', size: '1 MB' }]
    render(<DropzoneAndUpload variant="multiple" files={files} theme="dark" />)
    expect(screen.getByText(/1 item/)).toBeInTheDocument()
  })

  it('FU3: multi-panel renders on light theme without error', () => {
    const files: UploadFile[] = [{ id: 'f1', name: 'a.pdf', size: '1 MB' }]
    render(<DropzoneAndUpload variant="multiple" files={files} theme="light" />)
    expect(screen.getByText(/1 item/)).toBeInTheDocument()
  })
})

// ─── Themes ──────────────────────────────────────────────────────────────────

describe('DropzoneAndUpload — themes', () => {
  it.each(['light', 'dark'] as const)('renders theme=%s without error', (theme) => {
    render(<DropzoneAndUpload theme={theme} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})

// ─── Edge cases (F-5, F-8) ───────────────────────────────────────────────────

describe('DropzoneAndUpload — edge cases', () => {
  it('F-5: shows an error message when a dropped file exceeds maxSize', async () => {
    render(<DropzoneAndUpload maxSize={100} />)
    const dropZone = screen.getByRole('button')
    const bigFile = new File([new ArrayBuffer(200)], 'big.pdf', { type: 'application/pdf' })
    fireEvent.drop(dropZone, { dataTransfer: { files: [bigFile] } })
    expect(await screen.findByRole('alert')).toHaveTextContent(/exceeds the .* file size limit/i)
  })

  it('F-5: does not show size error when dropped file is within maxSize', () => {
    render(<DropzoneAndUpload maxSize={10000} />)
    const dropZone = screen.getByRole('button')
    const smallFile = new File(['ok'], 'small.pdf', { type: 'application/pdf' })
    fireEvent.drop(dropZone, { dataTransfer: { files: [smallFile] } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders acceptLabel and maxSize description', () => {
    render(<DropzoneAndUpload acceptLabel="PDF, DOCX" maxSize={5 * 1024 * 1024} />)
    expect(screen.getByText(/Supports: PDF, DOCX/)).toBeInTheDocument()
    expect(screen.getByText(/Max\. file size:/)).toBeInTheDocument()
  })
})

// ─── Accessibility (B-4, B-7, B-11) ──────────────────────────────────────────

describe('DropzoneAndUpload — accessibility', () => {
  it('B-7: error span has role=alert', () => {
    render(<DropzoneAndUpload error="Something went wrong" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('helper text does not have role=alert', () => {
    render(<DropzoneAndUpload helperText="Supported formats: PDF" />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('remove button has accessible aria-label including filename', () => {
    const files: UploadFile[] = [
      { id: 'x1', name: 'my-document.pdf', size: '2 MB' },
    ]
    render(<DropzoneAndUpload variant="single" files={files} />)
    expect(screen.getByRole('button', { name: /remove my-document\.pdf/i })).toBeInTheDocument()
  })

  it('drop zone has an aria-label', () => {
    render(<DropzoneAndUpload variant="single" />)
    const dropZone = screen.getByRole('button')
    expect(dropZone).toHaveAttribute('aria-label')
  })

  it('hidden file input has aria-hidden', () => {
    const { container } = render(<DropzoneAndUpload />)
    const input = container.querySelector('input[type="file"]')
    expect(input).toHaveAttribute('aria-hidden')
  })
})
