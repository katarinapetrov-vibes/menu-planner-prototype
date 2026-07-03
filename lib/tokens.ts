// lib/tokens.ts
// Sourced from Figma: Enterprise-DS-v3 — variables panel + component spec frames
//
// Architecture mirrors Figma's 3-tier token system:
//   1. primitives   — raw color scales, never reference directly in components
//   2. semantic     — aliases with { light, dark } mode values
//   3. components   — component-specific tokens (dimensions, colours, states)
//
// Additional sections: spacing · sizing · radius · borderWidth · typography · elevation · opacity

// ─── 1. PRIMITIVE COLOR SCALES ────────────────────────────────────────────────

export const primitives = {
  grey: {
    100: '#FFFFFF',
    200: '#F8F8F8',
    300: '#EEEEEE',
    400: '#E4E4E4',
    500: '#BBBBBB',
    600: '#676767',
    700: '#4B4B4B',
    800: '#242424',
  },
  green: {
    100: '#F6FDE9',
    200: '#E4FABF',
    300: '#D2F895',
    400: '#96DC14',
    500: '#00A846',  // ADD — ~3.13:1 vs white, passes WCAG 1.4.11 non-text
    600: '#067A46',
    700: '#056835',
    800: '#035624',
  },
  red: {
    100: '#FFEAE9',
    200: '#FFCCCA',
    300: '#FCAD9A',
    400: '#FE8680',
    500: '#DB1D1D',
    600: '#B30000',
    700: '#970000',
    800: '#7C0000',
  },
  orange: {
    100: '#FFECD3',
    200: '#FFDBAC',
    300: '#FFBF74',
    400: '#FF941A',
    500: '#EF670A',  // ADD — ~3.17:1 vs white, passes WCAG 1.4.11 non-text
    600: '#CE4500',
    700: '#A43700',
    800: '#7B2900',
  },
  blue: {
    100: '#E9FAFF',
    200: '#D3F6FF',
    300: '#92EAFF',
    400: '#40BDF0',
    500: '#1268FF',  // ADD — ~4.71:1 vs white, passes WCAG AA text
    600: '#002AFF',
    700: '#001DB2',
    800: '#00178C',
  },
  yellow: {
    100: '#FFFCD3',
    200: '#FFFAB2',
    300: '#FFF583',
    400: '#FFE900',
    500: '#E2C700',
    600: '#C6AE00',
    700: '#A48B00',
    800: '#726100',
  },
  teal: {
    100: '#F2FCF9',
    200: '#CBF5E6',
    300: '#A5EED4',
    400: '#54E1AC',
    500: '#0EC87B',
    600: '#118C74',
    700: '#09766A',
    800: '#006060',
  },
  pink: {
    100: '#F8ECF2',
    200: '#EFD1E0',
    300: '#F4B1D2',
    400: '#FF63AA',
    500: '#C6278C',
    600: '#AA097D',
    700: '#841484',
    800: '#691069',
  },
  brown: {
    100: '#F8EDCD',
    200: '#F5E4B5',
    300: '#F2DB9C',
    400: '#E6C16A',
    500: '#BC8B42',
    600: '#A97739',
    700: '#75451A',
    800: '#5D3714',
  },
  purple: {
    100: '#F5F2FF',
    200: '#E6E0FF',
    300: '#B7ABFF',
    400: '#9B8AFF',
    500: '#7E6AE6',
    600: '#6747D2',
    700: '#5236B8',
    800: '#2B1E66',
  },
} as const

// ─── 1b. TRANSLUCENT PRIMITIVE COLOURS ────────────────────────────────────────
// Same colour scales as primitives, rendered at 40% opacity.
// Referenced by semantic border/focus tokens — do not use directly in components.

export const translucent = {
  transparent: 'rgba(0, 0, 0, 0)',
  white:       '#FFFFFF',
  white55:     'rgba(255, 255, 255, 0.55)',  // white @ 55% opacity — subdued text on dark surfaces
  white10:     'rgba(255, 255, 255, 0.10)',  // white @ 10% opacity — disabled control bg on dark canvas
  green10:     'rgba(150, 220, 20, 0.10)',   // green[400] @ 10% opacity — control hover bg on dark canvas
  green20:     'rgba(150, 220, 20, 0.20)',   // green[400] @ 20% opacity — control pressed bg on dark canvas
  grey: {
    300: 'rgba(238, 238, 238, 0.4)',  // grey[300]
    500: 'rgba(187, 187, 187, 0.4)',  // grey[500]
  },
  green: {
    400: 'rgba(150, 220, 20, 0.4)',   // green[400]
    500: 'rgba(0, 168, 70, 0.4)',     // green[500]
  },
  red: {
    400: 'rgba(254, 134, 128, 0.4)',  // red[400]
    500: 'rgba(219, 29, 29, 0.4)',    // red[500]
  },
  orange: {
    400: 'rgba(255, 148, 26, 0.4)',   // orange[400]
    600: 'rgba(206, 69, 0, 0.4)',     // orange[600]
  },
  blue: {
    400: 'rgba(64, 189, 240, 0.4)',   // blue[400]
    600: 'rgba(0, 42, 255, 0.4)',     // blue[600]
  },
  yellow: {
    400: 'rgba(255, 233, 0, 0.4)',    // yellow[400]
    600: 'rgba(198, 174, 0, 0.4)',    // yellow[600]
  },
  teal: {
    400: 'rgba(84, 225, 172, 0.4)',   // teal[400]
    600: 'rgba(17, 140, 116, 0.4)',   // teal[600]
  },
  pink: {
    400: 'rgba(255, 99, 170, 0.4)',   // pink[400]
    600: 'rgba(170, 9, 125, 0.4)',    // pink[600]
  },
  brown: {
    400: 'rgba(230, 193, 106, 0.4)',  // brown[400]
    600: 'rgba(169, 119, 57, 0.4)',   // brown[600]
  },
  purple: {
    400: 'rgba(155, 138, 255, 0.4)',  // purple[400] (#9B8AFF)
    600: 'rgba(103, 71, 210, 0.4)',   // purple[600]
  },
} as const

// ─── 2. SEMANTIC TOKENS ────────────────────────────────────────────────────────
// Every token carries { light, dark } — the two variable modes from Figma.
// Token paths mirror Figma: colour/<layer>/<intent>/<variant>

export const semantic = {

  // ── Foreground ──────────────────────────────────────────────────────────────
  foreground: {
    default: {
      primary:     { light: primitives.grey[800], dark: primitives.grey[400] },  // Main body text, headings, and form labels. Highest contrast. Do not use for muted, secondary, or disabled content.
      secondary:   { light: primitives.grey[700], dark: primitives.grey[300] },  // Subdued text: captions, metadata, helper messages. Do not use where primary emphasis is needed.
      disabled:    { light: primitives.grey[500], dark: primitives.grey[600] },  // Text and icons in a disabled state only. Never apply to interactive or readable content.
      inverse:     { light: primitives.grey[100], dark: primitives.grey[800] },  // Text on dark/coloured fills (filled buttons, badges, chips). Do not use on white or grey page surfaces.
      placeholder: { light: primitives.grey[500], dark: primitives.grey[500] },  // Input placeholder text only. Do not use for real content, labels, or disabled text.
      tertiary:    { light: primitives.grey[600], dark: primitives.grey[500] },  // Lowest-emphasis text in the default hierarchy: idle/disabled form labels, empty-state descriptions. One tier below secondary. Figma: foreground/default/tertiary.
    },
    neutral: {
      default:        { light: primitives.grey[800], dark: primitives.grey[400] },  // Body text on neutral/grey surfaces. Functionally mirrors foreground.default.primary — prefer default.primary for most cases.
      defaultDeep:    { light: primitives.grey[700], dark: primitives.grey[300] },  // Secondary text on neutral surfaces (sub-labels, support copy in grey panels). Slightly higher contrast than neutral.default.
      mid:            { light: primitives.grey[600], dark: primitives.grey[500] },  // Helper text, icon labels, and adornment text. Lower emphasis than secondary.
      onColour:       { light: primitives.grey[100], dark: primitives.grey[800] },  // Text/icons directly on any neutral coloured fill. Do not use on white or tinted surfaces.
      onColourDeep:   { light: primitives.grey[100], dark: primitives.grey[800] },  // Text/icons on the deepest neutral fill (e.g. pressed-state overlay). Prefer onColour unless pressed state is needed.
    },
    positive: {
      default:        { light: primitives.green[500], dark: primitives.green[400] },  // Success labels, positive action text, confirmation copy. Do not use directly on green fills — use onColour there.
      defaultDeep:    { light: primitives.green[700], dark: primitives.green[300] },  // Hover/emphasis on positive text elements (e.g. hovered positive link). Do not use at rest.
      onColour:       { light: primitives.grey[100],  dark: primitives.green[800] },  // Text/icons rendered on a green fill (e.g. filled success button label).
      onColourDeep:   { light: primitives.grey[100],  dark: primitives.green[800] },  // Text/icons on the darkest green fill (e.g. pressed positive button). Prefer onColour at rest.
    },
    negative: {
      default:        { light: primitives.red[500],  dark: primitives.red[400] },   // Error messages, destructive action labels, validation failure text. Do not use on red fills.
      defaultDeep:    { light: primitives.red[700],  dark: primitives.red[300] },   // Hover/emphasis on negative text elements. Do not use at rest.
      onColour:       { light: primitives.grey[100], dark: primitives.red[800] },   // Text/icons on a red fill (e.g. filled destructive button label).
      onColourDeep:   { light: primitives.grey[100], dark: primitives.red[800] },   // Text/icons on the darkest red fill (e.g. pressed destructive button). Prefer onColour at rest.
    },
    warning: {
      default:        { light: primitives.orange[500], dark: primitives.orange[400] },  // Warning messages, caution labels, non-blocking alert text. Do not use on orange fills.
      defaultDeep:    { light: primitives.orange[700], dark: primitives.orange[300] },  // Hover/emphasis on warning text elements. Do not use at rest.
      onColour:       { light: primitives.grey[100],   dark: primitives.orange[800] },  // Text/icons on an orange warning fill.
      onColourDeep:   { light: primitives.grey[100],   dark: primitives.orange[800] },  // Text/icons on the darkest orange fill (e.g. pressed warning button). Prefer onColour at rest.
    },
    information: {
      default:        { light: primitives.blue[500], dark: primitives.blue[400] },  // Informational labels, help text, link-style info actions. Do not use on blue fills.
      defaultDeep:    { light: primitives.blue[700], dark: primitives.blue[300] },  // Hover/emphasis on information text elements. Do not use at rest.
      onColour:       { light: primitives.grey[100], dark: primitives.blue[800] },  // Text/icons on a blue information fill.
      onColourDeep:   { light: primitives.grey[100], dark: primitives.blue[800] },  // Text/icons on the darkest blue fill (e.g. pressed info button). Prefer onColour at rest.
    },
    reward: {
      default:        { light: primitives.yellow[600], dark: primitives.yellow[400] },  // Reward/points labels, achievement text, star ratings. Do not use on yellow fills.
      defaultDeep:    { light: primitives.yellow[700], dark: primitives.yellow[300] },  // Hover/emphasis on reward text. Do not use at rest.
      onColour:       { light: primitives.grey[100],   dark: primitives.yellow[800] },  // Text/icons on a yellow reward fill.
      onColourDeep:   { light: primitives.grey[100],   dark: primitives.yellow[800] },  // Text/icons on the darkest yellow fill. Prefer onColour at rest.
    },
    ai: {
      default:        { light: primitives.purple[600], dark: primitives.purple[400] },  // AI-generated content labels, AI feature names, AI tool copy. Do not use on purple fills.
      defaultDeep:    { light: primitives.purple[700], dark: primitives.purple[300] },  // Hover/emphasis on AI feature text. Do not use at rest.
      onColour:       { light: primitives.grey[100],   dark: primitives.purple[800] },  // Text/icons on a purple AI fill (e.g. filled AI button label).
      onColourDeep:   { light: primitives.grey[100],   dark: primitives.purple[800] },  // Text/icons on the darkest purple AI fill. Prefer onColour at rest.
    },
    complimentary: {
      brown: {
        default:      { light: primitives.brown[600], dark: primitives.brown[400] },  // Brown accent text: editorial, food, seasonal, or category labels on neutral surfaces. Not for status/feedback.
        defaultDeep:  { light: primitives.brown[700], dark: primitives.brown[300] },  // Hover/emphasis on brown accent text. Do not use at rest.
        onColour:     { light: primitives.grey[100],  dark: primitives.brown[800] },  // Text/icons on a brown accent fill.
        onColourDeep: { light: primitives.grey[100],  dark: primitives.brown[800] },  // Text/icons on the deepest brown fill. Prefer onColour at rest.
      },
      mint: {
        default:      { light: primitives.teal[600], dark: primitives.teal[400] },  // Mint/teal accent text: wellness, finance, or nature theme labels on neutral surfaces.
        defaultDeep:  { light: primitives.teal[700], dark: primitives.teal[300] },  // Hover/emphasis on mint accent text. Do not use at rest.
        onColour:     { light: primitives.grey[100], dark: primitives.teal[800] },  // Text/icons on a mint fill.
        onColourDeep: { light: primitives.grey[100], dark: primitives.teal[800] },  // Text/icons on the deepest mint fill. Prefer onColour at rest.
      },
      pink: {
        default:      { light: primitives.pink[600], dark: primitives.pink[400] },  // Pink accent text: beauty, lifestyle, or promotional labels on neutral surfaces.
        defaultDeep:  { light: primitives.pink[700], dark: primitives.pink[300] },  // Hover/emphasis on pink accent text. Do not use at rest.
        onColour:     { light: primitives.grey[100], dark: primitives.pink[800] },  // Text/icons on a pink fill.
        onColourDeep: { light: primitives.grey[100], dark: primitives.pink[800] },  // Text/icons on the deepest pink fill. Prefer onColour at rest.
      },
    },
  },

  // ── Background ──────────────────────────────────────────────────────────────
  background: {
    // ── Canonical surface tokens ─────────────────────────────────────────────
    // Surface vocabulary: base → raised → sunken → overlay (floating). `scrim` is a translucent wash behind modals, not a surface.
    // See sage-tokens.mdc "Surface vocabulary" and sage-layouts.mdc Section 1.
    base:   { light: primitives.grey[200], dark: primitives.grey[800] },   // Page canvas. Outermost surface.
    raised: {
      default:  { light: primitives.grey[100], dark: primitives.grey[700] },   // Raised content surfaces (cards, sections, panels) at rest.
      hovered:  { light: primitives.grey[300], dark: primitives.grey[600] },   // Hover state on a raised surface.
      selected: { light: primitives.grey[400], dark: primitives.grey[500] },   // Persistent selection state on a raised surface. Neutral grey — does not spend the accent budget.
      disabled: { light: primitives.grey[200], dark: primitives.grey[800] },   // Disabled raised surface (matches base; pair with opacity.half for full disabled effect).
    },
    sunken: {
      default: { light: primitives.grey[300], dark: primitives.grey[800] },    // Sunken/inset areas — input field bg, sunken panels. Dark value matches base (no darker grey primitive exists); contextual nesting inside raised still reads as sunken.
    },
    scrim:  { light: 'rgba(36,36,36,0.48)', dark: 'rgba(255,255,255,0.48)' },  // Translucent wash behind modals/dialogs. Not a surface — an obscuring layer.

    // ── Deprecated aliases (migrate to the canonical names above) ────────────
    page:          { light: primitives.grey[100], dark: primitives.grey[700] },                // @deprecated Use background.raised.default instead.
    container:     { light: primitives.grey[200], dark: primitives.grey[800] },                // @deprecated Use background.base instead.
    surfaceOffset: { light: primitives.grey[300], dark: primitives.grey[800] },                // @deprecated Use background.sunken.default instead.
    overlay:       { light: 'rgba(36,36,36,0.48)', dark: 'rgba(255,255,255,0.48)' },           // @deprecated Use background.scrim instead.

    positive: {
      defaultStrong:     { light: primitives.green[600], dark: primitives.green[400] },  // Filled background for success buttons, filled positive chips. Do not use as a subtle tint.
      defaultStrongDeep: { light: primitives.green[700], dark: primitives.green[300] },  // Hover/pressed fill on positive strong surfaces. Do not use at rest.
      defaultSubtle:     { light: primitives.green[100], dark: primitives.green[800] },  // Light tint for success alerts, banners, selected rows. Do not use for interactive fills.
      defaultSubtleDeep: { light: primitives.green[200], dark: primitives.green[700] },  // Hover state on subtle positive surfaces. Do not use at rest.
    },
    negative: {
      defaultStrong:     { light: primitives.red[600], dark: primitives.red[400] },  // Filled background for destructive/error buttons and badges. Do not use as a subtle tint.
      defaultStrongDeep: { light: primitives.red[700], dark: primitives.red[300] },  // Hover/pressed fill on negative strong surfaces. Do not use at rest.
      defaultSubtle:     { light: primitives.red[100], dark: primitives.red[800] },  // Error alert and banner backgrounds, validation error row tints. Do not use for interactive fills.
      defaultSubtleDeep: { light: primitives.red[200], dark: primitives.red[700] },  // Hover state on subtle negative surfaces. Do not use at rest.
    },
    warning: {
      defaultStrong:     { light: primitives.orange[600], dark: primitives.orange[400] },  // Filled background for warning-severity filled components. Do not use as a subtle tint.
      defaultStrongDeep: { light: primitives.orange[700], dark: primitives.orange[300] },  // Hover/pressed fill on warning strong surfaces. Do not use at rest.
      defaultSubtle:     { light: primitives.orange[100], dark: primitives.orange[800] },  // Warning alert and banner backgrounds. Do not use for interactive fills.
      defaultSubtleDeep: { light: primitives.orange[200], dark: primitives.orange[700] },  // Hover state on subtle warning surfaces. Do not use at rest.
    },
    information: {
      defaultStrong:     { light: primitives.blue[600], dark: primitives.blue[400] },  // Filled background for information-severity filled components. Do not use as a subtle tint.
      defaultStrongDeep: { light: primitives.blue[700], dark: primitives.blue[300] },  // Hover/pressed fill on information strong surfaces. Do not use at rest.
      defaultSubtle:     { light: primitives.blue[100], dark: primitives.blue[800] },  // Informational alert and banner backgrounds. Do not use for interactive fills.
      defaultSubtleDeep: { light: primitives.blue[200], dark: primitives.blue[700] },  // Hover state on subtle information surfaces. Do not use at rest.
    },
    reward: {
      defaultStrong:     { light: primitives.yellow[600], dark: primitives.yellow[400] },  // Filled background for reward/achievement filled components and badges. Do not use as a subtle tint.
      defaultStrongDeep: { light: primitives.yellow[700], dark: primitives.yellow[300] },  // Hover/pressed fill on reward strong surfaces. Do not use at rest.
      defaultSubtle:     { light: primitives.yellow[200], dark: primitives.yellow[800] },  // Reward highlight and points alert backgrounds. Do not use for interactive fills.
      defaultSubtleDeep: { light: primitives.yellow[300], dark: primitives.yellow[700] },  // Hover state on subtle reward surfaces. Do not use at rest.
    },
    ai: {
      defaultStrong:     { light: primitives.purple[600], dark: primitives.purple[400] },  // Filled background for AI feature CTAs and AI-branded components. Do not use as a subtle tint.
      defaultStrongDeep: { light: primitives.purple[700], dark: primitives.purple[300] },  // Hover/pressed fill on AI strong surfaces. Note: dark value stays purple[400] per Figma spec.
      defaultSubtle:     { light: primitives.purple[200], dark: primitives.purple[800] },  // AI content panels, suggestion boxes, AI-branded highlights. Do not use for interactive fills.
      defaultSubtleDeep: { light: primitives.purple[300], dark: primitives.purple[700] },  // Hover state on subtle AI surfaces. Do not use at rest.
    },
    // ── Neutral (grey-scale interactive surfaces) ─────────────────────────────
    // Parallel to the positive/negative/ai colour groups but greyscale.
    // Used for: neutral fill buttons, outline/text button hover tints, and disabled fills.
    // Figma token path: background/neutral/*
    neutral: {
      defaultStrong:     { light: primitives.grey[700], dark: primitives.grey[500] },  // Neutral fill button hover/focus bg. Figma: background/neutral/defaultStrong.
      defaultStrongDeep: { light: primitives.grey[800], dark: primitives.grey[600] },  // Neutral fill button resting bg (deepest neutral surface). Figma: background/neutral/defaultStrongDeep.
      defaultSubtle:     { light: primitives.grey[200], dark: primitives.grey[800] },  // Outline/text button hover tint; disabled bg for outline variants. Figma: background/neutral/defaultSubtle.
      defaultSubtleDeep: { light: primitives.grey[300], dark: primitives.grey[700] },  // Outline/text button press tint; disabled bg for fill variants. Figma: background/neutral/defaultSubtleDeep.
    },

    // ── Container tiers ───────────────────────────────────────────────────────
    // @deprecated containerSecondary is replaced by background.raised.hovered (canonical name above).
    containerSecondary: { light: primitives.grey[300], dark: primitives.grey[600] },  // @deprecated Use background.raised.hovered instead.

    complimentary: {
      mint: {
        defaultStrong:     { light: primitives.teal[600], dark: primitives.teal[400] },  // Mint-accented filled surfaces: wellness, nature, or finance theme components.
        defaultStrongDeep: { light: primitives.teal[700], dark: primitives.teal[300] },  // Hover/pressed on mint strong fills. Do not use at rest.
        defaultSubtle:     { light: primitives.teal[100], dark: primitives.teal[800] },  // Mint-accented alert or highlight backgrounds. Do not use for interactive fills.
        defaultSubtleDeep: { light: primitives.teal[200], dark: primitives.teal[700] },  // Hover state on subtle mint surfaces. Do not use at rest.
      },
      pink: {
        defaultStrong:     { light: primitives.pink[600], dark: primitives.pink[400] },  // Pink-accented filled surfaces: beauty or lifestyle theme components.
        defaultStrongDeep: { light: primitives.pink[700], dark: primitives.pink[300] },  // Hover/pressed on pink strong fills. Do not use at rest.
        defaultSubtle:     { light: primitives.pink[100], dark: primitives.pink[800] },  // Pink-accented highlight backgrounds. Do not use for interactive fills.
        defaultSubtleDeep: { light: primitives.pink[200], dark: primitives.pink[700] },  // Hover state on subtle pink surfaces. Do not use at rest.
      },
      brown: {
        defaultStrong:     { light: primitives.brown[600], dark: primitives.brown[400] },  // Brown/warm-accented filled surfaces: editorial, food, or seasonal theme components.
        defaultStrongDeep: { light: primitives.brown[700], dark: primitives.brown[300] },  // Hover/pressed on brown strong fills. Do not use at rest.
        defaultSubtle:     { light: primitives.brown[100], dark: primitives.brown[800] },  // Brown-accented highlight backgrounds. Do not use for interactive fills.
        defaultSubtleDeep: { light: primitives.brown[200], dark: primitives.brown[700] },  // Hover state on subtle brown surfaces. Do not use at rest.
      },
    },
  },

  // ── Border ──────────────────────────────────────────────────────────────────
  border: {
    default:  { light: primitives.grey[400], dark: primitives.grey[700] },   // Standard container, card, and divider borders. Default choice for most bordered UI.
    hover:    { light: primitives.grey[500], dark: primitives.grey[600] },    // Elevated border contrast on hovered interactive containers. Do not use as default border.
    strong:   { light: primitives.grey[500], dark: primitives.grey[600] },   // High-contrast borders requiring emphasis (e.g. selected state alternative ring). Do not use as a default border.
    focus:    { light: primitives.green[600], dark: primitives.green[400] },  // Keyboard focus ring color only. Never apply for aesthetic or decorative borders.
    disabled: { light: primitives.grey[400], dark: primitives.grey[700] },   // Borders on disabled fields and controls. Matches default value — visually reinforces disabled state.

    positive:    { light: primitives.green[600],  dark: primitives.green[400]  },  // Border on success-state inputs, outlined positive buttons, and selected positive items.
    negative:    { light: primitives.red[600],    dark: primitives.red[400]    },  // Border on error-state inputs and outlined destructive buttons.
    warning:     { light: primitives.orange[600], dark: primitives.orange[400] },  // Border on warning-state inputs and components.
    information: { light: primitives.blue[600],   dark: primitives.blue[400]   },  // Border on info-state inputs and components.
    reward:      { light: primitives.yellow[600], dark: primitives.yellow[400] },  // Border on reward/points-related components.
    ai:           { light: primitives.purple[600], dark: primitives.purple[400] },  // Border on AI-branded inputs and outlined AI components.

    // ── Variant-specific focus rings ─────────────────────────────────────────
    // Used as borderFocus in componentState — the visible focus ring colour per interactive variant.
    // The universal border.focus (green) applies to positive/neutral components.
    // Figma: colour/border/<variant>/focus
    focusNegative: { light: primitives.red[600],    dark: primitives.red[400]    },  // Focus ring for destructive/negative interactive components. Figma: border/negative/focus.
    focusAi:       { light: primitives.purple[600], dark: primitives.purple[400] },  // Focus ring for AI-branded interactive components. Figma: border/AI/focus.

    complimentary: {
      brown: {
        default:      { light: primitives.brown[600], dark: primitives.brown[400] },  // Default border for brown-accented interactive components.
        defaultHover: { light: primitives.brown[700], dark: primitives.brown[300] },  // Hover/pressed border for brown-accented components. Do not use at rest.
        focus:        { light: translucent.brown[400], dark: translucent.brown[600] },  // Focus ring for brown-accented interactive components. Use only for keyboard focus.
      },
      mint: {
        default:      { light: primitives.teal[600], dark: primitives.teal[400] },  // Default border for mint/teal-accented interactive components.
        defaultDeep:  { light: primitives.teal[700], dark: primitives.teal[300] },  // Hover/pressed border for mint-accented components. Do not use at rest.
        focus:        { light: translucent.teal[400], dark: translucent.teal[600] },  // Focus ring for mint-accented interactive components. Use only for keyboard focus.
      },
      pink: {
        default:      { light: primitives.pink[600], dark: primitives.pink[400] },  // Default border for pink-accented interactive components.
        defaultDeep:  { light: primitives.pink[700], dark: primitives.pink[300] },  // Hover/pressed border for pink-accented components. Do not use at rest.
        focus:        { light: translucent.pink[400], dark: translucent.pink[600] },  // Focus ring for pink-accented interactive components. Use only for keyboard focus.
      },
    },
  },

  // ── Interactive State Overlays (legacy) ──────────────────────────────────────
  // ⚠ Deprecated — do not use for new components.
  // These rgba overlays require compositing over the base fill, which breaks on coloured surfaces
  // and makes dark mode unpredictable. Use `componentState` (see bottom of file) instead — it maps
  // every component × variant × state directly to explicit semantic token values.
  //
  // Kept for the two existing usages in side-navigation.tsx. Remove once that file is migrated.
  state: {
    hover:    'rgba(0,0,0,0.08)',     // 8% dark overlay on hover. Legacy — prefer componentState.
    pressed:  'rgba(0,0,0,0.16)',    // 16% dark overlay on press. Legacy — prefer componentState.
    focused:  'rgba(0,0,0,0.04)',    // 4% dark overlay behind focus ring. Legacy — prefer componentState.
    disabled: 'rgba(255,255,255,0)', // No-op overlay — use opacity.half on the component wrapper instead.
    selected: 'rgba(6,122,70,0.10)', // Positive-tinted row selection tint. Still valid for table/list selected rows.
  },

} as const

// ─── 2c. BASE NUMERIC SCALE ───────────────────────────────────────────────────
// The single source-of-truth numeric scale from Figma's variables panel.
// Raw pixel values (as numbers) referenced by spacing, sizing, radius, and
// any other dimensional token group. Keys are the Figma token names.

export const scale = {
    0: 0,    // 0. Flush/no-gap positioning. Use to explicitly zero out spacing — prefer CSS gap:0 directly where cleaner.
   25: 1,    // 1px. Pixel-perfect alignment nudge only. Do not use for spacing or padding.
   50: 2,    // 2px. Compact density minimum. Powers spacing[50] for dense header/cell padding.
  100: 4,    // 4px. Extra-small unit. Icon-to-label gaps, chip inner padding, micro-spacing.
  200: 8,    // 8px. Small unit. Default gap for tightly-packed UI: icon rows, button icon gaps.
  300: 12,   // 12px. Medium-small unit. Component padding and grouped-element spacing.
  350: 14,   // 14px. Small-medium unit. Body/sm text size; secondary UI labels.
  400: 16,   // 16px. Base layout unit. Standard padding, card gaps, action spacing.
  500: 20,   // 20px. Medium unit. Comfortable list item height offsets and section gaps.
  600: 24,   // 24px. Large padding unit. Standard comfortable-density padding.
  700: 28,   // 28px. Spacious-density padding base. Use for spacious layout variants.
  800: 32,   // 32px. Icon-button size; avatar medium. Also common fixed component height.
  900: 36,   // 36px. Compact nav row height (sizing.componentHeight.navSm). Do not use for general spacing.
 1000: 40,   // 40px. Standard interactive height (button, input, table header). Most common fixed height.
 1100: 48,   // 48px. Large interactive height. Use for menu items, nav rows, and large buttons.
 1200: 56,   // 56px. Comfortable accordion trigger min-height. Use for expanded content block sizing.
 1300: 64,   // 64px. Hero element height. Use for large headers and featured component sizes.
 1400: 72,   // 72px. Extra-large element. Use for full-bleed or feature card sizing.
 1500: 96,   // 96px. Section-level vertical rhythm only. Do not use for component-level spacing.
 1550: 100,  // 100. Opacity denominator only (opacity.full = 1.0). Do not use for spacing.
 1600: 128,  // 128px. Large section gap. Page-level spacing only.
 1700: 168,  // 168px. Hero image/illustration height reference.
 1800: 216,  // 216px. Large illustration dimension reference.
 1900: 272,  // 272px. Oversized hero dimension reference.
 2000: 336,  // 336px. Source value for radius.round (pill/fully-rounded elements).
} as const

// ─── 3. SPACING SCALE ─────────────────────────────────────────────────────────
// Mirrors Figma's scale tokens. Used for gap, padding, and margin values.

export const spacing = {
  0:    `${scale[0]}px`,     // 0px. Flush layout — no gap, no padding. Explicit zero when reset is required.
  50:   `${scale[50]}px`,    // 2px. Compact-density baseline. Use for dense cell padding and tight icon gaps.
  100:  `${scale[100]}px`,   // 4px. Extra-small gap. Chip padding, icon-to-label gap, micro-spacing.
  200:  `${scale[200]}px`,   // 8px. Small gap. Default icon-row gap, button icon gap, tight field spacing.
  300:  `${scale[300]}px`,   // 12px. Medium-small padding. Component internal padding; grouped-element gap.
  400:  `${scale[400]}px`,   // 16px. Standard padding. Cards, modals, action buttons — the base layout unit.
  500:  `${scale[500]}px`,   // 20px. Medium gap. Comfortable list items; section-level horizontal gap.
  600:  `${scale[600]}px`,   // 24px. Large padding. Comfortable-density component padding; page horizontal gutters.
  700:  `${scale[700]}px`,   // 28px. Spacious-density padding. Use only in spacious layout variants.
  800:  `${scale[800]}px`,   // 32px. XL gap. Section spacing and large component padding.
  1000: `${scale[1000]}px`,  // 40px. XXL spacing. Use for generous layout-level vertical rhythm.
  1200: `${scale[1200]}px`,  // 56px. Section / accordion gap. Use for layout-level content block separation.
} as const

// ─── 4. SIZING SCALE ──────────────────────────────────────────────────────────

export const sizing = {
  // Fixed component heights per size variant (sourced from Figma fixed-height instances)
  componentHeight: {
    xs:    `${scale[500]}px`,   // chip, badge, small indicator
    sm:    `${scale[600]}px`,   // small icon button, avatar sm
    md:    `${scale[1000]}px`,  // standard button/input — size sm
    lg:    `${scale[1100]}px`,  // standard input — size md
    xl:    `${scale[1200]}px`,  // large button/input — size lg
    '2xl': `${scale[1300]}px`,  // hero element
    '3xl': `${scale[1400]}px`,  // extra-large element
    '4xl': `${scale[1500]}px`,  // section / card hero
    navSm: `${scale[900]}px`,   // side nav — sm item row height
    navLg: `${scale[1100]}px`,  // side nav — lg item row / logo / footer height
  },
  icon: {
    sm: `${scale[400]}px`,   // button icon, chip icon
    md: `${scale[600]}px`,   // inline icon
    lg: `${scale[800]}px`,   // text field icon, standalone icon
    xl: `${scale[1000]}px`,  // large standalone icon / icon-button artwork
  },
  iconButton:        `${scale[800]}px`,  // icon-only button — e.g. collapse toggle, toolbar icon button
  initialsContainer: `${scale[700]}px`,  // collapsed nav initials abbreviation span width
  // ── Checkmark icon sizes ──────────────────────────────────────────────────
  // The visible tick/check drawn inside a checkbox control at each size tier.
  // These intentionally fall between the icon scale steps.
  checkmark: {
    sm: '9px',   // checkbox sm — fits inside a 16×16 control
    md: '11px',  // checkbox md — fits inside a 20×20 control
    lg: '13px',  // checkbox lg — fits inside a 24×24 control
  },
  // ── Panel dimensions ──────────────────────────────────────────────────────
  // Sourced from Figma commentPanel component (node 41404:55363).
  // These values intentionally fall outside the numeric scale.
  panel: {
    width:          '526px',  // Comment panel fixed width. Figma: commentPanel w-526px.
    threadListMin:  '200px',  // Minimum thread-list scroll area height — prevents collapsed layout.
    threadListMax:  '520px',  // Maximum thread-list scroll area height — activates overflow-y.
  },
  // ── Dialog dimensions ─────────────────────────────────────────────────────
  // Fixed max-widths for the three dialog size variants and media-area min-heights.
  // Like sizing.panel, these are layout-level fixed dimensions that fall outside
  // the numeric component-height scale — intentional.
  dialog: {
    sm:    '400px',  // Small dialog max-width.
    md:    '560px',  // Medium dialog max-width (default).
    lg:    '720px',  // Large dialog max-width.
    media: {
      hero: '240px',  // Full-bleed hero illustration area min-height.
      spot: '180px',  // Spot illustration area min-height.
    },
  },
  // ── Header dimensions ─────────────────────────────────────────────────────
  header: {
    countryDropdown: `${scale[1800]}px`,  // 216px — widened from 128px to prevent truncation of long country names (e.g. "Factor Netherlands").
  },
} as const

// ─── 5. BORDER RADIUS ─────────────────────────────────────────────────────────

export const radius = {
  none:  `${scale[0]}px`,    // 0px. No rounding. Use for flush/sharp-cornered elements (e.g. full-width banners, table cells).
  xs:    `${scale[100]}px`,   // badge, tag inner element
  sm:    `${scale[200]}px`,   // chip, small card
  md:    `${scale[300]}px`,   // input, tooltip
  lg:    `${scale[400]}px`,   // card, modal
  xl:    `${scale[500]}px`,   // large card
  round:   `${scale[2000]}px`,  // fully rounded / pill
  circle:  '50%',               // perfect circle — avatar bubbles and circular indicators
} as const

// ─── 6. BORDER WIDTH ──────────────────────────────────────────────────────────

export const borderWidth = {
  thin:    `${scale[25]}px`,   // default border, chip border
  default: `${scale[50]}px`,   // medium emphasis border
  thick:   `${scale[100]}px`,  // strong border
  focus:   `${scale[100]}px`,  // keyboard focus ring
} as const

// ─── 7. TYPOGRAPHY ────────────────────────────────────────────────────────────

export const typography = {
  fontFamily: {
    body:     'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif',  // Source Sans 3 variable font. Use for all body, label, caption, and UI text.
    headline: 'var(--font-headline)',  // Agrandir Display. Use only for headline/H* entries. Do not use for body copy.
  },
  // Named type scale matching Figma style names exactly.
  // fontSize and lineHeight reference scale tokens directly (px values).
  scale: {
    'body/caption/regular': { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[300]}px`, fontWeight: 400, lineHeight: `${scale[500]}px` },  // 12px/400. Timestamps, footnotes, tag labels. Smallest regular text in the system.
    'body/caption/semi':    { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[300]}px`, fontWeight: 600, lineHeight: `${scale[500]}px` },  // 12px/600. Emphasis at caption size: table column headers, status chip labels.
    'body/caption/black':   { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[300]}px`, fontWeight: 900, lineHeight: `${scale[500]}px` },  // 12px/900. Maximum weight at caption size. Use sparingly for critical micro-labels.
    'body/label/regular':   { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[300]}px`, fontWeight: 400, lineHeight: `${scale[400]}px` },  // 12px/400 tight line-height. Form labels, field descriptors. Prefer over caption where vertical space is tight.
    'body/label/semi':      { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[300]}px`, fontWeight: 600, lineHeight: `${scale[400]}px` },  // 12px/600 tight line-height. Strong form labels and required field markers.
    'body/label/black':     { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[300]}px`, fontWeight: 900, lineHeight: `${scale[400]}px` },  // 12px/900 tight line-height. Critical required-field indicators only.
    'body/xs/regular':      { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[300]}px`, fontWeight: 400, lineHeight: `${scale[400]}px` },  // 12px/400. Dense secondary text, helper messages, and micro-copy.
    'body/xs/semi':         { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[300]}px`, fontWeight: 600, lineHeight: `${scale[400]}px` },  // 12px/600. Emphasized dense labels: badges, compact tags.
    'body/xs/black':        { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[300]}px`, fontWeight: 900, lineHeight: `${scale[400]}px` },  // 12px/900. Maximum-weight micro text. Use sparingly.
    'body/sm/regular':      { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[350]}px`, fontWeight: 400, lineHeight: `${scale[500]}px` },  // 14px/400. General small body text, help text, and secondary descriptions.
    'body/sm/semi':         { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[350]}px`, fontWeight: 600, lineHeight: `${scale[500]}px` },  // 14px/600. Sidebar nav items, interactive list labels, selected option labels.
    'body/sm/black':        { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[350]}px`, fontWeight: 900, lineHeight: `${scale[500]}px` },  // 14px/900. High-emphasis compact text. Use sparingly.
    'body/md/regular':      { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[400]}px`, fontWeight: 400, lineHeight: `${scale[600]}px` },  // 16px/400. Standard paragraph and dropdown option text.
    'body/md/semi':         { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[400]}px`, fontWeight: 600, lineHeight: `${scale[600]}px` },  // 16px/600. Button labels, selected nav items, form field values.
    'body/lg/regular':      { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[500]}px`, fontWeight: 400, lineHeight: `${scale[700]}px` },  // 20px/400. Section intro copy and lead paragraphs.
    'body/lg/semi':         { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[500]}px`, fontWeight: 600, lineHeight: `${scale[700]}px` },  // 20px/600. Prominent labels, modal subheadings, count displays.
    'body/lg/black':        { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[500]}px`, fontWeight: 900, lineHeight: `${scale[700]}px` },  // 20px/900. High-impact labels. Use for KPI values and stat displays.
    'body/xl/regular':      { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[600]}px`, fontWeight: 400, lineHeight: `${scale[900]}px` },  // 24px/400. Large feature copy and hero sub-text.
    'body/xl/semi':         { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[600]}px`, fontWeight: 600, lineHeight: `${scale[900]}px` },  // 24px/600. Large CTAs and feature headings.
    'body/xl/black':        { fontFamily: 'var(--font-source-sans-3), "Source Sans Pro", system-ui, sans-serif', fontSize: `${scale[600]}px`, fontWeight: 900, lineHeight: `${scale[900]}px` },  // 24px/900. Display-weight large text. Hero KPI numbers and statistics.
    'headline/h6':          { fontFamily: 'var(--font-headline)', fontSize: `${scale[500]}px`,  fontWeight: 500, lineHeight: `${scale[600]}px`  },  // 20px/500 Agrandir. Smallest headline. Section labels and widget titles.
    'headline/h5':          { fontFamily: 'var(--font-headline)', fontSize: `${scale[600]}px`,  fontWeight: 500, lineHeight: `${scale[800]}px`  },  // 24px/500 Agrandir. Card headings and panel titles.
    'headline/h4':          { fontFamily: 'var(--font-headline)', fontSize: `${scale[800]}px`,  fontWeight: 500, lineHeight: `${scale[1000]}px` },  // 32px/500 Agrandir. Page section headings and modal titles.
    'headline/h3':          { fontFamily: 'var(--font-headline)', fontSize: `${scale[1000]}px`, fontWeight: 500, lineHeight: `${scale[1100]}px` },  // 40px/500 Agrandir. Major page section titles.
    'headline/h2':          { fontFamily: 'var(--font-headline)', fontSize: `${scale[1100]}px`, fontWeight: 500, lineHeight: `${scale[1300]}px` },  // 48px/500 Agrandir. Page title level. Use sparingly — max one per page.
    'headline/h1':          { fontFamily: 'var(--font-headline)', fontSize: `${scale[1300]}px`, fontWeight: 500, lineHeight: `${scale[1400]}px` },  // 64px/500 Agrandir. Primary hero/page headline. One per route maximum.
  },
  fontSize: {
    micro: '8px',              // chart annotations, minimal labels
    mini:  '9px',              // compact badges, tags, pills
    xxs:   '10px',             // micro labels, secondary meta
    xxxs:  '11px',             // sm-size badge and section-header labels — between xxs(10px) and xs(12px)
    xs:  `${scale[300]}px`,   // dense UI labels, helper text
    sm:  `${scale[350]}px`,   // body/sm
    md:  `${scale[400]}px`,   // body/md
    lg:  `${scale[500]}px`,   // body/lg
    xl:  `${scale[600]}px`,   // body/xl
  },
  fontWeight: {
    regular:  400,  // 400. Default text weight. Use for body copy, descriptions, and read-only values.
    medium:   500,  // 500. Agrandir headline weight. Use for all headline/H* styles only. Do not use for body.
    semibold: 600,  // 600. Strong emphasis. Use for button labels, nav items, form labels, selected states.
    bold:     700,  // 700. Maximum body weight. Use for table headers and section title emphasis.
    black:    900,  // 900. Display weight. Use only for KPI numbers, hero stats, and maximum-impact display text.
  },
  lineHeight: {
    none:        1,           // unitless 1 — avatar/badge flush-centred text (no extra line gap)
    tight:       '1.125em',  // headline/h1
    snug:        '1.2em',    // headline/h3, h6
    quarter:     '1.25em',   // headline/h4
    compact:     '1.273em',  // sm section-header labels — between quarter(1.25) and base(1.333)
    base:        '1.333em',  // label, xs
    normal:      '1.4em',    // body/lg
    comfortable: '1.43em',   // 14px→20px ratio — sm list title, lg list description
    relaxed:     '1.5em',    // body/md
    loose:       '1.667em',  // body/sm, caption
  },
  letterSpacing: {
    normal: '0',       // default — no tracking adjustment
    wide:   '0.06em',  // section-header uppercase labels
  },
} as const

// ─── 8. ELEVATION / SHADOW ────────────────────────────────────────────────────

export const elevation = {
  level1:   `0px ${scale[50]}px ${scale[100]}px rgba(36,36,36,0.16)`,    // 2px blur — subtle card lift. Use for resting card elevation on hover.
  level2:   `0px ${scale[200]}px ${scale[200]}px rgba(36,36,36,0.16)`,   // 8px blur — elevated card shadow. Use for sticky toolbars and floating cards.
  level3:   `0px ${scale[400]}px ${scale[400]}px rgba(36,36,36,0.16)`,   // 16px blur — floating panel shadow. Use for dropdowns, popovers, and date pickers.
  level4:   `0px ${scale[600]}px ${scale[600]}px rgba(36,36,36,0.16)`,   // 24px blur — modal/drawer shadow. Use for dialogs, side sheets, and full overlays.
  dropdown: `0 ${scale[100]}px ${scale[400]}px rgba(0,0,0,0.12)`,        // Floating menu/dropdown shadow. Use for menus, selects, and date-picker panels. Do not use for modals.
} as const

// ─── 9. OPACITY ───────────────────────────────────────────────────────────────

export const opacity = {
  half: scale[1100] / 100,  // 0.48. Disabled element opacity. Apply to the entire disabled component wrapper. Do not use for partial fades or hover effects.
  full: scale[1550] / 100,  // 1.0. Full opacity. Use only when opacity must be explicitly reset to 1 (e.g. re-enabling after a disabled wrapper).
} as const

// ─── 10. MOTION TOKENS ────────────────────────────────────────────────────────

export const motion = {
  duration: {
    instant:    '0ms',
    fast:       '100ms',
    quick:      '150ms',
    base:       '200ms',
    moderate:   '300ms',
    slow:       '400ms',
    deliberate: '500ms',
    loop: {
      spinner:   '700ms',
      skeleton:  '1500ms',
      progress:  '1600ms',
    },
  },
  easing: {
    easeOut:    'cubic-bezier(0, 0, 0.2, 1)',
    easeIn:     'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut:  'cubic-bezier(0.4, 0, 0.2, 1)',
    spring:     'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bounce:     'cubic-bezier(0.22, 1, 0.36, 1)',
    linear:     'linear',
    // Framer Motion requires arrays, not CSS strings
    framer: {
      easeOut:   [0, 0, 0.2, 1]    as [number, number, number, number],
      easeIn:    [0.4, 0, 1, 1]    as [number, number, number, number],
      easeInOut: [0.4, 0, 0.2, 1]  as [number, number, number, number],
      spring:    [0.34, 1.56, 0.64, 1] as [number, number, number, number],
      bounce:    [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
  spring: {
    default:    { stiffness: 400, damping: 28 },
    snappy:     { stiffness: 400, damping: 20 },
    smooth:     { stiffness: 400, damping: 26 },
    gentle:     { stiffness: 280, damping: 14 },
    panel:      { stiffness: 320, damping: 22, mass: 0.8 },
  },
} as const

// ─── 11. COMPONENT TOKENS ─────────────────────────────────────────────────────

export const components = {

  // ── Button ──────────────────────────────────────────────────────────────────
  button: {
    paddingX:         spacing[300],
    paddingY:         spacing[0],
    gap:              spacing[100],
    iconSize:         sizing.icon.sm,
    borderWidth:      borderWidth.thin,
    focusBorderWidth: borderWidth.focus,
  },

  // ── Alert ───────────────────────────────────────────────────────────────────
  // Full light/dark colour sets per alertColour type.
  alert: {
    density: {
      comfortable: { paddingX: spacing[300], paddingY: spacing[300], gapX: spacing[300], gapY: spacing[200] },
      compact:     { paddingX: spacing[200], paddingY: spacing[200], gapX: spacing[100], gapY: spacing[0]   },
      spacious:    { paddingX: spacing[500], paddingY: spacing[400], gapX: spacing[500], gapY: spacing[400] },
    },
    colour: {
      success: {
        light: { bg: primitives.green[100],  border: primitives.green[600],  icon: primitives.green[600],  title: primitives.green[600],  date: primitives.grey[600], body: primitives.grey[800], action: primitives.green[600],  actionHoverBg: 'rgba(6,122,70,0.1)',    close: primitives.grey[600], closeHoverText: primitives.grey[800], closeHoverBg: 'rgba(6,122,70,0.1)'    },
        dark:  { bg: primitives.green[800], border: primitives.green[700], icon: primitives.green[300], title: primitives.green[300],          date: primitives.grey[500], body: primitives.grey[400], action: primitives.green[300],  actionHoverBg: 'rgba(109,206,133,0.1)', close: primitives.grey[500], closeHoverText: primitives.grey[400], closeHoverBg: 'rgba(255,255,255,0.1)' },
      },
      warning: {
        light: { bg: primitives.orange[100], border: primitives.orange[600], icon: primitives.orange[600], title: primitives.orange[600], date: primitives.grey[600], body: primitives.grey[800], action: primitives.orange[600], actionHoverBg: 'rgba(206,69,0,0.1)',    close: primitives.grey[600], closeHoverText: primitives.grey[800], closeHoverBg: 'rgba(206,69,0,0.1)'    },
        dark:  { bg: primitives.orange[800], border: primitives.orange[700], icon: primitives.orange[300], title: primitives.orange[300],        date: primitives.grey[500], body: primitives.grey[400], action: primitives.orange[300], actionHoverBg: 'rgba(255,154,92,0.1)',  close: primitives.grey[500], closeHoverText: primitives.grey[400], closeHoverBg: 'rgba(255,255,255,0.1)' },
      },
      error: {
        light: { bg: primitives.red[100],    border: primitives.red[600],    icon: primitives.red[600],    title: primitives.red[600],    date: primitives.grey[600], body: primitives.grey[800], action: primitives.red[600],    actionHoverBg: 'rgba(179,0,0,0.1)',    close: primitives.grey[600], closeHoverText: primitives.grey[800], closeHoverBg: 'rgba(179,0,0,0.1)'     },
        dark:  { bg: primitives.red[800], border: primitives.red[700], icon: primitives.red[400], title: primitives.red[400],                    date: primitives.grey[500], body: primitives.grey[400], action: primitives.red[400],    actionHoverBg: 'rgba(255,117,117,0.1)', close: primitives.grey[500], closeHoverText: primitives.grey[400], closeHoverBg: 'rgba(255,255,255,0.1)' },
      },
      info: {
        light: { bg: primitives.blue[100],   border: primitives.blue[600],   icon: primitives.blue[600],   title: primitives.blue[600],   date: primitives.grey[600], body: primitives.grey[800], action: primitives.blue[600],   actionHoverBg: 'rgba(0,42,255,0.1)',    close: primitives.grey[600], closeHoverText: primitives.grey[800], closeHoverBg: 'rgba(0,42,255,0.1)'    },
        dark:  { bg: primitives.blue[800], border: primitives.blue[700], icon: primitives.blue[400], title: primitives.blue[400],                  date: primitives.grey[500], body: primitives.grey[400], action: primitives.blue[400],   actionHoverBg: 'rgba(114,142,255,0.1)', close: primitives.grey[500], closeHoverText: primitives.grey[400], closeHoverBg: 'rgba(255,255,255,0.1)' },
      },
      ai: {
        light: { bg: primitives.purple[100], border: primitives.purple[700], icon: primitives.purple[700], title: primitives.purple[700], date: primitives.grey[600], body: primitives.grey[800], action: primitives.purple[700], actionHoverBg: 'rgba(82,54,184,0.1)', close: primitives.grey[600], closeHoverText: primitives.grey[800], closeHoverBg: 'rgba(82,54,184,0.1)' },
        dark:  { bg: primitives.purple[800], border: primitives.purple[700], icon: primitives.purple[400], title: primitives.purple[400], date: primitives.grey[500], body: primitives.grey[400], action: primitives.purple[400], actionHoverBg: 'rgba(155,138,255,0.1)', close: primitives.grey[500], closeHoverText: primitives.grey[400], closeHoverBg: 'rgba(255,255,255,0.1)' },
      },
    },
  },

  // ── Banner ──────────────────────────────────────────────────────────────────
  // Full light/dark colour sets per bannerColour type.
  // Action button uses a neutral fill (grey[700]/grey[400]) for both themes.
  banner: {
    density: {
      comfortable: { paddingX: spacing[400], paddingY: spacing[200], gapX: spacing[400] },
      compact:     { paddingX: spacing[300], paddingY: spacing[100], gapX: spacing[200] },
      spacious:    { paddingX: spacing[600], paddingY: spacing[300], gapX: spacing[600] },
    },
    colour: {
      success: {
        light: { bg: primitives.green[100],  icon: primitives.green[600],  body: primitives.grey[800], actionBg: primitives.grey[700], actionHoverBg: primitives.grey[800], actionText: primitives.grey[100], close: primitives.grey[600], closeHoverText: primitives.grey[800], closeHoverBg: 'rgba(6,122,70,0.1)'    },
        dark:  { bg: primitives.green[800], icon: primitives.green[300],               body: primitives.grey[400], actionBg: primitives.grey[400], actionHoverBg: primitives.grey[500], actionText: primitives.grey[800], close: primitives.grey[500], closeHoverText: primitives.grey[400], closeHoverBg: 'rgba(255,255,255,0.1)' },
      },
      warning: {
        light: { bg: primitives.orange[100], icon: primitives.orange[600], body: primitives.grey[800], actionBg: primitives.grey[700], actionHoverBg: primitives.grey[800], actionText: primitives.grey[100], close: primitives.grey[600], closeHoverText: primitives.grey[800], closeHoverBg: 'rgba(206,69,0,0.1)'    },
        dark:  { bg: primitives.orange[800], icon: primitives.orange[300],             body: primitives.grey[400], actionBg: primitives.grey[400], actionHoverBg: primitives.grey[500], actionText: primitives.grey[800], close: primitives.grey[500], closeHoverText: primitives.grey[400], closeHoverBg: 'rgba(255,255,255,0.1)' },
      },
      error: {
        light: { bg: primitives.red[100],    icon: primitives.red[600],    body: primitives.grey[800], actionBg: primitives.grey[700], actionHoverBg: primitives.grey[800], actionText: primitives.grey[100], close: primitives.grey[600], closeHoverText: primitives.grey[800], closeHoverBg: 'rgba(179,0,0,0.1)'     },
        dark:  { bg: primitives.red[800], icon: primitives.red[400],                   body: primitives.grey[400], actionBg: primitives.grey[400], actionHoverBg: primitives.grey[500], actionText: primitives.grey[800], close: primitives.grey[500], closeHoverText: primitives.grey[400], closeHoverBg: 'rgba(255,255,255,0.1)' },
      },
      info: {
        light: { bg: primitives.blue[100],   icon: primitives.blue[600],   body: primitives.grey[800], actionBg: primitives.grey[700], actionHoverBg: primitives.grey[800], actionText: primitives.grey[100], close: primitives.grey[600], closeHoverText: primitives.grey[800], closeHoverBg: 'rgba(0,42,255,0.1)'    },
        dark:  { bg: primitives.blue[800], icon: primitives.blue[400],                 body: primitives.grey[400], actionBg: primitives.grey[400], actionHoverBg: primitives.grey[500], actionText: primitives.grey[800], close: primitives.grey[500], closeHoverText: primitives.grey[400], closeHoverBg: 'rgba(255,255,255,0.1)' },
      },
      ai: {
        light: { bg: primitives.purple[100], icon: primitives.purple[700],               body: primitives.grey[800], actionBg: primitives.grey[700], actionHoverBg: primitives.grey[800], actionText: primitives.grey[100], close: primitives.grey[600], closeHoverText: primitives.grey[800], closeHoverBg: 'rgba(82,54,184,0.1)'   },
        dark:  { bg: primitives.purple[800], icon: primitives.purple[400],             body: primitives.grey[400], actionBg: primitives.grey[400], actionHoverBg: primitives.grey[500], actionText: primitives.grey[800], close: primitives.grey[500], closeHoverText: primitives.grey[400], closeHoverBg: 'rgba(255,255,255,0.1)' },
      },
    },
  },

  // ── Chip ────────────────────────────────────────────────────────────────────
  chip: {
    // Shared layout tokens
    height:       sizing.componentHeight.xs,
    borderRadius: radius.round,
    borderWidth:  borderWidth.thin,
    paddingX:     spacing[100],
    paddingY:     spacing[0],
    gap:          spacing[100],
    iconSize:     sizing.icon.sm,
    fontSize:     typography.fontSize.sm,
    lineHeight:   spacing[500],
    fontWeight:   typography.fontWeight.semibold,

    // Chip types — define the interaction model
    types: {
      // displayChip — read-only label/tag, no interaction
      display: {
        interactive: false,
      },
      // inputChip — removable tag (e.g. selected items in a multi-select)
      input: {
        interactive: true,
        removable:   true,
      },
      // filterChip — toggleable filter state
      filter: {
        interactive: true,
        selected:   { background: primitives.green[600], text: primitives.grey[100], border: primitives.green[600] },
        unselected: { background: primitives.green[200], text: primitives.green[600], border: primitives.green[600] },
      },
      // dragChip — draggable, always neutral colours
      drag: {
        interactive: true,
        draggable:   true,
        background:  primitives.grey[400],
        text:        primitives.grey[800],
        border:      primitives.grey[800],
      },
    },

    // chipColour × appearance — Figma nodes 47939:10168–10193
    colour: {
      positive:    { filled: primitives.green[600],   filledText: primitives.grey[100], subtle: primitives.green[200],   subtleText: primitives.green[600]   },
      mint:        { filled: primitives.teal[600],    filledText: primitives.grey[100], subtle: primitives.teal[200],    subtleText: primitives.teal[600]    },
      negative:    { filled: primitives.red[600],     filledText: primitives.grey[100], subtle: primitives.red[200],     subtleText: primitives.red[600]     },
      pink:        { filled: primitives.pink[600],    filledText: primitives.grey[100], subtle: primitives.pink[200],    subtleText: primitives.pink[600]    },
      neutral:     { filled: primitives.grey[700],    filledText: primitives.grey[100], subtle: primitives.grey[400],    subtleText: primitives.grey[800]    },
      brown:       { filled: primitives.brown[600],   filledText: primitives.grey[100], subtle: primitives.brown[200],   subtleText: primitives.brown[600]   },
      warning:     { filled: primitives.orange[600],  filledText: primitives.grey[100], subtle: primitives.orange[200],  subtleText: primitives.orange[600]  },
      information: { filled: primitives.blue[600],    filledText: primitives.grey[100], subtle: primitives.blue[200],    subtleText: primitives.blue[600]    },
      reward:      { filled: primitives.yellow[600],  filledText: primitives.grey[100], subtle: primitives.yellow[200],  subtleText: primitives.yellow[600]  },
    },
  },

  // ── Text Field ──────────────────────────────────────────────────────────────
  textField: {
    gap:      spacing[200],
    paddingY: spacing[200],
    paddingX: spacing[200],
    iconSize: sizing.icon.md,
  },

  // ── Progress Bar ─────────────────────────────────────────────────────────────
  // Figma Enterprise DS v3 — node 47455-18601 (linear) / 47455-18704 (circular)
  progressBar: {
    colour: {
      light: {
        indicator: semantic.background.positive.defaultStrong.light,   // green[600]
        track:     primitives.grey[300],                                // #EEEEEE — no semantic equivalent at this step
        label:     semantic.foreground.default.primary.light,          // grey[800]
      },
      dark: {
        indicator: semantic.background.positive.defaultStrong.dark,    // green[400]
        track:     semantic.border.default.dark,                       // grey[700]
        label:     semantic.foreground.default.primary.dark,           // grey[400]
      },
    },
    // Track height per size variant — mirrors spacing[100/200/300]
    size: {
      sm: { trackHeight: spacing[100], centerFontSize: '10px'  },  // 4px — spacing[100]; centerFontSize has no scale step
      md: { trackHeight: spacing[200], centerFontSize: '11px'  },  // 8px — spacing[200]; centerFontSize has no scale step
      lg: { trackHeight: spacing[300], centerFontSize: typography.fontSize.sm },  // trackHeight: 12px — spacing[300]; centerFontSize: 14px = typography.fontSize.sm
    },
    labelGap: '6px',
    density: {
      comfortable: { gapX: spacing[200] },
      compact:     { gapX: spacing[100] },
      spacious:    { gapX: spacing[300] },
    },
  },

  // ── Toggle Switch ────────────────────────────────────────────────────────────
  // Figma Sage DS — node 48559-11939 (light) / 48559-11613 (dark)
  toggle: {
    colour: {
      light: {
        trackOff:        primitives.grey[500],            // off track fill
        trackOffBorder:  primitives.grey[500],            // off track 1px border
        trackOffHover:   primitives.grey[400],            // off track hover
        trackOn:         primitives.green[100],           // on track bg
        trackOnBorder:   primitives.green[600],           // on track border
        trackOnHover:    primitives.green[200],           // on track hover bg
        thumbOn:         primitives.green[600],           // on thumb
        thumbOff:        primitives.grey[100],            // off thumb — white
        pressedOnThumb:  primitives.green[700],           // pressed on thumb
        pressedOnBorder: primitives.green[700],           // pressed on border
        errorTrack:      primitives.red[100],             // error track bg
        errorBorder:     primitives.red[600],             // error border
        errorThumb:      primitives.red[600],             // error thumb
        labelText:       semantic.foreground.default.primary.light,
        focusRing:       translucent.green[400],          // lime 40%
      },
      dark: {
        trackOff:        primitives.grey[600],            // off track fill
        trackOffBorder:  primitives.grey[400],            // off track 1px border (visible on dark)
        trackOffHover:   primitives.grey[600],            // off track hover
        trackOn:         primitives.green[800],           // on track bg
        trackOnBorder:   primitives.green[400],           // on track border
        trackOnHover:    primitives.green[300],           // on track hover bg
        thumbOn:         primitives.green[400],           // on thumb
        thumbOff:        primitives.grey[100],            // off thumb — white
        pressedOnThumb:  primitives.green[700],           // pressed on thumb
        pressedOnBorder: primitives.green[400],           // pressed on border
        errorTrack:      primitives.red[800],             // error track bg
        errorBorder:     primitives.red[400],             // error border
        errorThumb:      primitives.red[400],             // error thumb
        labelText:       semantic.foreground.default.primary.dark,
        focusRing:       translucent.green[500],          // green[500] @ 40%
        focusRingOffset: semantic.background.container.dark,  // grey[800]
      },
    },
    thumb: {
      xOff: scale[50],   // thumb translate-x when off (px) — 2px
      xOn:  scale[300],  // thumb translate-x when on  (px) — 12px
    },
    animation: motion.spring.snappy,
  },

  // ── Tooltip ─────────────────────────────────────────────────────────────────
  tooltip: {
    density: {
      comfortable: { paddingX: spacing[200], paddingY: spacing[100] },
      compact:     { paddingX: spacing[100], paddingY: spacing[0]   },
      spacious:    { paddingX: spacing[400], paddingY: spacing[200] },
    },
    maxWidth: '360px',
    minWidth: '120px',   // minimum bubble width
    gap: 8,              // px gap between trigger and bubble (= spacing[200])
    colour: {
      dark:  { bg: primitives.grey[700], text: primitives.grey[100] },  // grey[700] surface, white text
      light: { bg: primitives.grey[500], text: primitives.grey[800] },  // grey[500] surface, grey[800] text
    },
  },

  // ── Tabs ────────────────────────────────────────────────────────────────────
  tabs: {
    density: {
      comfortable: { paddingX: spacing[200], paddingY: spacing[200], gapX: spacing[200], gapY: spacing[200] },
      compact:     { paddingX: spacing[100], paddingY: spacing[100], gapX: spacing[100], gapY: spacing[100] },
      spacious:    { paddingX: spacing[400], paddingY: spacing[300], gapX: spacing[400], gapY: spacing[400] },
    },
    /** Tab list chrome, triggers, and rail (filled sidebar) appearance — all semantic aliases */
    colour: {
      light: {
        /** Tab list panel (page white on light canvas) */
        listSurface:      semantic.background.page.light,
        listBorder:       semantic.border.default.light,
        activeIndicator:  semantic.background.positive.defaultStrong.light,
        activeText:       semantic.foreground.default.primary.light,
        inactiveText:     semantic.foreground.neutral.mid.light,
        disabledText:     semantic.foreground.default.disabled.light,
        hoverBg:          semantic.background.neutral.defaultSubtle.light,
        pressedBg:        semantic.background.neutral.defaultSubtleDeep.light,
        panelText:        semantic.foreground.neutral.defaultDeep.light,
        focusOutline:     semantic.border.focus.light,
        chevronColor:     semantic.foreground.neutral.mid.light,
        railActiveFill:       semantic.background.positive.defaultSubtle.light,
        railActiveFillHover:  semantic.background.positive.defaultSubtleDeep.light,
        railActiveLabel:      semantic.foreground.positive.defaultDeep.light,
        railActiveIcon:       semantic.foreground.positive.defaultDeep.light,
      },
      dark: {
        /** Tab list panel — container tier on dark canvas */
        listSurface:      semantic.background.container.dark,
        listBorder:       semantic.border.default.dark,
        activeIndicator:  semantic.background.positive.defaultStrong.dark,
        activeText:       semantic.foreground.default.primary.dark,
        inactiveText:     semantic.foreground.neutral.mid.dark,
        disabledText:     semantic.foreground.default.disabled.dark,
        hoverBg:          semantic.background.neutral.defaultSubtle.dark,
        pressedBg:        semantic.background.neutral.defaultSubtleDeep.dark,
        panelText:        semantic.foreground.neutral.defaultDeep.dark,
        focusOutline:     semantic.border.focus.dark,
        chevronColor:     semantic.foreground.neutral.mid.dark,
        railActiveFill:       semantic.background.positive.defaultSubtle.dark,
        railActiveFillHover:  semantic.background.positive.defaultSubtleDeep.dark,
        railActiveLabel:      semantic.foreground.default.primary.dark,
        railActiveIcon:       semantic.foreground.positive.default.dark,
      },
    },
  },

  // ── Avatar ──────────────────────────────────────────────────────────────────
  // Figma Enterprise DS v3 — node 48308-5936
  avatar: {
    // Bubble diameter + typography per size variant (S=24 · M=32 · L=40 px)
    size: {
      sm: { bubble: sizing.componentHeight.sm, initFontSize: typography.fontSize.sm, iconSize: sizing.icon.sm, labelFontSize: typography.fontSize.sm },
      md: { bubble: sizing.iconButton,          initFontSize: typography.fontSize.sm, iconSize: sizing.icon.sm, labelFontSize: typography.fontSize.sm },
      lg: { bubble: sizing.componentHeight.md,  initFontSize: typography.fontSize.md, iconSize: sizing.icon.md, labelFontSize: typography.fontSize.md },
    },
    // Gap between bubble and name label — spacing/200
    gap: spacing[200],
    // Font weights
    initFontWeight:  typography.fontWeight.semibold,
    labelFontWeight: typography.fontWeight.regular,
    // Colours — sourced from semantic background/positive and foreground/positive tokens
    colour: {
      // type="light" → used on light canvases: dark-green fill, white text
      light: {
        bubble: semantic.background.positive.defaultStrong.light,  // green[600]
        fg:     semantic.foreground.positive.onColour.light,       // grey[100]
        label:  semantic.foreground.default.primary.light,         // grey[800]
      },
      // type="dark" → used on dark canvases: lime fill, deep-green text
      dark: {
        bubble: semantic.background.positive.defaultStrong.dark,   // green[400]
        fg:     semantic.foreground.positive.onColour.dark,        // green[800]
        label:  semantic.foreground.default.primary.dark,          // grey[400]
      },
    },
  },

  // ── Scrollbar ────────────────────────────────────────────────────────────────
  // Figma Enterprise DS v3 — node 45001-17736
  // Track size: 8px  ·  Border radius: 4px (applied to both track and thumb)
  scrollbar: {
    size:         spacing[200],
    borderRadius: radius.xs,
    colour: {
      light: {
        track:      semantic.border.default.light,                    // grey[400]
        thumb:      semantic.foreground.neutral.defaultDeep.light,    // grey[700]
        thumbHover: semantic.foreground.default.primary.light,        // grey[800]
      },
      dark: {
        track:      semantic.border.default.dark,                     // grey[700]
        thumb:      primitives.grey[600],                             // #676767 — mid step, no semantic equivalent
        thumbHover: semantic.foreground.default.placeholder.dark,     // grey[500]
      },
    },
  },

  // ── Menu ────────────────────────────────────────────────────────────────────
  // Figma Enterprise DS v3 — nodes 36226-31517 (container) · 36226-31865 (_item list atom)
  // Layout: row · gap 8px · padding 0px 16px · item height 48px
  menu: {
    paddingX:            spacing[400],
    paddingY:            spacing[0],
    gap:                 spacing[200],
    itemHeight:          sizing.componentHeight.lg,
    containerRadius:     radius.sm,
    containerPaddingY:   spacing[100],
    containerShadow:     elevation.dropdown,
    labelFontSize:       typography.fontSize.md,
    labelFontWeight:     typography.fontWeight.regular,
    semiBoldFontWeight:  typography.fontWeight.semibold,
    descFontSize:        typography.fontSize.sm,
    descFontWeight:      typography.fontWeight.regular,
    sectionTitleFontSize:   typography.fontSize.md,
    sectionTitleFontWeight: typography.fontWeight.bold,
    iconSize:            sizing.icon.sm,
    colour: {
      light: {
        label:        semantic.foreground.default.primary.light,
        description:  semantic.foreground.neutral.mid.light,
        icon:         semantic.foreground.neutral.defaultDeep.light,
        sectionTitle: semantic.foreground.neutral.mid.light,
        divider:      semantic.foreground.default.placeholder.light,  // grey[500]
        container:    semantic.background.page.light,
        border:       semantic.border.default.light,
        bg: {
          default:     semantic.background.page.light,
          hover:       primitives.grey[300],
          pressed:     primitives.grey[200],
          selected:    primitives.green[100],
          rangeSelect: primitives.green[300],
          disabled:    semantic.border.default.light,  // grey[400]
          focused:     semantic.background.page.light,
        },
        selectedBorder:    semantic.border.positive.light,
        focusRing:         semantic.border.focus.light,
        disabledLabel:     semantic.foreground.default.placeholder.light,
        weekSelectedLabel: semantic.foreground.positive.onColour.light,
        weekSelectedDesc:  primitives.green[300],
      },
      dark: {
        label:        semantic.foreground.default.primary.dark,
        description:  semantic.foreground.default.placeholder.dark,
        icon:         semantic.foreground.default.placeholder.dark,
        sectionTitle: semantic.foreground.default.placeholder.dark,
        divider:      semantic.border.default.dark,
        container:    semantic.background.container.dark,
        border:       semantic.border.default.dark,
        bg: {
          default:     semantic.background.container.dark,
          hover:       primitives.grey[800],
          pressed:     primitives.grey[800],
          selected:    primitives.green[700],
          rangeSelect: primitives.green[800],
          disabled:    primitives.grey[800],
          focused:     semantic.background.container.dark,
        },
        selectedBorder:    semantic.border.positive.dark,
        focusRing:         semantic.border.focus.dark,
        disabledLabel:     semantic.border.default.dark,     // grey[700]
        weekSelectedLabel: semantic.foreground.positive.onColour.dark,
        weekSelectedDesc:  primitives.green[700],
      },
    },
  },

  // ── Bottom Bar ──────────────────────────────────────────────────────────────
  // Figma Enterprise DS v3 — node 2524-8668 (Bottom Fixed Bar/Bulk Actions)
  // Layout: row · space-between · height 88px · padding 24px
  // Left: checkbox + selection count (Headline/Desktop/H4 — Agrandir Digital 500 20px)
  // Right: secondary text buttons | 1px divider | primary outlined + filled buttons
  bottomBar: {
    zIndex:              100,   // sits above page content, below modal overlays
    density: {
      comfortable: { paddingX: spacing[600], paddingY: spacing[600], gapX: spacing[400] },
      compact:     { paddingX: spacing[500], paddingY: spacing[500], gapX: spacing[200] },
      spacious:    { paddingX: spacing[800], paddingY: spacing[700], gapX: spacing[600] },
    },
    selectionGap:        spacing[400],
    primaryGap:          spacing[400],
    dividerWidth:        borderWidth.thin,
    borderRadius:        `${radius.xs} ${radius.xs} ${spacing[0]} ${spacing[0]}`,
    shadow:              elevation.dropdown,
    // Selection label — Headline/Desktop/H4
    selectionFontSize:   typography.fontSize.lg,
    selectionFontWeight: typography.fontWeight.medium,
    // Action buttons — Size=L / Body/Medium/Semi
    actionHeight:        sizing.componentHeight.md,
    actionPaddingX:      spacing[400],
    actionPaddingY:      spacing[200],
    actionFontSize:      typography.fontSize.md,
    actionFontWeight:    typography.fontWeight.semibold,
    actionIconGap:       spacing[200],
    actionRadius:        radius.xs,
    colour: {
      light: {
        bg:                   semantic.background.page.light,
        border:               semantic.border.strong.light,
        selectionText:        semantic.foreground.default.primary.light,
        divider:              semantic.border.strong.light,
        actionText:           semantic.foreground.positive.default.light,
        actionHoverBg:        semantic.background.positive.defaultSubtle.light,
        actionOutlinedBorder: semantic.border.positive.light,
        actionFilledBg:       semantic.background.positive.defaultStrong.light,
        actionFilledHoverBg:  semantic.background.positive.defaultStrongDeep.light,
        actionFilledText:     semantic.foreground.positive.onColour.light,
      },
      dark: {
        bg:                   semantic.background.container.dark,
        border:               semantic.border.default.dark,
        selectionText:        semantic.foreground.default.primary.dark,
        divider:              semantic.border.default.dark,
        actionText:           semantic.foreground.positive.default.dark,
        actionHoverBg:        semantic.background.positive.defaultStrongDeep.dark,  // green[700] — dark hover
        actionOutlinedBorder: semantic.border.positive.dark,
        actionFilledBg:       semantic.background.positive.defaultStrong.dark,
        actionFilledHoverBg:  semantic.background.positive.defaultSubtle.dark,      // green[300] — light highlight
        actionFilledText:     semantic.foreground.positive.onColour.dark,
      },
    },
  },

  // ── Card ─────────────────────────────────────────────────────────────────────
  // Figma Enterprise DS — Static (47845-10305) · Navigational (47851-7686) · Selectable (48121-15376)
  card: {
    borderRadius:  radius.sm,
    padding:       spacing[400],
    gap:           spacing[400],
    iconSize:      sizing.icon.lg,
    iconTextGap:   spacing[200],
    heroHeight:    sizing.componentHeight['4xl'],
    colour: {
      light: {
        filledBg:          primitives.grey[100],
        elevatedBg:        primitives.grey[100],
        elevatedShadow:    elevation.level2,
        outlinedBg:        primitives.grey[100],
        outlinedBorder:    primitives.grey[300],
        hoverBg:           primitives.grey[300],
        pressedBg:         semantic.border.default.light,           // grey[400]
        focusRing:         semantic.border.focus.light,
        selectedBorder:    semantic.border.positive.light,
        heroPlaceholderBg: semantic.border.default.light,           // grey[400]
        titleColour:       semantic.foreground.default.primary.light,
        descColour:        semantic.foreground.neutral.defaultDeep.light,
      },
      dark: {
        filledBg:          semantic.background.container.dark,       // grey[800]
        elevatedBg:        semantic.background.container.dark,       // grey[800]
        elevatedShadow:    '0px 8px 8px rgba(0,0,0,0.32)',          // rgba composite — no elevation token equivalent
        outlinedBg:        semantic.background.container.dark,       // grey[800]
        outlinedBorder:    semantic.border.default.dark,             // grey[700]
        hoverBg:           primitives.grey[800],
        pressedBg:         primitives.grey[800],
        focusRing:         semantic.border.focus.dark,
        selectedBorder:    semantic.border.positive.dark,
        heroPlaceholderBg: primitives.grey[800],
        titleColour:       semantic.foreground.default.primary.dark,
        descColour:        semantic.foreground.default.placeholder.dark,   // grey[500]
      },
    },
  },

  // ── Table ─────────────────────────────────────────────────────────────────────
  // Figma Enterprise DS — node 34782-89519
  table: {
    headerHeight:            sizing.componentHeight.md,
    borderRadius:            radius.sm,
    // Typography — column header (14px/bold), UI elements (14px/regular),
    // filter dropdown section label (14px/bold), filter inputs (14px).
    // All four resolve to typography.fontSize.sm = scale[350] = 14px.
    headerFontSize:          typography.fontSize.sm,
    headerFontWeight:        typography.fontWeight.bold,
    headerLineHeight:        '1.43em',
    uiFontSize:              typography.fontSize.sm,
    filterSectionFontSize:   typography.fontSize.sm,
    filterSectionFontWeight: typography.fontWeight.bold,
    filterInputFontSize:     typography.fontSize.sm,
    checkboxColumnWidth:     sizing.componentHeight.lg,   // 48px — fixed checkbox / icon column width
    filterBtnSize:           sizing.icon.md,              // 24px — filter toggle icon button
    filterDropdownOffset:    spacing[100],                // 4px gap between anchor and dropdown
    density: {
      comfortable: {
        titleBar:    { gap: spacing[400], paddingX: spacing[600], paddingY: spacing[400] },
        headerRow:   { paddingX: spacing[600] },
        headerCell:  { gap: spacing[100], paddingX: spacing[200], paddingY: spacing[200] },
        rowRow:      { paddingX: spacing[600] },
        rowCell:     { gap: spacing[100], paddingX: spacing[200], paddingY: spacing[200] },
      },
      compact: {
        titleBar:    { gap: spacing[200], paddingX: spacing[400], paddingY: spacing[200] },
        headerRow:   { paddingX: spacing[200] },
        headerCell:  { gap: spacing[50], paddingX: spacing[50], paddingY: spacing[50] },
        rowRow:      { paddingX: spacing[200] },
        rowCell:     { gap: spacing[50], paddingX: spacing[50], paddingY: spacing[50] },
      },
      spacious: {
        titleBar:    { gap: spacing[600], paddingX: spacing[800], paddingY: spacing[600] },
        headerRow:   { paddingX: spacing[400] },
        headerCell:  { gap: spacing[200], paddingX: spacing[300], paddingY: spacing[300] },
        rowRow:      { paddingX: spacing[400] },
        rowCell:     { gap: spacing[200], paddingX: spacing[300], paddingY: spacing[300] },
      },
    },
    colour: {
      light: {
        titleBg:            primitives.grey[100],
        headerBg:           primitives.grey[200],
        headerHoverBg:      primitives.green[200],
        rowBg:              primitives.grey[100],
        rowHoverBg:         primitives.grey[200],
        rowSelectedBg:      primitives.green[100],
        border:             semantic.border.default.light,
        headerText:         semantic.foreground.neutral.mid.light,     // grey[600]
        bodyText:           semantic.foreground.default.primary.light,
        secondaryText:      primitives.grey[600],                      // #676767 — snapped from Figma #6B6B6B
        sortIcon:           semantic.foreground.neutral.defaultDeep.light,  // grey[700]
        focusRing:          semantic.border.focus.light,
        selectedBorder:     semantic.border.positive.light,
        trendUp:            primitives.green[500],
        trendDown:          primitives.red[500],
        searchBg:           primitives.grey[200],
        searchBorder:       semantic.border.default.light,
        searchText:         semantic.foreground.default.primary.light,
        searchPlaceholder:  semantic.foreground.default.placeholder.light,
        countBadgeBg:       primitives.grey[300],
        countBadgeText:     semantic.foreground.neutral.defaultDeep.light,  // grey[700]
        filterBtnBorder:    semantic.border.default.light,
        filterBtnText:      semantic.foreground.default.primary.light,
      },
      dark: {
        titleBg:            primitives.grey[800],
        headerBg:           primitives.grey[800],
        headerHoverBg:      primitives.green[800],
        rowBg:              primitives.grey[800],
        rowHoverBg:         primitives.grey[800],
        rowSelectedBg:      primitives.green[800],
        border:             primitives.grey[700],
        headerText:         primitives.grey[500],
        bodyText:           primitives.grey[400],
        secondaryText:      primitives.grey[500],
        sortIcon:           primitives.grey[500],
        focusRing:          semantic.border.focus.dark,
        selectedBorder:     semantic.border.positive.dark,
        trendUp:            primitives.green[400],
        trendDown:          primitives.red[400],
        searchBg:           primitives.grey[800],
        searchBorder:       primitives.grey[700],
        searchText:         primitives.grey[400],
        searchPlaceholder:  primitives.grey[700],
        countBadgeBg:       primitives.grey[800],
        countBadgeText:     primitives.grey[500],
        filterBtnBorder:    primitives.grey[700],
        filterBtnText:      primitives.grey[400],
      },
    },
  },

  // ── Accordion ───────────────────────────────────────────────────────────────
  // Figma Enterprise DS v3 — node 15702-243571
  accordion: {
    colour: {
      light: {
        containerBg:     primitives.grey[100],
        containerBorder: semantic.border.default.light,
        divider:         semantic.border.default.light,
        hoverBg:         primitives.grey[200],
        pressedBg:       primitives.grey[300],
        titleText:       semantic.foreground.default.primary.light,
        subtitleText:    primitives.grey[600],
        chevronColor:    primitives.grey[600],
        iconColor:       semantic.foreground.default.primary.light,
        contentText:     semantic.foreground.neutral.defaultDeep.light,
        focusOutline:    semantic.border.focus.light,
      },
      dark: {
        containerBg:     semantic.background.container.dark,
        containerBorder: semantic.border.default.dark,
        divider:         semantic.border.default.dark,
        hoverBg:         primitives.grey[800],
        pressedBg:       primitives.grey[800],
        titleText:       semantic.foreground.default.primary.dark,
        subtitleText:    semantic.foreground.default.placeholder.dark,
        chevronColor:    semantic.foreground.default.placeholder.dark,
        iconColor:       semantic.foreground.default.primary.dark,
        contentText:     semantic.foreground.default.placeholder.dark,
        focusOutline:    semantic.border.focus.dark,
      },
    },
    density: {
      compact:     { triggerMinHeight: sizing.componentHeight.navSm },
      default:     { triggerMinHeight: sizing.componentHeight.md },
      comfortable: { triggerMinHeight: sizing.componentHeight.xl },
    },
    motion: {
      ...motion.spring.smooth,
      reducedDuration: parseFloat(motion.duration.base) / 1000,
    },
    focusOutlineOffset: '-2px',
  },

  // ── Icon ────────────────────────────────────────────────────────────────────
  icon: {
    defaultViewBox:    '0 0 24 24',
    defaultFill:       'none',
    fallbackSizeClass: 'w-6 h-6',  // used when size falls outside IconSize union
  },

  // ── Status Indicator ────────────────────────────────────────────────────────
  // Used in tables, lists, and status badges.
  statusIndicator: {
    dotSize: '10px',  // Figma fixed dot diameter — 10px falls between scale[200]=8px and scale[300]=12px; no standard step
    density: {
      comfortable: { gapX: spacing[100] },
      compact:     { gapX: spacing[50]  },
      spacious:    { gapX: spacing[200] },
    },
    colour: {
      positive:    { light: { background: primitives.green[500],  text: primitives.grey[100] }, dark: { background: primitives.green[400],  text: primitives.grey[100] } },
      negative:    { light: { background: primitives.red[500],   text: primitives.grey[100] }, dark: { background: primitives.red[400],   text: primitives.grey[100] } },
      warning:     { light: { background: primitives.orange[500], text: primitives.grey[100] }, dark: { background: primitives.orange[400], text: primitives.grey[100] } },
      information: { light: { background: primitives.blue[500],  text: primitives.grey[100] }, dark: { background: primitives.blue[400],  text: primitives.grey[100] } },
      ai:          { light: { background: primitives.purple[500], text: primitives.grey[100] }, dark: { background: primitives.purple[400], text: primitives.grey[100] } },
      reward:      { light: { background: primitives.yellow[600], text: primitives.grey[100] }, dark: { background: primitives.yellow[600], text: primitives.grey[100] } },  // unchanged across modes
      neutral:     { light: { background: primitives.grey[700],  text: primitives.grey[100] }, dark: { background: primitives.grey[500],  text: primitives.grey[100] } },
    },
    label: {
      light: semantic.foreground.default.primary.light,   // grey[800]
      dark:  semantic.foreground.default.inverse.light,   // grey[100] — text on dark canvas
    },
    value: {
      light: semantic.foreground.neutral.mid.light,  // grey[600]
      dark:  translucent.white55,                    // rgba(255,255,255,0.55) — subdued text on dark canvas
    },
  },

  // ── Slider ───────────────────────────────────────────────────────────────────
  // Figma node 2519-36338 (base) · 36988-115564 (label + percent)
  slider: {
    colour: {
      light: {
        trackFilled:       semantic.background.positive.defaultStrong.light,  // green[600]
        trackUnfilled:     semantic.border.default.light,                      // grey[400]
        thumbBg:           semantic.background.page.light,                     // grey[100]
        thumbBorder:       semantic.border.positive.light,                     // green[600]
        thumbPillBg:       primitives.green[500],                              // mid green pill fill
        trackActiveFilled: primitives.green[500],                              // active fill light
        focusRing:         translucent.green[500],                             // green[500] @ 40%
        labelColor:        semantic.foreground.default.primary.light,          // grey[800]
        percentColor:      semantic.foreground.neutral.mid.light,              // grey[600]
      },
      dark: {
        trackFilled:       semantic.background.positive.defaultStrong.dark,    // green[400]
        trackUnfilled:     semantic.border.default.dark,                       // grey[700]
        thumbBg:           semantic.background.container.dark,                 // grey[800]
        thumbBorder:       semantic.border.positive.dark,                      // green[400]
        thumbPillBg:       primitives.green[400],                              // lime pill fill
        trackActiveFilled: primitives.green[300],                              // active fill dark
        focusRing:         translucent.green[400],                             // green[400] @ 40%
        labelColor:        semantic.foreground.default.primary.dark,           // grey[400]
        percentColor:      semantic.foreground.default.placeholder.dark,       // grey[500]
      },
      disabled: {
        light: {
          trackFilled:   primitives.grey[500],   // #BBBBBB
          trackUnfilled: primitives.grey[300],   // #EEEEEE
          thumbBg:       primitives.grey[300],   // #EEEEEE
          thumbBorder:   primitives.grey[500],   // #BBBBBB
          labelColor:    primitives.grey[500],   // #BBBBBB
          percentColor:  primitives.grey[500],   // #BBBBBB
        },
        dark: {
          trackFilled:   primitives.grey[700],   // #4B4B4B
          trackUnfilled: primitives.grey[800],   // #242424 — snapped from grey[850]
          thumbBg:       primitives.grey[800],   // #242424 — snapped from grey[850]
          thumbBorder:   primitives.grey[700],   // #4B4B4B
          labelColor:    primitives.grey[700],   // #4B4B4B
          percentColor:  primitives.grey[700],   // #4B4B4B
        },
      },
    },
  },

  // ── Side Navigation ──────────────────────────────────────────────────────────
  // Figma Enterprise DS v3 — node 15070-249668
  sideNav: {
    expandedWidth:  { sm: '220px', md: '260px', lg: '280px' },
    collapsedWidth: { sm: '52px',  md: '64px',  lg: '72px'  },
  },

  // ── Divider ──────────────────────────────────────────────────────────────────
  // Figma Enterprise DS v3 — divider/line · divider/text · divider/dot
  // Colour keys: shade (light | dark) × weight (subtle | default | deep)
  // Token naming mirrors Figma: grey[300]=subtle · grey[400]=default · grey[500]=deep
  // Dark mode inverts the scale so deep is most visible on a dark canvas.
  divider: {
    // Line and dot colours — shared map (dot uses same values as line)
    colour: {
      light: { subtle: primitives.grey[300], default: primitives.grey[400], deep: primitives.grey[500] },
      dark:  { subtle: primitives.grey[700], default: primitives.grey[500], deep: primitives.grey[300] },
    },
    // Label text colours for divider/text variant
    label: {
      light: { subtle: primitives.grey[500], default: primitives.grey[600], deep: primitives.grey[800] },
      dark:  { subtle: primitives.grey[700], default: primitives.grey[500], deep: primitives.grey[300] },
    },
    // Dot diameter per size variant — mirrors spacing[100/200/300]
    dotSize: {
      sm: spacing[100],
      md: spacing[200],
      lg: spacing[300],
    },
    // Label font size per size variant
    labelFontSize: {
      sm: typography.fontSize.sm,
      md: typography.fontSize.sm,
      lg: typography.fontSize.md,
    },
  },

  // ── Stepper ──────────────────────────────────────────────────────────────────
  stepper: {
    colour: {
      light: {
        circlePending:      { bg: 'transparent',           border: primitives.grey[400],  text: primitives.grey[500]  },
        circleActive:       { bg: primitives.green[600],   border: primitives.green[600], text: primitives.grey[100]  },
        circleCompleted:    { bg: primitives.grey[600],    border: primitives.grey[600],  text: primitives.grey[100]  },
        circleError:        { bg: primitives.red[600],     border: primitives.red[600],   text: primitives.grey[100]  },
        titlePending:       primitives.grey[500],
        titleActive:        primitives.grey[800],
        titleCompleted:     primitives.grey[800],
        titleError:         primitives.red[600],
        stepPending:        primitives.grey[500],
        stepDefault:        primitives.grey[600],
        descPending:        primitives.grey[500],
        descDefault:        primitives.grey[500],
        connectorDefault:   primitives.grey[400],
        connectorCompleted: primitives.grey[600],
        focusColor:         semantic.border.focus.light,
      },
      dark: {
        circlePending:      { bg: 'transparent',           border: primitives.grey[700],  text: primitives.grey[600]  },
        circleActive:       { bg: primitives.green[400],   border: primitives.green[400], text: primitives.green[800] },
        circleCompleted:    { bg: primitives.grey[500],    border: primitives.grey[500],  text: primitives.grey[800]  },
        circleError:        { bg: primitives.red[400],     border: primitives.red[400],   text: primitives.red[800]   },  // was #FF7575; corrected to red[400]
        titlePending:       primitives.grey[600],
        titleActive:        primitives.grey[400],
        titleCompleted:     primitives.grey[400],
        titleError:         primitives.red[400],
        stepPending:        primitives.grey[700],
        stepDefault:        primitives.grey[500],
        descPending:        primitives.grey[700],
        descDefault:        primitives.grey[500],
        connectorDefault:   primitives.grey[700],
        connectorCompleted: primitives.grey[500],
        focusColor:         semantic.border.focus.dark,
      },
    },
    size: {
      sm: { circleSize: scale[600],  circleBorder: borderWidth.default, stepFontSize: typography.fontSize.sm, titleFontSize: typography.fontSize.sm, descFontSize: '11px', iconScale: 0.45, connectorThick: 1,   hGap: scale[200], vGap: scale[300], labelGap: scale[200], contentGap: scale[25]  },
      md: { circleSize: scale[800],  circleBorder: borderWidth.default, stepFontSize: typography.fontSize.sm, titleFontSize: typography.fontSize.sm, descFontSize: typography.fontSize.sm, iconScale: 0.44, connectorThick: 1.5, hGap: scale[300], vGap: scale[400], labelGap: scale[200], contentGap: scale[50]  },
      lg: { circleSize: scale[1000], circleBorder: borderWidth.default, stepFontSize: typography.fontSize.sm, titleFontSize: typography.fontSize.md, descFontSize: typography.fontSize.sm, iconScale: 0.43, connectorThick: 2,   hGap: scale[400], vGap: scale[500], labelGap: scale[300], contentGap: scale[100] },
    },
    density: {
      comfortable: { gapX: spacing[200], gapY: spacing[200] },
      compact:     { gapX: spacing[100], gapY: spacing[100] },
      spacious:    { gapX: spacing[400], gapY: spacing[300] },
    },
  },

  // ── Notification Badge ───────────────────────────────────────────────────────
  // Figma node 3414-50790
  //
  // Light canvas → saturated fill (defaultStrong); dark canvas → pastel fill.
  // Dark pastel bg tokens G-1/G-3/G-5/G-7/G-9 — ALL RESOLVED.
  // On-fill text tokens G-2/G-4/G-6/G-8/G-10 — ALL RESOLVED (onColour.dark accepted for pastel use).
  notificationBadge: {
    colour: {
      error: {
        light: {
          bg:   semantic.background.negative.defaultStrong.light,        // #B30000 — exact
          text: semantic.foreground.default.inverse.light,               // #FFFFFF — exact
        },
        dark: {
          bg:   semantic.background.negative.defaultStrongDeep.dark,     // #FCAD9A — G-1 RESOLVED (nearest-neighbour accepted): red[300] delta ≈3/255 vs Figma #FFAD9A
          text: semantic.foreground.negative.onColour.dark,              // #7C0000 — G-2 RESOLVED: red[800] on red[300] pastel passes contrast; onColour.dark accepted for pastel use
        },
      },
      success: {
        light: {
          bg:   semantic.background.positive.defaultStrong.light,        // #067A46 — exact
          text: semantic.foreground.default.inverse.light,               // #FFFFFF — exact
        },
        dark: {
          bg:   semantic.background.positive.defaultStrongDeep.dark,     // #D2F895 — G-3 RESOLVED: green[300] is the Figma pastel fill
          text: semantic.foreground.positive.onColour.dark,              // #035624 — G-4 RESOLVED: green[800] on green[300] pastel passes contrast; onColour.dark accepted for pastel use
        },
      },
      warning: {
        light: {
          bg:   semantic.background.warning.defaultStrong.light,         // #CE4500 — exact
          text: semantic.foreground.default.inverse.light,               // #FFFFFF — exact
        },
        dark: {
          bg:   semantic.background.warning.defaultStrongDeep.dark,      // #FFBF74 — G-5 RESOLVED: orange[300] is the Figma pastel fill
          text: semantic.foreground.warning.onColour.dark,               // #7B2900 — G-6 RESOLVED: orange[800] on orange[300] pastel passes contrast; onColour.dark accepted for pastel use
        },
      },
      info: {
        light: {
          bg:   semantic.background.information.defaultStrongDeep.light, // #001DB2 — exact match on StrongDeep
          text: semantic.foreground.default.inverse.light,               // #FFFFFF — exact
        },
        dark: {
          bg:   semantic.background.information.defaultStrongDeep.dark,  // #92EAFF — G-7 RESOLVED: blue[300] is the Figma pastel fill
          text: semantic.foreground.information.onColour.dark,           // #00178C — G-8 RESOLVED: blue[800] on blue[300] pastel passes contrast; onColour.dark accepted for pastel use
        },
      },
      ai: {
        light: {
          bg:   semantic.background.ai.defaultStrongDeep.light,          // #5236B8 — exact match on StrongDeep
          text: semantic.foreground.default.inverse.light,               // #FFFFFF — exact
        },
        dark: {
          bg:   semantic.background.ai.defaultStrongDeep.dark,           // #B7ABFF — G-9 RESOLVED: purple[300] now in semantic layer via defaultStrongDeep.dark
          text: semantic.foreground.ai.onColour.dark,                    // #2B1E66 — G-10 RESOLVED: purple[800] on purple[300] pastel passes contrast; onColour.dark accepted for pastel use
        },
      },
    },
    // ── Dimensions ──────────────────────────────────────────────────────────
    size: {
      sm: {
        height:   spacing[400],   // 16px — spacing[400]
        minWidth: spacing[400],   // 16px — spacing[400]
        dotSize:  spacing[200],   // 8px  — spacing[200]
        fontSize: typography.fontSize.sm,
        paddingX: spacing[100],   // 4px  — spacing[100]
      },
      md: {
        height:   spacing[500],   // 20px — spacing[500]
        minWidth: spacing[500],   // 20px — spacing[500]
        dotSize:  spacing[200],   // 8px — spacing[200]
        fontSize: typography.fontSize.sm,
        paddingX: spacing[100],   // 4px  — spacing[100]
      },
      lg: {
        height:   spacing[600],   // 24px — spacing[600]
        minWidth: spacing[600],   // 24px — spacing[600]
        dotSize:  spacing[300],   // 12px — spacing[300]
        fontSize: typography.fontSize.sm,
        paddingX: spacing[200],   // 8px  — spacing[200]
      },
    },
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  // Figma node 15042-240527
  // Colour tokens for all sub-regions: root surface, title, avatars, pictogram,
  // label chip, inline inputs, dropdowns, tab bar, breadcrumbs, and action buttons.
  // G-14 RESOLVED — nearest neighbour accepted: containerSecondary.light (#EEEEEE) vs Figma #F0F0F0 (+2 lightness steps, imperceptible).
  // G-15 RESOLVED — Tab component's semantic.border.focus token used directly (same chain). focusRingStyle helper removed.
  // G-16 RESOLVED — sizing.header.countryDropdown = scale[1600] = 128px (nearest scale step; Figma ~100px raw width had no scale match).
  // G-17 RESOLVED — nearest existing token used: defaultStrong.dark (#96DC14) for dark hover; defaultStrongDeep.light (#056835) for light.
  // G-18 RESOLVED — nearest existing token used: positive.defaultSubtle.dark (#035624) for selected dark bg.
  // G-19 RESOLVED — exact match: containerSecondary.dark = grey[700] = #333333.
  // G-20 RESOLVED — nearest neighbour accepted: containerSecondary.light (#EEEEEE) vs Figma close-btn hover #F5F5F5.
  header: {
    colour: {
      light: {
        // Surface
        bg:                   semantic.background.page.light,                    // #FFFFFF
        border:               semantic.border.default.light,                     // #E4E4E4
        separator:            semantic.border.default.light,                     // #E4E4E4
        // Text
        title:                semantic.foreground.default.primary.light,         // #242424
        label:                semantic.foreground.neutral.mid.light,             // #676767 — label above input/dropdown (nearest to Figma #767676; G-14 accepted)
        icon:                 semantic.foreground.default.secondary.light,       // #4B4B4B
        inputText:            semantic.foreground.default.primary.light,         // #242424
        placeholder:          semantic.foreground.neutral.mid.dark,              // #BBBBBB — placeholder text (same value both modes)
        // Controls (input / dropdown)
        controlBg:            semantic.background.page.light,                    // #FFFFFF
        controlBorder:        semantic.border.default.light,                     // #E4E4E4
        controlHoverBg:       semantic.background.containerSecondary.light,      // #EEEEEE — nearest to Figma #F5F5F5; G-20 accepted
        // Pictogram / label chip surface
        chipBg:               semantic.background.containerSecondary.light,      // #EEEEEE — nearest to Figma #F0F0F0; G-14 accepted
        chipBorder:           semantic.border.default.light,                     // #E4E4E4
        chipText:             semantic.foreground.default.secondary.light,       // #4B4B4B
        // Actions
        primaryBg:            semantic.background.positive.defaultStrong.light,  // #067A46
        primaryText:          semantic.foreground.positive.onColour.light,       // #FFFFFF
        primaryHoverBg:       semantic.background.positive.defaultStrongDeep.light, // #056835 — nearest; G-17 accepted (Figma #A8E820 is dark-canvas only, no primitive)
        secondaryBorder:      semantic.foreground.default.primary.light,         // #242424
        secondaryText:        semantic.foreground.default.primary.light,         // #242424
        linkText:             semantic.background.positive.defaultStrong.light,  // #067A46
        linkHoverText:        semantic.background.positive.defaultStrongDeep.light, // #056835
        backArrowText:        semantic.background.positive.defaultStrong.light,  // #067A46
        backArrowHoverBg:     semantic.background.containerSecondary.light,      // #EEEEEE — nearest to Figma #F0F0F0; G-14 accepted
        focusRing:            semantic.border.focus.light,                       // #067A46 — G-15 resolved: uses Tab component's semantic.border.focus chain
        // Tab bar
        tabActive:            semantic.foreground.default.primary.light,         // #242424
        tabInactive:          semantic.foreground.default.secondary.light,       // #4B4B4B
        tabDisabled:          semantic.foreground.default.disabled.light,        // #BBBBBB
        tabIndicator:         semantic.background.positive.defaultStrong.light,  // #067A46
        // Breadcrumb
        crumbText:            semantic.foreground.default.primary.light,         // #242424
        crumbSeparator:       semantic.foreground.default.disabled.light,        // #BBBBBB
        crumbChipBg:          semantic.background.containerSecondary.light,      // #EEEEEE — nearest to Figma #F0F0F0; G-14 accepted
        crumbChipBorder:      semantic.border.default.light,                     // #E4E4E4
        crumbChipText:        semantic.foreground.default.secondary.light,       // #4B4B4B
        crumbChipHoverBg:     semantic.background.containerSecondary.light,      // #EEEEEE
        crumbChevron:         semantic.foreground.default.secondary.light,       // #4B4B4B
      },
      dark: {
        // Surface
        bg:                   semantic.background.container.dark,                // #242424
        border:               semantic.border.default.dark,                      // #4B4B4B
        separator:            semantic.border.default.dark,                      // #4B4B4B
        // Text
        title:                semantic.foreground.default.primary.dark,          // #E4E4E4
        label:                semantic.foreground.neutral.mid.dark,              // #BBBBBB
        icon:                 semantic.foreground.neutral.mid.dark,              // #BBBBBB
        inputText:            semantic.foreground.default.primary.dark,          // #E4E4E4
        placeholder:          semantic.foreground.neutral.mid.dark,              // #BBBBBB
        // Controls
        controlBg:            semantic.background.container.dark,                // #242424
        controlBorder:        semantic.border.default.dark,                      // #4B4B4B
        controlHoverBg:       semantic.background.container.dark,                // #242424
        // Pictogram / label chip surface
        chipBg:               semantic.background.container.dark,                // #242424
        chipBorder:           semantic.border.default.dark,                      // #4B4B4B
        chipText:             semantic.foreground.neutral.mid.dark,              // #BBBBBB
        // Actions
        primaryBg:            semantic.background.positive.defaultStrong.dark,   // #96DC14
        primaryText:          semantic.foreground.positive.onColour.dark,        // #035624
        primaryHoverBg:       semantic.background.positive.defaultStrong.dark,   // #96DC14 — nearest; G-17 accepted (no primitive for Figma #A8E820)
        secondaryBorder:      semantic.foreground.default.primary.dark,          // #E4E4E4
        secondaryText:        semantic.foreground.default.primary.dark,          // #E4E4E4
        linkText:             semantic.background.positive.defaultStrong.dark,   // #96DC14
        linkHoverText:        semantic.background.positive.defaultStrong.dark,   // #96DC14 — nearest; G-17 accepted (Figma #B0F040 has no primitive)
        backArrowText:        semantic.background.positive.defaultStrong.dark,   // #96DC14
        backArrowHoverBg:     semantic.background.container.dark,                // #242424
        focusRing:            semantic.border.focus.dark,                        // #96DC14
        // Tab bar
        tabActive:            semantic.foreground.default.primary.dark,          // #E4E4E4
        tabInactive:          semantic.foreground.neutral.mid.dark,              // #BBBBBB
        tabDisabled:          semantic.foreground.default.tertiary.dark,         // #676767
        tabIndicator:         semantic.background.positive.defaultStrong.dark,   // #96DC14
        // Breadcrumb
        crumbText:            semantic.foreground.default.primary.dark,          // #E4E4E4
        crumbSeparator:       semantic.foreground.default.tertiary.dark,         // #676767
        crumbChipBg:          semantic.background.container.dark,                // #242424
        crumbChipBorder:      semantic.border.default.dark,                      // #4B4B4B
        crumbChipText:        semantic.foreground.neutral.mid.dark,              // #BBBBBB
        crumbChipHoverBg:     semantic.background.containerSecondary.dark,       // #333333 — G-19 resolved: exact match
        crumbChevron:         semantic.foreground.neutral.mid.dark,              // #BBBBBB
      },
    },
    // Dropdown option states — partial gaps
    // G-18 RESOLVED — nearest accepted: positive.defaultSubtle.dark (#035624) for Figma #1a3a1a selected bg.
    // G-19 RESOLVED — exact match: containerSecondary.dark = grey[700] = #333333.
    dropdownOption: {
      light: {
        activeBg:   semantic.background.containerSecondary.light,               // #EEEEEE
        activeText: semantic.foreground.default.primary.light,                  // #242424
        hoverBg:    semantic.background.containerSecondary.light,               // #EEEEEE — nearest to Figma #F5F5F5
        hoverText:  semantic.foreground.default.primary.light,                  // #242424
      },
      dark: {
        activeBg:   semantic.background.positive.defaultSubtle.dark,            // #035624 — nearest to Figma #1a3a1a; G-18 accepted
        activeText: semantic.background.positive.defaultStrong.dark,            // #96DC14
        hoverBg:    semantic.background.containerSecondary.dark,                // #333333 — grey[700] = exact match for Figma value
        hoverText:  semantic.foreground.default.primary.dark,                   // #E4E4E4
      },
    },
  },

  // ── Dialog ──────────────────────────────────────────────────────────────────
  // Figma node 47788-11473
  // Colour tokens for both canvas themes; dimensional tokens for shadow/radius/scrim.
  dialog: {
    colour: {
      light: {
        panel:           semantic.background.page.light,                       // #FFFFFF
        panelBorder:     semantic.border.default.light,                        // #E4E4E4
        divider:         semantic.border.default.light,                        // #E4E4E4
        title:           semantic.foreground.default.primary.light,            // #242424
        body:            semantic.foreground.default.secondary.light,          // #4B4B4B
        caption:         semantic.foreground.default.disabled.light,           // #BBBBBB
        closeBtnFg:      semantic.foreground.default.secondary.light,          // #4B4B4B
        closeBtnHoverFg: semantic.foreground.default.primary.light,            // #242424
        closeBtnHoverBg: semantic.background.containerSecondary.light,         // #EEEEEE — nearest to Figma #F5F5F5; G-20 accepted
        media:           semantic.background.containerSecondary.light,         // #EEEEEE
        focusRing:       semantic.border.focus.light,                          // #067A46
        bannerBg:        semantic.background.information.defaultSubtle.light,  // #E9FAFF
        bannerBorder:    semantic.border.information.light,                    // #002AFF
        bannerText:      semantic.foreground.default.primary.light,            // #242424
      },
      dark: {
        panel:           semantic.background.container.dark,                   // #242424
        panelBorder:     semantic.border.default.dark,                         // #4B4B4B
        divider:         semantic.border.default.dark,                         // #4B4B4B
        title:           semantic.foreground.default.primary.dark,             // #E4E4E4
        body:            semantic.foreground.default.primary.dark,             // #E4E4E4
        caption:         semantic.foreground.default.disabled.dark,            // #676767
        closeBtnFg:      semantic.foreground.default.primary.dark,             // #E4E4E4
        closeBtnHoverFg: semantic.foreground.default.primary.dark,             // #E4E4E4
        closeBtnHoverBg: semantic.background.container.dark,                   // #242424
        media:           semantic.background.container.dark,                   // #242424
        focusRing:       semantic.border.focus.dark,                           // #96DC14
        bannerBg:        semantic.background.information.defaultSubtle.dark,   // #00178C
        bannerBorder:    semantic.border.information.dark,                     // #40BDF0
        bannerText:      semantic.foreground.default.primary.dark,             // #E4E4E4
      },
    },
    shadow: elevation.level3,            // 0px 16px 16px rgba(36,36,36,0.16)
    scrim:  semantic.background.overlay, // { light: rgba(36,36,36,0.48), dark: rgba(255,255,255,0.48) }
    radius: radius.sm,                   // 8px
  },

} as const

// ─── 11. COMPONENT STATE TOKENS ───────────────────────────────────────────────
// Explicit per-state colour maps — the replacement for semantic.state overlays.
//
// Structure: componentState.<component>.<variant>.<state> = { fg, bg, border, borderFocus, opacity }
//   fg/bg/border/borderFocus — { light: string, dark: string }  (semantic token values, mode-aware)
//   opacity                  — number (opacity.full = 1.0 · opacity.half = 0.48)
//
// Usage in component code:
//   const tok = componentState.button.fill.positive[isPressed ? 'press' : isHovered ? 'hover' : 'idle']
//   const bg  = tok.bg[theme]   // theme: 'light' | 'dark'
//
// State keys:  idle · hover · press · focus · disabled
// Mirrors: Figma Enterprise-DS-v3 — variables panel / state table frames

// Shorthands — local only, not exported
const _s  = semantic
const _op = opacity
const _n  = { light: 'rgba(0,0,0,0)', dark: 'rgba(0,0,0,0)' } as const  // transparent sentinel

export const componentState = {

  // ── Button ───────────────────────────────────────────────────────────────────
  // fill    — filled solid background; fg = onColour
  // outline — transparent bg at rest, subtle tint on hover/press; fg = colour.default
  // text    — no border or fill at rest, subtle tint on hover/press
  button: {
    fill: {
      positive: {
        idle:     { fg: _s.foreground.positive.onColour,     bg: _s.background.positive.defaultStrong,     border: _n, borderFocus: _n,                  opacity: _op.full },
        hover:    { fg: _s.foreground.positive.onColourDeep, bg: _s.background.positive.defaultStrongDeep, border: _n, borderFocus: _n,                  opacity: _op.full },
        press:    { fg: _s.foreground.positive.onColourDeep, bg: _s.background.positive.defaultStrongDeep, border: _n, borderFocus: _n,                  opacity: _op.full },
        focus:    { fg: _s.foreground.positive.onColour,     bg: _s.background.positive.defaultStrongDeep, border: _n, borderFocus: _s.border.focus,     opacity: _op.full },
        disabled: { fg: _s.foreground.neutral.default,       bg: _s.background.neutral.defaultSubtleDeep,  border: _n, borderFocus: _n,                  opacity: _op.half },
      },
      negative: {
        idle:     { fg: _s.foreground.negative.onColour,     bg: _s.background.negative.defaultStrong,     border: _n, borderFocus: _n,                          opacity: _op.full },
        hover:    { fg: _s.foreground.negative.onColourDeep, bg: _s.background.negative.defaultStrongDeep, border: _n, borderFocus: _n,                          opacity: _op.full },
        press:    { fg: _s.foreground.negative.onColourDeep, bg: _s.background.negative.defaultStrongDeep, border: _n, borderFocus: _n,                          opacity: _op.full },
        focus:    { fg: _s.foreground.negative.onColour,     bg: _s.background.negative.defaultStrongDeep, border: _n, borderFocus: _s.border.focusNegative,     opacity: _op.full },
        disabled: { fg: _s.foreground.neutral.default,       bg: _s.background.neutral.defaultSubtleDeep,  border: _n, borderFocus: _n,                          opacity: _op.half },
      },
      neutral: {
        // Neutral fill buttons rest at defaultStrongDeep (very dark) and lighten on hover.
        idle:     { fg: _s.foreground.neutral.onColour,     bg: _s.background.neutral.defaultStrongDeep, border: _n, borderFocus: _n,              opacity: _op.full },
        hover:    { fg: _s.foreground.neutral.onColourDeep, bg: _s.background.neutral.defaultStrong,     border: _n, borderFocus: _n,              opacity: _op.full },
        press:    { fg: _s.foreground.neutral.onColourDeep, bg: _s.background.neutral.defaultStrong,     border: _n, borderFocus: _n,              opacity: _op.full },
        focus:    { fg: _s.foreground.neutral.onColour,     bg: _s.background.neutral.defaultStrong,     border: _n, borderFocus: _s.border.focus, opacity: _op.full },
        disabled: { fg: _s.foreground.neutral.default,      bg: _s.background.neutral.defaultSubtleDeep, border: _n, borderFocus: _n,              opacity: _op.half },
      },
      ai: {
        // AI fill buttons hold defaultStrong on hover (no darken) — only press deepens.
        idle:     { fg: _s.foreground.ai.onColour,     bg: _s.background.ai.defaultStrong,     border: _n, borderFocus: _n,               opacity: _op.full },
        hover:    { fg: _s.foreground.ai.onColourDeep, bg: _s.background.ai.defaultStrong,     border: _n, borderFocus: _n,               opacity: _op.full },
        press:    { fg: _s.foreground.ai.onColourDeep, bg: _s.background.ai.defaultStrongDeep, border: _n, borderFocus: _n,               opacity: _op.full },
        focus:    { fg: _s.foreground.ai.onColour,     bg: _s.background.ai.defaultStrong,     border: _n, borderFocus: _s.border.focusAi, opacity: _op.full },
        disabled: { fg: _s.foreground.neutral.default, bg: _s.background.neutral.defaultSubtleDeep, border: _n, borderFocus: _n,          opacity: _op.half },
      },
    },

    outline: {
      positive: {
        idle:     { fg: _s.foreground.positive.default,    bg: _n,                                    border: _s.border.positive, borderFocus: _n,                  opacity: _op.full },
        hover:    { fg: _s.foreground.positive.default,    bg: _s.background.positive.defaultSubtle,  border: _s.border.positive, borderFocus: _n,                  opacity: _op.full },
        press:    { fg: _s.foreground.positive.default,    bg: _s.background.positive.defaultSubtleDeep, border: _s.border.positive, borderFocus: _n,               opacity: _op.full },
        focus:    { fg: _s.foreground.positive.default,    bg: _s.background.positive.defaultSubtle,  border: _s.border.positive, borderFocus: _s.border.focus,     opacity: _op.full },
        disabled: { fg: _s.foreground.neutral.defaultDeep, bg: _s.background.neutral.defaultSubtle,   border: _s.border.disabled, borderFocus: _n,                  opacity: _op.half },
      },
      negative: {
        idle:     { fg: _s.foreground.negative.default,    bg: _n,                                    border: _s.border.negative, borderFocus: _n,                          opacity: _op.full },
        hover:    { fg: _s.foreground.negative.default,    bg: _s.background.negative.defaultSubtle,  border: _s.border.negative, borderFocus: _n,                          opacity: _op.full },
        press:    { fg: _s.foreground.negative.default,    bg: _s.background.negative.defaultSubtleDeep, border: _s.border.negative, borderFocus: _n,                       opacity: _op.full },
        focus:    { fg: _s.foreground.negative.default,    bg: _s.background.negative.defaultSubtle,  border: _s.border.negative, borderFocus: _s.border.focusNegative,     opacity: _op.full },
        disabled: { fg: _s.foreground.neutral.defaultDeep, bg: _s.background.neutral.defaultSubtle,   border: _s.border.disabled, borderFocus: _n,                          opacity: _op.half },
      },
      neutral: {
        idle:     { fg: _s.foreground.neutral.default,     bg: _n,                                    border: _s.border.default,  borderFocus: _n,              opacity: _op.full },
        hover:    { fg: _s.foreground.neutral.default,     bg: _s.background.neutral.defaultSubtle,   border: _s.border.default,  borderFocus: _n,              opacity: _op.full },
        press:    { fg: _s.foreground.neutral.default,     bg: _s.background.neutral.defaultSubtleDeep, border: _s.border.default, borderFocus: _n,             opacity: _op.full },
        focus:    { fg: _s.foreground.neutral.default,     bg: _s.background.neutral.defaultSubtle,   border: _s.border.default,  borderFocus: _s.border.focus, opacity: _op.full },
        disabled: { fg: _s.foreground.neutral.defaultDeep, bg: _s.background.neutral.defaultSubtle,   border: _s.border.disabled, borderFocus: _n,              opacity: _op.half },
      },
      ai: {
        idle:     { fg: _s.foreground.ai.default,          bg: _n,                                 border: _s.border.ai,       borderFocus: _n,               opacity: _op.full },
        hover:    { fg: _s.foreground.ai.default,          bg: _s.background.ai.defaultSubtle,     border: _s.border.ai,       borderFocus: _n,               opacity: _op.full },
        press:    { fg: _s.foreground.ai.default,          bg: _s.background.ai.defaultSubtleDeep, border: _s.border.ai,       borderFocus: _n,               opacity: _op.full },
        focus:    { fg: _s.foreground.ai.default,          bg: _s.background.ai.defaultSubtle,     border: _s.border.ai,       borderFocus: _s.border.focusAi, opacity: _op.full },
        disabled: { fg: _s.foreground.neutral.defaultDeep, bg: _s.background.neutral.defaultSubtle, border: _s.border.disabled, borderFocus: _n,              opacity: _op.half },
      },
    },

    text: {
      positive: {
        idle:     { fg: _s.foreground.positive.default,    bg: _n,                                       border: _n, borderFocus: _n,                  opacity: _op.full },
        hover:    { fg: _s.foreground.positive.default,    bg: _s.background.positive.defaultSubtle,     border: _n, borderFocus: _n,                  opacity: _op.full },
        press:    { fg: _s.foreground.positive.default,    bg: _s.background.positive.defaultSubtleDeep, border: _n, borderFocus: _n,                  opacity: _op.full },
        focus:    { fg: _s.foreground.positive.default,    bg: _s.background.positive.defaultSubtle,     border: _n, borderFocus: _s.border.focus,     opacity: _op.full },
        disabled: { fg: _s.foreground.neutral.defaultDeep, bg: _s.background.neutral.defaultSubtle,      border: _n, borderFocus: _n,                  opacity: _op.half },
      },
      negative: {
        idle:     { fg: _s.foreground.negative.default,    bg: _n,                                       border: _n, borderFocus: _n,                          opacity: _op.full },
        hover:    { fg: _s.foreground.negative.default,    bg: _s.background.negative.defaultSubtle,     border: _n, borderFocus: _n,                          opacity: _op.full },
        press:    { fg: _s.foreground.negative.default,    bg: _s.background.negative.defaultSubtleDeep, border: _n, borderFocus: _n,                          opacity: _op.full },
        focus:    { fg: _s.foreground.negative.default,    bg: _s.background.negative.defaultSubtle,     border: _n, borderFocus: _s.border.focusNegative,     opacity: _op.full },
        disabled: { fg: _s.foreground.neutral.defaultDeep, bg: _s.background.neutral.defaultSubtle,      border: _n, borderFocus: _n,                          opacity: _op.half },
      },
      neutral: {
        idle:     { fg: _s.foreground.neutral.default,     bg: _n,                                       border: _n, borderFocus: _n,              opacity: _op.full },
        hover:    { fg: _s.foreground.neutral.default,     bg: _s.background.neutral.defaultSubtle,      border: _n, borderFocus: _n,              opacity: _op.full },
        press:    { fg: _s.foreground.neutral.default,     bg: _s.background.neutral.defaultSubtleDeep,  border: _n, borderFocus: _n,              opacity: _op.full },
        focus:    { fg: _s.foreground.neutral.default,     bg: _s.background.neutral.defaultSubtle,      border: _n, borderFocus: _s.border.focus, opacity: _op.full },
        disabled: { fg: _s.foreground.neutral.defaultDeep, bg: _s.background.neutral.defaultSubtle,      border: _n, borderFocus: _n,              opacity: _op.half },
      },
      ai: {
        idle:     { fg: _s.foreground.ai.default,          bg: _n,                                    border: _n, borderFocus: _n,               opacity: _op.full },
        hover:    { fg: _s.foreground.ai.default,          bg: _s.background.ai.defaultSubtle,        border: _n, borderFocus: _n,               opacity: _op.full },
        press:    { fg: _s.foreground.ai.default,          bg: _s.background.ai.defaultSubtleDeep,    border: _n, borderFocus: _n,               opacity: _op.full },
        focus:    { fg: _s.foreground.ai.default,          bg: _s.background.ai.defaultSubtle,        border: _n, borderFocus: _s.border.focusAi, opacity: _op.full },
        disabled: { fg: _s.foreground.neutral.defaultDeep, bg: _s.background.neutral.defaultSubtle,   border: _n, borderFocus: _n,               opacity: _op.half },
      },
    },
  },

  // ── Input / Text Field ────────────────────────────────────────────────────────
  // `empty`  — no user value entered (shows placeholder text)
  // `filled` — value present (full-opacity text)
  // Note: disabled inputs use opacity.full + bg colour change (not opacity.half) to keep labels readable.
  input: {
    empty: {
      idle:     { fg: _s.foreground.neutral.mid,        bg: _s.background.container,          border: _s.border.default,   borderFocus: _n,              opacity: _op.full },
      hover:    { fg: _s.foreground.neutral.mid,        bg: _s.background.containerSecondary, border: _s.border.default,   borderFocus: _n,              opacity: _op.full },
      press:    { fg: _s.foreground.default.secondary,  bg: _s.background.container,          border: _s.border.default,   borderFocus: _n,              opacity: _op.full },
      focus:    { fg: _s.foreground.positive.default,   bg: _s.background.container,          border: _s.border.positive,  borderFocus: _s.border.focus, opacity: _op.full },
      disabled: { fg: _s.foreground.neutral.mid,        bg: _s.background.neutral.defaultSubtle, border: _s.border.disabled, borderFocus: _n,            opacity: _op.full },
    },
    filled: {
      idle:     { fg: _s.foreground.default.secondary,  bg: _s.background.container,          border: _s.border.default,   borderFocus: _n,              opacity: _op.full },
      hover:    { fg: _s.foreground.default.primary,    bg: _s.background.containerSecondary, border: _s.border.default,   borderFocus: _n,              opacity: _op.full },
      press:    { fg: _s.foreground.default.primary,    bg: _s.background.container,          border: _s.border.default,   borderFocus: _n,              opacity: _op.full },
      focus:    { fg: _s.foreground.default.primary,    bg: _s.background.container,          border: _s.border.positive,  borderFocus: _s.border.focus, opacity: _op.full },
      disabled: { fg: _s.foreground.neutral.mid,        bg: _s.background.neutral.defaultSubtle, border: _s.border.disabled, borderFocus: _n,            opacity: _op.full },
    },
  },

  // ── Checkbox ─────────────────────────────────────────────────────────────────
  // `default`  — unchecked state
  // `selected` — checked state (filled green box + white tick)
  // Disabled opacity stays full — background colour signals disabled, not opacity reduction.
  checkbox: {
    default: {
      idle:     { fg: _s.foreground.positive.default,    bg: _s.background.container,                  border: _s.border.positive,  borderFocus: _n,              opacity: _op.full },
      hover:    { fg: _s.foreground.default.tertiary,    bg: _s.background.positive.defaultSubtle,     border: _s.border.positive,  borderFocus: _n,              opacity: _op.full },
      press:    { fg: _s.foreground.default.secondary,   bg: _s.background.positive.defaultSubtleDeep, border: _s.border.positive,  borderFocus: _n,              opacity: _op.full },
      focus:    { fg: _s.foreground.default.primary,     bg: _s.background.container,                  border: _s.border.positive,  borderFocus: _s.border.focus, opacity: _op.full },
      disabled: { fg: _s.foreground.default.tertiary,    bg: _s.background.neutral.defaultSubtle,      border: _s.border.disabled,  borderFocus: _n,              opacity: _op.full },
    },
    selected: {
      idle:     { fg: _s.foreground.positive.onColour, bg: _s.background.positive.defaultStrong,     border: _s.border.positive,  borderFocus: _n,              opacity: _op.full },
      hover:    { fg: _s.foreground.positive.onColour, bg: _s.background.positive.defaultStrongDeep, border: _s.border.positive,  borderFocus: _n,              opacity: _op.full },
      press:    { fg: _s.foreground.positive.onColour, bg: _s.background.positive.defaultStrongDeep, border: _s.border.positive,  borderFocus: _n,              opacity: _op.full },
      focus:    { fg: _s.foreground.positive.onColour, bg: _s.background.positive.defaultStrong,     border: _s.border.positive,  borderFocus: _s.border.focus, opacity: _op.full },
      disabled: { fg: _s.foreground.default.tertiary,  bg: _s.background.neutral.defaultSubtle,      border: _s.border.disabled,  borderFocus: _n,              opacity: _op.full },
    },
  },

  // ── Radio Button ─────────────────────────────────────────────────────────────
  // Same semantic pattern as checkbox — only the visual shape differs.
  radio: {
    default: {
      idle:     { fg: _s.foreground.positive.default,    bg: _s.background.container,                  border: _s.border.positive,  borderFocus: _n,              opacity: _op.full },
      hover:    { fg: _s.foreground.default.tertiary,    bg: _s.background.positive.defaultSubtle,     border: _s.border.positive,  borderFocus: _n,              opacity: _op.full },
      press:    { fg: _s.foreground.default.secondary,   bg: _s.background.positive.defaultSubtleDeep, border: _s.border.positive,  borderFocus: _n,              opacity: _op.full },
      focus:    { fg: _s.foreground.default.primary,     bg: _s.background.container,                  border: _s.border.positive,  borderFocus: _s.border.focus, opacity: _op.full },
      disabled: { fg: _s.foreground.default.tertiary,    bg: _s.background.neutral.defaultSubtle,      border: _s.border.disabled,  borderFocus: _n,              opacity: _op.full },
    },
    selected: {
      idle:     { fg: _s.foreground.positive.onColour, bg: _s.background.positive.defaultStrong,     border: _s.border.positive,  borderFocus: _n,              opacity: _op.full },
      hover:    { fg: _s.foreground.positive.onColour, bg: _s.background.positive.defaultStrongDeep, border: _s.border.positive,  borderFocus: _n,              opacity: _op.full },
      press:    { fg: _s.foreground.positive.onColour, bg: _s.background.positive.defaultStrongDeep, border: _s.border.positive,  borderFocus: _n,              opacity: _op.full },
      focus:    { fg: _s.foreground.positive.onColour, bg: _s.background.positive.defaultStrong,     border: _s.border.positive,  borderFocus: _s.border.focus, opacity: _op.full },
      disabled: { fg: _s.foreground.default.tertiary,  bg: _s.background.neutral.defaultSubtle,      border: _s.border.disabled,  borderFocus: _n,              opacity: _op.full },
    },
  },

  // ── Toggle / Switch ───────────────────────────────────────────────────────────
  // `fg` = thumb colour · `bg` = track fill · `border` = track border
  // `default`  = off/unchecked · `selected` = on/checked
  toggle: {
    default: {
      idle:     { fg: _s.foreground.default.inverse, bg: _s.background.neutral.defaultSubtleDeep, border: _s.border.default,  borderFocus: _n,              opacity: _op.full },
      hover:    { fg: _s.foreground.default.inverse, bg: _s.background.neutral.defaultSubtle,     border: _s.border.hover,    borderFocus: _n,              opacity: _op.full },
      press:    { fg: _s.foreground.default.inverse, bg: _s.background.neutral.defaultSubtle,     border: _s.border.default,  borderFocus: _n,              opacity: _op.full },
      focus:    { fg: _s.foreground.default.inverse, bg: _s.background.neutral.defaultSubtleDeep, border: _s.border.default,  borderFocus: _s.border.focus, opacity: _op.full },
      disabled: { fg: _s.foreground.default.inverse, bg: _s.background.neutral.defaultSubtleDeep, border: _s.border.disabled, borderFocus: _n,              opacity: _op.full },
    },
    selected: {
      idle:     { fg: _s.foreground.default.inverse,   bg: _s.background.positive.defaultStrong,     border: _s.border.positive,  borderFocus: _n,              opacity: _op.full },
      hover:    { fg: _s.foreground.default.inverse,   bg: _s.background.positive.defaultStrongDeep, border: _s.border.positive,  borderFocus: _n,              opacity: _op.full },
      press:    { fg: _s.foreground.default.inverse,   bg: _s.background.positive.defaultStrongDeep, border: _s.border.positive,  borderFocus: _n,              opacity: _op.full },
      focus:    { fg: _s.foreground.default.inverse,   bg: _s.background.positive.defaultStrong,     border: _s.border.positive,  borderFocus: _s.border.focus, opacity: _op.full },
      disabled: { fg: _s.foreground.default.disabled,  bg: _s.background.neutral.defaultSubtleDeep,  border: _s.border.disabled,  borderFocus: _n,              opacity: _op.full },
    },
  },

  // ── Tab ───────────────────────────────────────────────────────────────────────
  // `default`  = unselected tab · `selected` = active tab
  tab: {
    default: {
      idle:     { fg: _s.foreground.default.primary,    bg: _s.background.container,                  border: _s.border.default,  borderFocus: _n,              opacity: _op.full },
      hover:    { fg: _s.foreground.positive.default,   bg: _s.background.positive.defaultSubtle,     border: _s.border.default,  borderFocus: _n,              opacity: _op.full },
      press:    { fg: _s.foreground.positive.defaultDeep, bg: _s.background.positive.defaultSubtleDeep, border: _s.border.default, borderFocus: _n,             opacity: _op.full },
      focus:    { fg: _s.foreground.default.primary,    bg: _s.background.container,                  border: _s.border.default,  borderFocus: _s.border.focus, opacity: _op.full },
      disabled: { fg: _s.foreground.default.tertiary,   bg: _s.background.neutral.defaultSubtle,      border: _s.border.default,  borderFocus: _n,              opacity: _op.full },
    },
    selected: {
      idle:     { fg: _s.foreground.positive.default,     bg: _s.background.container,                  border: _s.border.positive,  borderFocus: _n,              opacity: _op.full },
      hover:    { fg: _s.foreground.positive.default,     bg: _s.background.positive.defaultSubtle,     border: _s.border.positive,  borderFocus: _n,              opacity: _op.full },
      press:    { fg: _s.foreground.positive.defaultDeep, bg: _s.background.positive.defaultSubtleDeep, border: _s.border.positive,  borderFocus: _n,              opacity: _op.full },
      focus:    { fg: _s.foreground.positive.default,     bg: _s.background.container,                  border: _s.border.positive,  borderFocus: _s.border.focus, opacity: _op.full },
      disabled: { fg: _s.foreground.default.tertiary,     bg: _s.background.neutral.defaultSubtle,      border: _s.border.default,   borderFocus: _n,              opacity: _op.full },
    },
  },

} as const

