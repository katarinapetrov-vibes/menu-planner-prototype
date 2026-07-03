'use client'

/**
 * Enterprise DS v3 — Comment Panel
 * Figma nodes 41404-55363 · 41404-55364 · 41404-55362
 * Atoms: 41361-33200
 *
 * A persistent side panel for threaded annotations and comments attached
 * to documents, tasks, or design artefacts. Supports:
 *   - Threaded comments with one level of nested replies
 *   - Emoji reaction pills with counts and active state
 *   - Inline editing and deletion (own comments only)
 *   - Resolved / active filter toggle
 *   - New comment composer with ⌘↵ shortcut
 *   - Empty state and resolved-only state
 *   - Light and dark canvas theming
 *   - Fully keyboard accessible
 *
 * Atoms (Figma node 41361-33200):
 *   ReactionPill      — emoji + count, togglable
 *   CommentComposer   — textarea + send button
 *   CommentItemAtom   — avatar + author row + body + actions
 *   EmptyState        — illustration + caption
 *
 * Token mapping
 *   Panel bg          colour/background/page                   light: #FFFFFF   dark: #00178C
 *   Header border     colour/border/default                    light: #E4E4E4   dark: #4B4B4B
 *   Item hover bg     colour/background/container              light: #F8F8F8   dark: #242424
 *   Primary text      colour/foreground/default/primary        light: #242424   dark: #E4E4E4
 *   Secondary text    colour/foreground/default/secondary      light: #4B4B4B   dark: #EEEEEE
 *   Muted / timestamp colour/foreground/default/disabled       light: #BBBBBB   dark: #676767
 *   Send / active     colour/foreground/positive/default       light: #067A46   dark: #96DC14
 *   Input bg          colour/background/container              light: #F8F8F8   dark: #242424
 *   Input border      colour/border/default                    light: #E4E4E4   dark: #4B4B4B
 *   Input border focus colour/border/focus                     light: #067A46   dark: #96DC14
 *   Resolved bg       colour/background/positive/defaultSubtle light: #F6FDE9  dark: #035624
 *   Resolved text     colour/foreground/positive/default       light: #067A46   dark: #96DC14
 *   Resolved border   colour/border/positive                   light: #067A46   dark: #96DC14
 *   Delete text       colour/foreground/negative/default       light: #B30000   dark: #FE8680
 *   Focus ring        colour/border/focus                      light: #067A46   dark: #96DC14
 *   Radius panel      radius/sm                                8px
 *   Radius item       radius/sm                                8px
 *   Radius input      radius/sm                                8px
 *   Radius pill       radius/round                             336px
 *   Shadow            elevation/level2
 */

import React, { useState } from 'react'
import { cn } from './utils'
import { Avatar } from './avatar'
import { LikeCommentCounter } from './like-and-comment-counter'
import { TextArea } from './text-area'
import { semantic, spacing, sizing, radius, borderWidth, elevation, typography, opacity as opacityTokens } from '@/lib/tokens'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CommentPanelTheme = 'light' | 'dark'

export interface CommentReaction {
  /** Emoji character, e.g. "👍" */
  emoji: string
  /** Number of users who reacted */
  count: number
  /** Whether the current user has reacted */
  reacted: boolean
}

export interface CommentAuthor {
  /** Unique user identifier */
  id: string
  /** Full display name */
  name: string
  /** Optional avatar image URL */
  avatar?: string
  /** Optional role or team label */
  role?: string
}

export interface Comment {
  /** Unique comment identifier */
  id: string
  /** Author details */
  author: CommentAuthor
  /** Comment body text */
  body: string
  /** ISO timestamp string or Date object */
  timestamp: string | Date
  /** Whether the comment has been edited */
  edited?: boolean
  /** Whether the thread is resolved */
  resolved?: boolean
  /** Emoji reactions on this comment */
  reactions?: CommentReaction[]
  /** Nested replies — one level deep */
  replies?: Comment[]
}

export interface CommentPanelProps {
  /** Array of top-level comment threads */
  comments?: Comment[]
  /** Panel header title */
  title?: string
  /** Called when the close button is pressed */
  onClose?: () => void
  /** Called when a new top-level comment is submitted */
  onSubmit?: (body: string) => void
  /** Called when a reply is submitted on a thread */
  onReply?: (commentId: string, body: string) => void
  /** Called when the user toggles a reaction */
  onReact?: (commentId: string, emoji: string) => void
  /** Called when the user edits their own comment */
  onEdit?: (commentId: string, body: string) => void
  /** Called when the user deletes their own comment */
  onDelete?: (commentId: string) => void
  /** Called when a thread is resolved or re-opened */
  onResolve?: (commentId: string, resolved: boolean) => void
  /** Placeholder text for the new-comment textarea */
  composerPlaceholder?: string
  /** Current user — used to show edit/delete on own comments */
  currentUser?: CommentAuthor
  /** Controlled: whether resolved threads are visible */
  showResolved?: boolean
  /** Uncontrolled default for showResolved */
  defaultShowResolved?: boolean
  /** Called when the show-resolved toggle changes */
  onShowResolvedChange?: (show: boolean) => void
  /** Canvas theme */
  theme?: CommentPanelTheme
  className?: string
  style?: React.CSSProperties
  /** Accessible label for the panel landmark */
  'aria-label'?: string
}

// ─── Design Tokens ────────────────────────────────────────────────────────────

const tokens = {
  light: {
    panelBg:             semantic.background.container.light,               // #F8F8F8
    headerBorder:        semantic.border.default.light,                     // #E4E4E4
    divider:             semantic.border.default.light,                     // #E4E4E4
    itemHoverBg:         semantic.background.container.light,               // #F8F8F8
    primaryText:         semantic.foreground.default.primary.light,         // #242424
    secondaryText:       semantic.foreground.default.secondary.light,       // #4B4B4B
    mutedText:           semantic.foreground.default.disabled.light,        // #BBBBBB
    actionText:          semantic.foreground.default.secondary.light,       // #4B4B4B
    sendActive:          semantic.foreground.positive.default.light,        // #067A46
    sendDisabled:        semantic.foreground.default.disabled.light,        // #BBBBBB
    inputBg:             semantic.background.container.light,               // #F8F8F8
    inputBorder:         semantic.border.default.light,                     // #E4E4E4
    inputBorderFocus:    semantic.border.focus.light,                       // #067A46
    focusOutline:        semantic.border.focus.light,                       // #067A46
    resolvedBg:          semantic.background.positive.defaultSubtle.light,  // #F6FDE9
    resolvedText:        semantic.foreground.positive.default.light,        // #067A46
    resolvedBorder:      semantic.border.positive.light,                    // #067A46
    deleteText:          semantic.foreground.negative.default.light,        // #B30000
    closeIcon:           semantic.foreground.default.secondary.light,       // #4B4B4B
    countBadgeBg:        semantic.background.container.light,               // #F8F8F8
    countBadgeText:      semantic.foreground.default.secondary.light,       // #4B4B4B
    toggleActiveBg:      semantic.background.positive.defaultSubtle.light,  // #F6FDE9
    toggleActiveText:    semantic.foreground.positive.default.light,        // #067A46
    toggleInactiveText:  semantic.foreground.default.secondary.light,       // #4B4B4B
  },
  dark: {
    panelBg:             semantic.background.container.dark,                // #242424
    headerBorder:        semantic.border.default.dark,                      // #4B4B4B
    divider:             semantic.border.default.dark,                      // #4B4B4B
    itemHoverBg:         semantic.background.container.dark,                // #242424
    primaryText:         semantic.foreground.default.primary.dark,          // #E4E4E4
    secondaryText:       semantic.foreground.default.secondary.dark,        // #EEEEEE
    mutedText:           semantic.foreground.default.disabled.dark,         // #676767
    actionText:          semantic.foreground.default.secondary.dark,        // #EEEEEE
    sendActive:          semantic.foreground.positive.default.dark,         // #96DC14
    sendDisabled:        semantic.foreground.default.disabled.dark,         // #676767
    inputBg:             semantic.background.container.dark,                // #242424
    inputBorder:         semantic.border.default.dark,                      // #4B4B4B
    inputBorderFocus:    semantic.border.focus.dark,                        // #96DC14
    focusOutline:        semantic.border.focus.dark,                        // #96DC14
    resolvedBg:          semantic.background.positive.defaultSubtle.dark,   // #035624
    resolvedText:        semantic.foreground.positive.default.dark,         // #96DC14
    resolvedBorder:      semantic.border.positive.dark,                     // #96DC14
    deleteText:          semantic.foreground.negative.default.dark,         // #FE8680
    closeIcon:           semantic.foreground.default.secondary.dark,        // #EEEEEE
    countBadgeBg:        semantic.background.container.dark,                // #242424
    countBadgeText:      semantic.foreground.default.secondary.dark,        // #EEEEEE
    toggleActiveBg:      semantic.background.positive.defaultSubtle.dark,   // #035624
    toggleActiveText:    semantic.foreground.positive.default.dark,         // #96DC14
    toggleInactiveText:  semantic.foreground.default.secondary.dark,        // #EEEEEE
  },
} as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(timestamp: string | Date): string {
  const date   = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  if (isNaN(date.getTime())) return '—'
  const now    = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH   = Math.floor(diffMin / 60)
  const diffD   = Math.floor(diffH / 24)
  if (diffMin < 1)  return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffH   < 24) return `${diffH}h ago`
  if (diffD   < 7)  return `${diffD}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="w-5 h-5">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="w-5 h-5">
      <path
        d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ReplyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="w-3.5 h-3.5">
      <path
        d="M9 17L4 12L9 7M4 12H15C17.2091 12 19 13.7909 19 16V20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ResolveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="w-3.5 h-3.5">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="w-3.5 h-3.5">
      <path
        d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="w-3.5 h-3.5">
      <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

function ChatBubbleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="w-6 h-6">
      <path
        d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── CommentComposer (atom) ───────────────────────────────────────────────────

interface CommentComposerProps {
  placeholder:  string
  onSubmit:     (body: string) => void
  theme:        CommentPanelTheme
  currentUser?: CommentAuthor
  autoFocus?:   boolean
  compact?:     boolean
}

function CommentComposer({
  placeholder,
  onSubmit,
  theme,
  currentUser,
  autoFocus,
  compact,
}: CommentComposerProps) {
  const [value, setValue] = useState('')
  const t       = tokens[theme]
  const hasText = value.trim().length > 0

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && hasText) {
      e.preventDefault()
      onSubmit(value.trim())
      setValue('')
    }
  }

  const handleSubmit = () => {
    if (!hasText) return
    onSubmit(value.trim())
    setValue('')
  }

  return (
    <div
      className="flex flex-col gap-2"
      style={{
        padding: compact
          ? `${spacing[200]} ${spacing[400]}`
          : `${spacing[300]} ${spacing[400]}`,
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="flex gap-2 items-start">
        {currentUser && !compact && (
          <Avatar
            name={currentUser.name}
            src={currentUser.avatar}
            size="sm"
            type={theme === 'dark' ? 'dark' : 'light'}
            theme={theme}
            className="shrink-0 mt-1"
          />
        )}

        <TextArea
          value={value}
          onChange={setValue}
          placeholder={placeholder}
          rows={compact ? 1 : 2}
          resizable={false}
          theme={theme}
          size="sm"
          autoFocus={autoFocus}
          className="flex-1"
          aria-label={placeholder}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!hasText}
          aria-label="Send comment"
          className="flex items-center justify-center rounded-lg transition-colors duration-quick focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
          style={{
            width:        '32px',
            height:       '32px',
            border:       'none',
            background:   'transparent',
            color:        hasText ? t.sendActive : t.sendDisabled,
            cursor:       hasText ? 'pointer' : 'not-allowed',
            opacity:      hasText ? 1 : opacityTokens.half,
            outlineColor: t.focusOutline,
            padding:      0,
          }}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  )
}

// ─── CommentItemAtom (atom) ───────────────────────────────────────────────────

interface CommentItemAtomProps {
  comment:      Comment
  depth?:       number
  theme:        CommentPanelTheme
  onReply?:     (commentId: string, body: string) => void
  onReact?:     (commentId: string, emoji: string) => void
  onEdit?:      (commentId: string, body: string) => void
  onDelete?:    (commentId: string) => void
  onResolve?:   (commentId: string, resolved: boolean) => void
  currentUser?: CommentAuthor
}

function CommentItemAtom({
  comment,
  depth = 0,
  theme,
  onReply,
  onReact,
  onEdit,
  onDelete,
  onResolve,
  currentUser,
}: CommentItemAtomProps) {
  const [hovered,          setHovered]          = useState(false)
  const [hasFocusedAction, setHasFocusedAction] = useState(false)
  const [replyOpen,        setReplyOpen]        = useState(false)
  const [editMode,         setEditMode]         = useState(false)
  const [editBody,         setEditBody]         = useState(comment.body)

  const t     = tokens[theme]
  const isOwn = currentUser ? currentUser.id === comment.author.id : false

  const handleEditSave = () => {
    const trimmed = editBody.trim()
    if (trimmed && trimmed !== comment.body) {
      onEdit?.(comment.id, trimmed)
    }
    setEditMode(false)
  }

  return (
    <div style={{ paddingLeft: depth > 0 ? spacing[600] : 0 }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius:    radius.sm,
          padding:         `${spacing[300]} ${spacing[400]}`,
          backgroundColor: hovered ? t.itemHoverBg : 'transparent',
          transition:      'background-color 150ms ease',
        }}
      >
        {/* Resolved badge */}
        {comment.resolved && (
          <div
            className="inline-flex items-center gap-1 mb-2"
            style={{
              borderRadius:    radius.round,
              padding:         `2px ${spacing[200]}`,
              backgroundColor: t.resolvedBg,
              border:          `${borderWidth.thin} solid ${t.resolvedBorder}`,
              color:           t.resolvedText,
              fontSize:        typography.fontSize.sm,
              fontFamily:      typography.fontFamily.body,
              fontWeight:      600,
            }}
          >
            <ResolveIcon />
            <span>Resolved</span>
          </div>
        )}

        {/* Header: avatar + author + timestamp */}
        <div className="flex items-start gap-2">
          <Avatar
            name={comment.author.name}
            src={comment.author.avatar}
            size="sm"
            type={theme === 'dark' ? 'dark' : 'light'}
            theme={theme}
            className="shrink-0 mt-0.5"
          />

          <div className="flex-1 min-w-0">
            {/* Author row */}
            <div className="flex items-baseline gap-1.5 mb-1 flex-wrap">
              <span
                className="font-semibold"
                style={{
                  color:      t.primaryText,
                  fontFamily: typography.fontFamily.body,
                  fontSize:   typography.fontSize.sm,
                }}
              >
                {comment.author.name}
              </span>

              {comment.author.role && (
                <span
                  style={{
                    color:      t.mutedText,
                    fontFamily: typography.fontFamily.body,
                    fontSize:   typography.fontSize.sm,
                  }}
                >
                  {comment.author.role}
                </span>
              )}

              <span
                className="ml-auto shrink-0"
                style={{
                  color:      t.mutedText,
                  fontFamily: typography.fontFamily.body,
                  fontSize:   typography.fontSize.sm,
                }}
              >
                {formatRelativeTime(comment.timestamp)}
                {comment.edited && (
                  <span style={{ fontStyle: 'italic' }}> (edited)</span>
                )}
              </span>
            </div>

            {/* Body or edit mode */}
            {editMode ? (
              <div
                className="flex flex-col gap-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleEditSave() }
                  if (e.key === 'Escape') { setEditMode(false); setEditBody(comment.body) }
                }}
              >
                <TextArea
                  value={editBody}
                  onChange={setEditBody}
                  autoFocus
                  rows={3}
                  resizable={false}
                  theme={theme}
                  size="sm"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleEditSave}
                    className="font-semibold px-3 py-1 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                    style={{
                      backgroundColor: t.resolvedBg,
                      color:           t.resolvedText,
                      border:          `${borderWidth.thin} solid ${t.resolvedBorder}`,
                      fontFamily:      typography.fontFamily.body,
                      fontSize:        typography.fontSize.sm,
                      cursor:          'pointer',
                      outlineColor:    t.focusOutline,
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditMode(false); setEditBody(comment.body) }}
                    className="font-medium px-3 py-1 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                    style={{
                      color:       t.mutedText,
                      border:      `${borderWidth.thin} solid ${t.divider}`,
                      background:  'transparent',
                      fontFamily:  typography.fontFamily.body,
                      fontSize:    typography.fontSize.sm,
                      cursor:      'pointer',
                      outlineColor: t.focusOutline,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p
                className="leading-relaxed"
                style={{
                  color:      t.primaryText,
                  fontFamily: typography.fontFamily.body,
                  fontWeight: 400,
                  wordBreak:  'break-word',
                  fontSize:   typography.fontSize.md,
                }}
              >
                {comment.body}
              </p>
            )}

            {/* Reactions row — like / dislike counters only */}
            {!editMode && comment.reactions && comment.reactions.length > 0 && (() => {
              const like    = comment.reactions.find((r) => r.emoji === '👍')
              const dislike = comment.reactions.find((r) => r.emoji === '👎')
              if (!like && !dislike) return null
              return (
                <div className="flex items-center gap-1 mt-2">
                  {like && (
                    <LikeCommentCounter
                      iconType="like"
                      count={like.count}
                      active={like.reacted}
                      theme={theme}
                      onClick={() => onReact?.(comment.id, '👍')}
                    />
                  )}
                  {dislike && (
                    <LikeCommentCounter
                      iconType="dislike"
                      count={dislike.count}
                      active={dislike.reacted}
                      theme={theme}
                      onClick={() => onReact?.(comment.id, '👎')}
                    />
                  )}
                </div>
              )
            })()}

            {/* Action bar — visible on hover or keyboard focus */}
            {!editMode && (
              <div
                className="flex items-center gap-3 mt-2 transition-opacity duration-quick"
                style={{
                  opacity:       hovered || hasFocusedAction ? 1 : 0,
                  pointerEvents: hovered || hasFocusedAction ? 'auto' : 'none',
                }}
                onFocus={() => setHasFocusedAction(true)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setHasFocusedAction(false)
                  }
                }}
              >
                {depth === 0 && onReply && (
                  <button
                    type="button"
                    tabIndex={0}
                    onClick={() => setReplyOpen((x) => !x)}
                    className="flex items-center gap-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                    style={{
                      color:        t.actionText,
                      fontFamily:   typography.fontFamily.body,
                      fontSize:     typography.fontSize.sm,
                      border:       'none',
                      background:   'transparent',
                      cursor:       'pointer',
                      padding:      0,
                      outlineColor: t.focusOutline,
                    }}
                  >
                    <ReplyIcon />
                    <span>Reply</span>
                  </button>
                )}

                {depth === 0 && onResolve && (
                  <button
                    type="button"
                    tabIndex={0}
                    onClick={() => onResolve(comment.id, !comment.resolved)}
                    className="flex items-center gap-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                    style={{
                      color:        comment.resolved ? t.resolvedText : t.actionText,
                      fontFamily:   typography.fontFamily.body,
                      fontSize:     typography.fontSize.sm,
                      border:       'none',
                      background:   'transparent',
                      cursor:       'pointer',
                      padding:      0,
                      outlineColor: t.focusOutline,
                    }}
                  >
                    <ResolveIcon />
                    <span>{comment.resolved ? 'Re-open' : 'Resolve'}</span>
                  </button>
                )}

                {isOwn && onEdit && (
                  <button
                    type="button"
                    tabIndex={0}
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                    style={{
                      color:        t.actionText,
                      fontFamily:   typography.fontFamily.body,
                      fontSize:     typography.fontSize.sm,
                      border:       'none',
                      background:   'transparent',
                      cursor:       'pointer',
                      padding:      0,
                      outlineColor: t.focusOutline,
                    }}
                  >
                    <EditIcon />
                    <span>Edit</span>
                  </button>
                )}

                {isOwn && onDelete && (
                  <button
                    type="button"
                    tabIndex={0}
                    onClick={() => onDelete(comment.id)}
                    className="flex items-center gap-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                    style={{
                      color:        t.deleteText,
                      fontFamily:   typography.fontFamily.body,
                      fontSize:     typography.fontSize.sm,
                      border:       'none',
                      background:   'transparent',
                      cursor:       'pointer',
                      padding:      0,
                      outlineColor: t.focusOutline,
                    }}
                  >
                    <TrashIcon />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItemAtom
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              theme={theme}
              onReact={onReact}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}

      {/* Reply composer */}
      {replyOpen && (
        <div style={{ paddingLeft: spacing[600] }}>
          <CommentComposer
            placeholder="Write a reply… (⌘↵ to send)"
            theme={theme}
            compact
            autoFocus
            onSubmit={(body) => {
              onReply?.(comment.id, body)
              setReplyOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

// ─── EmptyState (atom) ────────────────────────────────────────────────────────

function EmptyState({ theme }: { theme: CommentPanelTheme }) {
  const t = tokens[theme]
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: t.itemHoverBg, color: t.mutedText }}
      >
        <ChatBubbleIcon />
      </div>
      <p
        className="font-semibold"
        style={{ color: t.primaryText, fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.md }}
      >
        No comments yet
      </p>
      <p
        style={{ color: t.mutedText, fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.sm }}
      >
        Be the first to leave a comment on this item.
      </p>
    </div>
  )
}

// ─── CommentPanel ─────────────────────────────────────────────────────────────

export function CommentPanel({
  comments                = [],
  title                   = 'Comments',
  onClose,
  onSubmit,
  onReply,
  onReact,
  onEdit,
  onDelete,
  onResolve,
  composerPlaceholder     = 'Add a comment… (⌘↵ to send)',
  currentUser,
  showResolved:            controlledShowResolved,
  defaultShowResolved     = false,
  onShowResolvedChange,
  theme                   = 'light',
  className,
  style,
  'aria-label':            ariaLabel = 'Comments panel',
}: CommentPanelProps) {
  const t = tokens[theme]

  const [internalShowResolved, setInternalShowResolved] = useState(defaultShowResolved)
  const showResolved = controlledShowResolved ?? internalShowResolved

  const handleToggleResolved = (val: boolean) => {
    // Always sync internal state so it stays current if the consumer later
    // removes the controlled prop (prevents stale uncontrolled fallback).
    setInternalShowResolved(val)
    onShowResolvedChange?.(val)
  }

  const resolvedCount  = comments.filter((c) => c.resolved).length
  const totalCount     = comments.length
  const activeComments = showResolved ? comments : comments.filter((c) => !c.resolved)

  return (
    <section
      aria-label={ariaLabel}
      className={cn('flex flex-col', className)}
      style={{
        width:           sizing.panel.width,
        backgroundColor: t.panelBg,
        borderRadius:    radius.sm,
        boxShadow:       elevation.level2,
        overflow:        'hidden',
        ...style,
      }}
    >
      {/* ── Header ── */}
      <header
        className="flex items-center shrink-0 gap-2"
        style={{
          height:       sizing.componentHeight.xl,
          paddingLeft:  spacing[400],
          paddingRight: spacing[300],
          borderBottom: `${borderWidth.thin} solid ${t.headerBorder}`,
          flexShrink:   0,
        }}
      >
        <h2
          className="flex-1"
          style={{ color: t.primaryText, fontFamily: typography.fontFamily.headline, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.medium }}
        >
          {title}
        </h2>

        {/* Comment count badge */}
        {totalCount > 0 && (
          <span
            className="inline-flex items-center justify-center shrink-0"
            style={{
              height:          '20px',
              minWidth:        '20px',
              padding:         `0 ${spacing[200]}`,
              borderRadius:    radius.round,
              backgroundColor: t.countBadgeBg,
              color:           t.countBadgeText,
              fontSize:        typography.fontSize.sm,
              fontFamily:      typography.fontFamily.body,
              fontWeight:      600,
              border:          `${borderWidth.thin} solid ${t.headerBorder}`,
            }}
          >
            {totalCount}
          </span>
        )}

        {/* Resolved filter toggle */}
        {resolvedCount > 0 && (
          <button
            type="button"
            onClick={() => handleToggleResolved(!showResolved)}
            aria-pressed={showResolved}
            className="font-medium px-2 py-1 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              backgroundColor: showResolved ? t.toggleActiveBg : 'transparent',
              color:           showResolved ? t.toggleActiveText : t.toggleInactiveText,
              border:          `${borderWidth.thin} solid ${showResolved ? t.resolvedBorder : t.headerBorder}`,
              fontFamily:      typography.fontFamily.body,
              fontSize:        typography.fontSize.sm,
              cursor:          'pointer',
              outlineColor:    t.focusOutline,
            }}
          >
            {resolvedCount} resolved
          </button>
        )}

        {/* Close button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comments panel"
            className="flex items-center justify-center rounded-lg transition-colors duration-quick focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              width:        '32px',
              height:       '32px',
              border:       'none',
              background:   'transparent',
              color:        t.closeIcon,
              cursor:       'pointer',
              outlineColor: t.focusOutline,
              flexShrink:   0,
            }}
          >
            <CloseIcon />
          </button>
        )}
      </header>

      {/* ── Thread list ── */}
      <div
        className="flex-1 overflow-y-auto"
        aria-live="polite"
        aria-relevant="additions removals"
        style={{
          minHeight: sizing.panel.threadListMin,
          maxHeight: sizing.panel.threadListMax,
          padding:   `${spacing[200]} 0`,
        }}
      >
        {activeComments.length === 0 ? (
          <EmptyState theme={theme} />
        ) : (
          <div>
            {activeComments.map((comment, idx) => (
              <div key={comment.id}>
                <CommentItemAtom
                  comment={comment}
                  theme={theme}
                  onReply={onReply}
                  onReact={onReact}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onResolve={onResolve}
                  currentUser={currentUser}
                />
                {idx < activeComments.length - 1 && (
                  <div
                    style={{
                      borderBottom: `${borderWidth.thin} solid ${t.divider}`,
                      margin:       `${spacing[100]} ${spacing[400]}`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Composer ── */}
      {onSubmit && (
        <div style={{ borderTop: `${borderWidth.thin} solid ${t.headerBorder}` }}>
          <CommentComposer
            placeholder={composerPlaceholder}
            onSubmit={onSubmit}
            theme={theme}
            currentUser={currentUser}
          />
        </div>
      )}
    </section>
  )
}

CommentPanel.displayName = 'CommentPanel'

export default CommentPanel
