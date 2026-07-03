'use client'

import React, { useState, useEffect, useId, useRef } from 'react'
import { semantic, spacing, radius, opacity, borderWidth, typography, motion as motionTokens } from '@/lib/tokens'

/**
 * Enterprise DS v3 — Rating
 * Figma node: 36988-46583
 *
 * An interactive or read-only rating control rendered as stars, numeric buttons,
 * or emoji faces. Implemented as a radio group for full accessibility compliance.
 *
 * Figma variables
 *   Variant              — star | numeric | emoji
 *   Value                — 0–5  (0 = unrated)
 *   ReadOnly             — boolean
 *   Disabled             — boolean
 *   Theme                — light | dark
 *   HighlightSelectedOnly— boolean  (only the selected item is highlighted;
 *                                   emoji defaults true, star/numeric default false)
 *
 * Token mapping
 *   Selected fill        colour/background/positive/defaultStrong
 *   Selected fill hover  colour/background/positive/defaultStrongDeep
 *   Selected text        colour/foreground/positive/onColour
 *   Hover bg (preview)   colour/background/positive/defaultSubtle
 *   Hover border         colour/border/positive
 *   Idle star/emoji      colour/border/strong   (#BBBBBB light / #676767 dark)
 *   Idle numeric border  colour/border/default  (#E4E4E4 light / #4B4B4B dark)
 *   Idle text            colour/foreground/default/primary
 *   Focus ring           colour/border/focus
 *   Disabled opacity     opacity/disabled  (0.48)
 */

const s  = semantic
const sp = spacing
const r  = radius
const op = opacity
const bw = borderWidth

// ─── Types ────────────────────────────────────────────────────────────────────

export type RatingVariant = 'star' | 'numeric' | 'emoji'
export type RatingTheme   = 'light' | 'dark'

export interface RatingProps {
  /** Visual variant — star row, numeric buttons, or emoji faces */
  variant?: RatingVariant
  /** Controlled value: 0 = unrated, 1–5 = rated */
  value?: number
  /** Uncontrolled initial value */
  defaultValue?: number
  /** Called with the new rating value on selection */
  onChange?: (value: number) => void
  /** Read-only display mode — disables all interaction */
  readOnly?: boolean
  /** Non-interactive, rendered at reduced opacity */
  disabled?: boolean
  /** Canvas theme */
  theme?: RatingTheme
  /** When true, only the selected item is highlighted (not all preceding items).
   *  Defaults to true for emoji, false for star and numeric. */
  highlightSelectedOnly?: boolean
  /** Accessible label for the radio group */
  'aria-label'?: string
  /** Additional CSS class names */
  className?: string
}

// ─── Design Tokens ────────────────────────────────────────────────────────────

const CT = {
  // ── Selected ───────────────────────────────────────────────────────────────
  selectedFill:      { light: s.background.positive.defaultStrong.light,     dark: s.background.positive.defaultStrong.dark     },
  selectedFillDeep:  { light: s.background.positive.defaultStrongDeep.light, dark: s.background.positive.defaultStrongDeep.dark },
  selectedText:      { light: s.foreground.positive.onColour.light,          dark: s.foreground.positive.onColour.dark          },
  // ── Hover/preview (not yet committed) ──────────────────────────────────────
  hoverBg:           { light: s.background.positive.defaultSubtle.light,     dark: s.background.positive.defaultSubtle.dark     },
  hoverBorder:       { light: s.border.positive.light,                       dark: s.border.positive.dark                       },
  // ── Idle (unselected) ──────────────────────────────────────────────────────
  idleStroke:        { light: '#BBBBBB',                                     dark: s.border.strong.dark                         }, // light: colour/border/strong, dark: #676767
  idleBorder:        { light: s.border.default.light,                        dark: s.border.default.dark                        },
  idleText:          { light: s.foreground.default.primary.light,            dark: s.foreground.default.primary.dark            },
  // ── Focus ring ─────────────────────────────────────────────────────────────
  focus:             { light: s.border.focus.light,                          dark: s.border.focus.dark                          },
} as const

// Figma spec dimensions
const STAR_SIZE  = 24   // px (height annotation in spec)
const STAR_GAP   = sp[200]  // 8px
const NUM_W      = 40   // px (width annotation)
const NUM_H      = 36   // px (height annotation)
const EMOJI_SIZE = 40   // px (width × height annotation)
const ITEM_GAP   = sp[400]  // 16px

// Human-readable labels for screen readers
const EMOJI_LABELS = [
  'very dissatisfied',
  'dissatisfied',
  'neutral',
  'satisfied',
  'very satisfied',
]

// 12 particles evenly spread around the circle, with slight size/delay variation
const BURST_PARTICLES: Array<{ angle: number; dist: number; size: number; delay: number }> = [
  { angle:   0, dist: 28, size: 7, delay: 0    },
  { angle:  30, dist: 32, size: 5, delay: 0.03 },
  { angle:  60, dist: 26, size: 8, delay: 0.05 },
  { angle:  90, dist: 30, size: 5, delay: 0    },
  { angle: 120, dist: 28, size: 7, delay: 0.04 },
  { angle: 150, dist: 32, size: 5, delay: 0.02 },
  { angle: 180, dist: 26, size: 6, delay: 0.06 },
  { angle: 210, dist: 30, size: 8, delay: 0.01 },
  { angle: 240, dist: 28, size: 5, delay: 0.03 },
  { angle: 270, dist: 32, size: 7, delay: 0.05 },
  { angle: 300, dist: 26, size: 6, delay: 0    },
  { angle: 330, dist: 30, size: 5, delay: 0.04 },
]

function StarBurst({ color }: { color: string }) {
  return (
    <>
      {BURST_PARTICLES.map(({ angle, dist, size, delay }, idx) => {
        const rad = (angle * Math.PI) / 180
        const tx  = Math.round(Math.cos(rad) * dist)
        const ty  = Math.round(Math.sin(rad) * dist)
        return (
          <span
            key={idx}
            aria-hidden
            style={{
              position:   'absolute',
              top:        '50%',
              left:       '50%',
              width:      `${size}px`,
              height:     `${size}px`,
              pointerEvents: 'none',
              // CSS custom props picked up by the keyframe
              ['--tx' as string]: `${tx}px`,
              ['--ty' as string]: `${ty}px`,
              animation: `ratingBurstParticle ${motionTokens.duration.slow} ${motionTokens.easing.bounce} ${delay}s both`,
            }}
          >
            {/* mini star SVG */}
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={color}
              style={{ display: 'block' }}
            >
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </span>
        )
      })}
    </>
  )
}

// ─── SVG: Star icon ───────────────────────────────────────────────────────────

function StarIcon({
  size,
  filled,
  fillColor,
  strokeColor,
}: {
  size: number
  filled: boolean
  fillColor: string
  strokeColor: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={filled ? fillColor : 'none'}
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── SVG: Emoji face ──────────────────────────────────────────────────────────
// viewBox 0 0 40 40 — circle at cx=20 cy=20 r=18
// 5 distinct face expressions matching Figma spec

const EMOJI_MOUTHS = [
  'M 12 28 Q 20 22 28 28',   // 1: very dissatisfied — deep frown (inverted curve)
  'M 14 27 Q 20 23 26 27',   // 2: dissatisfied — slight frown
  'M 14 26 H 26',            // 3: neutral — flat line
  'M 14 24 Q 20 29 26 24',   // 4: satisfied — slight smile
  'M 12 23 Q 20 31 28 23',   // 5: very satisfied — wide open smile
]

function EmojiIcon({
  index,
  size,
  strokeColor,
  circleStroke,
  bgFill,
  isSelected = false,
  activationNonce = 0,
}: {
  index: number          // 1–5
  size: number
  strokeColor: string
  /** Stroke for the outer circle only — defaults to strokeColor */
  circleStroke?: string
  bgFill: string
  isSelected?: boolean
  activationNonce?: number
}) {
  // 'idle' → no animation, 'blink' → both eyes blink shut/open, 'wink' → left eye winks periodically
  const [eyePhase, setEyePhase] = useState<'idle' | 'blink' | 'wink'>('idle')
  const phaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (phaseTimer.current) clearTimeout(phaseTimer.current)
    if (!isSelected) {
      setEyePhase('idle')
      return
    }
    // On (re-)selection: blink once, then settle into idle wink
    setEyePhase('blink')
    phaseTimer.current = setTimeout(() => setEyePhase('wink'), 460)
    return () => { if (phaseTimer.current) clearTimeout(phaseTimer.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected, activationNonce])

  const happyEyes = index === 5

  // Shared SVG transform props so scaleY pivots on the element's own centre
  const eyeBase: React.CSSProperties = { transformBox: 'fill-box', transformOrigin: 'center' }

  // Left eye: blink first, then periodic wink
  const leftAnim: string | undefined =
    eyePhase === 'blink' ? `emojiEyeBlink ${motionTokens.duration.slow} ${motionTokens.easing.easeInOut} both` :
    eyePhase === 'wink'  ? `emojiEyeWink ${motionTokens.duration.loop.skeleton} ${motionTokens.easing.easeInOut} 0.4s infinite` :
    undefined

  // Right eye: only blinks on selection, never winks
  const rightAnim: string | undefined =
    eyePhase === 'blink' ? `emojiEyeBlink ${motionTokens.duration.slow} ${motionTokens.easing.easeInOut} both` :
    undefined

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      {/* Outer circle — never animates */}
      <circle cx="20" cy="20" r="18" stroke={circleStroke ?? strokeColor} strokeWidth="1.5" fill={bgFill} />
      {/* Eyes — each eye gets its own animation */}
      {happyEyes ? (
        <>
          <path d="M 13 16 Q 15 12.5 17 16" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round"
            style={{ ...eyeBase, animation: leftAnim }} />
          <path d="M 23 16 Q 25 12.5 27 16" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round"
            style={{ ...eyeBase, animation: rightAnim }} />
        </>
      ) : (
        <>
          <circle cx="15" cy="15" r="1.5" fill={strokeColor}
            style={{ ...eyeBase, animation: leftAnim }} />
          <circle cx="25" cy="15" r="1.5" fill={strokeColor}
            style={{ ...eyeBase, animation: rightAnim }} />
        </>
      )}
      {/* Mouth — static, just reflects the current index */}
      <path d={EMOJI_MOUTHS[index - 1]} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

// ─── Numeric item ─────────────────────────────────────────────────────────────

function NumericItem({
  value,
  selected,
  hovered,
  theme,
}: {
  value: number
  selected: boolean
  hovered: boolean
  theme: RatingTheme
}) {
  const bg = selected
    ? (hovered ? CT.selectedFillDeep[theme] : CT.selectedFill[theme])
    : (hovered ? CT.hoverBg[theme] : 'transparent')

  const borderColor = selected
    ? CT.selectedFill[theme]
    : (hovered ? CT.hoverBorder[theme] : CT.idleBorder[theme])

  const textColor = selected
    ? CT.selectedText[theme]
    : CT.idleText[theme]

  return (
    <span
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:          `${NUM_W}px`,
        height:         `${NUM_H}px`,
        borderRadius:   r.xs,
        border:         `${bw.thin} solid ${borderColor}`,
        backgroundColor: bg,
        color:          textColor,
        fontSize:       typography.fontSize.md,
        fontWeight:     600,
        fontFamily:     typography.fontFamily.body,
        transition:     `background-color ${motionTokens.duration.quick}, border-color ${motionTokens.duration.quick}, color ${motionTokens.duration.quick}`,
        userSelect:     'none',
      }}
    >
      {value}
    </span>
  )
}

// ─── Rating ───────────────────────────────────────────────────────────────────

export function Rating({
  variant = 'star',
  value: controlledValue,
  defaultValue = 0,
  onChange,
  readOnly = false,
  disabled = false,
  theme = 'light',
  highlightSelectedOnly,
  'aria-label': ariaLabel,
  className,
}: RatingProps) {
  const groupId = useId()

  // Controlled / uncontrolled pattern
  const isControlled = controlledValue !== undefined
  const [internal, setInternal] = useState(defaultValue)
  const value = isControlled ? (controlledValue ?? 0) : internal

  // Hover preview state (0 = no hover)
  const [hover, setHover] = useState(0)

  // Star burst animation — incremented to re-trigger the burst on repeated clicks
  const [burstKey, setBurstKey] = useState(0)
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Spring bounce — tracks which star was last clicked and a nonce to re-trigger
  const [spring, setSpring] = useState<{ i: number; n: number } | null>(null)

  // Emoji face animation — same pattern
  const [emojiSpring, setEmojiSpring] = useState<{ i: number; n: number } | null>(null)

  const interactive = !readOnly && !disabled

  // Emoji defaults to single-highlight; star and numeric default to cumulative
  const singleHighlight = highlightSelectedOnly ?? (variant === 'emoji')

  // The value to visually reflect (hover preview takes precedence)
  const displayValue = interactive && hover > 0 ? hover : value

  const isActive = (i: number) =>
    singleHighlight ? displayValue === i : i <= displayValue

  const handleSelect = (i: number) => {
    if (!interactive) return
    if (!isControlled) setInternal(i)
    onChange?.(i)
    if (variant === 'star') {
      // Spring bounce on every star
      setSpring(prev => ({ i, n: (prev?.n ?? 0) + 1 }))
      // Particle burst only on the 5th star
      if (i === 5) {
        if (burstTimer.current) clearTimeout(burstTimer.current)
        setBurstKey(k => k + 1)
        burstTimer.current = setTimeout(() => setBurstKey(0), 700)
      }
    }
    if (variant === 'emoji') {
      setEmojiSpring(prev => ({ i, n: (prev?.n ?? 0) + 1 }))
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel ?? `${variant} rating`}
      aria-disabled={disabled || undefined}
      className={className}
      style={{
        display:     'inline-flex',
        alignItems:  'center',
        gap:         variant === 'star' ? STAR_GAP : ITEM_GAP,
        opacity:     disabled ? op.half : 1,
        cursor:      disabled ? 'not-allowed' : undefined,
      }}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const active  = isActive(i)
        const hovered = interactive && hover === i

        // Color resolution per item
        const fillColor   = active
          ? (hovered ? CT.selectedFillDeep[theme] : CT.selectedFill[theme])
          : 'transparent'
        const strokeColor = active
          ? (hovered ? CT.selectedFillDeep[theme] : CT.selectedFill[theme])
          : CT.idleStroke[theme]

        const ariaItemLabel =
          variant === 'emoji'
            ? `${EMOJI_LABELS[i - 1]} (${i} out of 5)`
            : `${i} out of 5`

        const isBurstStar = variant === 'star' && i === 5

        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={ariaItemLabel}
            disabled={!interactive}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleSelect(i)}
            onMouseEnter={() => { if (interactive) setHover(i) }}
            onMouseLeave={() => { if (interactive) setHover(0) }}
            style={{
              background: 'none',
              border:     'none',
              padding:    0,
              margin:     0,
              cursor:     interactive ? 'pointer' : readOnly ? 'default' : 'not-allowed',
              display:    'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: variant === 'numeric' ? r.xs : '50%',
              outline:    'none',
              // Burst particles need relative + visible overflow on the host button
              position:   isBurstStar ? 'relative' : undefined,
              overflow:   isBurstStar ? 'visible'  : undefined,
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = `2px solid ${CT.focus[theme]}`
              e.currentTarget.style.outlineOffset = '2px'
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none'
            }}
          >
            {variant === 'star' && (
              <span
                key={spring?.i === i ? `spring-${spring.n}` : `star-${i}`}
                style={{
                  display: 'inline-flex',
                  animation: spring?.i === i
                    ? `ratingStarSpring ${motionTokens.duration.deliberate} ${motionTokens.easing.easeOut} both`
                    : undefined,
                }}
              >
                <StarIcon
                  size={STAR_SIZE}
                  filled={active}
                  fillColor={fillColor}
                  strokeColor={strokeColor}
                />
              </span>
            )}

            {/* Star-burst particles rendered when 5th star is clicked */}
            {isBurstStar && burstKey > 0 && (
              <StarBurst key={burstKey} color={CT.selectedFill[theme]} />
            )}

            {variant === 'numeric' && (
              <NumericItem
                value={i}
                selected={active}
                hovered={hovered}
                theme={theme}
              />
            )}

            {variant === 'emoji' && (
              <EmojiIcon
                index={i}
                size={EMOJI_SIZE}
                strokeColor={active ? CT.selectedFill[theme] : CT.idleStroke[theme]}
                circleStroke={active ? CT.selectedFill[theme] : CT.idleStroke[theme]}
                bgFill={active ? CT.hoverBg[theme] : 'transparent'}
                isSelected={value === i}
                activationNonce={emojiSpring?.i === i ? emojiSpring.n : 0}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default Rating
