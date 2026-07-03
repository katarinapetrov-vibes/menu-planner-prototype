import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { CommentPanel } from '../comment-panel'
import type { Comment, CommentAuthor } from '../comment-panel'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const author1: CommentAuthor = { id: 'u1', name: 'Alice', role: 'Designer' }
const author2: CommentAuthor = { id: 'u2', name: 'Bob' }

const makeComment = (overrides: Partial<Comment> = {}): Comment => ({
  id:        'c1',
  author:    author1,
  body:      'Hello world',
  timestamp: new Date('2024-01-01T12:00:00Z'),
  resolved:  false,
  replies:   [],
  reactions: [],
  edited:    false,
  ...overrides,
})

/**
 * The action bar lives inside a hover div. Since React synthetic event props
 * don't become HTML attributes, we traverse up from the comment body text
 * to find the hover container and fire mouseEnter on it.
 *
 * DOM tree:
 *   <div [paddingLeft]>                       ← depth wrapper
 *     <div [borderRadius, onMouseEnter]>      ← hover container   ← 3 up from <p>
 *       <div.flex.items-start>                                     ← 2 up from <p>
 *         <Avatar>
 *         <div.flex-1.min-w-0>                                     ← 1 up from <p>
 *           <div.flex.items-baseline>  (author row)
 *           <p>{body}</p>                                          ← found by text
 */
function hoverComment(bodyText: string) {
  const p = screen.getByText(bodyText)
  // parentElement × 3 = hover container
  const hoverDiv = p.parentElement?.parentElement?.parentElement
  if (!hoverDiv) throw new Error('Could not find hover container')
  fireEvent.mouseEnter(hoverDiv)
  return hoverDiv
}

// ─── Basic rendering ──────────────────────────────────────────────────────────

describe('CommentPanel — basic rendering', () => {
  it('renders with default title "Comments"', () => {
    render(<CommentPanel />)
    expect(screen.getByRole('heading', { name: /comments/i })).toBeTruthy()
  })

  it('renders custom title', () => {
    render(<CommentPanel title="Feedback" />)
    expect(screen.getByRole('heading', { name: /feedback/i })).toBeTruthy()
  })

  it('renders with section role and default aria-label', () => {
    render(<CommentPanel />)
    expect(screen.getByRole('region', { name: /comments panel/i })).toBeTruthy()
  })

  it('renders with custom aria-label', () => {
    render(<CommentPanel aria-label="Design comments" />)
    expect(screen.getByRole('region', { name: /design comments/i })).toBeTruthy()
  })

  it('applies custom className', () => {
    const { container } = render(<CommentPanel className="my-custom-class" />)
    expect(container.firstChild).toHaveClass('my-custom-class')
  })
})

// ─── Empty state ──────────────────────────────────────────────────────────────

describe('CommentPanel — empty state', () => {
  it('shows empty state when comments array is empty', () => {
    render(<CommentPanel comments={[]} />)
    expect(screen.getByText('No comments yet')).toBeTruthy()
  })

  it('shows empty state with default props (no comments prop)', () => {
    render(<CommentPanel />)
    expect(screen.getByText('No comments yet')).toBeTruthy()
  })

  it('shows helpful sub-text in empty state', () => {
    render(<CommentPanel comments={[]} />)
    expect(screen.getByText(/be the first to leave a comment/i)).toBeTruthy()
  })

  it('does not show empty state when there are comments', () => {
    render(<CommentPanel comments={[makeComment()]} />)
    expect(screen.queryByText('No comments yet')).toBeNull()
  })
})

// ─── Comment rendering ────────────────────────────────────────────────────────

describe('CommentPanel — comment rendering', () => {
  it('renders comment body text', () => {
    render(<CommentPanel comments={[makeComment({ body: 'Test comment body' })]} />)
    expect(screen.getByText('Test comment body')).toBeTruthy()
  })

  it('renders author name', () => {
    render(<CommentPanel comments={[makeComment()]} />)
    expect(screen.getByText('Alice')).toBeTruthy()
  })

  it('renders author role when provided', () => {
    render(<CommentPanel comments={[makeComment()]} />)
    expect(screen.getByText('Designer')).toBeTruthy()
  })

  it('does not render role when not provided', () => {
    render(<CommentPanel comments={[makeComment({ author: author2 })]} />)
    expect(screen.queryByText('Designer')).toBeNull()
  })

  it('renders multiple comments', () => {
    const comments = [
      makeComment({ id: 'c1', body: 'First comment' }),
      makeComment({ id: 'c2', body: 'Second comment', author: author2 }),
    ]
    render(<CommentPanel comments={comments} />)
    expect(screen.getByText('First comment')).toBeTruthy()
    expect(screen.getByText('Second comment')).toBeTruthy()
  })

  it('shows total comment count badge when comments exist', () => {
    render(<CommentPanel comments={[makeComment()]} />)
    // The count badge renders a <span> with the count inside the header
    const heading = screen.getByRole('heading', { name: /comments/i })
    const header = heading.closest('header')!
    expect(header.querySelector('span')).toBeTruthy()
  })

  it('does not show count badge when no comments', () => {
    const { container } = render(<CommentPanel comments={[]} />)
    // No <span> with a number should exist in the header
    const header = container.querySelector('header')!
    const spans = Array.from(header.querySelectorAll('span'))
    const hasCountSpan = spans.some((s) => /^\d+$/.test(s.textContent?.trim() ?? ''))
    expect(hasCountSpan).toBe(false)
  })

  it('renders "(edited)" marker for edited comments', () => {
    render(<CommentPanel comments={[makeComment({ edited: true })]} />)
    expect(screen.getByText(/(edited)/i)).toBeTruthy()
  })

  it('does not render "(edited)" for non-edited comments', () => {
    render(<CommentPanel comments={[makeComment({ edited: false })]} />)
    expect(screen.queryByText(/(edited)/i)).toBeNull()
  })
})

// ─── Resolved badge ───────────────────────────────────────────────────────────

describe('CommentPanel — resolved state', () => {
  it('renders "Resolved" badge on resolved comments (when visible)', () => {
    render(<CommentPanel comments={[makeComment({ resolved: true })]} defaultShowResolved />)
    expect(screen.getByText('Resolved')).toBeTruthy()
  })

  it('does not render "Resolved" badge on unresolved comments', () => {
    render(<CommentPanel comments={[makeComment({ resolved: false })]} />)
    expect(screen.queryByText('Resolved')).toBeNull()
  })

  it('hides resolved comments by default (defaultShowResolved=false)', () => {
    const comments = [
      makeComment({ id: 'c1', body: 'Visible comment',  resolved: false }),
      makeComment({ id: 'c2', body: 'Hidden resolved',  resolved: true  }),
    ]
    render(<CommentPanel comments={comments} />)
    expect(screen.getByText('Visible comment')).toBeTruthy()
    expect(screen.queryByText('Hidden resolved')).toBeNull()
  })

  it('shows resolved comments when defaultShowResolved=true', () => {
    const comments = [
      makeComment({ id: 'c1', body: 'Active comment',   resolved: false }),
      makeComment({ id: 'c2', body: 'Archived comment', resolved: true  }),
    ]
    render(<CommentPanel comments={comments} defaultShowResolved />)
    expect(screen.getByText('Active comment')).toBeTruthy()
    expect(screen.getByText('Archived comment')).toBeTruthy()
  })

  it('renders resolved count toggle button when resolved comments exist', () => {
    render(<CommentPanel comments={[makeComment({ resolved: true })]} />)
    expect(screen.getByRole('button', { name: /resolved/i })).toBeTruthy()
  })

  it('does not render resolved toggle when no resolved comments exist', () => {
    render(<CommentPanel comments={[makeComment({ resolved: false })]} />)
    expect(screen.queryByRole('button', { name: /resolved/i })).toBeNull()
  })

  it('toggle button shows resolved comment count', () => {
    const comments = [
      makeComment({ id: 'c1', resolved: true }),
      makeComment({ id: 'c2', resolved: true }),
    ]
    render(<CommentPanel comments={comments} />)
    expect(screen.getByText(/2 resolved/i)).toBeTruthy()
  })

  it('clicking resolved toggle reveals hidden resolved comment', () => {
    const comments = [
      makeComment({ id: 'c1', body: 'Active thread',   resolved: false }),
      makeComment({ id: 'c2', body: 'Archived thread', resolved: true  }),
    ]
    render(<CommentPanel comments={comments} />)
    expect(screen.queryByText('Archived thread')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /1 resolved/i }))
    expect(screen.getByText('Archived thread')).toBeTruthy()
  })

  it('toggle button has aria-pressed=false by default', () => {
    render(<CommentPanel comments={[makeComment({ resolved: true })]} />)
    const btn = screen.getByRole('button', { name: /resolved/i })
    expect(btn).toHaveAttribute('aria-pressed', 'false')
  })

  it('toggle button has aria-pressed=true when active', () => {
    render(<CommentPanel comments={[makeComment({ resolved: true })]} defaultShowResolved />)
    const btn = screen.getByRole('button', { name: /resolved/i })
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })

  it('controlled showResolved prop shows resolved comments', () => {
    const comments = [
      makeComment({ id: 'c1', body: 'Active thread',   resolved: false }),
      makeComment({ id: 'c2', body: 'Archived thread', resolved: true  }),
    ]
    render(<CommentPanel comments={comments} showResolved />)
    expect(screen.getByText('Active thread')).toBeTruthy()
    expect(screen.getByText('Archived thread')).toBeTruthy()
  })

  it('calls onShowResolvedChange when resolved toggle is clicked', () => {
    const onShowResolvedChange = vi.fn()
    render(
      <CommentPanel
        comments={[makeComment({ resolved: true })]}
        onShowResolvedChange={onShowResolvedChange}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /resolved/i }))
    expect(onShowResolvedChange).toHaveBeenCalledWith(true)
  })
})

// ─── Close button ─────────────────────────────────────────────────────────────

describe('CommentPanel — close button', () => {
  it('does not render close button when onClose is not provided', () => {
    render(<CommentPanel />)
    expect(screen.queryByRole('button', { name: /close/i })).toBeNull()
  })

  it('renders close button when onClose is provided', () => {
    render(<CommentPanel onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /close comments panel/i })).toBeTruthy()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<CommentPanel onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /close comments panel/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

// ─── Composer ─────────────────────────────────────────────────────────────────

describe('CommentPanel — composer', () => {
  it('does not render composer when onSubmit is not provided', () => {
    render(<CommentPanel />)
    expect(screen.queryByRole('button', { name: /send comment/i })).toBeNull()
  })

  it('renders composer textarea when onSubmit is provided', () => {
    render(<CommentPanel onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: /send comment/i })).toBeTruthy()
  })

  it('renders composer placeholder text', () => {
    render(<CommentPanel onSubmit={vi.fn()} />)
    expect(screen.getByPlaceholderText(/add a comment/i)).toBeTruthy()
  })

  it('renders custom composer placeholder', () => {
    render(<CommentPanel onSubmit={vi.fn()} composerPlaceholder="Leave feedback…" />)
    expect(screen.getByPlaceholderText('Leave feedback…')).toBeTruthy()
  })

  it('send button is disabled when composer is empty', () => {
    render(<CommentPanel onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: /send comment/i })).toBeDisabled()
  })

  it('calls onSubmit with comment body when ⌘↵ is pressed', () => {
    const onSubmit = vi.fn()
    render(<CommentPanel onSubmit={onSubmit} />)
    const textarea = screen.getByPlaceholderText(/add a comment/i)
    fireEvent.change(textarea, { target: { value: 'New comment text' } })
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true })
    expect(onSubmit).toHaveBeenCalledWith('New comment text')
  })

  it('calls onSubmit with trimmed body', () => {
    const onSubmit = vi.fn()
    render(<CommentPanel onSubmit={onSubmit} />)
    const textarea = screen.getByPlaceholderText(/add a comment/i)
    fireEvent.change(textarea, { target: { value: '  trimmed  ' } })
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true })
    expect(onSubmit).toHaveBeenCalledWith('trimmed')
  })

  it('does not call onSubmit when body is empty/whitespace only', () => {
    const onSubmit = vi.fn()
    render(<CommentPanel onSubmit={onSubmit} />)
    const textarea = screen.getByPlaceholderText(/add a comment/i)
    fireEvent.change(textarea, { target: { value: '   ' } })
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('clears composer after successful submit', () => {
    const onSubmit = vi.fn()
    render(<CommentPanel onSubmit={onSubmit} />)
    const textarea = screen.getByPlaceholderText(/add a comment/i) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'A comment' } })
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true })
    expect(textarea.value).toBe('')
  })
})

// ─── Reply behaviour ──────────────────────────────────────────────────────────

describe('CommentPanel — reply composer', () => {
  it('opens reply composer when Reply button is clicked (hover)', () => {
    render(<CommentPanel comments={[makeComment({ body: 'Root comment' })]} onReply={vi.fn()} />)
    hoverComment('Root comment')
    fireEvent.click(screen.getByRole('button', { name: /reply/i }))
    expect(screen.getByPlaceholderText(/write a reply/i)).toBeTruthy()
  })

  it('calls onReply with commentId and body on reply submit', () => {
    const onReply = vi.fn()
    render(<CommentPanel comments={[makeComment({ id: 'c1', body: 'Root comment' })]} onReply={onReply} />)
    hoverComment('Root comment')
    fireEvent.click(screen.getByRole('button', { name: /reply/i }))
    const replyInput = screen.getByPlaceholderText(/write a reply/i)
    fireEvent.change(replyInput, { target: { value: 'My reply' } })
    fireEvent.keyDown(replyInput, { key: 'Enter', metaKey: true })
    expect(onReply).toHaveBeenCalledWith('c1', 'My reply')
  })
})

// ─── Edit behaviour ───────────────────────────────────────────────────────────

describe('CommentPanel — inline edit', () => {
  it('shows Edit button for own comments on hover', () => {
    render(
      <CommentPanel
        comments={[makeComment({ body: 'My text', author: author1 })]}
        onEdit={vi.fn()}
        currentUser={author1}
      />
    )
    hoverComment('My text')
    expect(screen.getByRole('button', { name: /edit/i })).toBeTruthy()
  })

  it('does not show Edit button for other users\' comments', () => {
    render(
      <CommentPanel
        comments={[makeComment({ body: 'Their text', author: author1 })]}
        onEdit={vi.fn()}
        currentUser={author2}
      />
    )
    hoverComment('Their text')
    expect(screen.queryByRole('button', { name: /^edit$/i })).toBeNull()
  })

  it('enters edit mode when Edit is clicked', () => {
    render(
      <CommentPanel
        comments={[makeComment({ body: 'Original body', author: author1 })]}
        onEdit={vi.fn()}
        currentUser={author1}
      />
    )
    hoverComment('Original body')
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(screen.getByRole('button', { name: /save/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeTruthy()
  })

  it('calls onEdit with commentId and new body on save', () => {
    const onEdit = vi.fn()
    render(
      <CommentPanel
        comments={[makeComment({ id: 'c1', body: 'Old text', author: author1 })]}
        onEdit={onEdit}
        currentUser={author1}
      />
    )
    hoverComment('Old text')
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    const editInput = screen.getByDisplayValue('Old text') as HTMLTextAreaElement
    fireEvent.change(editInput, { target: { value: 'Updated body' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onEdit).toHaveBeenCalledWith('c1', 'Updated body')
  })

  it('does not call onEdit if body is unchanged', () => {
    const onEdit = vi.fn()
    render(
      <CommentPanel
        comments={[makeComment({ id: 'c1', body: 'Same text', author: author1 })]}
        onEdit={onEdit}
        currentUser={author1}
      />
    )
    hoverComment('Same text')
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onEdit).not.toHaveBeenCalled()
  })

  it('cancels edit mode without calling onEdit', () => {
    const onEdit = vi.fn()
    render(
      <CommentPanel
        comments={[makeComment({ id: 'c1', body: 'Original text', author: author1 })]}
        onEdit={onEdit}
        currentUser={author1}
      />
    )
    hoverComment('Original text')
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onEdit).not.toHaveBeenCalled()
    expect(screen.getByText('Original text')).toBeTruthy()
  })

  it('pressing Escape exits edit mode', () => {
    render(
      <CommentPanel
        comments={[makeComment({ id: 'c1', body: 'Escape test', author: author1 })]}
        onEdit={vi.fn()}
        currentUser={author1}
      />
    )
    hoverComment('Escape test')
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    const editInput = screen.getByDisplayValue('Escape test')
    fireEvent.keyDown(editInput, { key: 'Escape' })
    expect(screen.queryByRole('button', { name: /save/i })).toBeNull()
  })
})

// ─── Delete behaviour ─────────────────────────────────────────────────────────

describe('CommentPanel — delete', () => {
  it('shows Delete button for own comments on hover', () => {
    render(
      <CommentPanel
        comments={[makeComment({ body: 'Delete me', author: author1 })]}
        onDelete={vi.fn()}
        currentUser={author1}
      />
    )
    hoverComment('Delete me')
    expect(screen.getByRole('button', { name: /delete/i })).toBeTruthy()
  })

  it('calls onDelete with commentId when Delete is clicked', () => {
    const onDelete = vi.fn()
    render(
      <CommentPanel
        comments={[makeComment({ id: 'c1', body: 'Delete me', author: author1 })]}
        onDelete={onDelete}
        currentUser={author1}
      />
    )
    hoverComment('Delete me')
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith('c1')
  })
})

// ─── Resolve behaviour ────────────────────────────────────────────────────────

describe('CommentPanel — resolve', () => {
  it('shows Resolve button on hover', () => {
    render(
      <CommentPanel
        comments={[makeComment({ body: 'Pending thread', resolved: false })]}
        onResolve={vi.fn()}
      />
    )
    hoverComment('Pending thread')
    expect(screen.getByRole('button', { name: /^resolve$/i })).toBeTruthy()
  })

  it('calls onResolve with commentId and true when Resolve is clicked', () => {
    const onResolve = vi.fn()
    render(
      <CommentPanel
        comments={[makeComment({ id: 'c1', body: 'Pending thread', resolved: false })]}
        onResolve={onResolve}
      />
    )
    hoverComment('Pending thread')
    fireEvent.click(screen.getByRole('button', { name: /^resolve$/i }))
    expect(onResolve).toHaveBeenCalledWith('c1', true)
  })

  it('shows Re-open button for resolved comment and calls onResolve with false', () => {
    const onResolve = vi.fn()
    render(
      <CommentPanel
        comments={[makeComment({ id: 'c1', body: 'Done thread', resolved: true })]}
        onResolve={onResolve}
        defaultShowResolved
      />
    )
    hoverComment('Done thread')
    fireEvent.click(screen.getByRole('button', { name: /re-open/i }))
    expect(onResolve).toHaveBeenCalledWith('c1', false)
  })
})

// ─── Reactions ────────────────────────────────────────────────────────────────

describe('CommentPanel — reactions', () => {
  it('renders like counter when comment has 👍 reaction', () => {
    const comment = makeComment({
      reactions: [{ emoji: '👍', count: 7, reacted: false }],
    })
    render(<CommentPanel comments={[comment]} />)
    expect(screen.getByText('7')).toBeTruthy()
  })

  it('renders dislike counter when comment has 👎 reaction', () => {
    const comment = makeComment({
      reactions: [{ emoji: '👎', count: 4, reacted: true }],
    })
    render(<CommentPanel comments={[comment]} />)
    expect(screen.getByText('4')).toBeTruthy()
  })

  it('does not render reaction buttons when reactions array is empty', () => {
    render(<CommentPanel comments={[makeComment({ reactions: [] })]} />)
    // Reaction counts (7, 4, etc.) should not appear; no LikeCommentCounter rendered
    expect(screen.queryByText('7')).toBeNull()
    expect(screen.queryByText('4')).toBeNull()
  })

  it('calls onReact with commentId and emoji when like is clicked', () => {
    const onReact = vi.fn()
    const comment = makeComment({
      id:        'c1',
      reactions: [{ emoji: '👍', count: 9, reacted: false }],
    })
    render(<CommentPanel comments={[comment]} onReact={onReact} />)
    // LikeCommentCounter renders a button; find via count text
    const countEl = screen.getByText('9')
    const likeBtn = countEl.closest('button')
    expect(likeBtn).toBeTruthy()
    fireEvent.click(likeBtn!)
    expect(onReact).toHaveBeenCalledWith('c1', '👍')
  })
})

// ─── Nested replies ───────────────────────────────────────────────────────────

describe('CommentPanel — nested replies display', () => {
  it('renders nested reply comments', () => {
    const reply: Comment = makeComment({ id: 'r1', body: 'Nested reply text', author: author2 })
    const comment = makeComment({ id: 'c1', replies: [reply] })
    render(<CommentPanel comments={[comment]} />)
    expect(screen.getByText('Nested reply text')).toBeTruthy()
  })

  it('does not render a Reply button inside nested replies (depth > 0)', () => {
    // At depth 1, the CommentItemAtom guards with `depth === 0 && onReply`
    const reply: Comment = makeComment({ id: 'r1', body: 'Nested reply text', author: author2 })
    const comment = makeComment({ id: 'c1', body: 'Root body', replies: [reply] })
    render(<CommentPanel comments={[comment]} onReply={vi.fn()} />)

    // Hover the nested reply item (second hoverable, found via its unique body text)
    const nestedP = screen.getByText('Nested reply text')
    const hoverDiv = nestedP.parentElement?.parentElement?.parentElement
    expect(hoverDiv).toBeTruthy()
    fireEvent.mouseEnter(hoverDiv!)

    // No Reply button within the nested item's own action bar (depth=1 guard).
    // Scoped to hoverDiv so the root comment's Reply button (depth=0, now always
    // in the a11y tree since aria-hidden was removed) does not produce a false fail.
    expect(within(hoverDiv!).queryByRole('button', { name: /^reply$/i })).toBeNull()
  })
})

// ─── Theme prop ───────────────────────────────────────────────────────────────

describe('CommentPanel — theming', () => {
  it('renders without error with theme="light"', () => {
    expect(() => render(<CommentPanel theme="light" />)).not.toThrow()
  })

  it('renders without error with theme="dark"', () => {
    expect(() => render(<CommentPanel theme="dark" />)).not.toThrow()
  })
})
