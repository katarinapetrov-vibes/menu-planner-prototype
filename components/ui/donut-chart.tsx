'use client'

import React from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { primitives, radius, semantic, spacing, typography } from '@/lib/tokens'

ChartJS.register(ArcElement, Tooltip, Legend)

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma Enterprise DS — Doughnt/Chart (node 8143:169115)
//
// The Figma component is a doughnut chart with five named slices:
//   Green  fill_KRLL02 = #E4FABF  (primitives.green[200])
//   Yellow fill_TB6JGR = #FFFAB2  (primitives.yellow[200])
//   Orange fill_U3PFU0 = #FFECD3  (primitives.orange[100])
//   Red    fill_GCEDVU = #FFCCCA  (primitives.red[200])
//   Blue   fill_D6PL6J = #E9FAFF  (primitives.blue[100])
//
// Slice border: stroke_K150QR = #FFFFFF (1px white gap between slices, light mode)
//
// Legend (Details): row layout, centred, gap 24px
//   Each item: 24×16 solid rectangle swatch + label
//   Swatch size: layout_95LBSO = 24×16 px — identical to all other chart legends
//   Label text: HF/Desktop/Small Text — Source Sans Pro 14px/400, #676767 (fill_6U8A2U)
//
// The light palette is the DS [200]/[100] tint level.
// The dark palette steps up to [300] for better visibility on dark backgrounds.

export type DonutChartTheme = 'light' | 'dark'

export interface DonutChartSlice {
  /** Label shown in the legend and tooltip */
  label: string
  /** Numeric value for this slice */
  value: number
  /**
   * Optional CSS color string to override the palette entry for this slice.
   * Applied to the slice fill. The border colour is always the panel background.
   */
  color?: string
}

export interface DonutChartProps {
  /** One or more slices rendered as doughnut segments */
  slices: DonutChartSlice[]
  /** Show legend below the chart — default true */
  showLegend?: boolean
  /**
   * Size of the hollow centre as a percentage of the chart radius.
   * Accepts a CSS string ('60%') or a pixel number.
   * Default '60%'.
   */
  cutout?: string | number
  /**
   * Pixel expansion of a slice on hover — default 8.
   * Set to 0 to disable hover expansion.
   */
  hoverOffset?: number
  /** Height of the canvas area in px — default 300 */
  height?: number
  theme?: DonutChartTheme
  className?: string
  style?: React.CSSProperties
}

// ─── Colour palettes ──────────────────────────────────────────────────────────
// Light: DS primitive [200]/[100] — exactly matches Figma fill tokens.
// Dark:  DS primitive [300]       — one step more saturated for dark backgrounds.
// Both palettes are extended to 9 entries using the full DS primitive scale.

const FILL_PALETTE: Record<DonutChartTheme, string[]> = {
  light: [
    primitives.green[200],   // #E4FABF — Green  (Figma fill_KRLL02 exact)
    primitives.yellow[200],  // #FFFAB2 — Yellow (Figma fill_TB6JGR exact)
    primitives.orange[100],  // #FFECD3 — Orange (Figma fill_U3PFU0 exact)
    primitives.red[200],     // #FFCCCA — Red    (Figma fill_GCEDVU exact)
    primitives.blue[100],    // #E9FAFF — Blue   (Figma fill_D6PL6J exact)
    primitives.teal[200],    // #CBF5E6
    primitives.pink[200],    // #EFD1E0
    primitives.brown[200],   // #F5E4B5
    primitives.purple[200],  // #E6E0FF
  ],
  dark: [
    primitives.green[300],   // #D2F895
    primitives.yellow[300],  // #FFF583
    primitives.orange[300],  // #FFBF74
    primitives.red[300],     // #FCAD9A
    primitives.blue[300],    // #92EAFF
    primitives.teal[300],    // #A5EED4
    primitives.pink[300],    // #F4B1D2
    primitives.brown[300],   // #F2DB9C
    primitives.purple[300],  // #B7ABFF
  ],
}

// ─── DonutChart ───────────────────────────────────────────────────────────────

export const DonutChart = React.forwardRef<HTMLDivElement, DonutChartProps>(
  (
    {
      slices,
      showLegend  = true,
      cutout      = '60%',
      hoverOffset = 8,
      height      = 300,
      theme       = 'light',
      className,
      style,
    },
    ref,
  ) => {
    const isDark = theme === 'dark'

    const tickColor  = primitives.grey[600]   // #676767 — fill_6U8A2U (legend labels)
    const panelBg    = isDark
      ? semantic.background.container.dark
      : semantic.background.page.light
    // Slice border: white gap in light mode, dark panel colour in dark mode
    const borderColor = isDark ? semantic.background.container.dark : primitives.grey[100]
    const fontFamily  = typography.fontFamily.body
    const fontSize    = 14   // HF/Desktop/Small Text — 14px/400

    const [isMounted, setIsMounted] = React.useState(false)
    React.useEffect(() => { setIsMounted(true) }, [])

    // Resolve each slice's fill colour
    const resolvedColors = slices.map(
      (s, i) => s.color ?? FILL_PALETTE[theme][i % FILL_PALETTE[theme].length],
    )

    const chartData: ChartData<'doughnut'> = {
      labels: slices.map(s => s.label),
      datasets: [
        {
          data:            slices.map(s => s.value),
          backgroundColor: resolvedColors,
          borderColor,
          borderWidth:     1,   // stroke_K150QR: 1px white gap
          hoverOffset,
        },
      ],
    }

    const options: ChartOptions<'doughnut'> = {
      responsive:          true,
      maintainAspectRatio: false,
      animation:           { duration: 250 },
      cutout,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? primitives.grey[700] : primitives.grey[100],
          titleColor:      isDark ? primitives.grey[400] : primitives.grey[800],
          bodyColor:       isDark ? primitives.grey[500] : primitives.grey[600],
          borderColor:     isDark ? primitives.grey[700] : primitives.grey[400],
          borderWidth:     1,
          padding:         { x: 12, y: 8 },
          titleFont:  { family: fontFamily, size: fontSize, weight: 600 },
          bodyFont:   { family: fontFamily, size: fontSize },
          cornerRadius: 4,
          callbacks: {
            label: (ctx) => {
              const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0)
              const value = ctx.parsed
              const pct   = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
              return ` ${ctx.label}: ${value} (${pct}%)`
            },
          },
        },
      },
    }

    return (
      <div
        ref={ref}
        className={className}
        style={{
          background:    panelBg,
          padding:       spacing[400],
          borderRadius:  radius.sm,
          display:       'flex',
          flexDirection: 'column',
          gap:           spacing[400],
          ...style,
        }}
      >
        {/* Chart canvas */}
        <div style={{ height: `${height}px`, position: 'relative' }}>
          {isMounted && <Doughnut data={chartData} options={options} />}
        </div>

        {/* Legend — centred row, 24×16 solid swatch + label per slice */}
        {showLegend && slices.length > 0 && (
          <div style={{
            display:        'flex',
            flexDirection:  'row',
            justifyContent: 'center',
            flexWrap:       'wrap',
            gap:            spacing[600],
          }}>
            {slices.map((s, i) => {
              const swatchColor = s.color ?? FILL_PALETTE[theme][i % FILL_PALETTE[theme].length]
              return (
                <div key={s.label} style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        spacing[200],
                }}>
                  {/* 24×16 solid swatch — matches Figma layout_95LBSO */}
                  <div style={{
                    width:           '24px',
                    height:          '16px',
                    backgroundColor: swatchColor,
                    border:          `1px solid ${swatchColor}`,
                    borderRadius:    '2px',
                    flexShrink:      0,
                  }} />
                  <span style={{
                    fontFamily,
                    fontSize:   `${fontSize}px`,
                    fontWeight: typography.fontWeight.regular,
                    lineHeight: typography.lineHeight.loose,
                    color:      tickColor,
                  }}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  },
)

DonutChart.displayName = 'DonutChart'

export default DonutChart
